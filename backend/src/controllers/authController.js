// backend/src/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendConfirmEmail = require('../utils/sendConfirmEmail'); // new/expected helper

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
};

// Generate OTP (6-digit string)
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, location, businessDetails } = req.body;

    // Basic validation (you can expand)
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Name, email, password and phone are required' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role,
      location,
      businessDetails: role !== 'customer' ? businessDetails : undefined,
      otp: {
        code: otp,
        expiresAt: otpExpiry
      }
    });

    // Try to send OTP email — do not fail registration if email sending fails,
    // but let client know and log the error.
    try {
      await sendConfirmEmail(user.email, otp); // sendConfirmEmail(to, otp) sends OTP template
      console.log(`OTP email sent to ${user.email}`);
    } catch (emailErr) {
      console.error('Error sending OTP email during register:', emailErr);

      // Return success (user created) but inform client that OTP email failed.
      return res.status(201).json({
        success: true,
        message: 'Registration created but failed to send OTP email. Use resend OTP or contact support.',
        userId: user._id
      });
    }

    // If email sent OK, return success
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify OTP sent to your email.',
      userId: user._id
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) return res.status(400).json({ message: 'userId and otp are required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.otp || !user.otp.code) {
      return res.status(400).json({ message: 'No OTP found for user. Please request a new OTP.' });
    }

    // Check OTP validity
    if (user.otp.code !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    // Mark user as verified
    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location
      }
    });
  } catch (error) {
    console.error('verifyOTP error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user exists and select password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if verified
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your account first' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location
      }
    });
  } catch (error) {
    console.error('login error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = {
      code: otp,
      expiresAt: otpExpiry
    };
    await user.save();

    // Send OTP email
    try {
      await sendConfirmEmail(user.email, otp);
      console.log(`Resent OTP to ${user.email}`);
      return res.status(200).json({ success: true, message: 'OTP resent successfully' });
    } catch (e) {
      console.error('Error resending OTP email:', e);
      return res.status(500).json({ message: 'OTP saved but failed to send email' });
    }
  } catch (error) {
    console.error('resendOTP error:', error);
    res.status(500).json({ message: error.message });
  }
};