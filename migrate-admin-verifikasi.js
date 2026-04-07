// Migration: Add admin verification columns to pemesanan table
// Run this if you already have the pemesanan table created

const db = require('./db');

async function migrate() {
  try {
    console.log('Starting migration: Adding admin verification columns...');

    // Add catatan_admin column (if not exists)
    await db.query(`
      ALTER TABLE pemesanan 
      ADD COLUMN IF NOT EXISTS catatan_admin VARCHAR(500) NULL 
      AFTER catatan
    `).catch(err => {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('catatan_admin column already exists, skipping...');
      } else {
        throw err;
      }
    });

    // Add updated_at column (if not exists)
    await db.query(`
      ALTER TABLE pemesanan 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
      AFTER created_at
    `).catch(err => {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('updated_at column already exists, skipping...');
      } else {
        throw err;
      }
    });

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
