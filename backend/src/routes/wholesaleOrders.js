// src/routes/wholesaleOrders.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createWholesaleOrder } = require('../controllers/wholesaleOrderController');

router.post('/', protect, authorize('retailer'), createWholesaleOrder);

module.exports = router;
