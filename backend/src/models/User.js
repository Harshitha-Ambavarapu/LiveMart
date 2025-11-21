const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    default: null
  },

  name: {
    type: String,
    required: function () {
      return !this.googleId; // required only for normal signup
    },
    trim: true
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)@\w+([.-]?\w+)(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },

  // Password required ONLY for normal signup
  password: {
    type: String,
    required: function () {
      return !this.googleId; // Google users have no password
    },
    minlength: 6,
    select: false
  },

  // Phone NOT required for Google users
  phone: {
    type: String,
    required: function () {
      return !this.googleId;
    },
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },

  role: {
    type: String,
    enum: ['customer', 'retailer', 'wholesaler'],
    default: 'customer'
  },

  // Location optional for Google users
  location: {
    address: { type: String },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    city: String,
    state: String,
    pincode: String
  },

  businessDetails: {
    businessName: String,
    gstin: String,
    businessType: String
  },

  connectedWholesalers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  isVerified: {
    type: Boolean,
    default: false
  },

  otp: {
    code: String,
    expiresAt: Date
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ----------------------------
// PASSWORD HASHING
// ----------------------------
userSchema.pre('save', async function (next) {
  // Skip hashing if password is not modified or missing (Google users)
  if (!this.password || !this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ----------------------------
// COMPARE PASSWORD
// ----------------------------
userSchema.methods.comparePassword = async function (enteredPassword) {
  // If Google user (no password stored)
  if (!this.password) return false;

  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);