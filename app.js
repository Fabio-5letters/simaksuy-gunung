const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const db = require('./db');
const authRoutes = require('./routes/authRoutes'); // Import auth routes
const userRoutes = require('./routes/userRoutes'); // Import user routes
const adminRoutes = require('./routes/adminRoutes'); // Import admin routes
const generalRoutes = require('./routes/generalRoutes'); // Import general routes
const pembayaranRoutes = require('./routes/pembayaranRoutes'); // Import payment routes

const app = express();
const PORT = process.env.PORT || 8081; // Default port

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'simaksi_secret_key_2024',
  resave: true,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));
app.use(flash());

// Make user and flash messages available to all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
// Redirect root path to /login
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Use auth routes
app.use('/', authRoutes);

// Use user routes
app.use('/', userRoutes);

// Use admin routes
app.use('/', adminRoutes);

// Use general routes
app.use('/', generalRoutes);

// Use payment routes
app.use('/', pembayaranRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', { user: req.session.user || null });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).render('error', {
    user: req.session.user || null,
    message: 'Terjadi kesalahan pada server',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server jalan di http://localhost:${PORT}`);
});