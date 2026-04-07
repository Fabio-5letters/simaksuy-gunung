const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = express.Router();

// Login route
router.get('/login', (req, res) => {
  const success = req.query.success;
  res.render('login', { error: null, success: success });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('=== LOGIN ATTEMPT ===');
  console.log('Email:', email);
  console.log('Password:', password);

  // Validation
  if (!email || !password) {
    console.log('Validation failed: Email or password empty');
    return res.render('login', { error: 'Email dan password harus diisi', success: null });
  }

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    console.log('Query result count:', rows.length);

    if (rows.length === 0) {
      console.log('User not found for email:', email);
      return res.render('login', { error: 'Email atau password salah', success: null });
    }

    const user = rows[0];
    console.log('User found:', { id: user.id, nama: user.nama, email: user.email, role: user.role });
    console.log('Stored hash:', user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.render('login', { error: 'Email atau password salah', success: null });
    }

    req.session.user = { id: user.id, nama: user.nama, email: user.email, role: user.role };
    console.log('Login successful, session set:', req.session.user);
    console.log('Redirecting to:', user.role === 'admin' ? '/admin' : '/beranda');

    if (user.role === 'admin') {
      res.redirect('/admin');
    } else {
      res.redirect('/beranda');
    }
  } catch (err) {
    console.error('Login error:', err);
    res.render('login', { error: 'Terjadi kesalahan saat login. Silakan coba lagi.', success: null });
  }
});

// Register route
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

router.post('/register', async (req, res) => {
  const { nama, email, password } = req.body;
  
  // Validation
  if (!nama || !email || !password) {
    return res.render('register', { error: 'Semua field harus diisi' });
  }
  
  if (password.length < 6) {
    return res.render('register', { error: 'Password minimal 6 karakter' });
  }

  try {
    // Check if email already exists
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.render('register', { error: 'Email sudah terdaftar, gunakan email lain' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)', 
      [nama, email, hashedPassword, 'user']);
    
    // Redirect to login with success message
    res.redirect('/login?success=true');
  } catch (err) {
    console.error('Register error:', err);
    // More detailed error message
    if (err.code === 'ER_DUP_ENTRY') {
      return res.render('register', { error: 'Email sudah terdaftar' });
    }
    res.render('register', { error: 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.' });
  }
});

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Server error');
    }
    res.redirect('/login');
  });
});

module.exports = router;