const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // ✅ ADD THIS LINE
require('dotenv').config();

const app = express();

// ✅ Middleware
app.use(cors({ origin: process.env.CLIENT_ROOT_URI || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(express.urlencoded({ extended: true }));

const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');

// require passport strategies (create this file next)
require('./passport-google'); // path: src/passport-google.js

app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard-cat',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.use(passport.initialize());
app.use(passport.session());


// ✅ Serve static files for uploads (ADD THIS LINE)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// ✅ Test route
app.get('/', (req, res) => {
  res.json({
    message: 'Live MART API is running! 🚀',
    status: 'success',
  });
});

// ---------------------------------------------------
// Import ALL routes
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
const sendConfirmEmail = require('./utils/sendConfirmEmail'); // ensure this file exists

app.get('/test/send-email', async (req, res) => {
  try {
    await sendConfirmEmail(process.env.SMTP_USER, 'Dev Tester');
    res.json({ success: true, message: 'Test email sent — check inbox/spam.' });
  } catch (err) {
    console.error('Test email error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});
// -------------------------------------------------


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
  }
};

connectDB();

// ---------------------------------------------------
// Start Server
// ---------------------------------------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});