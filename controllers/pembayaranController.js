const db = require('../db');
const crypto = require('crypto');

// Generate unique booking code
function generateKodeBooking() {
  const timestamp = Date.now().toString(36).toUpperCase().slice(-5);
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SIMAKSI-${timestamp}-${random}`;
}

// Format currency to IDR
function formatRupiah(amount) {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

// GET /daftar/:id - Show registration form for specific mountain
exports.showDaftar = async (req, res) => {
  try {
    const { id } = req.params;
    const [gunung] = await db.query('SELECT * FROM gunung WHERE id = ?', [id]);

    if (gunung.length === 0) {
      req.flash('error', 'Gunung tidak ditemukan.');
      return res.redirect('/pendakian');
    }

    const data = gunung[0];
    // Split pintu_jalur string into array
    const pintuJalur = data.pintu_jalur ? data.pintu_jalur.split(',').map(p => p.trim()) : [];

    res.render('pendaftaran', {
      user: req.session.user,
      gunung: { ...data, pintuJalur }
    });
  } catch (err) {
    console.error('Show daftar error:', err);
    res.status(500).redirect('/pendakian');
  }
};

// GET /pembayaran/:kode_booking - Show QRIS payment page
exports.showPembayaran = async (req, res) => {
  try {
    const { kode_booking } = req.params;

    const [pemesanan] = await db.query(
      `SELECT p.*, g.nama_gunung, g.ketinggian 
       FROM pemesanan p 
       JOIN gunung g ON p.id_gunung = g.id 
       WHERE p.kode_booking = ?`,
      [kode_booking]
    );

    if (pemesanan.length === 0) {
      return res.status(404).render('error', {
        message: 'Pemesanan tidak ditemukan',
        error: 'Kode booking tidak valid atau sudah dihapus.'
      });
    }

    const data = pemesanan[0];

    // Only show payment page if status is still pending
    if (data.status !== 'pending') {
      return res.redirect(`/status-pemesanan/${data.kode_booking}`);
    }

    res.render('pembayaran-qris', {
      user: req.session.user,
      pemesanan: data,
      formatRupiah
    });
  } catch (err) {
    console.error('Show pembayaran error:', err);
    res.status(500).redirect('/pendakian');
  }
};

// POST /buat-pemesanan - Create new booking (replaces POST /simaksi for payment flow)
exports.buatPemesanan = async (req, res) => {
  console.log('--- BUAT PEMESANAN ---');
  console.log('Body:', req.body);
  console.log('User:', req.session.user);

  const {
    id_gunung,
    nama_gunung,
    tanggal_pendakian,
    tanggal_keluar,
    pintu_masuk,
    pintu_keluar,
    nomor_hp,
    email,
    jumlah_anggota,
    harga_per_orang,
    metode_pembayaran
  } = req.body;

  try {
    // Basic validation
    if (!id_gunung || !tanggal_pendakian || !tanggal_keluar || !pintu_masuk || !pintu_keluar) {
      console.log('❌ Validasi gagal: Data wajib ada yang kosong');
      req.flash('error', 'Mohon lengkapi data rute dan tanggal.');
      return res.redirect('/pendakian');
    }

    const jumlah = parseInt(jumlah_anggota, 10) || 1;
    const harga = parseInt(harga_per_orang, 10) || 150000;
    const totalBayar = harga * jumlah;
    const kodeBooking = generateKodeBooking();

    console.log('Creating booking:', kodeBooking, 'for user:', req.session.user.id);

    // Insert into pemesanan table
    await db.query(
      `INSERT INTO pemesanan (
        id_user, id_gunung, nama_gunung,
        tanggal_masuk, tanggal_keluar,
        pintu_masuk, pintu_keluar,
        nomor_hp, email, jumlah_anggota,
        harga_per_orang, total_bayar, metode_pembayaran,
        kode_booking, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.session.user.id,
        id_gunung,
        nama_gunung || 'Gunung',
        tanggal_pendakian,
        tanggal_keluar,
        pintu_masuk,
        pintu_keluar,
        nomor_hp || '',
        email || req.session.user.email,
        jumlah,
        harga,
        totalBayar,
        metode_pembayaran || 'QRIS',
        kodeBooking,
        'pending'
      ]
    );

    // Backward compatibility
    try {
        await db.query(
          `INSERT INTO simaksi (id_user, id_gunung, tanggal_pendakian, jumlah_anggota, status_pengajuan) 
           VALUES (?, ?, ?, ?, ?)`,
          [req.session.user.id, id_gunung, tanggal_pendakian, jumlah, 'Pending']
        );
    } catch (simaksiErr) {
        console.warn('⚠️ Simaksi legacy table insert failed (non-critical):', simaksiErr.message);
    }

    console.log('✅ Booking created successfully. Redirecting to payment...');
    res.redirect(`/pembayaran/${kodeBooking}`);
  } catch (err) {
    console.error('❌ Buat pemesanan error:', err);
    req.flash('error', 'Gagal memproses pendaftaran: ' + err.message);
    res.redirect('/pendakian');
  }
};

