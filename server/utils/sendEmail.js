const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const host = process.env.SMTP_HOST || process.env.MAILTRAP_HOST;
  const port = Number(process.env.SMTP_PORT || process.env.MAILTRAP_PORT || 587);
  const user = process.env.SMTP_USER || process.env.MAILTRAP_USER;
  const pass = process.env.SMTP_PASS || process.env.MAILTRAP_PASS;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
  });

  const fromName = process.env.FROM_NAME || 'ResumeIQ';
  const fromEmail = process.env.FROM_EMAIL || 'noreply@resumeiq.com';

  const message = {
    from: `"${fromName}" <${fromEmail}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
  return info;
};

module.exports = sendEmail;

