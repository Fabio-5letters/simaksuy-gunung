const db = require('../db');

async function tableExists(tableName) {
  const [rows] = await db.query(
    `
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
      LIMIT 1
    `,
    [tableName]
  );

  return rows.length > 0;
}

async function columnExists(tableName, columnName) {
  const [rows] = await db.query(
    `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
      LIMIT 1
    `,
    [tableName, columnName]
  );

  return rows.length > 0;
}

async function constraintExists(tableName, constraintName) {
  const [rows] = await db.query(
    `
      SELECT CONSTRAINT_NAME
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND CONSTRAINT_NAME = ?
      LIMIT 1
    `,
    [tableName, constraintName]
  );

  return rows.length > 0;
}

async function ensureColumn(tableName, columnName, definition) {
  if (await columnExists(tableName, columnName)) {
    return false;
  }

  await db.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  return true;
}

async function ensureAdminSchema({ silent = false } = {}) {
  const changes = [];

  if (!(await tableExists('pintu_jalur'))) {
    await db.query(`
      CREATE TABLE pintu_jalur (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_gunung INT NOT NULL,
        nama_pintu VARCHAR(100) NOT NULL,
        lokasi VARCHAR(255) NOT NULL,
        keterangan TEXT,
        status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_pintu_jalur_gunung
          FOREIGN KEY (id_gunung) REFERENCES gunung(id) ON DELETE CASCADE,
        UNIQUE KEY unique_pintu_per_gunung (id_gunung, nama_pintu)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    changes.push('created table pintu_jalur');
  }

  if (await ensureColumn('gunung', 'pintu_masuk_id', 'INT NULL AFTER status')) {
    changes.push('added gunung.pintu_masuk_id');
  }

  if (await ensureColumn('gunung', 'pintu_keluar_id', 'INT NULL AFTER pintu_masuk_id')) {
    changes.push('added gunung.pintu_keluar_id');
  }

  if (await ensureColumn('gunung', 'pintu_jalur', 'VARCHAR(500) NULL AFTER pintu_keluar_id')) {
    changes.push('added gunung.pintu_jalur');
  }

  if (await ensureColumn('gunung', 'pintu_masuk_ids', 'TEXT NULL AFTER pintu_jalur')) {
    changes.push('added gunung.pintu_masuk_ids');
  }

  if (await ensureColumn('gunung', 'pintu_keluar_ids', 'TEXT NULL AFTER pintu_masuk_ids')) {
    changes.push('added gunung.pintu_keluar_ids');
  }

  if (!(await constraintExists('gunung', 'fk_gunung_pintu_masuk'))) {
    await db.query(`
      ALTER TABLE gunung
      ADD CONSTRAINT fk_gunung_pintu_masuk
      FOREIGN KEY (pintu_masuk_id) REFERENCES pintu_jalur(id) ON DELETE SET NULL
    `);
    changes.push('added fk_gunung_pintu_masuk');
  }

  if (!(await constraintExists('gunung', 'fk_gunung_pintu_keluar'))) {
    await db.query(`
      ALTER TABLE gunung
      ADD CONSTRAINT fk_gunung_pintu_keluar
      FOREIGN KEY (pintu_keluar_id) REFERENCES pintu_jalur(id) ON DELETE SET NULL
    `);
    changes.push('added fk_gunung_pintu_keluar');
  }

  if (!(await tableExists('pendakian'))) {
    await db.query(`
      CREATE TABLE pendakian (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_pendakian VARCHAR(255) NOT NULL,
        tanggal DATE NOT NULL,
        status ENUM('Buka', 'Tutup', 'Penuh') NOT NULL DEFAULT 'Buka',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    changes.push('created table pendakian');
  }

  if (await ensureColumn('berita', 'gambar_path', 'VARCHAR(255) NULL AFTER isi_berita')) {
    changes.push('added berita.gambar_path');
  }

  if (!silent) {
    if (changes.length > 0) {
      console.log(`Database schema synced: ${changes.join(', ')}`);
    } else {
      console.log('Database schema already up to date');
    }
  }

  return changes;
}

if (require.main === module) {
  ensureAdminSchema()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Database schema sync failed:', err);
      process.exit(1);
    });
}

module.exports = ensureAdminSchema;
