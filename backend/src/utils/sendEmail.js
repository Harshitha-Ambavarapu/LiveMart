// backend/src/utils/sendEmail.js
const nodemailer = require('nodemailer');

async function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 587);

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP_USER and SMTP_PASS must be set in .env');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

/**
 * sendEmail(to, subject, text, html)
 * - to: recipient email
 * - subject: email subject
 * - text: plain text
 * - html: html body (optional)
 */
async function sendEmail(to, subject, text, html) {
  const transporter = await createTransporter();
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html
  });

  // nodemailer returns messageId; good to log
  return info;
}

module.exports = sendEmail;