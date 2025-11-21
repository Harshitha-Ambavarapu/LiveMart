// backend/src/models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  // 🆕 REQUIRED FOR RETAILER DASHBOARD & STOCK UPDATE
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },

  // 🆕 Helps identify route (customer → retailer OR retailer → wholesaler)
  sellerRole: {
    type: String,
    enum: ['retailer', 'wholesaler', null],
    default: null
  },

  name: String,
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },

  subtotal: {
    type: Number,
    required: true
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  // Customer who placed the order
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // ⚠️ Your old single-seller field — kept for backward compatibility
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // --------------------------
  // 🆕 Updated multi-seller items
  // --------------------------
  items: [orderItemSchema],

  // Shipping info
  shippingAddress: {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true }
  },

  deliveryAddress: {
    address: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: [Number]
  },

  // Payment
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'cod', 'online', 'offline'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: String,

  // Order status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },

  orderStatus: {
  type: String,
  enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
  default: 'pending'
},


  // Pricing
  subtotal: {
    type: Number,
    required: true
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },

  // Tracking
  trackingInfo: {
    currentStatus: String,
    estimatedDelivery: Date,
    updates: [{
      status: String,
      message: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },

  scheduledDate: Date,
  notes: String,
  cancellationReason: String,

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// -----------------------
// PRE-SAVE RECOMPUTATION
// -----------------------
orderSchema.pre('save', function (next) {
  if (this.items && this.items.length > 0) {
    if (!this.subtotal) {
      this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
    }

    if (!this.totalAmount) {
      this.totalAmount =
        this.subtotal +
        (this.shippingCost || 0) +
        (this.tax || 0);
    }
  }

  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
