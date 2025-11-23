// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// load env first
require('dotenv').config();

const app = express();

// ---------- DEBUG: Stripe env checks (helpful for dev) ----------
/*
  Prints:
   - prefix of STRIPE_SECRET_KEY (first 3 chars)
   - whether STRIPE_WEBHOOK_SECRET is present
   - a warning if STRIPE_SECRET_KEY looks like a publishable key (pk_)
*/
console.log('STRIPE_SECRET_KEY prefix:', process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.slice(0,3) : 'MISSING');
console.log('STRIPE_WEBHOOK_SECRET present:', !!process.env.STRIPE_WEBHOOK_SECRET);
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('pk_')) {
  console.error('⚠️  STRIPE_SECRET_KEY looks like a publishable key (pk_...). Move the secret key (sk_...) to backend .env.');
}

// ---------- Basic config ----------
const CLIENT_ROOT = process.env.CLIENT_ROOT_URI || 'http://localhost:3000';
const PORT = process.env.PORT || 4000;

// ---------- Middleware that must run AFTER webhook raw handler ----------
app.use(cors({ origin: CLIENT_ROOT, credentials: true }));

// ---------- Passport / Session / Cookies ----------
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');

// require passport strategies (ensure the file exists at this path)
try {
  require('./passport-google'); // path: ./passport-google.js
} catch (err) {
  console.warn('passport-google.js not found or failed to load. Ensure file exists if using Google auth.');
}

app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'keyboard-cat',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ---------- Serve static uploads ----------
app.use('/uploads', express.static(path.join(__dirname, './public/uploads')));

// ---------- Stripe webhook route (must receive RAW body) ----------
// This route must be mounted BEFORE express.json() so the raw buffer is available for signature verification.
// The handler is implemented in controllers/orderController.js as `handleStripeWebhook`.
let webhookHandler;
try {
  // adapt path if your controllers live in a different folder (e.g., ./src/controllers)
  const orderController = require('./controllers/orderController');
  webhookHandler = orderController.handleStripeWebhook;
} catch (err) {
  console.warn('Could not load orderController.handleStripeWebhook. Make sure controllers/orderController.js exists.', err.message);
}

if (webhookHandler) {
  // Stripe sends JSON, but we need raw body for verification
  app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), webhookHandler);
} else {
  // If webhook handler not available, provide a simple dummy to avoid 404 during dev (optional)
  app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), (req, res) => {
    console.warn('Stripe webhook received but no handler was mounted (orderController missing).');
    res.status(200).send({ received: true });
  });
}

// ---------- Now regular body parsers for the rest of routes ----------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ---------- Test route ----------
app.get('/', (req, res) => {
  res.json({
    message: 'Live MART API is running! 🚀',
    status: 'success',
  });
});

// ---------------------------------------------------
// Import ALL routes (adjust paths if your routes live elsewhere)
// ---------------------------------------------------
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const reviewRoutes = require('./routes/reviews');
const wholesaleOrders = require('./routes/wholesaleOrders');

// ---------------------------------------------------
// Use ALL routes
// ---------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wholesale-orders', wholesaleOrders);

// ---------- test email route (temporary) ----------
const sendConfirmEmail = require('./utils/sendConfirmEmail');

app.get('/test/send-email', async (req, res) => {
  try {
    await sendConfirmEmail(process.env.SMTP_USER, 'Dev Tester');
    res.json({ success: true, message: 'Test email sent — check inbox/spam.' });
  } catch (err) {
    console.error('Test email error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------------------------------------------------
// MongoDB Connection
// ---------------------------------------------------
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/livemart', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

connectDB();

// ---------------------------------------------------
// Start Server
// ---------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`➡️  Frontend allowed origin: ${CLIENT_ROOT}`);
});
