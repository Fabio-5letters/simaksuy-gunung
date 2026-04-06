const express = require('express');
const db = require('../db');

const router = express.Router();

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
  if (req.session.user && req.session.user.role === 'user') {
    return next();
  }
  res.redirect('/login');
}

// User dashboard
router.get('/beranda', isAuthenticated, async (req, res) => {
  try {
    const [gunung] = await db.query('SELECT * FROM gunung');
    const [berita] = await db.query('SELECT * FROM berita ORDER BY tanggal DESC');
    const [simaksi] = await db.query('SELECT s.*, g.nama_gunung FROM simaksi s JOIN gunung g ON s.id_gunung = g.id WHERE s.id_user = ?', [req.session.user.id]);

    res.render('beranda', { gunung, berita, simaksi });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Apply for Simaksi
router.post('/simaksi', isAuthenticated, async (req, res) => {
  const { id_gunung, tanggal_pendakian, jumlah_anggota } = req.body;
  try {
    await db.query('INSERT INTO simaksi (id_user, id_gunung, tanggal_pendakian, jumlah_anggota, status_pengajuan) VALUES (?, ?, ?, ?, ?)', [
      req.session.user.id,
      id_gunung,
      tanggal_pendakian,
      jumlah_anggota,
      'Pending'
    ]);
    res.redirect('/beranda');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;