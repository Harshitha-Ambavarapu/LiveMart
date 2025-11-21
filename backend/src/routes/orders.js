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
  cancelOrder
} = require('../controllers/orderController');

// Create new order
router.post('/', protect, createOrder);

// Customer orders
router.get('/my-orders', protect, getMyOrders);

// Seller incoming orders
router.get('/incoming', protect, getIncomingOrders);

// Single order
router.get('/:id', protect, getOrder);

// Confirm order (seller only)
router.put('/:id/confirm', protect, confirmOrder);

// Update order status
router.put('/:id/status', protect, updateOrderStatus);

// Cancel order
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
