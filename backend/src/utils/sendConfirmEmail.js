// backend/src/utils/sendConfirmEmail.js
const sendEmail = require('./sendEmail');

/**
 * sendConfirmEmail(toEmail, nameOrMessage)
 * If nameOrMessage looks like code (6 digits) it sends an OTP message,
 * otherwise it sends a welcome/confirmation template.
 */
module.exports = async function sendConfirmEmail(toEmail, nameOrMessage) {
  if (!toEmail) throw new Error('No recipient email provided');

  // If nameOrMessage is a short numeric OTP (6 digits), send OTP template
  const otpMatch = typeof nameOrMessage === 'string' && /^\d{4,8}$/.test(nameOrMessage);

  if (otpMatch) {
    const otp = nameOrMessage;
    const subject = 'Your LiveMart verification code';
    const text = `Hi,\n\nYour LiveMart verification code is: ${otp}\nIt will expire in 10 minutes.\n\n— LiveMart Team`;
    const html = `<div><p>Hi,</p><p>Your LiveMart verification code is: <strong>${otp}</strong></p><p>It will expire in 10 minutes.</p><p>— LiveMart Team</p></div>`;
    return sendEmail(toEmail, subject, text, html);
  }

  // Otherwise treat nameOrMessage as a name or custom message for welcome mail
  const name = typeof nameOrMessage === 'string' ? nameOrMessage : '';
  const subject = 'Welcome to LiveMart';
  const text = `Hi ${name},\n\nWelcome to LiveMart! Thanks for signing up.\n\n— LiveMart Team`;
  const html = `<div><h2>Hi ${name}</h2><p>Welcome to <strong>LiveMart</strong> — thanks for signing up!</p></div>`;
  return sendEmail(toEmail, subject, text, html);
};