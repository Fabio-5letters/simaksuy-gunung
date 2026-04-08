require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const generalRoutes = require('./routes/generalRoutes');
const pembayaranRoutes = require('./routes/pembayaranRoutes');

const app = express();
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security: Helmet for security headers
app.use(helmet());

// Security: Content Security Policy
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"]
    }
  })
);

// Rate limiting for all routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Terlalu banyak permintaan. Silakan coba lagi dalam 15 menit.',
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 8, // limit each IP to 8 login/register attempts per windowMs
  message: 'Terlalu banyak percobaan. Silakan coba lagi dalam 15 menit.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use(generalLimiter);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret_key_change_in_production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: NODE_ENV === 'production', // true for HTTPS in production
    httpOnly: true,
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000, // 24 hours
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
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Use auth routes with rate limiting
app.use('/', authLimiter, authRoutes);

// Use other routes
app.use('/', userRoutes);
app.use('/', adminRoutes);
app.use('/', generalRoutes);
app.use('/', pembayaranRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', {
    user: req.session.user || null,
    message: 'Maaf, halaman yang Anda cari tidak dapat ditemukan.'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Don't leak error details in production
  const errorMessage = NODE_ENV === 'development' ? err.message : 'Terjadi kesalahan pada server';
  
  res.status(500).render('error', {
    user: req.session.user || null,
    message: 'Terjadi kesalahan pada server',
    error: errorMessage
  });
});

// Start server with automatic port fallback
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`\n✅ SIMAKSI Server Running`);
    console.log(`📍 Environment: ${NODE_ENV}`);
    console.log(`🌐 Server: http://localhost:${port}`);
    console.log(`🔒 Security: Helmet enabled, Rate limiting active`);
    console.log(`📡 Tekan Ctrl+C untuk menghentikan server\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`\n⚠️  Port ${port} sudah digunakan!`);
      const newPort = port + 1;
      console.log(`🔄 Mencoba port alternatif: ${newPort}...\n`);
      startServer(newPort);
    } else {
      console.error('❌ Server error:', err);
      process.exit(1);
    }
  });

  return server;
}

const PORT = process.env.PORT || 8081;
startServer(PORT);

module.exports = app;