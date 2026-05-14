const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const sdk = require('../lib/sdkClient');
const { AuthServiceSdkError } = require('energy-community-auth-sdk');

const router = express.Router();

// Envuelve una promesa con un timeout. Lanza error si supera ms milisegundos.
function withTimeout(promise, ms, label) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`SDK timeout (${ms}ms): ${label}`)), ms)
  );
  return Promise.race([promise, timeout]);
}

const SDK_TIMEOUT_MS = 15000; // 15 segundos máximo por llamada al SDK

// ============================================================
// POST /forgot-password
// ============================================================
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  console.log('[forgot-password] Solicitud recibida para email:', email);

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.warn('[forgot-password] Email inválido:', email);
    return res.status(400).json({ message: 'Ingresa un email válido.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  try {
    console.log('[forgot-password] Llamando SDK requestPasswordRecovery para:', cleanEmail);
    await withTimeout(
      sdk.auth.requestPasswordRecovery({ email: cleanEmail }),
      SDK_TIMEOUT_MS,
      'requestPasswordRecovery'
    );
    console.log('[forgot-password] SDK respondió exitosamente para:', cleanEmail);
  } catch (err) {
    if (err.message && err.message.startsWith('SDK timeout')) {
      console.error('[forgot-password] TIMEOUT en SDK:', err.message);
    } else if (err instanceof AuthServiceSdkError) {
      console.error('[forgot-password] SDK error status=%d message=%s', err.status, err.message);
    } else {
      console.error('[forgot-password] Error inesperado:', err);
    }
    // No interrumpir — siempre devolver éxito por seguridad
  }

  console.log('[forgot-password] Respondiendo éxito al cliente para:', cleanEmail);
  return res.json({
    message: 'Si el correo está registrado, recibirás un enlace de recuperación.',
  });
});

// ============================================================
// GET /verify-token/:token
// ============================================================
router.get('/verify-token/:token', async (req, res) => {
  const { token } = req.params;
  console.log('[verify-token] Verificando token (primeros 20 chars):', token?.substring(0, 20));

  try {
    console.log('[verify-token] Llamando SDK validateRecoveryToken...');
    const result = await withTimeout(
      sdk.auth.validateRecoveryToken({ token }),
      SDK_TIMEOUT_MS,
      'validateRecoveryToken'
    );
    console.log('[verify-token] SDK respondió: valid=%s email=%s', result.valid, result.email);
    return res.json({ valid: result.valid, email: result.email });
  } catch (err) {
    if (err.message && err.message.startsWith('SDK timeout')) {
      console.error('[verify-token] TIMEOUT en SDK:', err.message);
      return res.status(504).json({ valid: false, message: 'El servicio de autenticación no respondió. Intenta de nuevo.' });
    }
    if (err instanceof AuthServiceSdkError) {
      console.error('[verify-token] SDK error status=%d message=%s', err.status, err.message);
    } else {
      console.error('[verify-token] Error inesperado:', err);
    }
    return res.json({ valid: false, message: 'Token inválido o expirado.' });
  }
});

// ============================================================
// POST /reset-password/:token
// ============================================================
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  console.log('[reset-password] Solicitud recibida, token (primeros 20 chars):', token?.substring(0, 20));

  if (!password || password.length < 6) {
    console.warn('[reset-password] Contraseña muy corta');
    return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  try {
    // Validar token
    console.log('[reset-password] Validando token con SDK...');
    const validation = await withTimeout(
      sdk.auth.validateRecoveryToken({ token }),
      SDK_TIMEOUT_MS,
      'validateRecoveryToken'
    );
    console.log('[reset-password] Token válido=%s email=%s', validation.valid, validation.email);

    if (!validation.valid) {
      return res.status(400).json({ message: 'Token inválido o expirado.' });
    }

    // Restablecer contraseña
    console.log('[reset-password] Llamando SDK resetPassword...');
    await withTimeout(
      sdk.auth.resetPassword({ token, password }),
      SDK_TIMEOUT_MS,
      'resetPassword'
    );
    console.log('[reset-password] Contraseña restablecida en SDK para email:', validation.email);

    // Sincronizar hash en MongoDB
    if (validation.email) {
      const user = await User.findOne({ email: validation.email });
      if (user) {
        user.password = await bcrypt.hash(password, 10);
        await user.save();
        console.log('[reset-password] Hash sincronizado en MongoDB para:', validation.email);
      } else {
        console.warn('[reset-password] Usuario no encontrado en MongoDB:', validation.email);
      }
    }

    return res.json({ message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.' });
  } catch (err) {
    if (err.message && err.message.startsWith('SDK timeout')) {
      console.error('[reset-password] TIMEOUT en SDK:', err.message);
      return res.status(504).json({ message: 'El servicio de autenticación no respondió. Intenta de nuevo.' });
    }
    if (err instanceof AuthServiceSdkError) {
      const message = err.status === 409
        ? 'Este enlace ya fue usado. Solicita uno nuevo.'
        : err.message || 'Token inválido o expirado.';
      console.error('[reset-password] SDK error status=%d message=%s', err.status, err.message);
      return res.status(err.status || 400).json({ message });
    }
    console.error('[reset-password] Error inesperado:', err);
    return res.status(500).json({ message: 'Error al restablecer la contraseña.' });
  }
});

module.exports = router;
