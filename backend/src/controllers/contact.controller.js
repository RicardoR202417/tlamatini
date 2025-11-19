import { MensajeContacto } from '../models/index.js';
import { createTransporter } from '../utils/mailer.js';

// POST /api/contacto
export const crearMensajeContacto = async (req, res) => {
  try {
    const { nombre, correo, asunto, mensaje, website } = req.body || {};

    // Honeypot: si el campo 'website' tiene valor, es spam
    if (website && website.trim() !== '') {
      return res.status(400).json({ success: false, message: 'Spam detectado' });
    }

    if (!nombre || !correo || !mensaje) {
      return res.status(400).json({ success: false, message: 'Nombre, correo y mensaje son obligatorios' });
    }

    // Anti-spam simple: limitar 1 mensaje por minuto por correo
    const limiteMs = Number(process.env.CONTACT_RATE_LIMIT_MS || 60000);
    const ultimo = await MensajeContacto.findOne({
      where: { correo },
      order: [['fecha', 'DESC']]
    });

    if (ultimo && (Date.now() - new Date(ultimo.fecha).getTime()) < limiteMs) {
      return res.status(429).json({ success: false, message: 'Demasiados mensajes. Intente nuevamente más tarde.' });
    }

    const registro = await MensajeContacto.create({
      nombre, correo, asunto, mensaje
    });

    // Enviar correo a la asociación
    try {
      const transporter = createTransporter();
      const to = process.env.CONTACT_RECEIVER || process.env.SMTP_USER;
      const subject = `[Contacto] ${asunto || 'Nuevo mensaje de contacto'}`;
      const html = `
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Correo:</strong> ${correo}</p>
        <p><strong>Asunto:</strong> ${asunto || ''}</p>
        <hr />
        <p>${mensaje.replace(/\n/g, '<br/>')}</p>
      `;

      await transporter.sendMail({
        from: `"${process.env.APP_NAME || 'App'}" <${process.env.SMTP_USER}>`,
        to, subject, html
      });
    } catch (mailErr) {
      console.error('[contact] Error al enviar correo:', mailErr?.message || mailErr);
      // No fallamos la petición por fallo en email; el mensaje quedó en DB
    }

    res.status(201).json({ success: true, data: registro, message: 'Mensaje recibido' });
  } catch (error) {
    console.error('Error en crearMensajeContacto:', error);
    res.status(500).json({ success: false, message: 'Error al procesar mensaje', error: error.message });
  }
};
