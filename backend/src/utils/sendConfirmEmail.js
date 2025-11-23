// backend/src/utils/sendConfirmEmail.js
const sendEmail = require('./sendEmail');

/**
 * sendConfirmEmail(toEmail, nameOrMessage)
 *
 * If nameOrMessage looks like a numeric OTP (4–8 digits) it sends an OTP email.
 * Otherwise it treats nameOrMessage as a name (or custom message) and sends a welcome email.
 *
 * This function delegates to ./sendEmail(to, subject, text, html) and returns the promise.
 */
module.exports = async function sendConfirmEmail(toEmail, nameOrMessage) {
  if (!toEmail || typeof toEmail !== 'string') {
    throw new Error('No recipient email provided or invalid email');
  }

  // basic email sanity check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(toEmail)) {
    throw new Error('Invalid recipient email address');
  }

  try {
    // OTP detection: 4 to 8 numeric digits
    const otpMatch = typeof nameOrMessage === 'string' && /^\d{4,8}$/.test(nameOrMessage);

    if (otpMatch) {
      const otp = nameOrMessage;
      const subject = 'Your LiveMart verification code';
      const text = `Hi,\n\nYour LiveMart verification code is: ${otp}\nIt will expire in 10 minutes.\n\n— LiveMart Team`;
      const html = `<div style="font-family: Arial, sans-serif; line-height:1.4;">
        <p>Hi,</p>
        <p>Your LiveMart verification code is: <strong style="font-size:18px">${otp}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <p>— LiveMart Team</p>
      </div>`;
      return await sendEmail(toEmail, subject, text, html);
    }

    // Otherwise treat nameOrMessage as a name or custom message for welcome mail
    const name = (typeof nameOrMessage === 'string' && nameOrMessage.trim().length > 0)
      ? nameOrMessage.trim()
      : 'Customer';

    const subject = 'Welcome to LiveMart';
    const text = `Hi ${name},\n\nWelcome to LiveMart! Thanks for signing up.\n\n— LiveMart Team`;
    const html = `<div style="font-family: Arial, sans-serif; line-height:1.4;">
      <h2>Hi ${name},</h2>
      <p>Welcome to <strong>LiveMart</strong> — thanks for signing up!</p>
      <p>We're excited to have you on board.</p>
      <p>— LiveMart Team</p>
    </div>`;

    return await sendEmail(toEmail, subject, text, html);
  } catch (err) {
    // Bubble up a clear error for the caller while keeping the original error details in console
    console.error('Error sending confirmation email:', err);
    throw new Error(err.message || 'Failed to send confirmation email');
  }
};
