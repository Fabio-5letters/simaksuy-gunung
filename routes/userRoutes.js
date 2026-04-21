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
      req.flash('error', 'Semua field harus diisi.');
      return res.redirect('/beranda');
    }

    // Validate tanggal_pendakian is in the future
    const pendakianDate = new Date(tanggal_pendakian);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (pendakianDate < today) {
      req.flash('error', 'Tanggal pendakian harus di masa depan.');
      return res.redirect('/beranda');
    }

    // Validate jumlah_anggota
    const jumlah = parseInt(jumlah_anggota, 10);
    if (jumlah < 1 || jumlah > 20) {
      req.flash('error', 'Jumlah anggota harus antara 1-20 orang.');
      return res.redirect('/beranda');
    }

    await db.query('INSERT INTO simaksi (id_user, id_gunung, tanggal_pendakian, jumlah_anggota, status_pengajuan) VALUES (?, ?, ?, ?, ?)', [
      req.session.user.id,
      id_gunung,
      tanggal_pendakian,
      jumlah,
      'Pending'
    ]);
    req.flash('success', 'Pengajuan pendakian berhasil dibuat.');
    res.redirect('/beranda');
  } catch (err) {
    console.error('Simaksi error:', err);
    req.flash('error', 'Terjadi kesalahan saat membuat pengajuan.');
    res.redirect('/beranda');
  }
});

module.exports = router;