// POST /konfirmasi-bayar/:kode_booking - User confirms they've paid
exports.konfirmasiBayar = async (req, res) => {
  try {
    const { kode_booking } = req.params;
    const { final_metode } = req.body;

    const [result] = await db.query(
      `UPDATE pemesanan SET status = 'dibayar', metode_pembayaran = ? 
       WHERE kode_booking = ? AND id_user = ?`,
      [final_metode || 'QRIS', kode_booking, req.session.user.id]
    );

    if (result.affectedRows === 0) {
      req.flash('error', 'Pemesanan tidak ditemukan atau bukan milik Anda.');
      return res.redirect('/pendakian');
    }

    // Redirect to upload proof page
    res.redirect(`/upload-bukti/${kode_booking}`);
  } catch (err) {
    console.error('Konfirmasi bayar error:', err);
    res.redirect('/pendakian');
  }
};

// GET /upload-bukti/:kode_booking - Show upload proof page
exports.showUploadBukti = async (req, res) => {
  try {
    const { kode_booking } = req.params;

    const [pemesanan] = await db.query(
      `SELECT p.*, g.nama_gunung FROM pemesanan p JOIN gunung g ON p.id_gunung = g.id WHERE p.kode_booking = ? AND p.id_user = ?`,
      [kode_booking, req.session.user.id]
    );

    if (pemesanan.length === 0) {
      req.flash('error', 'Pemesanan tidak ditemukan.');
      return res.redirect('/pendakian');
    }

    const data = pemesanan[0];

    // If already verified, redirect to status
    if (data.status === 'diverifikasi' || data.status === 'ditolak') {
      return res.redirect(`/status-pemesanan/${data.kode_booking}`);
    }

    res.render('upload-bukti', {
      user: req.session.user,
      pemesanan: data,
      formatRupiah,
      error: req.flash('error'),
      success: req.flash('success')
    });
  } catch (err) {
    console.error('Show upload bukti error:', err);
    res.redirect('/pendakian');
  }
};

// POST /upload-bukti/:kode_booking - Handle proof upload (called by multer middleware)
exports.uploadBukti = async (req, res) => {
  try {
    const { kode_booking } = req.params;
    const catatan = req.body.catatan || '';

    if (!req.file) {
      req.flash('error', 'Mohon upload bukti pembayaran.');
      return res.redirect(`/upload-bukti/${kode_booking}`);
    }

    const fileName = req.file.filename;

    const [result] = await db.query(
      `UPDATE pemesanan SET bukti_pembayaran = ?, catatan = ? 
       WHERE kode_booking = ? AND id_user = ? AND status = 'dibayar'`,
      [fileName, catatan, kode_booking, req.session.user.id]
    );

    if (result.affectedRows === 0) {
      req.flash('error', 'Pemesanan tidak ditemukan atau sudah diproses.');
      return res.redirect(`/upload-bukti/${kode_booking}`);
    }

    req.flash('success', 'Bukti pembayaran berhasil diupload! Menunggu verifikasi admin.');
    res.redirect(`/pembayaran-sukses/${kode_booking}`);
  } catch (err) {
    console.error('Upload bukti error:', err);
    req.flash('error', 'Gagal mengupload bukti pembayaran.');
    res.redirect(`/upload-bukti/${kode_booking}`);
  }
};

