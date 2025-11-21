// src/routes/auth.js
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

const { 
  register, 
  verifyOTP, 
  login, 
  getMe, 
  resendOTP 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const sendConfirmEmail = require('../utils/sendConfirmEmail'); // ensure file exists and works

// NOTE: make sure `require('./passport-google')` is executed in server.js BEFORE this router is mounted
// e.g. in server.js: require('./passport-google'); app.use(passport.initialize()); app.use('/api/auth', authRoutes);

// Regular auth routes
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login);
router.get('/me', protect, getMe);

// --- Google OAuth routes ---
// Start OAuth flow
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback endpoint
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_ROOT_URI || 'http://localhost:3000'}/login`, session: true }),
  async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        return res.redirect(`${process.env.CLIENT_ROOT_URI || 'http://localhost:3000'}/login`);
      }

      // create JWT (use env or default)
      const expiresIn = process.env.JWT_EXPIRES_IN || '30d';
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn }
      );

      // If created very recently, send welcome/confirmation email (optional)
      try {
        const ageMs = Date.now() - new Date(user.createdAt || Date.now()).getTime();
        const justCreated = ageMs < 60 * 1000;
        if (justCreated && user.email) {
          await sendConfirmEmail(user.email, user.name);
        }
      } catch (emailErr) {
        console.error('Error sending confirmation email:', emailErr);
      }

      // Set token in httpOnly cookie (recommended)
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // set true only for HTTPS
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: (() => {
          // parse expressible number from env or fallback 30 days
          const days = parseInt(process.env.COOKIE_EXPIRES_DAYS || '30', 10);
          return days * 24 * 60 * 60 * 1000;
        })(),
        path: '/'
      });

      // Redirect to client success page
      return res.redirect(`${process.env.CLIENT_ROOT_URI || 'http://localhost:3000'}/auth/success`);
    } catch (err) {
      console.error('Google callback error:', err);
      return res.redirect(`${process.env.CLIENT_ROOT_URI || 'http://localhost:3000'}/login`);
    }
  }
);

// Optional: logout route (clears cookie and passport session)
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/'
  });

  // If Passport session is being used, log out there too
  if (typeof req.logout === 'function') {
    req.logout(err => {
      if (err) console.error('Passport logout error:', err);
    });
  }
  // Destroy express-session if used
  if (req.session) {
    req.session.destroy(() => {});
  }

  return res.json({ success: true, message: 'Logged out' });
});

module.exports = router;