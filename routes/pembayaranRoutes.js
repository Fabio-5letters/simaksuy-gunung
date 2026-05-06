const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pembayaranController = require('../controllers/pembayaranController');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'bukti-pembayaran');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'bukti-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images only
function fileFilter(req, file, cb) {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diperbolehkan (JPG, PNG, GIF)'));
  }
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: fileFilter
});

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
  if (req.session.user && req.session.user.role === 'user') {
    return next();
  }
  res.redirect('/login');
}

// ==================== ROUTES ====================

// GET /daftar/:id - Show registration form
router.get('/daftar/:id', isAuthenticated, pembayaranController.showDaftar);

// POST /buat-pemesanan - Create new booking (replaces old POST /simaksi)
router.post('/buat-pemesanan', isAuthenticated, pembayaranController.buatPemesanan);

// GET /pembayaran/:kode_booking - Show QRIS payment page
router.get('/pembayaran/:kode_booking', isAuthenticated, pembayaranController.showPembayaran);

// POST /konfirmasi-bayar/:kode_booking - User confirms payment
router.post('/konfirmasi-bayar/:kode_booking', isAuthenticated, pembayaranController.konfirmasiBayar);

// GET /upload-bukti/:kode_booking - Show upload proof page
router.get('/upload-bukti/:kode_booking', isAuthenticated, pembayaranController.showUploadBukti);

// POST /upload-bukti/:kode_booking - Handle proof upload
router.post('/upload-bukti/:kode_booking', isAuthenticated, (req, res, next) => {
  upload.single('bukti_pembayaran')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        req.flash('error', 'Ukuran file terlalu besar. Maksimal 5MB.');
      } else {
        req.flash('error', 'Gagal mengupload file.');
      }
      return res.redirect(`/upload-bukti/${req.params.kode_booking}`);
    } else if (err) {
      req.flash('error', err.message);
      return res.redirect(`/upload-bukti/${req.params.kode_booking}`);
    }
    next();
  });
}, pembayaranController.uploadBukti);

// GET /pembayaran-sukses/:kode_booking - Success page
router.get('/pembayaran-sukses/:kode_booking', isAuthenticated, pembayaranController.showPembayaranSukses);

// GET /status-pemesanan/:kode_booking - View order status
router.get('/status-pemesanan/:kode_booking', isAuthenticated, pembayaranController.showStatusPemesanan);

// GET /riwayat-pemesanan - List all user's orders
router.get('/riwayat-pemesanan', isAuthenticated, pembayaranController.riwayatPemesanan);

module.exports = router;
