// src/controllers/wholesaleOrderController.js
const WholesaleOrder = require('../models/WholesaleOrder');
const Product = require('../models/Product');

exports.createWholesaleOrder = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items provided' });
    }

    const orderItems = [];

    // Check each product & process stock
    for (const it of items) {
      const product = await Product.findById(it.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${it.productId} not found`
        });
      }

      if (product.stock < it.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      // Deduct stock
      product.stock -= it.quantity;
      await product.save();

      // Store correct seller (wholesaler)
      orderItems.push({
        product: it.productId,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        markup: it.markup || 0,
        seller: product.seller,         // ⭐ wholesaler ID
        sellerRole: product.sellerRole  // ⭐ "wholesaler"
      });
    }

    // ⭐ Retailer should pay ONLY wholesaler price
    const wholesalerTotal = orderItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    // ⭐ Retailer’s markup is stored separately (NOT charged to wholesaler)
    const retailerProfit = orderItems.reduce(
      (sum, item) => sum + (item.markup || 0) * item.quantity,
      0
    );

    // Create wholesale order
    const order = await WholesaleOrder.create({
      retailer: req.user.id,      // who is buying
      items: orderItems,
      total: wholesalerTotal,     // ⭐ retailer pays this amount
      retailerProfit,             // ⭐ retailer profit (not charged)
      status: 'pending'
    });

    return res.status(201).json({ success: true, order });

  } catch (err) {
    console.error('Wholesale order error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};