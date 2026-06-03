const db = require('../db');

/**
 * =====================
 * PINTU JALUR CRUD
 * =====================
 */

// GET - List all entry points
exports.getPintuJalur = async (req, res) => {
  try {
    const { id_gunung } = req.query;
    
    let query = `
      SELECT pj.*, g.nama_gunung
      FROM pintu_jalur pj
      JOIN gunung g ON pj.id_gunung = g.id
    `;
    let params = [];

    if (id_gunung) {
      query += ' WHERE pj.id_gunung = ?';
      params.push(id_gunung);
    }

    query += ' ORDER BY g.nama_gunung, pj.nama_pintu';

    const [pintuJalur] = await db.query(query, params);
    const [gunung] = await db.query('SELECT id, nama_gunung FROM gunung ORDER BY nama_gunung');

    res.render('admin/kelola-pintu-jalur', {
      pintuJalur,
      gunung,
      selectedGunung: id_gunung || null,
      user: req.session.user
    });
  } catch (err) {
    console.error('Get pintu jalur error:', err);
    req.flash('error', 'Gagal memuat data pintu jalur');
    res.redirect('/admin');
  }
};

// GET - Show form to add new entry point
exports.showTambahPintu = async (req, res) => {
  try {
    const [gunung] = await db.query('SELECT id, nama_gunung FROM gunung ORDER BY nama_gunung');

    res.render('admin/tambah-pintu-jalur', {
      gunung,
      user: req.session.user
    });
  } catch (err) {
    console.error('Show tambah pintu error:', err);
    req.flash('error', 'Gagal menampilkan form');
    res.redirect('/admin/pintu-jalur');
  }
};

// POST - Create new entry point
exports.createPintuJalur = async (req, res) => {
  try {
    const { id_gunung, nama_pintu, lokasi, keterangan, status } = req.body;

    // Validation
    if (!id_gunung || !nama_pintu || !lokasi) {
      req.flash('error', 'Gunung, nama pintu, dan lokasi harus diisi');
      return res.redirect('/admin/pintu-jalur/tambah');
    }

    // Check if mountain exists
    const [gunung] = await db.query('SELECT id FROM gunung WHERE id = ?', [id_gunung]);
    if (gunung.length === 0) {
      req.flash('error', 'Gunung tidak ditemukan');
      return res.redirect('/admin/pintu-jalur/tambah');
    }

    // Insert entry point
    await db.query(
      'INSERT INTO pintu_jalur (id_gunung, nama_pintu, lokasi, keterangan, status) VALUES (?, ?, ?, ?, ?)',
      [id_gunung, nama_pintu, lokasi, keterangan || null, status || 'aktif']
    );

    req.flash('success', `Pintu jalur "${nama_pintu}" berhasil ditambahkan`);
    res.redirect('/admin/pintu-jalur');
  } catch (err) {
    console.error('Create pintu jalur error:', err);
    
    if (err.code === 'ER_DUP_ENTRY') {
      req.flash('error', 'Pintu jalur dengan nama yang sama sudah ada untuk gunung ini');
    } else {
      req.flash('error', 'Gagal menambahkan pintu jalur');
    }
    res.redirect('/admin/pintu-jalur/tambah');
  }
};

// GET - Show form to edit entry point
exports.showEditPintu = async (req, res) => {
  try {
    const { id } = req.params;

    const [pintu] = await db.query('SELECT * FROM pintu_jalur WHERE id = ?', [id]);
    if (pintu.length === 0) {
      req.flash('error', 'Pintu jalur tidak ditemukan');
      return res.redirect('/admin/pintu-jalur');
    }

    const [gunung] = await db.query('SELECT id, nama_gunung FROM gunung ORDER BY nama_gunung');

    res.render('admin/edit-pintu-jalur', {
      pintu: pintu[0],
      gunung,
      user: req.session.user
    });
  } catch (err) {
    console.error('Show edit pintu error:', err);
    req.flash('error', 'Gagal menampilkan form edit');
    res.redirect('/admin/pintu-jalur');
  }
};

// POST - Update entry point
exports.updatePintuJalur = async (req, res) => {
  try {
    const { id } = req.params;
    const { id_gunung, nama_pintu, lokasi, keterangan, status } = req.body;

    // Validation
    if (!id_gunung || !nama_pintu || !lokasi) {
      req.flash('error', 'Gunung, nama pintu, dan lokasi harus diisi');
      return res.redirect(`/admin/pintu-jalur/edit/${id}`);
    }

    // Check if entry point exists
    const [pintu] = await db.query('SELECT id FROM pintu_jalur WHERE id = ?', [id]);
    if (pintu.length === 0) {
      req.flash('error', 'Pintu jalur tidak ditemukan');
      return res.redirect('/admin/pintu-jalur');
    }

    // Check if mountain exists
    const [gunung] = await db.query('SELECT id FROM gunung WHERE id = ?', [id_gunung]);
    if (gunung.length === 0) {
      req.flash('error', 'Gunung tidak ditemukan');
      return res.redirect(`/admin/pintu-jalur/edit/${id}`);
    }

    // Update entry point
    await db.query(
      'UPDATE pintu_jalur SET id_gunung = ?, nama_pintu = ?, lokasi = ?, keterangan = ?, status = ? WHERE id = ?',
      [id_gunung, nama_pintu, lokasi, keterangan || null, status || 'aktif', id]
    );

    req.flash('success', `Pintu jalur "${nama_pintu}" berhasil diubah`);
    res.redirect('/admin/pintu-jalur');
  } catch (err) {
    console.error('Update pintu jalur error:', err);
    
    if (err.code === 'ER_DUP_ENTRY') {
      req.flash('error', 'Pintu jalur dengan nama yang sama sudah ada untuk gunung ini');
    } else {
      req.flash('error', 'Gagal mengubah pintu jalur');
    }
    res.redirect(`/admin/pintu-jalur/edit/${req.params.id}`);
  }
};

// POST - Delete entry point
exports.deletePintuJalur = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if entry point exists
    const [pintu] = await db.query('SELECT nama_pintu FROM pintu_jalur WHERE id = ?', [id]);
    if (pintu.length === 0) {
      req.flash('error', 'Pintu jalur tidak ditemukan');
      return res.redirect('/admin/pintu-jalur');
    }

    // Delete entry point
    await db.query('DELETE FROM pintu_jalur WHERE id = ?', [id]);

    req.flash('success', `Pintu jalur "${pintu[0].nama_pintu}" berhasil dihapus`);
    res.redirect('/admin/pintu-jalur');
  } catch (err) {
    console.error('Delete pintu jalur error:', err);
    req.flash('error', 'Gagal menghapus pintu jalur');
    res.redirect('/admin/pintu-jalur');
  }
};

// API - Get entry points for a specific mountain (for registration form)
exports.getPintuByGunung = async (req, res) => {
  try {
    const { id_gunung } = req.query;

    if (!id_gunung) {
      return res.status(400).json({ error: 'id_gunung diperlukan' });
    }

    const [pintu] = await db.query(
      'SELECT id, nama_pintu, lokasi FROM pintu_jalur WHERE id_gunung = ? AND status = "aktif" ORDER BY nama_pintu',
      [id_gunung]
    );

    res.json({
      success: true,
      data: pintu
    });
  } catch (err) {
    console.error('Get pintu by gunung error:', err);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil data pintu jalur'
    });
  }
};

module.exports = exports;
