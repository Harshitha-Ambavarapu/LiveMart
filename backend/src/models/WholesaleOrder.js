// src/models/WholesaleOrder.js
const mongoose = require('mongoose');

const WholesaleOrderSchema = new mongoose.Schema({
  retailer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    markup: Number,
    unitPrice: Number
  }],
  total: Number,
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WholesaleOrder', WholesaleOrderSchema);
