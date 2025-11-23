const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
  createOrder,
  getMyOrders,
  getIncomingOrders,
  getOrder,
  updateOrderStatus,
  confirmOrder,
  cancelOrder,
  createPaymentIntent,
  createCheckoutSession,
  handleStripeWebhook,
} = require('../controllers/orderController');

// Create new order
router.post('/', protect, createOrder);

// Customer orders
router.get('/my-orders', protect, getMyOrders);

// Seller incoming orders
router.get('/incoming', protect, getIncomingOrders);

// Stripe Payment Intent (for inline card payments)
router.post('/:orderId/paymentIntent', protect, createPaymentIntent);

// Stripe Checkout Session (hosted checkout)
router.post('/:orderId/create-checkout-session', protect, createCheckoutSession);

// Single order
router.get('/:id', protect, getOrder);

// Confirm order (seller only)
router.put('/:id/confirm', protect, confirmOrder);

// Update order status
router.put('/:id/status', protect, updateOrderStatus);

// Cancel order
router.put('/:id/cancel', protect, cancelOrder);

// Stripe webhook (do NOT protect this route) - mounted with raw body in server.js
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;