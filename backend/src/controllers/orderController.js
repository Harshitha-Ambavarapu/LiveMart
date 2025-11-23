// backend/src/controllers/orderController.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

/* ============================================
   CREATE ORDER
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
      totalAmount,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    const orderItems = [];
    let seller = null;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ message: `Product ${item.product} not found` });

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}. Available: ${product.stock}` });
      }

      if (!seller) {
        seller = product.seller;
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal: product.price * item.quantity,
      });

      product.stock -= item.quantity;
      await product.save();
    }

    const normalizedSubtotal = Number(subtotal) || orderItems.reduce((s, i) => s + i.subtotal, 0);
    const normalizedShipping = Number(shippingCost) || 0;
    const normalizedTax = Number(tax) || 0;
    const normalizedTotal = Number(totalAmount) || normalizedSubtotal + normalizedShipping + normalizedTax;

    const order = await Order.create({
      user: req.user._id,
      customer: req.user._id,
      seller: seller,
      items: orderItems,
      shippingAddress: shippingAddress || deliveryAddress,
      deliveryAddress: deliveryAddress || shippingAddress,
      paymentMethod,
      subtotal: normalizedSubtotal,
      shippingCost: normalizedShipping,
      tax: normalizedTax,
      totalAmount: normalizedTotal,
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
    const orders = await Order.find({ seller: req.user._id })
      .populate("customer", "name email phone")
      .populate("items.product", "name images")
      .sort("-createdAt");

    res.status(200).json({ success: true, count: orders.length, orders });
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

// ==========================================================
// ⚡ STRIPE PAYMENT FUNCTIONS (UPDATED + CHECKOUT) ⚡
// ==========================================================

/**
 * Create Stripe PaymentIntent
 * POST /api/orders/:orderId/paymentIntent
 */
exports.createPaymentIntent = async (req, res) => {
  try {
    const orderId = req.params.orderId || null;
    let amountRupees = null;

    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: 'Order not found' });
      amountRupees = Number(order.totalAmount);
    } else {
      const { amount } = req.body;
      if (!amount || isNaN(amount)) return res.status(400).json({ message: "Amount is required when orderId is not provided" });
      amountRupees = Number(amount);
    }

    if (amountRupees <= 0 || isNaN(amountRupees)) return res.status(400).json({ message: "Invalid amount" });

    const amountInPaise = Math.round(amountRupees * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPaise,
      currency: process.env.STRIPE_CURRENCY || 'inr',
      payment_method_types: ['card'],
      metadata: {
        orderId: orderId || 'none',
        userId: req.user ? req.user._id.toString() : 'guest',
      },
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return res.status(500).json({ message: 'Error creating payment intent', error: error.message });
  }
};

/**
 * Create Stripe Checkout Session
 * POST /api/orders/:orderId/create-checkout-session
 */
exports.createCheckoutSession = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId).populate('items.product', 'name price');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    const line_items = order.items.map(item => ({
      price_data: {
        currency: process.env.STRIPE_CURRENCY || 'inr',
        product_data: { name: item.name || (item.product && item.product.name) || 'Product' },
        unit_amount: Math.round((item.price || (item.product && item.product.price) || 0) * 100),
      },
      quantity: item.quantity,
    }));

    if (order.shippingCost && Number(order.shippingCost) > 0) {
      line_items.push({
        price_data: {
          currency: process.env.STRIPE_CURRENCY || 'inr',
          product_data: { name: 'Shipping' },
          unit_amount: Math.round(Number(order.shippingCost) * 100),
        },
        quantity: 1,
      });
    }

    if (order.tax && Number(order.tax) > 0) {
      line_items.push({
        price_data: {
          currency: process.env.STRIPE_CURRENCY || 'inr',
          product_data: { name: 'Tax' },
          unit_amount: Math.round(Number(order.tax) * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.CLIENT_ROOT_URI || 'http://localhost:3000'}/order-confirmation/${order._id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_ROOT_URI || 'http://localhost:3000'}/checkout`,
      metadata: {
        orderId: order._id.toString(),
        userId: req.user ? req.user._id.toString() : 'guest',
      },
    });

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('createCheckoutSession error:', err);
    return res.status(500).json({ message: 'Failed to create checkout session', error: err.message });
  }
};

/**
 * Stripe Webhook Handler
 * POST /api/webhooks/stripe
 * Note: route must be mounted with express.raw() upstream
 */
exports.handleStripeWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`⚠️ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log(`PaymentIntent ${paymentIntent.id} succeeded`);
        const orderId = paymentIntent.metadata?.orderId;
        if (orderId && orderId !== 'none') {
          try {
            const updatedOrder = await Order.findByIdAndUpdate(
              orderId,
              {
                paymentMethod: 'Stripe',
                paymentStatus: 'paid',
                paymentIntentId: paymentIntent.id,
                status: 'Processing',
                orderStatus: 'Processing',
              },
              { new: true }
            );

            if (updatedOrder) {
              console.log(`Order ${orderId} updated to paid via webhook.`);
              if (updatedOrder.customer) {
                try {
                  const customer = await User.findById(updatedOrder.customer);
                  if (customer && customer.email) {
                    await sendEmail(
                      customer.email,
                      "Payment received for your order",
                      `Hi ${customer.name || 'Customer'}, we received payment for order #${updatedOrder._id}. We'll process it shortly.`
                    );
                  }
                } catch (mailErr) {
                  console.error("Failed to send payment confirmation email:", mailErr);
                }
              }
            } else {
              console.error(`Order ${orderId} not found to mark as paid (webhook).`);
            }
          } catch (updateErr) {
            console.error('Error updating order on payment success webhook:', updateErr);
          }
        } else {
          console.warn('payment_intent.succeeded webhook received but metadata.orderId missing.');
        }
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log(`Checkout session completed: ${session.id}`);
        const orderId = session.metadata?.orderId;
        const paymentIntentId = session.payment_intent || null;
        if (orderId) {
          try {
            const updatedOrder = await Order.findByIdAndUpdate(
              orderId,
              {
                paymentMethod: 'Stripe (Checkout)',
                paymentStatus: 'paid',
                paymentIntentId: paymentIntentId,
                status: 'Processing',
                orderStatus: 'Processing',
              },
              { new: true }
            );

            if (updatedOrder) {
              console.log(`Order ${orderId} updated to paid via checkout.session.completed.`);
              if (updatedOrder.customer) {
                try {
                  const customer = await User.findById(updatedOrder.customer);
                  if (customer && customer.email) {
                    await sendEmail(
                      customer.email,
                      "Payment received for your order",
                      `Hi ${customer.name || 'Customer'}, we received payment for order #${updatedOrder._id} via Checkout. We'll process it shortly.`
                    );
                  }
                } catch (mailErr) {
                  console.error("Failed to send payment confirmation email after checkout session:", mailErr);
                }
              }
            } else {
              console.error(`Order ${orderId} not found to mark as paid (checkout.session.completed).`);
            }
          } catch (updateErr) {
            console.error('Error updating order on checkout.session.completed webhook:', updateErr);
          }
        } else {
          console.warn('checkout.session.completed webhook received but session.metadata.orderId missing.');
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.warn(`Payment failed for PaymentIntent ${paymentIntent.id}:`, paymentIntent.last_payment_error?.message);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Error handling webhook event:", err);
    res.status(200).json({ received: true, error: err.message });
  }
};
