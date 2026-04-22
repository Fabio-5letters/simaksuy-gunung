const express = require('express');
const path = require('path');
const db = require('../db');

const router = express.Router();

// Berita page - accessible to all users with search
router.get('/berita', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let query, countQuery, params = [], countParams = [];

    if (search) {
      // Search in judul and isi_berita
      const searchPattern = `%${search}%`;
      query = `SELECT * FROM berita WHERE judul LIKE ? OR isi_berita LIKE ? ORDER BY tanggal DESC LIMIT ? OFFSET ?`;
      params = [searchPattern, searchPattern, limit, offset];
      
      countQuery = `SELECT COUNT(*) as total FROM berita WHERE judul LIKE ? OR isi_berita LIKE ?`;
      countParams = [searchPattern, searchPattern];
    } else {
      query = `SELECT * FROM berita ORDER BY tanggal DESC LIMIT ? OFFSET ?`;
      params = [limit, offset];
      
      countQuery = `SELECT COUNT(*) as total FROM berita`;
      countParams = [];
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    const [berita] = await db.query(query, params);

    res.render('berita', { 
      berita, 
      user: req.session.user,
      currentPage: page,
      totalPages,
      total,
      search
    });
  } catch (err) {
    console.error('Berita error:', err);
    res.render('berita', { berita: [], user: req.session.user, currentPage: 1, totalPages: 0, total: 0, search: '' });
  }
});

// Single berita page
router.get('/berita/:id', async (req, res) => {
  try {
    const [berita] = await db.query('SELECT * FROM berita WHERE id = ?', [req.params.id]);
    if (berita.length === 0) {
      return res.status(404).render('404', { message: 'Berita tidak ditemukan', user: req.session.user });
    }
    res.render('berita-detail', { berita: berita[0], user: req.session.user });
  } catch (err) {
    console.error('Berita detail error:', err);
    res.status(500).render('error', { message: 'Terjadi kesalahan saat memuat berita', user: req.session.user });
  }
});

// Pendakian page - accessible to all users
router.get('/pendakian', async (req, res) => {
  try {
    const [gunung] = await db.query('SELECT * FROM gunung');
    res.render('pendakian', { gunung, user: req.session.user });
  } catch (err) {
    console.error('Pendakian error:', err);
    res.render('pendakian', { gunung: [], user: req.session.user, error: 'Gagal memuat data gunung' });
  }
});

// Detail gunung - accessible to all users
router.get('/pendakian/:id', async (req, res) => {
  try {
    const [gunung] = await db.query('SELECT * FROM gunung WHERE id = ?', [req.params.id]);
    
    if (gunung.length === 0) {
      return res.status(404).render('404', { 
        message: 'Gunung tidak ditemukan', 
        user: req.session.user 
      });
    }

    const data = gunung[0];
    
    // Get related news
    const [berita] = await db.query(
      'SELECT * FROM berita WHERE judul LIKE ? ORDER BY tanggal DESC LIMIT 3',
      [`%${data.nama_gunung.replace('Gunung', '')}%`]
    );

    res.render('gunung-detail', { 
      gunung: data, 
      berita,
      user: req.session.user 
    });
  } catch (err) {
    console.error('Gunung detail error:', err);
    res.status(500).render('error', { 
      message: 'Terjadi kesalahan saat memuat detail gunung', 
      user: req.session.user 
    });
  }
});

// Kontak page - accessible to all users
router.get('/kontak', (req, res) => {
  res.render('kontak', { user: req.session.user });
});

