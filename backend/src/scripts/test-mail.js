// scripts/test-mail.js
import 'dotenv/config';

import { createTransporter } from '../utils/mailer.js';

const run = async () => {
  try {
    const t = createTransporter();
    const info = await t.sendMail({
      from: `"${process.env.APP_NAME || 'App'}" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // te envías a ti mismo
      subject: 'Test SMTP ✔',
      html: '<b>Hola! SMTP OK</b>'
    });
    console.log('OK ->', info.messageId);
  } catch (e) {
    console.error('Fallo SMTP:', e);
  }
};
run();
