const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./db');
const authRoutes = require('./routes/authRoutes'); // Import auth routes
const userRoutes = require('./routes/userRoutes'); // Import user routes

const app = express();
const PORT = process.env.PORT || 4000; // Change default port to 4000

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'simaksi_secret',
  resave: false,
  saveUninitialized: true
}));

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Add Content Security Policy header
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self';");
  next();
});

// Routes
// Redirect root path to /login
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Use auth routes
app.use('/', authRoutes);

// Use user routes
app.use('/', userRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});