const express = require('express');
const path = require('path');
const db = require('../db');

const router = express.Router();

// Berita page - accessible to all users
router.get('/berita', async (req, res) => {
  try {
    const [berita] = await db.query('SELECT * FROM berita ORDER BY tanggal DESC');
    res.render('berita', { berita, user: req.session.user });
  } catch (err) {
    console.error('Berita error:', err);
    res.render('berita', { berita: [], user: req.session.user, error: 'Gagal memuat berita' });
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

// Kontak page - accessible to all users
router.get('/kontak', (req, res) => {
  res.render('kontak', { user: req.session.user });
});

// Profile page - for logged in users
router.get('/profile', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('profile', { user: req.session.user });
});

// Riwayat pendakian - for logged in users
router.get('/riwayat', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  try {
    const [simaksi] = await db.query(`
      SELECT s.*, g.nama_gunung, g.lokasi, g.ketinggian
      FROM simaksi s
      JOIN gunung g ON s.id_gunung = g.id
      WHERE s.id_user = ?
      ORDER BY s.created_at DESC
    `, [req.session.user.id]);

    res.render('riwayat', { simaksi, user: req.session.user });
  } catch (err) {
    console.error('Riwayat error:', err);
    res.render('riwayat', { simaksi: [], user: req.session.user, error: 'Gagal memuat riwayat' });
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
      ORDER BY s.created_at DESC
    `, [req.session.user.id]);

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

// Download file panduan
router.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../public/panduan', filename);

  // Check if file exists
  if (require('fs').existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).render('error', { message: 'File panduan tidak ditemukan', user: req.session.user });
  }
});

module.exports = router;