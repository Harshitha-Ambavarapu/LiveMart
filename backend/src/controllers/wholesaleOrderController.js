// src/controllers/wholesaleOrderController.js
const WholesaleOrder = require('../models/WholesaleOrder'); // we'll create simple model
const Product = require('../models/Product');

exports.createWholesaleOrder = async (req, res) => {
  try {
    const { items, retailerId } = req.body;
    // Basic validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items provided' });
    }

    // Check each product availability and optionally reserve or decrement stock (business rules)
    for (const it of items) {
      const product = await Product.findById(it.productId);
      if (!product) return res.status(404).json({ success: false, message: `Product ${it.productId} not found` });
      if (product.stock < it.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }
      // Optionally decrement stock now (or after payment/shipping) — here we deduct
      product.stock = product.stock - it.quantity;
      await product.save();
    }

    // Create wholesale order record (simple schema)
    const order = await WholesaleOrder.create({
      retailer: req.user.id,
      items,
      total: items.reduce((s,i) => s + (i.unitPrice ? i.unitPrice : 0) * i.quantity + (i.markup||0) * i.quantity, 0),
      status: 'pending'
    });

    return res.status(201).json({ success: true, order });
  } catch (err) {
    console.error('Wholesale order error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};