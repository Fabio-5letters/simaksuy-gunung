const db = require('../db');
const ensureAdminSchema = require('../migrations/002-sync-admin-schema');
const path = require('path');
const fs = require('fs');
const fsp = fs.promises;

let adminSchemaReady;

function ensureSchemaReady() {
  if (!adminSchemaReady) {
    adminSchemaReady = ensureAdminSchema({ silent: true }).catch((err) => {
      adminSchemaReady = null;
      throw err;
    });
  }

  return adminSchemaReady;
}

function normalizeIdList(value) {
  if (!value) return [];
  const values = Array.isArray(value) ? value : [value];
  return [...new Set(values.map((item) => parseInt(item, 10)).filter(Number.isInteger))];
}

function parseStoredIdList(value, fallbackValue) {
  if (value) {
    try {
      return normalizeIdList(JSON.parse(value));
    } catch (err) {
      return normalizeIdList(String(value).split(','));
    }
  }

  return normalizeIdList(fallbackValue);
}

async function deletePublicFile(publicPath) {
  if (!publicPath) return;

  const filePath = path.join(__dirname, '../public', publicPath);
  try {
    await fsp.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Error deleting file:', err);
    }
  }
}

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
    const [result] = await db.query(
      'INSERT INTO gunung (nama_gunung, lokasi, ketinggian, kuota_harian, status) VALUES (?, ?, ?, ?, ?)',
      [nama_gunung, lokasi, ketinggian, kuota_harian, status]
    );

    const newId = result.insertId;
    // Langsung ke halaman edit agar admin bisa pilih pintu masuk/keluar
    res.redirect(`/admin/gunung/edit/${newId}`);
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
    await ensureSchemaReady();

    const [gunung] = await db.query('SELECT * FROM gunung WHERE id = ?', [id]);
    if (gunung.length === 0) return res.redirect('/admin/gunung');

    // Ambil daftar pintu yang tersedia untuk gunung ini
    const [pintu] = await db.query(
      'SELECT id, nama_pintu, lokasi FROM pintu_jalur WHERE id_gunung = ? ORDER BY nama_pintu',
      [id]
    );

    res.render('edit-gunung', {
      item: gunung[0],
      pintu,
      selectedPintuMasuk: parseStoredIdList(gunung[0].pintu_masuk_ids, gunung[0].pintu_masuk_id),
      selectedPintuKeluar: parseStoredIdList(gunung[0].pintu_keluar_ids, gunung[0].pintu_keluar_id)
    });
  } catch (err) {
    console.error('Error fetching gunung for edit:', err);
    res.status(500).send('Internal Server Error');
  }
};