// GET /pembayaran-sukses/:kode_booking - Success page after upload
exports.showPembayaranSukses = async (req, res) => {
  try {
    const { kode_booking } = req.params;
    const QRCode = require('qrcode');

    const [pemesanan] = await db.query(
      `SELECT p.*, g.nama_gunung FROM pemesanan p JOIN gunung g ON p.id_gunung = g.id WHERE p.kode_booking = ? AND p.id_user = ?`,
      [kode_booking, req.session.user.id]
    );

    if (pemesanan.length === 0) {
      req.flash('error', 'Pemesanan tidak ditemukan.');
      return res.redirect('/pendakian');
    }

    const data = pemesanan[0];
    
    // Generate QR Code for the booking
    const qrCodeDataUrl = await QRCode.toDataURL(data.kode_booking);

    res.render('pembayaran-sukses', {
      user: req.session.user,
      pemesanan: data,
      qrCode: qrCodeDataUrl,
      formatRupiah,
      success: req.flash('success')
    });
  } catch (err) {
    console.error('Show pembayaran sukses error:', err);
    res.redirect('/pendakian');
  }
};

// GET /status-pemesanan/:kode_booking - View order status
exports.showStatusPemesanan = async (req, res) => {
  try {
    const { kode_booking } = req.params;
    const QRCode = require('qrcode');

    const [pemesanan] = await db.query(
      `SELECT p.*, g.nama_gunung, g.ketinggian FROM pemesanan p JOIN gunung g ON p.id_gunung = g.id WHERE p.kode_booking = ? AND p.id_user = ?`,
      [kode_booking, req.session.user.id]
    );

    if (pemesanan.length === 0) {
      req.flash('error', 'Pemesanan tidak ditemukan.');
      return res.redirect('/pendakian');
    }

    const data = pemesanan[0];
    
    // Generate QR Code for the booking
    const qrCodeDataUrl = await QRCode.toDataURL(data.kode_booking);

    res.render('status-pemesanan', {
      user: req.session.user,
      pemesanan: data,
      qrCode: qrCodeDataUrl,
      formatRupiah
    });
  } catch (err) {
    console.error('Show status pemesanan error:', err);
    res.redirect('/pendakian');
  }
};

// GET /riwayat-pemesanan - List all user's orders
exports.riwayatPemesanan = async (req, res) => {
  try {
    const [pemesanan] = await db.query(
      `SELECT p.*, g.nama_gunung FROM pemesanan p JOIN gunung g ON p.id_gunung = g.id
       WHERE p.id_user = ? ORDER BY p.created_at DESC`,
      [req.session.user.id]
    );

    res.render('riwayat-pemesanan', {
      user: req.session.user,
      pemesanan,
      formatRupiah
    });
  } catch (err) {
    console.error('Riwayat pemesanan error:', err);
    res.redirect('/pendakian');
  }
};

// ==================== ADMIN FUNCTIONS ====================

