const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../db');

const router = express.Router();

// Helper function to send reset email (for now, log to console)
async function sendResetEmail(email, nama, resetUrl) {
  // TODO: Integrate with actual email service (e.g., nodemailer, SendGrid, etc.)
  console.log('\n📧 EMAIL RESET PASSWORD:');
  console.log(`Kepada: ${email}`);
  console.log(`Nama: ${nama}`);
  console.log(`Link Reset: ${resetUrl}`);
  console.log('---\n');
  
  // In production, you would use:
  // const transporter = nodemailer.createTransport({...});
  // await transporter.sendMail({
  //   from: process.env.EMAIL_USER,
  //   to: email,
  //   subject: 'Reset Password SIMAKSI',
  //   html: `<p>Halo ${nama},</p><p>Klik link berikut untuk reset password Anda:</p><a href="${resetUrl}">Reset Password</a>`
  // });
}

// Login route
router.get('/login', (req, res) => {
  const success = req.query.success;
  res.render('login', { error: null, success: success });
});

router.post('/login', async (req, res) => {
  const email = req.body.email?.trim() || '';
  const password = req.body.password?.trim() || '';

  // Validation
  if (!email || !password) {
    return res.render('login', { error: 'Email dan password harus diisi', success: null });
  }

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.render('login', { error: 'Email atau password salah', success: null });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.render('login', { error: 'Email atau password salah', success: null });
    }

    req.session.user = { id: user.id, nama: user.nama, email: user.email, role: user.role };

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
  const nama = req.body.nama?.trim() || '';
  const email = req.body.email?.trim() || '';
  const password = req.body.password?.trim() || '';
  
  console.log('Register attempt:', { nama, email, passwordLength: password?.length });
  
  // Validation
  if (!nama || !email || !password) {
    console.warn('Validation failed: missing fields');
    return res.render('register', { error: 'Semua field harus diisi' });
  }
  
  if (password.length < 6) {
    console.warn('Validation failed: password too short');
    return res.render('register', { error: 'Password minimal 6 karakter' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.warn('Validation failed: invalid email format');
    return res.render('register', { error: 'Format email tidak valid' });
  }

  try {
    // Check if email already exists
    console.log('Checking if email exists:', email);
    const [existingUser] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      console.warn('Email already registered:', email);
      return res.render('register', { error: 'Email sudah terdaftar, gunakan email lain' });
    }

    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('Inserting user to database:', { nama, email });
    const [result] = await db.query('INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)', 
      [nama, email, hashedPassword, 'user']);
    
    console.log('User registered successfully:', email);
    
    // Automatically log in the user
    req.session.user = { 
      id: result.insertId, 
      nama: nama, 
      email: email, 
      role: 'user' 
    };
    
    // Redirect directly to home page
    res.redirect('/beranda');
  } catch (err) {
    console.error('Register error details:', {
      message: err.message,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      sql: err.sql
    });
    // More detailed error message
    if (err.code === 'ER_DUP_ENTRY') {
      return res.render('register', { error: 'Email sudah terdaftar' });
    }
    if (err.code === 'ER_NO_REFERENCED_ROW' || err.errno === 1452) {
      return res.render('register', { error: 'Terjadi kesalahan database. Hubungi administrator.' });
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

// Forgot Password route - show form
router.get('/forgot-password', (req, res) => {
  res.render('forgot-password', { error: null, success: null });
});

// Forgot Password route - process form
router.post('/forgot-password', async (req, res) => {
  const email = req.body.email?.trim() || '';

  // Validation
  if (!email) {
    return res.render('forgot-password', { error: 'Email harus diisi', success: null });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.render('forgot-password', { error: 'Format email tidak valid', success: null });
  }

  try {
    // Check if email exists
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      // Don't reveal if email exists or not (security best practice)
      return res.render('forgot-password', { 
        error: null, 
        success: 'Jika email terdaftar, kami akan mengirimkan link reset password' 
      });
    }

    const user = users[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to database
    await db.query(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [resetTokenHash, resetTokenExpiry, user.id]
    );

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    // Send email (for now, just log to console)
    await sendResetEmail(user.email, user.nama, resetUrl);

    res.render('forgot-password', { 
      error: null, 
      success: 'Jika email terdaftar, kami akan mengirimkan link reset password' 
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.render('forgot-password', { 
      error: 'Terjadi kesalahan. Silakan coba lagi.', 
      success: null 
    });
  }
});

// Reset Password route - show form
router.get('/reset-password/:token', async (req, res) => {
  const { token } = req.params;

  try {
    // Hash the token to compare with database
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with this token
    const [users] = await db.query(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [tokenHash]
    );

    if (users.length === 0) {
      return res.render('reset-password', { 
        error: 'Link reset tidak valid atau sudah kadaluarsa', 
        success: null,
        validToken: false 
      });
    }

    res.render('reset-password', { 
      error: null, 
      success: null,
      validToken: true,
      token: token 
    });
  } catch (err) {
    console.error('Reset password (GET) error:', err);
    res.render('reset-password', { 
      error: 'Terjadi kesalahan', 
      success: null,
      validToken: false 
    });
  }
});

// Reset Password route - process form
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const password = req.body.password?.trim() || '';
  const konfirmasi_password = req.body.konfirmasi_password?.trim() || '';

  // Validation
  if (!password || !konfirmasi_password) {
    return res.render('reset-password', { 
      error: 'Semua field harus diisi', 
      success: null,
      validToken: true,
      token: token 
    });
  }

  if (password !== konfirmasi_password) {
    return res.render('reset-password', { 
      error: 'Konfirmasi password tidak cocok', 
      success: null,
      validToken: true,
      token: token 
    });
  }

  if (password.length < 6) {
    return res.render('reset-password', { 
      error: 'Password minimal 6 karakter', 
      success: null,
      validToken: true,
      token: token 
    });
  }

  if (password.length > 255) {
    return res.render('reset-password', { 
      error: 'Password terlalu panjang (maksimal 255 karakter)', 
      success: null,
      validToken: true,
      token: token 
    });
  }

  try {
    // Hash the token
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with this token
    const [users] = await db.query(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [tokenHash]
    );

    if (users.length === 0) {
      return res.render('reset-password', { 
        error: 'Link reset tidak valid atau sudah kadaluarsa', 
        success: null,
        validToken: false 
      });
    }

    const user = users[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    await db.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.render('reset-password', { 
      error: null, 
      success: 'Password berhasil diubah. Silakan login dengan password baru.',
      validToken: false 
    });
  } catch (err) {
    console.error('Reset password (POST) error:', err);
    res.render('reset-password', { 
      error: 'Terjadi kesalahan. Silakan coba lagi.', 
      success: null,
      validToken: true,
      token: token 
    });
  }
});

module.exports = router;