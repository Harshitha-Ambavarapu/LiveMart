// backend/src/controllers/orderController.js

const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/* ============================================
   CREATE ORDER (Customer → Retailer)
============================================ */
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      paymentMethod,
      shippingAddress,
      deliveryAddress,
      scheduledDate,
      notes,
      subtotal,
      shippingCost,
      tax,
      totalAmount
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    const orderItems = [];

    // Get seller from FIRST product (always a retailer)
    const firstProduct = await Product.findById(items[0].product);
    if (!firstProduct) {
      return res.status(404).json({ message: "Invalid product in order" });
    }

    const seller = firstProduct.seller;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product)
        return res.status(404).json({ message: `Product ${item.product} not found`});

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal: product.price * item.quantity,
        seller: product.seller,
        sellerRole: product.sellerRole,
      });

      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: req.user._id,
      customer: req.user._id,
      seller,
      items: orderItems,
      shippingAddress: shippingAddress || deliveryAddress,
      deliveryAddress: deliveryAddress || shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      tax,
      totalAmount,
      scheduledDate,
      notes,
      trackingInfo: {
        currentStatus: "Order placed",
        updates: [
          {
            status: "pending",
            message: "Order has been placed successfully",
            timestamp: new Date(),
          },
        ],
      },
    });

    const populated = await Order.findById(order._id)
      .populate("seller", "name phone")
      .populate("items.product", "name images");

    res.status(201).json({ success: true, ...populated.toObject() });

  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ============================================
   CUSTOMER — MY ORDERS
============================================ */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate("seller", "name")
      .populate("items.product", "name images")
      .sort("-createdAt");

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ============================================
   RETAILER — INCOMING ORDERS
============================================ */
exports.getIncomingOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      "items.seller": req.user._id
    })
      .populate("customer", "name email phone")
      .populate("items.product", "name images")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ============================================
   GET SINGLE ORDER
============================================ */
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name phone email")
      .populate("seller", "name phone email")
      .populate("items.product", "name images category");

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (
      order.customer._id.toString() !== req.user._id.toString() &&
      order.seller._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ============================================
   SELLER CONFIRM ORDER
============================================ */
exports.confirmOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "email name")
      .populate("seller", "email name");

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.seller._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    order.status = "confirmed";
    order.orderStatus = "confirmed";

    order.trackingInfo.updates.push({
      status: "confirmed",
      message: "Order confirmed by seller",
      timestamp: new Date(),
    });

    await order.save();

    await sendEmail(
      order.customer.email,
      "Your order has been confirmed",
      `Hello ${order.customer.name}, your order #${order._id} has been confirmed.`
    );

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ============================================
   CANCEL ORDER
============================================ */
exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (
      order.customer.toString() !== req.user._id.toString() &&
      order.seller.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (order.status === "delivered") {
      return res.status(400).json({ message: "Cannot cancel delivered order" });
    }

    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.status = "cancelled";
    order.orderStatus = "cancelled";
    order.cancellationReason = reason;

    order.trackingInfo.updates.push({
      status: "cancelled",
      message: `Order cancelled: ${reason}`,
      timestamp: new Date(),
    });

    await order.save();

    res.status(200).json({ success: true, message: "Order cancelled", order });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ============================================
   UPDATE ORDER STATUS
============================================ */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, message } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    order.status = status;
    order.orderStatus = status;

    order.trackingInfo.updates.push({
      status,
      message: message || `Order updated to ${status}`,
      timestamp: new Date(),
    });

    await order.save();

    res.status(200).json({ success: true, order });

  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ============================================
   STRIPE — PAYMENT INTENT
============================================ */
exports.createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100),
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });

  } catch (error) {
    console.log("Stripe intent error:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ============================================
   STRIPE — CHECKOUT SESSION
============================================ */
exports.createCheckoutSession = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate("items.product");

    if (!order) return res.status(404).json({ message: "Order not found" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      line_items: order.items.map((it) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: it.product.name,
          },
          unit_amount: Math.round(it.price * 100),
        },
        quantity: it.quantity,
      })),

      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/payment-success?orderId=${orderId}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-failed`,
    });

    res.json({ url: session.url });

  } catch (error) {
    console.log("Stripe checkout session error:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ============================================
   STRIPE — WEBHOOK HANDLER
============================================ */
exports.handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];

    let event;
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      console.log("💰 Payment completed!");
    }

    res.json({ received: true });

  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};