// GET /admin/pemesanan - List all orders for admin verification
exports.adminPemesanan = async (req, res) => {
  try {
    const [pemesanan] = await db.query(
      `SELECT p.*, u.nama AS nama_user, u.email AS email_user, g.nama_gunung, g.ketinggian
       FROM pemesanan p
       JOIN users u ON p.id_user = u.id
       JOIN gunung g ON p.id_gunung = g.id
       ORDER BY
         CASE p.status
           WHEN 'dibayar' THEN 1
           WHEN 'pending' THEN 2
           WHEN 'diverifikasi' THEN 3
           WHEN 'ditolak' THEN 4
         END,
         p.created_at DESC`
    );

    // Statistics
    const stats = {
      total: pemesanan.length,
      pending: pemesanan.filter(p => p.status === 'pending').length,
      dibayar: pemesanan.filter(p => p.status === 'dibayar').length,
      diverifikasi: pemesanan.filter(p => p.status === 'diverifikasi').length,
      ditolak: pemesanan.filter(p => p.status === 'ditolak').length,
      totalPendapatan: pemesanan
        .filter(p => p.status === 'diverifikasi')
        .reduce((sum, p) => sum + parseInt(p.total_bayar), 0)
    };

    res.render('admin-pemesanan', {
      user: req.session.user,
      pemesanan,
      stats,
      formatRupiah
    });
  } catch (err) {
    console.error('Admin pemesanan error:', err);
    res.status(500).send('Server error');
  }
};

// POST /admin/verifikasi/:id - Verify payment
exports.verifikasiPemesanan = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, catatan_admin } = req.body;

    // Validate status
    if (!['diverifikasi', 'ditolak'].includes(status)) {
      req.flash('error', 'Status tidak valid.');
      return res.redirect('/admin/pemesanan');
    }

    // Update pemesanan status
    await db.query(
      `UPDATE pemesanan SET status = ?, catatan_admin = ?, updated_at = NOW() WHERE id = ?`,
      [status, catatan_admin || '', id]
    );

    // Also update simaksi table for backward compatibility
    const [pemesanan] = await db.query(
      `SELECT id_user, id_gunung, tanggal_masuk FROM pemesanan WHERE id = ?`,
      [id]
    );

    if (pemesanan.length > 0) {
      const { id_user, id_gunung, tanggal_masuk } = pemesanan[0];
      
      // Map status: diverifikasi -> Disetujui, ditolak -> Ditolak
      const simaksiStatus = status === 'diverifikasi' ? 'Disetujui' : 'Ditolak';
      
      await db.query(
        `UPDATE simaksi SET status_pengajuan = ? WHERE id_user = ? AND id_gunung = ? AND tanggal_pendakian = ? AND status_pengajuan = 'Pending'`,
        [simaksiStatus, id_user, id_gunung, tanggal_masuk]
      );
    }

    req.flash('success', `Pemesanan berhasil ${status === 'diverifikasi' ? 'diverifikasi' : 'ditolak'}.`);
    res.redirect('/admin/pemesanan');
  } catch (err) {
    console.error('Verifikasi pemesanan error:', err);
    req.flash('error', 'Gagal memverifikasi pemesanan.');
    res.redirect('/admin/pemesanan');
  }
};

// GET /admin/pemesanan/:id - View order detail for verification
exports.adminDetailPemesanan = async (req, res) => {
  try {
    const { id } = req.params;

    const [pemesanan] = await db.query(
      `SELECT p.*, u.nama AS nama_user, u.email AS email_user, g.nama_gunung, g.ketinggian, g.lokasi
       FROM pemesanan p
       JOIN users u ON p.id_user = u.id
       JOIN gunung g ON p.id_gunung = g.id
       WHERE p.id = ?`,
      [id]
    );

    if (pemesanan.length === 0) {
      req.flash('error', 'Pemesanan tidak ditemukan.');
      return res.redirect('/admin/pemesanan');
    }

    res.render('admin-pemesanan-detail', {
      user: req.session.user,
      order: pemesanan[0],
      formatRupiah,
      error: req.flash('error'),
      success: req.flash('success')
    });
  } catch (err) {
    console.error('Admin detail pemesanan error:', err);
    res.redirect('/admin/pemesanan');
  }
};