// Submit kontak
router.post('/kontak', async (req, res) => {
  const nama = req.body.nama?.trim() || '';
  const email = req.body.email?.trim() || '';
  const subjek = req.body.subjek?.trim() || '';
  const pesan = req.body.pesan?.trim() || '';
  
  // Validate input
  if (!nama || !email || !subjek || !pesan) {
    return res.render('kontak', { 
      user: req.session.user,
      error: 'Semua field harus diisi'
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.render('kontak', { 
      user: req.session.user,
      error: 'Format email tidak valid'
    });
  }

  // Validate minimum message length
  if (pesan.length < 10) {
    return res.render('kontak', { 
      user: req.session.user,
      error: 'Pesan minimal 10 karakter'
    });
  }

  // TODO: Implement email sending to admin
  // For now, just log the message
  console.log('\n📧 Pesan Kontak Baru:');
  console.log(`Dari: ${nama} (${email})`);
  console.log(`Subjek: ${subjek}`);
  console.log(`Pesan: ${pesan}`);
  console.log(`Waktu: ${new Date().toLocaleString('id-ID')}\n`);

  res.render('kontak', { 
    user: req.session.user,
    success: 'Pesan Anda berhasil dikirim! Kami akan segera menghubungi Anda.',
    error: null
  });
});

// Profile page - for logged in users
router.get('/profile', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  try {
    // Get fresh user data from database
    const [users] = await db.query(
      'SELECT id, nama, email, role, created_at FROM users WHERE id = ?',
      [req.session.user.id]
    );

    if (users.length === 0) {
      req.session.destroy();
      return res.redirect('/login');
    }

    const userData = users[0];

    // Get user statistics
    const [pemesananStats] = await db.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'diverifikasi' THEN 1 ELSE 0 END) as diverifikasi,
        SUM(CASE WHEN status = 'pending' OR status = 'dibayar' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'ditolak' THEN 1 ELSE 0 END) as ditolak
       FROM pemesanan WHERE id_user = ?`,
      [req.session.user.id]
    );

    res.render('profile', { 
      user: req.session.user,
      userData,
      stats: pemesananStats[0],
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (err) {
    console.error('Profile error:', err);
    res.render('profile', { 
      user: req.session.user,
      error: 'Gagal memuat profile'
    });
  }
});

// Update profile
router.post('/profile/update', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const nama = req.body.nama?.trim() || '';
  const email = req.body.email?.trim() || '';

  // Validate input
  if (!nama || !email) {
    req.flash('error', 'Nama dan email harus diisi');
    return res.redirect('/profile');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    req.flash('error', 'Format email tidak valid');
    return res.redirect('/profile');
  }

  try {
    // Check if email already exists (excluding current user)
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, req.session.user.id]
    );

    if (existing.length > 0) {
      req.flash('error', 'Email sudah digunakan oleh user lain');
      return res.redirect('/profile');
    }

    // Update user data
    await db.query(
      'UPDATE users SET nama = ?, email = ? WHERE id = ?',
      [nama, email, req.session.user.id]
    );

    // Update session
    req.session.user.nama = nama;
    req.session.user.email = email;

    req.flash('success', 'Profile berhasil diupdate!');
    res.redirect('/profile');
  } catch (err) {
    console.error('Update profile error:', err);
    req.flash('error', 'Gagal mengupdate profile');
    res.redirect('/profile');
  }
});

// Change password
router.post('/profile/change-password', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const password_lama = req.body.password_lama?.trim() || '';
  const password_baru = req.body.password_baru?.trim() || '';
  const konfirmasi_password = req.body.konfirmasi_password?.trim() || '';
  const bcrypt = require('bcryptjs');

  // Validate input
  if (!password_lama || !password_baru || !konfirmasi_password) {
    req.flash('error', 'Semua field password harus diisi');
    return res.redirect('/profile');
  }

  if (password_baru !== konfirmasi_password) {
    req.flash('error', 'Konfirmasi password tidak cocok');
    return res.redirect('/profile');
  }

  if (password_baru.length < 6) {
    req.flash('error', 'Password minimal 6 karakter');
    return res.redirect('/profile');
  }

  if (password_baru.length > 255) {
    req.flash('error', 'Password terlalu panjang (maksimal 255 karakter)');
    return res.redirect('/profile');
  }

  if (password_lama === password_baru) {
    req.flash('error', 'Password baru harus berbeda dengan password lama');
    return res.redirect('/profile');
  }

  try {
    // Get current user password
    const [users] = await db.query(
      'SELECT password FROM users WHERE id = ?',
      [req.session.user.id]
    );

    if (users.length === 0) {
      req.flash('error', 'User tidak ditemukan');
      return res.redirect('/profile');
    }

    const isMatch = await bcrypt.compare(password_lama, users[0].password);

    if (!isMatch) {
      req.flash('error', 'Password lama tidak benar');
      return res.redirect('/profile');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password_baru, 10);

    // Update password
    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.session.user.id]
    );

    req.flash('success', 'Password berhasil diubah!');
    res.redirect('/profile');
  } catch (err) {
    console.error('Change password error:', err);
    req.flash('error', 'Gagal mengubah password');
    res.redirect('/profile');
  }
});

// Riwayat pendakian - for logged in users
router.get('/riwayat', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let whereClause = 'WHERE p.id_user = ?';
    let whereClauseSimaksi = 'WHERE s.id_user = ?';
    let params = [req.session.user.id];
    let paramsSimaksi = [req.session.user.id];

    if (search) {
      const searchPattern = `%${search}%`;
      whereClause += ' AND (g.nama_gunung LIKE ? OR p.kode_booking LIKE ?)';
      whereClauseSimaksi += ' AND g.nama_gunung LIKE ?';
      params.push(searchPattern, searchPattern);
      paramsSimaksi.push(searchPattern);
    }

    // Get total count for pagination
    const [countResult] = await db.query(`
      SELECT COUNT(*) as total FROM pemesanan p
      JOIN gunung g ON p.id_gunung = g.id
      ${whereClause}
    `, params);

    const [countResultSimaksi] = await db.query(`
      SELECT COUNT(*) as total FROM simaksi s
      JOIN gunung g ON s.id_gunung = g.id
      ${whereClauseSimaksi}
    `, paramsSimaksi);

    const total = countResult[0].total + countResultSimaksi[0].total;
    const totalPages = Math.ceil(total / limit);

    // Get data from pemesanan table (modern payment system)
    const [pemesanan] = await db.query(`
      SELECT p.*, g.nama_gunung, g.lokasi, g.ketinggian
      FROM pemesanan p
      JOIN gunung g ON p.id_gunung = g.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    // Also get data from simaksi table (legacy system)
    const [simaksi] = await db.query(`
      SELECT s.*, g.nama_gunung, g.lokasi, g.ketinggian
      FROM simaksi s
      JOIN gunung g ON s.id_gunung = g.id
      ${whereClauseSimaksi}
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `, [...paramsSimaksi, limit, offset]);

    // Merge and show both (pemesanan takes priority as it's more complete)
    const combinedData = [...pemesanan, ...simaksi];

    res.render('riwayat', { 
      simaksi: combinedData, 
      user: req.session.user,
      currentPage: page,
      totalPages,
      total,
      search
    });
  } catch (err) {
    console.error('Riwayat error:', err);
    res.render('riwayat', { 
      simaksi: [], 
      user: req.session.user, 
      currentPage: 1,
      totalPages: 0,
      total: 0,
      search: '',
      error: 'Gagal memuat riwayat' 
    });
  }
});

