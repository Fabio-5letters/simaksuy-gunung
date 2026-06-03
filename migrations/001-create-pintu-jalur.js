/**
 * Migration: Create pintu_jalur (Entry/Exit Points) table
 * Run: node migrations/001-create-pintu-jalur.js
 */

const db = require('../db');

async function migrate() {
  try {
    console.log('🔄 Starting migration: Create pintu_jalur table...\n');

    // Check if table exists
    const [tables] = await db.query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='pintu_jalur'
    `);

    if (tables.length === 0) {
      console.log('📝 Creating pintu_jalur table...');
      
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
          FOREIGN KEY (id_gunung) REFERENCES gunung(id) ON DELETE CASCADE,
          UNIQUE KEY unique_pintu_per_gunung (id_gunung, nama_pintu)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('✅ Table created successfully\n');
    } else {
      console.log('ℹ️  Table pintu_jalur already exists\n');
    }

    // Sample data
    const sampleData = [
      // Semeru
      { gunung: 'Semeru', pintu: 'Pos Pendaki Semeru (Ranu Pani)', lokasi: 'Ranu Pani, Lumajang', keterangan: 'Pintu masuk utama via Ranu Pani' },
      { gunung: 'Semeru', pintu: 'Pos Taman Nasional', lokasi: 'Taman Nasional Bromo Tengger Semeru', keterangan: 'Pos resmi dari pengelola taman nasional' },
      { gunung: 'Semeru', pintu: 'Tangsi Ranu Kumbolo', lokasi: 'Ranu Kumbolo, Semeru', keterangan: 'Basecamp alternatif di ketinggian 2400m' },
      // Gede Pangrango
      { gunung: 'Gede Pangrango', pintu: 'Cibodas', lokasi: 'Cibodas, Sukabumi', keterangan: 'Pintu masuk utama dari Sukabumi' },
      { gunung: 'Gede Pangrango', pintu: 'Gunung Putri', lokasi: 'Gunung Putri, Bogor', keterangan: 'Akses dari Bogor via Gunung Putri' },
      { gunung: 'Gede Pangrango', pintu: 'Selabintana', lokasi: 'Selabintana, Sukabumi', keterangan: 'Rute alternatif dari Selabintana' },
      // Bromo
      { gunung: 'Bromo', pintu: 'Cemoro Lewati', lokasi: 'Cemoro Lewati, Probolinggo', keterangan: 'Pintu masuk utama Bromo dari arah Probolinggo' },
      { gunung: 'Bromo', pintu: 'Ngadas', lokasi: 'Ngadas, Pasuruan', keterangan: 'Akses dari Pasuruan via Ngadas' },
      // Merapi
      { gunung: 'Merapi', pintu: 'Pos Babadan', lokasi: 'Babadan, Sleman', keterangan: 'Pintu masuk utama Merapi dari Sleman' },
      { gunung: 'Merapi', pintu: 'Pos Jeladri', lokasi: 'Jeladri, Sleman', keterangan: 'Pos resmi Taman Nasional Merapi' },
      { gunung: 'Merapi', pintu: 'Pos Bukit Cinta', lokasi: 'Bukit Cinta, Magelang', keterangan: 'Rute alternatif dari Magelang' },
      // Merbabu
      { gunung: 'Merbabu', pintu: 'Pos Selo', lokasi: 'Selo, Boyolali', keterangan: 'Pintu masuk utama Merbabu dari Selo' },
      { gunung: 'Merbabu', pintu: 'Pos Tawangmangu', lokasi: 'Tawangmangu, Karanganyar', keterangan: 'Rute dari Karanganyar via Tawangmangu' },
      // Slamet
      { gunung: 'Slamet', pintu: 'Ambawang', lokasi: 'Ambawang, Purbalingga', keterangan: 'Pintu masuk utama Slamet dari Purbalingga' },
      { gunung: 'Slamet', pintu: 'Gambuhan', lokasi: 'Gambuhan, Batang', keterangan: 'Rute alternatif dari Batang' },
      // Lawu
      { gunung: 'Lawu', pintu: 'Carik', lokasi: 'Carik, Karanganyar', keterangan: 'Pintu masuk utama Lawu dari Karanganyar' },
      { gunung: 'Lawu', pintu: 'Telingsidi', lokasi: 'Telingsidi, Karanganyar', keterangan: 'Pos alternatif dari Karanganyar' },
      { gunung: 'Lawu', pintu: 'Cemara Sewu', lokasi: 'Cemara Sewu, Magetan', keterangan: 'Rute dari Magetan via Cemara Sewu' },
      // Ciremai
      { gunung: 'Ciremai', pintu: 'Linggarjati', lokasi: 'Linggarjati, Kuningan', keterangan: 'Pintu masuk utama Ciremai dari Kuningan' },
      { gunung: 'Ciremai', pintu: 'Cirebon', lokasi: 'Cirebon', keterangan: 'Akses dari kota Cirebon' },
      { gunung: 'Ciremai', pintu: 'Plumbon', lokasi: 'Plumbon, Majalengka', keterangan: 'Rute dari Majalengka via Plumbon' }
    ];

    console.log('🏔️  Seeding entry points data...\n');

    // Check if data already exists
    const [existingData] = await db.query('SELECT COUNT(*) as count FROM pintu_jalur');
    
    if (existingData[0].count === 0) {
      for (const data of sampleData) {
        try {
          const [gunungResult] = await db.query('SELECT id FROM gunung WHERE nama_gunung = ?', [data.gunung]);
          
          if (gunungResult.length > 0) {
            await db.query(
              'INSERT INTO pintu_jalur (id_gunung, nama_pintu, lokasi, keterangan, status) VALUES (?, ?, ?, ?, ?)',
              [gunungResult[0].id, data.pintu, data.lokasi, data.keterangan, 'aktif']
            );
            console.log(`✅ Added: ${data.gunung} → ${data.pintu}`);
          } else {
            console.log(`⚠️  Skipped: ${data.gunung} - Mountain not found`);
          }
        } catch (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            console.log(`ℹ️  Already exists: ${data.gunung} → ${data.pintu}`);
          } else {
            console.error(`❌ Error adding ${data.gunung} → ${data.pintu}:`, err.message);
          }
        }
      }
    } else {
      console.log(`ℹ️  Data already exists (${existingData[0].count} entries found)\n`);
    }

    // Verify
    console.log('\n📋 Verification - Entry points by mountain:\n');
    const [results] = await db.query(`
      SELECT g.nama_gunung, COUNT(p.id) as total_pintu
      FROM gunung g
      LEFT JOIN pintu_jalur p ON g.id = p.id_gunung
      GROUP BY g.id, g.nama_gunung
      ORDER BY g.nama_gunung
    `);

    results.forEach(row => {
      console.log(`📍 ${row.nama_gunung}: ${row.total_pintu} entry point(s)`);
    });

    console.log('\n✨ Migration completed successfully!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
