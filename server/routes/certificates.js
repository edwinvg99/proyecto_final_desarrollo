const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const User = require('../models/User');

/**
 * POST /api/certificates/register
 * Guarda el certificado en MongoDB y publica un mensaje
 * en Cloudflare Queue para que el Worker Consumer envíe
 * el correo de notificación al usuario.
 */
router.post('/register', async (req, res) => {
  try {
    // ── Verificar que viene un token (presencia mínima) ────────
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requerido.' });
    }

    const { moduloId, moduloTitulo, certCode, userEmail, userName } = req.body;

    if (!moduloId || !moduloTitulo || !certCode || !userEmail) {
      return res.status(400).json({ error: 'Faltan datos del certificado.' });
    }

    // ── Buscar usuario en MongoDB por email ────────────────────
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    // ── Guardar certificado en MongoDB ─────────────────────────
    const certificate = new Certificate({
      userId:      user._id.toString(),
      userEmail:   user.email,
      userName:    userName || `${user.nombre} ${user.apellido}`,
      moduloId,
      moduloTitulo,
      certCode,
    });
    await certificate.save();
    console.log(`Certificado registrado: ${certCode} — ${user.email}`);

    // ── Publicar en Cloudflare Queue (mensajería en la nube) ───
    const { CF_API_TOKEN, CF_ACCOUNT_ID, CF_QUEUE_NAME, CF_QUEUE_ID } = process.env;
    const queueIdentifier = CF_QUEUE_ID || CF_QUEUE_NAME;

    if (CF_API_TOKEN && CF_ACCOUNT_ID && queueIdentifier) {
      const queueUrl = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/queues/${queueIdentifier}/messages`;

      const fecha = new Date().toLocaleDateString('es-CO', {
        day: 'numeric', month: 'long', year: 'numeric',
      });

      const queueRes = await fetch(queueUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{
            body: JSON.stringify({
              email:       user.email,
              name:        userName || `${user.nombre} ${user.apellido}`,
              moduloTitulo,
              certCode,
              date:        fecha,
            }),
            content_type: 'json',
          }],
        }),
      });

      if (!queueRes.ok) {
        const errText = await queueRes.text();
        console.error('Error publicando en Cloudflare Queue:', errText);
      } else {
        console.log(`Mensaje encolado en queue "${queueIdentifier}" para certificado ${certCode}`);
      }
    } else {
      console.log('CF_QUEUE_ID/CF_QUEUE_NAME no configurado — saltando mensajería en la nube');
    }

    res.status(201).json({ success: true, certCode });

  } catch (error) {
    // certCode duplicado — ya fue registrado antes (no es error)
    if (error.code === 11000) {
      return res.status(200).json({ success: true, message: 'Certificado ya registrado.' });
    }
    console.error('Error registrando certificado:', error);
    res.status(500).json({ error: 'Error al registrar el certificado.' });
  }
});

module.exports = router;
