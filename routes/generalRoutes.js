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
    // Get data from pemesanan table (modern payment system)
    const [pemesanan] = await db.query(`
      SELECT p.*, g.nama_gunung, g.lokasi, g.ketinggian
      FROM pemesanan p
      JOIN gunung g ON p.id_gunung = g.id
      WHERE p.id_user = ?
      ORDER BY p.created_at DESC
    `, [req.session.user.id]);

    // Also get data from simaksi table (legacy system)
    const [simaksi] = await db.query(`
      SELECT s.*, g.nama_gunung, g.lokasi, g.ketinggian
      FROM simaksi s
      JOIN gunung g ON s.id_gunung = g.id
      WHERE s.id_user = ?
      ORDER BY s.created_at DESC
    `, [req.session.user.id]);

    // Merge and show both (pemesanan takes priority as it's more complete)
    const combinedData = [...pemesanan, ...simaksi];

    res.render('riwayat', { simaksi: combinedData, user: req.session.user });
  } catch (err) {
    console.error('Riwayat error:', err);
    res.render('riwayat', { simaksi: [], user: req.session.user, error: 'Gagal memuat riwayat' });
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