import nodemailer from 'nodemailer';

function must(name){
  const v = process.env[name];
  if (!v) throw new Error(`[mailer] Falta variable ${name} en .env`);
  return v;
}
function bool(v, def=false){ return String(v ?? def).toLowerCase() === 'true'; }

export function createTransporter() {
  const host   = must('SMTP_HOST');              // ej: smtp.office365.com
  const port   = Number(process.env.SMTP_PORT || 587);
  const secure = bool(process.env.SMTP_SECURE, false);
  const user   = must('SMTP_USER');
  const pass   = must('SMTP_PASS');

  console.log('[mailer] usando', { host, port, secure });

  return nodemailer.createTransport({
    host,
    port,
    secure,          // Outlook: false (587, STARTTLS)
    auth: { user, pass }
  });
}

export async function sendResetPasswordEmail({ to, subject, html }) {
  const transporter = createTransporter();
  return transporter.sendMail({
    from: `"${process.env.APP_NAME || 'App'}" <${process.env.SMTP_USER}>`,
    to, subject, html
  });
}