// Update gunung
exports.updateGunung = async (req, res) => {
  const { id } = req.params;
  const { nama_gunung, lokasi, ketinggian, kuota_harian, status, pintu_masuk_id, pintu_keluar_id } = req.body;

  try {
    await ensureSchemaReady();

    const masukIds = normalizeIdList(pintu_masuk_id);
    const keluarIds = normalizeIdList(pintu_keluar_id);
    const allSelectedIds = [...new Set([...masukIds, ...keluarIds])];

    if (allSelectedIds.length > 0) {
      const placeholders = allSelectedIds.map(() => '?').join(', ');
      const [validPintu] = await db.query(
        `SELECT id FROM pintu_jalur WHERE id_gunung = ? AND id IN (${placeholders})`,
        [id, ...allSelectedIds]
      );
      const validIds = new Set(validPintu.map((pintu) => pintu.id));
      const invalidIds = allSelectedIds.filter((pintuId) => !validIds.has(pintuId));

      if (invalidIds.length > 0) {
        req.flash('error', 'Pilihan pintu jalur tidak sesuai dengan gunung ini');
        return res.redirect(`/admin/gunung/edit/${id}`);
      }
    }

    const masukId = masukIds[0] || null;
    const keluarId = keluarIds[0] || null;

    await db.query(
      'UPDATE gunung SET nama_gunung = ?, lokasi = ?, ketinggian = ?, kuota_harian = ?, status = ?, pintu_masuk_id = ?, pintu_keluar_id = ?, pintu_masuk_ids = ?, pintu_keluar_ids = ? WHERE id = ?',
      [
        nama_gunung,
        lokasi,
        ketinggian,
        kuota_harian,
        status,
        masukId,
        keluarId,
        JSON.stringify(masukIds),
        JSON.stringify(keluarIds),
        id
      ]
    );

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
    await ensureSchemaReady();

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
    await ensureSchemaReady();

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
  const { judul } = req.body;
  const konten = req.body.konten || req.body.isi_berita;
  let gambarPath = null;
  
  try {
    await ensureSchemaReady();

    if (!judul || !konten) {
      if (req.file) await deletePublicFile('/uploads/berita/' + req.file.filename);
      req.flash('error', 'Judul dan konten berita wajib diisi');
      return res.redirect('/admin/berita');
    }

    // Get gambar path if file was uploaded
    if (req.file) {
      gambarPath = '/uploads/berita/' + req.file.filename;
    }
    
    await db.query('INSERT INTO berita (judul, isi_berita, gambar_path, tanggal) VALUES (?, ?, ?, NOW())', 
      [judul, konten, gambarPath]);
    req.flash('success', 'Berita berhasil ditambahkan');
    res.redirect('/admin/berita');
  } catch (err) {
    // Delete uploaded file jika ada error saat insert
    if (req.file) {
      await deletePublicFile('/uploads/berita/' + req.file.filename);
    }
    console.error('Error creating berita:', err);
    req.flash('error', 'Gagal menambahkan berita');
    res.redirect('/admin/berita');
  }
};

// Update berita
exports.updateBerita = async (req, res) => {
  const { id } = req.params;
  const { judul } = req.body;
  const konten = req.body.konten || req.body.isi_berita;
  
  try {
    await ensureSchemaReady();

    if (!judul || !konten) {
      if (req.file) await deletePublicFile('/uploads/berita/' + req.file.filename);
      req.flash('error', 'Judul dan konten berita wajib diisi');
      return res.redirect('/admin/berita');
    }

    // Get berita lama untuk check gambar lama
    const [beritaLama] = await db.query('SELECT gambar_path FROM berita WHERE id = ?', [id]);
    if (beritaLama.length === 0) {
      if (req.file) await deletePublicFile('/uploads/berita/' + req.file.filename);
      req.flash('error', 'Berita tidak ditemukan');
      return res.redirect('/admin/berita');
    }

    let gambarPath = beritaLama[0]?.gambar_path || null;
    
    // Jika ada file baru, delete gambar lama dan gunakan file baru
    if (req.file) {
      // Delete gambar lama jika ada
      await deletePublicFile(gambarPath);
      gambarPath = '/uploads/berita/' + req.file.filename;
    }
    
    await db.query('UPDATE berita SET judul = ?, isi_berita = ?, gambar_path = ? WHERE id = ?', 
      [judul, konten, gambarPath, id]);
    req.flash('success', 'Berita berhasil diperbarui');
    res.redirect('/admin/berita');
  } catch (err) {
    // Delete uploaded file jika ada error saat update
    if (req.file) {
      await deletePublicFile('/uploads/berita/' + req.file.filename);
    }
    console.error('Error updating berita:', err);
    req.flash('error', 'Gagal memperbarui berita');
    res.redirect('/admin/berita');
  }
};

// Delete berita
exports.deleteBerita = async (req, res) => {
  const { id } = req.params;
  try {
    await ensureSchemaReady();

    // Get berita untuk get gambar path
    const [berita] = await db.query('SELECT gambar_path FROM berita WHERE id = ?', [id]);
    if (berita.length === 0) {
      req.flash('error', 'Berita tidak ditemukan');
      return res.redirect('/admin/berita');
    }
    
    // Delete gambar dari file system jika ada
    await deletePublicFile(berita[0]?.gambar_path);
    
    // Delete berita dari database
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
    await ensureSchemaReady();

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
    await ensureSchemaReady();

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
    await ensureSchemaReady();

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
    await ensureSchemaReady();

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
    await ensureSchemaReady();

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
