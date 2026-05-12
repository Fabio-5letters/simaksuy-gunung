require('dotenv').config();
const db = require('./db');

async function fixCreatedAtColumn() {
  try {
    // Check if created_at column exists
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'simaksi_db'}' 
      AND TABLE_NAME = 'simaksi' 
      AND COLUMN_NAME = 'created_at'
    `);

    if (columns.length > 0) {
      console.log('✓ Kolom created_at sudah ada di tabel simaksi');
    } else {
      console.log('✗ Kolom created_at tidak ditemukan. Menambahkan...');
      await db.query(`
        ALTER TABLE simaksi 
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('✓ Kolom created_at berhasil ditambahkan ke tabel simaksi');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixCreatedAtColumn();
