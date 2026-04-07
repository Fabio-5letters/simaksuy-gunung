const express = require('express');
const db = require('../db');

const router = express.Router();

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
  console.log('Session check:', req.session.user);
  if (req.session.user && req.session.user.role === 'user') {
    return next();
  }
  console.log('Redirecting to login - no valid session');
  res.redirect('/login');
}

// User dashboard
router.get('/beranda', isAuthenticated, async (req, res) => {
  console.log('Accessing beranda, session:', req.session.user);
  try {
    const [gunung] = await db.query('SELECT * FROM gunung');
    const [berita] = await db.query('SELECT * FROM berita ORDER BY tanggal DESC LIMIT 3');
    const [simaksi] = await db.query('SELECT s.*, g.nama_gunung FROM simaksi s JOIN gunung g ON s.id_gunung = g.id WHERE s.id_user = ?', [req.session.user.id]);

    res.render('beranda', { gunung, berita, simaksi, user: req.session.user });
  } catch (err) {
    console.error('Beranda error:', err);
    res.render('beranda', { gunung: [], berita: [], simaksi: [], user: req.session.user, error: 'Gagal memuat data' });
  }
});

// Apply for Simaksi
router.post('/simaksi', isAuthenticated, async (req, res) => {
  const { id_gunung, tanggal_pendakian, jumlah_anggota } = req.body;
  try {
    // Validate input
    if (!id_gunung || !tanggal_pendakian || !jumlah_anggota) {
      return res.redirect('/beranda');
    }

    await db.query('INSERT INTO simaksi (id_user, id_gunung, tanggal_pendakian, jumlah_anggota, status_pengajuan) VALUES (?, ?, ?, ?, ?)', [
      req.session.user.id,
      id_gunung,
      tanggal_pendakian,
      jumlah_anggota,
      'Pending'
    ]);
    res.redirect('/beranda');
  } catch (err) {
    console.error('Simaksi error:', err);
    res.redirect('/beranda');
  }
});

module.exports = router;