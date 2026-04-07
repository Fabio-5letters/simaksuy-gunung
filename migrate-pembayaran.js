const db = require('./db');

async function migratePembayaran() {
  try {
    console.log('Running payment system migration...');

    // Check if pemesanan table already exists
    const [tables] = await db.query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'simaksi_db' AND TABLE_NAME = 'pemesanan'
    `);

    if (tables.length > 0) {
      console.log('pemesanan table already exists, skipping migration.');
      process.exit(0);
    }

    // Create pemesanan table
    await db.query(`
      CREATE TABLE IF NOT EXISTS pemesanan (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_user INT NOT NULL,
        id_gunung INT NOT NULL,
        nama_gunung VARCHAR(100) NOT NULL,
        tanggal_masuk DATE NOT NULL,
        tanggal_keluar DATE NOT NULL,
        pintu_masuk VARCHAR(50) NOT NULL,
        pintu_keluar VARCHAR(50) NOT NULL,
        nomor_hp VARCHAR(20) NOT NULL,
        email VARCHAR(100) NOT NULL,
        jumlah_anggota INT NOT NULL,
        harga_per_orang INT NOT NULL DEFAULT 150000,
        total_bayar INT NOT NULL,
        metode_pembayaran VARCHAR(50) NOT NULL DEFAULT 'QRIS',
        kode_booking VARCHAR(20) NOT NULL UNIQUE,
        status ENUM('pending', 'dibayar', 'diverifikasi', 'ditolak') NOT NULL DEFAULT 'pending',
        bukti_pembayaran VARCHAR(255) NULL,
        catatan VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (id_gunung) REFERENCES gunung(id) ON DELETE CASCADE
      )
    `);

    console.log('Migration completed successfully! pemesanan table created.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migratePembayaran();
