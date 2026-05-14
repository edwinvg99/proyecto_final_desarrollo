/**
 * Cloudflare Queue Consumer Worker — certificate-notifier
 *
 * Recibe mensajes de la queue "certificate-notifications" y envía
 * un correo de notificación al usuario via Resend API.
 *
 * Variables de entorno (Secrets del Worker en Cloudflare):
 *   RESEND_API_KEY  — API Key de https://resend.com
 */
export default {
  async queue(batch, env) {
    for (const message of batch.messages) {
      try {
        const { email, name, moduloTitulo, certCode, date } = message.body;

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Energía Clara <onboarding@resend.dev>',
            to: [email],
            subject: `✅ Tu certificado de "${moduloTitulo}" fue generado`,
            html: `
              <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#010518;color:#fff;padding:40px;border-radius:12px;">
                <div style="text-align:center;margin-bottom:24px;">
                  <h1 style="color:#7DD3FC;margin:0;font-size:28px;">Energía Clara</h1>
                  <p style="color:#64748b;margin:4px 0 0;">Plataforma Educativa — TDEA</p>
                </div>

                <h2 style="color:#fff;font-size:22px;">¡Felicitaciones, ${name}! 🎓</h2>

                <p style="color:#94A3B8;line-height:1.6;">
                  Tu certificado de participación ha sido generado exitosamente en la plataforma
                  <strong style="color:#7DD3FC;">Energía Clara</strong>.
                </p>

                <div style="background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:20px;margin:24px 0;">
                  <p style="margin:0 0 8px;"><span style="color:#64748b;">📚 Módulo:</span> <strong style="color:#34D399;">${moduloTitulo}</strong></p>
                  <p style="margin:0 0 8px;"><span style="color:#64748b;">🔑 Código:</span> <code style="color:#7DD3FC;">${certCode}</code></p>
                  <p style="margin:0;"><span style="color:#64748b;">📅 Fecha:</span> <span style="color:#fff;">${date}</span></p>
                </div>

                <p style="color:#94A3B8;line-height:1.6;">
                  Puedes acceder a más módulos educativos y continuar aprendiendo sobre energías renovables en Colombia.
                </p>

                <div style="text-align:center;margin-top:32px;">
                  <a href="https://energiaclara.up.railway.app/educativo"
                     style="background:#34D399;color:#010518;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;">
                    Ver más módulos
                  </a>
                </div>

                <p style="color:#334155;font-size:12px;text-align:center;margin-top:32px;">
                  Este mensaje fue enviado automáticamente. Energía Clara — TDEA.
                </p>
              </div>
            `,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error enviando email a ${email}: ${errorText}`);
          message.retry();
        } else {
          console.log(`Email enviado a ${email} — certificado ${certCode}`);
          message.ack();
        }

      } catch (error) {
        console.error('Error en consumer:', error);
        message.retry();
      }
    }
  },
};
