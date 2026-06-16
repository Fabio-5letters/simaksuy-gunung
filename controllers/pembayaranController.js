const db = require('../db');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');

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

    // Check if mountain is closed
    if (data.status === 'Tutup') {
      req.flash('error', `Mohon maaf, pendakian ke ${data.nama_gunung} sedang ditutup.`);
      return res.redirect('/pendakian');
    }

    let pintuJalur = data.pintu_jalur ? data.pintu_jalur.split(',').map(p => p.trim()) : [];

    if (pintuJalur.length === 0) {
      const [pintuRows] = await db.query(
        'SELECT nama_pintu FROM pintu_jalur WHERE id_gunung = ? AND status = "aktif" ORDER BY nama_pintu',
        [id]
      );
      pintuJalur = pintuRows.map((pintu) => pintu.nama_pintu);
    }

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
    // Check if mountain is closed first
    const [gunung] = await db.query('SELECT status, nama_gunung FROM gunung WHERE id = ?', [id_gunung]);
    if (gunung.length > 0 && gunung[0].status === 'Tutup') {
      req.flash('error', `Mohon maaf, pendakian ke ${gunung[0].nama_gunung} sedang ditutup.`);
      return res.redirect('/pendakian');
    }

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

// GET /download-tiket/:kode_registrasi - View or Download ticket
exports.downloadTiket = async (req, res) => {
  try {
    let { kode_registrasi: booking_id } = req.params;
    const format = req.query.format || 'pdf';
    const QRCode = require('qrcode');
    
    console.log(`[Tiket] Request download/view: ${booking_id}, Format: ${format}, User: ${req.session.user?.email}`);
    
    // Handle legacy prefix if present
    let legacy_id = null;
    if (booking_id.startsWith('SIMAKSI-LEGACY-')) {
      legacy_id = booking_id.replace('SIMAKSI-LEGACY-', '');
    }

    // First, try finding by kode_booking (modern system)
    let [rows] = await db.query(
      `SELECT p.*, u.nama AS nama_user, u.email AS email_user, g.nama_gunung, g.lokasi, g.ketinggian
       FROM pemesanan p
       JOIN users u ON p.id_user = u.id
       JOIN gunung g ON p.id_gunung = g.id
       WHERE p.kode_booking = ?`,
      [booking_id]
    );

    let data;
    if (rows.length > 0) {
      data = rows[0];
      console.log(`[Tiket] Found in pemesanan: ${data.kode_booking}`);
    } else {
      // If not found by kode_booking, try by ID (could be legacy or modern ID)
      // Use legacy_id if we extracted it, otherwise use the raw booking_id
      const searchId = legacy_id || booking_id;
      
      [rows] = await db.query(
        `SELECT p.*, u.nama AS nama_user, u.email AS email_user, g.nama_gunung, g.lokasi, g.ketinggian
         FROM pemesanan p
         JOIN users u ON p.id_user = u.id
         JOIN gunung g ON p.id_gunung = g.id
         WHERE p.id = ?`,
        [searchId]
      );

      if (rows.length > 0) {
        data = rows[0];
        console.log(`[Tiket] Found in pemesanan by ID: ${data.id}`);
      } else {
        // Try legacy simaksi table
        [rows] = await db.query(
          `SELECT s.id, s.id_user, s.id_gunung, s.tanggal_pendakian AS tanggal_masuk, s.jumlah_anggota, 
                  s.status_pengajuan AS status, u.nama AS nama_user, u.email AS email_user, g.nama_gunung, g.lokasi, g.ketinggian
           FROM simaksi s
           JOIN users u ON s.id_user = u.id
           JOIN gunung g ON s.id_gunung = g.id
           WHERE s.id = ?`,
          [searchId]
        );

        if (rows.length === 0) {
          console.warn(`[Tiket] Data tidak ditemukan untuk ID/Kode: ${booking_id}`);
          req.flash('error', `Tiket dengan kode ${booking_id} tidak ditemukan atau sudah tidak tersedia.`);
          return res.redirect(req.session.user.role === 'admin' ? '/admin/pemesanan' : '/riwayat');
        }

        data = rows[0];
        console.log(`[Tiket] Found in legacy simaksi: ${data.id}`);
        // Map legacy status
        if (data.status === 'Disetujui') data.status = 'diverifikasi';
        
        // Legacy defaults
        data.kode_booking = `SIMAKSI-LEGACY-${data.id}`;
        data.pintu_masuk = 'Pintu Utama';
        data.pintu_keluar = 'Pintu Utama';
        data.tanggal_keluar = data.tanggal_masuk;
        data.total_bayar = data.jumlah_anggota * 150000;
        data.nomor_hp = '-';
      }
    }

    // Security check
    if (req.session.user.role !== 'admin' && data.id_user !== req.session.user.id) {
      console.warn(`[Tiket] Unauthorized access attempt by ${req.session.user?.email} for ticket ${booking_id}`);
      req.flash('error', 'Anda tidak memiliki akses ke tiket ini.');
      return res.redirect('/riwayat');
    }

    if (data.status !== 'diverifikasi') {
      console.log(`[Tiket] Ticket found but not verified. Status: ${data.status}`);
      req.flash('error', 'Tiket hanya dapat diunduh jika status sudah diverifikasi.');
      return res.redirect(req.session.user.role === 'admin' ? `/admin/pemesanan/${data.id}` : `/riwayat`);
    }

    console.log(`[Tiket] Generating ${format.toUpperCase()} for ${data.kode_booking}`);

    // If format is HTML, render the etiket view
    if (format === 'html') {
      return res.render('etiket', {
        user: req.session.user,
        pemesanan: data
      });
    }

    // Otherwise, generate PDF
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Tiket-${data.kode_booking}.pdf`);
    
    doc.pipe(res);

    // Design the ticket header
    doc.rect(0, 0, 595.28, 120).fill('#1e5631');
    doc.fillColor('#ffffff').fontSize(24).font('Helvetica-Bold').text('TIKET PENDAKIAN GUNUNG', 50, 45, { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Sistem Informasi Manajemen Pendakian (SIMAKSI)', 50, 75, { align: 'center' });
    
    doc.moveDown(4);
    doc.fillColor('#000000').fontSize(12);

    // Ticket Box
    doc.rect(40, 150, 515, 300).stroke('#e5e7eb');
    
    const startY = 180;
    const rowHeight = 35;

    const fields = [
      ['Nomor Registrasi', data.kode_booking],
      ['Nama Pendaki', data.nama_user],
      ['Gunung Tujuan', data.nama_gunung],
      ['Lokasi', data.lokasi],
      ['Tanggal Masuk', data.tanggal_masuk ? new Date(data.tanggal_masuk).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'],
      ['Pintu Masuk', data.pintu_masuk],
      ['Jumlah Anggota', `${data.jumlah_anggota} Orang`],
      ['Status', 'DISETUJUI / DIVERIFIKASI']
    ];

    fields.forEach((field, i) => {
      const y = startY + (i * rowHeight);
      doc.font('Helvetica-Bold').text(field[0], 60, y);
      doc.font('Helvetica').text(': ' + field[1], 200, y);
    });

    // QR Code
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(data.kode_booking);
        // dataUrl is base64, pdfkit can take it if we remove the header
        const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
        doc.image(Buffer.from(base64Data, 'base64'), 420, 180, { width: 110 });
        doc.fontSize(9).font('Helvetica-Oblique').text('Scan untuk verifikasi', 415, 295, { width: 120, align: 'center' });
    } catch (qrErr) {
        console.error('QR generation in PDF failed:', qrErr);
    }

    // Divider
    doc.moveTo(40, 480).lineTo(555, 480).dash(5, { space: 10 }).stroke('#cbd5e1');

    // Footer / Rules
    doc.font('Helvetica-Bold').fontSize(14).text('PENTING:', 50, 510);
    doc.font('Helvetica').fontSize(10).fillColor('#4b5563');
    const rules = [
      '1. Harap membawa kartu identitas asli (KTP/SIM/Paspor) saat melakukan verifikasi.',
      '2. Tiket ini wajib ditunjukkan kepada petugas di basecamp pendakian.',
      '3. Pendaki wajib mematuhi seluruh peraturan yang berlaku di kawasan gunung.',
      '4. Dilarang keras membuang sampah di sepanjang jalur pendakian.',
      '5. Tiket ini hanya berlaku untuk tanggal dan gunung yang tertera di atas.'
    ];
    
    rules.forEach((rule, i) => {
      doc.text(rule, 50, 535 + (i * 20));
    });

    doc.end();

  } catch (err) {
    console.error('Download tiket error:', err);
    res.status(500).send('Gagal mengunduh tiket');
  }
};

