const express = require('express');
const db = require('../db');
const pembayaranController = require('../controllers/pembayaranController');

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

    // Get pemesanan statistics
    let pemesananStats = { total: 0, pending: 0, dibayar: 0, diverifikasi: 0, ditolak: 0 };
    try {
      const [pemesanan] = await db.query('SELECT status FROM pemesanan');
      pemesananStats = {
        total: pemesanan.length,
        pending: pemesanan.filter(p => p.status === 'pending').length,
        dibayar: pemesanan.filter(p => p.status === 'dibayar').length,
        diverifikasi: pemesanan.filter(p => p.status === 'diverifikasi').length,
        ditolak: pemesanan.filter(p => p.status === 'ditolak').length
      };
    } catch (err) {
      console.warn('⚠ Pemesanan table not available, using default stats');
    }

    res.render('admin', { gunung, berita, simaksi, pemesananStats });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).render('error', {
      user: req.session.user,
      message: 'Terjadi kesalahan saat memuat dashboard admin',
      error: err.message
    });
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

// ==================== PEMESANAN (PAYMENT) MANAGEMENT ====================

// GET /admin/pemesanan - List all orders for admin verification
router.get('/admin/pemesanan', isAdmin, pembayaranController.adminPemesanan);

// GET /admin/pemesanan/:id - View order detail for verification
router.get('/admin/pemesanan/:id', isAdmin, pembayaranController.adminDetailPemesanan);

// POST /admin/verifikasi/:id - Verify/reject payment
router.post('/admin/verifikasi/:id', isAdmin, pembayaranController.verifikasiPemesanan);

module.exports = router;