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

// Get edit gunung page
exports.editGunung = async (req, res) => {
  const { id } = req.params;
  try {
    const [gunung] = await db.query('SELECT * FROM gunung WHERE id = ?', [id]);
    if (gunung.length === 0) return res.redirect('/admin/gunung');
    res.render('edit-gunung', { item: gunung[0] });
  } catch (err) {
    console.error('Error fetching gunung for edit:', err);
    res.status(500).send('Internal Server Error');
  }
};

// Update gunung
exports.updateGunung = async (req, res) => {
  const { id } = req.params;
  const { nama_gunung, lokasi, ketinggian, kuota_harian, status } = req.body;
  try {
    await db.query('UPDATE gunung SET nama_gunung = ?, lokasi = ?, ketinggian = ?, kuota_harian = ?, status = ? WHERE id = ?', 
      [nama_gunung, lokasi, ketinggian, kuota_harian, status, id]);
    req.flash('success', 'Data gunung berhasil diperbarui');
    res.redirect('/admin/gunung');
  } catch (err) {
    console.error('Error updating gunung:', err);
    req.flash('error', 'Gagal memperbarui data gunung');
    res.redirect('/admin/gunung');
  }
};

// Delete gunung
exports.deleteGunung = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM gunung WHERE id = ?', [id]);
    req.flash('success', 'Data gunung berhasil dihapus');
    res.redirect('/admin/gunung');
  } catch (err) {
    console.error('Error deleting gunung:', err);
    req.flash('error', 'Gagal menghapus data gunung');
    res.redirect('/admin/gunung');
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

// Get edit berita page
exports.editBerita = async (req, res) => {
  const { id } = req.params;
  try {
    const [berita] = await db.query('SELECT * FROM berita WHERE id = ?', [id]);
    if (berita.length === 0) return res.redirect('/admin/berita');
    res.render('edit-berita', { item: berita[0] });
  } catch (err) {
    console.error('Error fetching berita for edit:', err);
    res.status(500).send('Internal Server Error');
  }
};

// Create new berita
exports.createBerita = async (req, res) => {
  const { judul, konten } = req.body;
  try {
    await db.query('INSERT INTO berita (judul, isi_berita, tanggal) VALUES (?, ?, NOW())', [judul, konten]);
    req.flash('success', 'Berita berhasil ditambahkan');
    res.redirect('/admin/berita');
  } catch (err) {
    console.error('Error creating berita:', err);
    req.flash('error', 'Gagal menambahkan berita');
    res.redirect('/admin/berita');
  }
};

// Update berita
exports.updateBerita = async (req, res) => {
  const { id } = req.params;
  const { judul, konten } = req.body;
  try {
    await db.query('UPDATE berita SET judul = ?, isi_berita = ? WHERE id = ?', [judul, konten, id]);
    req.flash('success', 'Berita berhasil diperbarui');
    res.redirect('/admin/berita');
  } catch (err) {
    console.error('Error updating berita:', err);
    req.flash('error', 'Gagal memperbarui berita');
    res.redirect('/admin/berita');
  }
};

// Delete berita
exports.deleteBerita = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM berita WHERE id = ?', [id]);
    req.flash('success', 'Berita berhasil dihapus');
    res.redirect('/admin/berita');
  } catch (err) {
    console.error('Error deleting berita:', err);
    req.flash('error', 'Gagal menghapus berita');
    res.redirect('/admin/berita');
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

// Get edit pendakian page
exports.editPendakian = async (req, res) => {
  const { id } = req.params;
  try {
    const [pendakian] = await db.query('SELECT * FROM pendakian WHERE id = ?', [id]);
    if (pendakian.length === 0) return res.redirect('/admin/pendakian');
    res.render('edit-pendakian', { item: pendakian[0] });
  } catch (err) {
    console.error('Error fetching pendakian for edit:', err);
    res.status(500).send('Internal Server Error');
  }
};

// Create new pendakian
exports.createPendakian = async (req, res) => {
  const { nama_pendakian, tanggal, status } = req.body;
  try {
    await db.query('INSERT INTO pendakian (nama_pendakian, tanggal, status) VALUES (?, ?, ?)', [nama_pendakian, tanggal, status]);
    req.flash('success', 'Jadwal pendakian berhasil ditambahkan');
    res.redirect('/admin/pendakian');
  } catch (err) {
    console.error('Error creating pendakian:', err);
    req.flash('error', 'Gagal menambahkan jadwal pendakian');
    res.redirect('/admin/pendakian');
  }
};

// Update pendakian
exports.updatePendakian = async (req, res) => {
  const { id } = req.params;
  const { nama_pendakian, tanggal, status } = req.body;
  try {
    await db.query('UPDATE pendakian SET nama_pendakian = ?, tanggal = ?, status = ? WHERE id = ?', [nama_pendakian, tanggal, status, id]);
    req.flash('success', 'Jadwal pendakian berhasil diperbarui');
    res.redirect('/admin/pendakian');
  } catch (err) {
    console.error('Error updating pendakian:', err);
    req.flash('error', 'Gagal memperbarui jadwal pendakian');
    res.redirect('/admin/pendakian');
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