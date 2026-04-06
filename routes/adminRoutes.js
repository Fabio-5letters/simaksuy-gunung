const express = require('express');
const db = require('../db');

const router = express.Router();

// Middleware to check if admin is logged in
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  res.redirect('/login');
}

// Admin dashboard
router.get('/admin', isAdmin, async (req, res) => {
  try {
    const [gunung] = await db.query('SELECT * FROM gunung');
    const [berita] = await db.query('SELECT * FROM berita');
    const [simaksi] = await db.query('SELECT s.*, u.nama, g.nama_gunung FROM simaksi s JOIN users u ON s.id_user = u.id JOIN gunung g ON s.id_gunung = g.id');

    res.render('admin', { gunung, berita, simaksi });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Manage Gunung
router.post('/admin/gunung', isAdmin, async (req, res) => {
  const { nama_gunung, lokasi, ketinggian, kuota_harian, status } = req.body;
  try {
    await db.query('INSERT INTO gunung (nama_gunung, lokasi, ketinggian, kuota_harian, status) VALUES (?, ?, ?, ?, ?)', [
      nama_gunung, lokasi, ketinggian, kuota_harian, status
    ]);
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Manage Berita
router.post('/admin/berita', isAdmin, async (req, res) => {
  const { judul, isi_berita, tanggal } = req.body;
  try {
    await db.query('INSERT INTO berita (judul, isi_berita, tanggal) VALUES (?, ?, ?)', [
      judul, isi_berita, tanggal
    ]);
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Manage Simaksi
router.post('/admin/simaksi/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { status_pengajuan } = req.body;
  try {
    await db.query('UPDATE simaksi SET status_pengajuan = ? WHERE id = ?', [status_pengajuan, id]);
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;