// Download E-Tiket
router.get('/download-etiket/:kode_booking', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  try {
    const { kode_booking } = req.params;

    const [pemesanan] = await db.query(`
      SELECT p.*, g.nama_gunung, g.lokasi, g.ketinggian, u.nama AS nama_user, u.email AS email_user
      FROM pemesanan p
      JOIN gunung g ON p.id_gunung = g.id
      JOIN users u ON p.id_user = u.id
      WHERE p.kode_booking = ? AND p.id_user = ?
    `, [kode_booking, req.session.user.id]);

    if (pemesanan.length === 0) {
      return res.status(404).render('error', { 
        message: 'E-Tiket tidak ditemukan', 
        user: req.session.user 
      });
    }

    const data = pemesanan[0];

    // Check if payment is verified
    if (data.status !== 'diverifikasi') {
      req.flash('error', 'E-Tiket hanya dapat diunduh setelah pembayaran diverifikasi.');
      return res.redirect('/riwayat');
    }

    // Render E-Tiket as HTML
    res.render('etiket', { 
      user: req.session.user,
      pemesanan: data
    });
  } catch (err) {
    console.error('Download etiket error:', err);
    res.status(500).render('error', { 
      message: 'Terjadi kesalahan saat mengunduh E-Tiket', 
      user: req.session.user 
    });
  }
});

// Informasi Cuaca page - accessible to all users
router.get('/cuaca', async (req, res) => {
  try {
    const [gunung] = await db.query('SELECT * FROM gunung');

    res.render('cuaca', { gunung, user: req.session.user });
  } catch (err) {
    console.error('Cuaca error:', err);
    res.render('cuaca', { gunung: [], user: req.session.user, error: 'Gagal memuat data cuaca' });
  }
});

// Status Pendakian page - for logged in users
router.get('/status', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  try {
    const [simaksi] = await db.query(`
      SELECT s.*, g.nama_gunung, g.lokasi
      FROM simaksi s
      JOIN gunung g ON s.id_gunung = g.id
      WHERE s.id_user = ?
      ORDER BY s.id DESC
    `, [req.session.user.id]);

    console.log('User ID:', req.session.user.id, 'Data Status:', simaksi);
    res.render('status', { simaksi, user: req.session.user });
  } catch (err) {
    console.error('Status error:', err);
    res.render('status', { simaksi: [], user: req.session.user, error: 'Gagal memuat status pendakian' });
  }
});

// Download Panduan page - accessible to all users
router.get('/panduan', (req, res) => {
  res.render('panduan', { user: req.session.user });
});

// FAQ page
router.get('/faq', (req, res) => {
  res.render('faq', { user: req.session.user });
});

// Syarat & Ketentuan page
router.get('/syarat-ketentuan', (req, res) => {
  res.render('syarat-ketentuan', { user: req.session.user });
});

// Keselamatan page
router.get('/keselamatan', (req, res) => {
  res.render('keselamatan', { user: req.session.user });
});

// Download file panduan
router.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../public/panduan', filename);
  
  // Security: Prevent path traversal
  const resolvedPath = path.resolve(filePath);
  const allowedPath = path.resolve(path.join(__dirname, '../public/panduan'));
  
  if (!resolvedPath.startsWith(allowedPath)) {
    return res.status(403).render('error', { 
      message: 'Akses ditolak: Path tidak valid', 
      user: req.session.user 
    });
  }

  // Check if file exists
  if (require('fs').existsSync(resolvedPath)) {
    res.download(resolvedPath);
  } else {
    res.status(404).render('error', { message: 'File panduan tidak ditemukan', user: req.session.user });
  }
});

module.exports = router;