const express = require('express');
const db = require('../db');
const adminController = require('../controllers/adminController');
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
router.get('/admin/gunung', isAdmin, async (req, res) => {
  try {
    const [gunung] = await db.query('SELECT * FROM gunung');
    res.render('admin', { gunung, berita: [], simaksi: [], pemesananStats: { total: 0, pending: 0, dibayar: 0, diverifikasi: 0, ditolak: 0 } });
  } catch (err) {
    res.status(500).render('error', { user: req.session.user, message: 'Gagal memuat data gunung', error: err.message });
  }
});

router.post('/admin/gunung', isAdmin, async (req, res) => {
  const { nama_gunung, lokasi, ketinggian, kuota_harian, status } = req.body;
  try {
    // Validate input
    if (!nama_gunung || !lokasi || !ketinggian || !kuota_harian || !status) {
      req.flash('error', 'Semua field harus diisi');
      return res.redirect('/admin');
    }

    const tinggiNum = parseInt(ketinggian, 10);
    const quotaNum = parseInt(kuota_harian, 10);

    if (isNaN(tinggiNum) || tinggiNum < 0) {
      req.flash('error', 'Ketinggian harus berupa angka positif');
      return res.redirect('/admin');
    }

    if (isNaN(quotaNum) || quotaNum < 1) {
      req.flash('error', 'Kuota harian harus berupa angka positif');
      return res.redirect('/admin');
    }

    await db.query('INSERT INTO gunung (nama_gunung, lokasi, ketinggian, kuota_harian, status) VALUES (?, ?, ?, ?, ?)', [
      nama_gunung, lokasi, tinggiNum, quotaNum, status
    ]);
    req.flash('success', 'Gunung berhasil ditambahkan');
    res.redirect('/admin');
  } catch (err) {
    console.error('Add gunung error:', err);
    req.flash('error', 'Terjadi kesalahan saat menambah gunung');
    res.redirect('/admin');
  }
});

// Manage Berita
router.get('/admin/berita', isAdmin, adminController.getBerita);
router.post('/admin/berita', isAdmin, adminController.createBerita);
router.put('/admin/berita/:id', isAdmin, adminController.updateBerita);
router.delete('/admin/berita/:id', isAdmin, adminController.deleteBerita);

// Manage Pendakian
router.get('/admin/pendakian', isAdmin, adminController.getPendakian);
router.post('/admin/pendakian', isAdmin, adminController.createPendakian);
router.put('/admin/pendakian/:id', isAdmin, adminController.updatePendakian);
router.delete('/admin/pendakian/:id', isAdmin, adminController.deletePendakian);

// Manage Simaksi
router.post('/admin/simaksi/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { status_pengajuan } = req.body;
  try {
    // Validate input
    if (!status_pengajuan) {
      req.flash('error', 'Status harus dipilih');
      return res.redirect('/admin');
    }

    if (!['Pending', 'Disetujui', 'Ditolak'].includes(status_pengajuan)) {
      req.flash('error', 'Status tidak valid');
      return res.redirect('/admin');
    }

    const [result] = await db.query('UPDATE simaksi SET status_pengajuan = ? WHERE id = ?', [status_pengajuan, id]);
    
    if (result.affectedRows === 0) {
      req.flash('error', 'Pengajuan tidak ditemukan');
      return res.redirect('/admin');
    }

    req.flash('success', 'Status pengajuan berhasil diubah');
    res.redirect('/admin');
  } catch (err) {
    console.error('Update simaksi error:', err);
    req.flash('error', 'Terjadi kesalahan saat mengupdate status');
    res.redirect('/admin');
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