const db = require('../db');

// ==================== GUNUNG MANAGEMENT ====================

// Get all gunung
exports.getGunung = async (req, res) => {
  try {
    const [gunung] = await db.query('SELECT * FROM gunung ORDER BY nama_gunung ASC');
    res.render('kelola-gunung', { gunung });
  } catch (err) {
    console.error('Error fetching gunung:', err);
    res.status(500).render('error', {
      user: req.session.user,
      message: 'Terjadi kesalahan saat memuat data gunung',
      error: err.message
    });
  }
};

// Create new gunung
exports.createGunung = async (req, res) => {
  const { nama_gunung, lokasi, ketinggian, kuota_harian, status } = req.body;
  try {
    await db.query('INSERT INTO gunung (nama_gunung, lokasi, ketinggian, kuota_harian, status) VALUES (?, ?, ?, ?, ?)', 
      [nama_gunung, lokasi, ketinggian, kuota_harian, status]);
    res.redirect('/admin/gunung');
  } catch (err) {
    console.error('Error creating gunung:', err);
    res.status(500).render('error', {
      user: req.session.user,
      message: 'Terjadi kesalahan saat menambahkan gunung',
      error: err.message
    });
  }
};

// Delete gunung
exports.deleteGunung = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM gunung WHERE id = ?', [id]);
    res.redirect('/admin/gunung');
  } catch (err) {
    console.error('Error deleting gunung:', err);
    res.status(500).render('error', {
      user: req.session.user,
      message: 'Terjadi kesalahan saat menghapus gunung',
      error: err.message
    });
  }
};

// ==================== BERITA MANAGEMENT ====================

// Get all berita
exports.getBerita = async (req, res) => {
  try {
    const [berita] = await db.query('SELECT * FROM berita ORDER BY tanggal DESC');
    res.render('kelola-berita', { berita });
  } catch (err) {
    console.error('Error fetching berita:', err);
    res.status(500).render('error', {
      user: req.session.user,
      message: 'Terjadi kesalahan saat memuat data berita',
      error: err.message
    });
  }
};

// Create new berita
exports.createBerita = async (req, res) => {
  const { judul, konten } = req.body;
  try {
    await db.query('INSERT INTO berita (judul, isi_berita, tanggal) VALUES (?, ?, NOW())', [judul, konten]);
    res.redirect('/admin/berita');
  } catch (err) {
    console.error('Error creating berita:', err);
    res.status(500).render('error', {
      user: req.session.user,
      message: 'Terjadi kesalahan saat menambahkan berita',
      error: err.message
    });
  }
};

// Update berita
exports.updateBerita = async (req, res) => {
  const { id } = req.params;
  const { judul, konten } = req.body;
  try {
    await db.query('UPDATE berita SET judul = ?, isi_berita = ? WHERE id = ?', [judul, konten, id]);
    res.redirect('/admin/berita');
  } catch (err) {
    console.error('Error updating berita:', err);
    res.status(500).render('error', {
      user: req.session.user,
      message: 'Terjadi kesalahan saat memperbarui berita',
      error: err.message
    });
  }
};

// Delete berita
exports.deleteBerita = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM berita WHERE id = ?', [id]);
    res.redirect('/admin/berita');
  } catch (err) {
    console.error('Error deleting berita:', err);
    res.status(500).render('error', {
      user: req.session.user,
      message: 'Terjadi kesalahan saat menghapus berita',
      error: err.message
    });
  }
};

// ==================== PENDAKIAN MANAGEMENT ====================

// Get all pendakian
exports.getPendakian = async (req, res) => {
  try {
    const [pendakian] = await db.query('SELECT * FROM pendakian ORDER BY tanggal DESC');
    res.render('kelola-pendakian', { pendakian });
  } catch (err) {
    console.error('Error fetching pendakian:', err);
    res.status(500).render('error', {
      user: req.session.user,
      message: 'Terjadi kesalahan saat memuat data pendakian',
      error: err.message
    });
  }
};

// Create new pendakian
exports.createPendakian = async (req, res) => {
  const { nama_pendakian, tanggal, status } = req.body;
  try {
    await db.query('INSERT INTO pendakian (nama_pendakian, tanggal, status) VALUES (?, ?, ?)', [nama_pendakian, tanggal, status]);
    res.redirect('/admin/pendakian');
  } catch (err) {
    console.error('Error creating pendakian:', err);
    res.status(500).render('error', {
      user: req.session.user,
      message: 'Terjadi kesalahan saat menambahkan pendakian',
      error: err.message
    });
  }
};

// Update pendakian
exports.updatePendakian = async (req, res) => {
  const { id } = req.params;
  const { nama_pendakian, tanggal, status } = req.body;
  try {
    await db.query('UPDATE pendakian SET nama_pendakian = ?, tanggal = ?, status = ? WHERE id = ?', [nama_pendakian, tanggal, status, id]);
    res.redirect('/admin/pendakian');
  } catch (err) {
    console.error('Error updating pendakian:', err);
    res.status(500).render('error', {
      user: req.session.user,
      message: 'Terjadi kesalahan saat memperbarui pendakian',
      error: err.message
    });
  }
};

// Delete pendakian
exports.deletePendakian = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM pendakian WHERE id = ?', [id]);
    res.redirect('/admin/pendakian');
  } catch (err) {
    console.error('Error deleting pendakian:', err);
    res.status(500).render('error', {
      user: req.session.user,
      message: 'Terjadi kesalahan saat menghapus pendakian',
      error: err.message
    });
  }
};