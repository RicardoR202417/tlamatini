import nodemailer from 'nodemailer';

export function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: String(SMTP_SECURE || 'false') === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
}

export async function sendResetPasswordEmail({ to, subject, html }) {
  const transporter = createTransporter();
  return transporter.sendMail({
    from: `"${process.env.APP_NAME || 'App'}" <${process.env.SMTP_USER}>`,
    to, subject, html
  });
}
