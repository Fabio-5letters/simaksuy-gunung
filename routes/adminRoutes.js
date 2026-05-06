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

// ==================== MANAGE GUNUNG ====================
router.get('/admin/gunung', isAdmin, adminController.getGunung);
router.post('/admin/gunung', isAdmin, adminController.createGunung);
router.delete('/admin/gunung/:id', isAdmin, adminController.deleteGunung);

// ==================== MANAGE BERITA ====================
router.get('/admin/berita', isAdmin, adminController.getBerita);
router.post('/admin/berita', isAdmin, adminController.createBerita);
router.put('/admin/berita/:id', isAdmin, adminController.updateBerita);
router.delete('/admin/berita/:id', isAdmin, adminController.deleteBerita);

// ==================== MANAGE PENDAKIAN ====================
router.get('/admin/pendakian', isAdmin, adminController.getPendakian);
router.post('/admin/pendakian', isAdmin, adminController.createPendakian);
router.put('/admin/pendakian/:id', isAdmin, adminController.updatePendakian);
router.delete('/admin/pendakian/:id', isAdmin, adminController.deletePendakian);

// ==================== PEMESANAN (PAYMENT) MANAGEMENT ====================
router.get('/admin/pemesanan', isAdmin, pembayaranController.adminPemesanan);
router.get('/admin/pemesanan/:id', isAdmin, pembayaranController.adminDetailPemesanan);
router.post('/admin/verifikasi/:id', isAdmin, pembayaranController.verifikasiPemesanan);

// ==================== ADMIN DASHBOARD (LAST PRIORITY) ====================
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

// Manage Simaksi (Legacy / Single Update)
router.post('/admin/simaksi/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { status_pengajuan } = req.body;
  try {
    if (!status_pengajuan) {
      req.flash('error', 'Status harus dipilih');
      return res.redirect('/admin');
    }
    const [result] = await db.query('UPDATE simaksi SET status_pengajuan = ? WHERE id = ?', [status_pengajuan, id]);
    req.flash('success', 'Status pengajuan berhasil diubah');
    res.redirect('/admin');
  } catch (err) {
    console.error('Update simaksi error:', err);
    req.flash('error', 'Terjadi kesalahan saat mengupdate status');
    res.redirect('/admin');
  }
});

module.exports = router;