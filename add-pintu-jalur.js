/**
 * Migration Script: Add pintu_jalur (Entry Points) for each mountain
 * Run: node add-pintu-jalur.js
 */

const db = require('./db');

async function migrate() {
  try {
    console.log('🔄 Starting migration: Add pintu_jalur to gunung table...\n');

    // Check if pintu_jalur column exists
    const [columns] = await db.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME='gunung' AND COLUMN_NAME='pintu_jalur'
    `);

    if (columns.length === 0) {
      console.log('📝 Creating pintu_jalur column...');
      await db.query(`
        ALTER TABLE gunung 
        ADD COLUMN pintu_jalur VARCHAR(500) DEFAULT NULL 
        COMMENT 'Daftar pintu masuk/jalur terpisah dengan koma'
      `);
      console.log('✅ Column created successfully\n');
    } else {
      console.log('ℹ️  Column pintu_jalur already exists\n');
    }

    // Update entry points for each mountain
    const updates = [
      {
        mountain: 'Semeru',
        entries: 'Pos Pendaki Semeru (Ranu Pani),Pos Taman Nasional,Tangsi Ranu Kumbolo'
      },
      {
        mountain: 'Gede Pangrango',
        entries: 'Cibodas,Gunung Putri,Selabintana'
      },
      {
        mountain: 'Bromo',
        entries: 'Cemoro Lewati,Ngadas'
      },
      {
        mountain: 'Merapi',
        entries: 'Pos Babadan,Pos Jeladri,Pos Bukit Cinta'
      },
      {
        mountain: 'Merbabu',
        entries: 'Pos Selo,Pos Tawangmangu'
      },
      {
        mountain: 'Slamet',
        entries: 'Ambawang,Gambuhan'
      },
      {
        mountain: 'Lawu',
        entries: 'Carik,Telingsidi,Cemara Sewu'
      },
      {
        mountain: 'Ciremai',
        entries: 'Linggarjati,Cirebon,Plumbon'
      }
    ];

    console.log('🏔️  Updating entry points for mountains...\n');

    for (const update of updates) {
      try {
        const [result] = await db.query(
          'UPDATE gunung SET pintu_jalur = ? WHERE nama_gunung = ?',
          [update.entries, update.mountain]
        );
        
        if (result.affectedRows > 0) {
          console.log(`✅ ${update.mountain}`);
          console.log(`   Entry points: ${update.entries.split(',').join(', ')}`);
        } else {
          console.log(`⚠️  ${update.mountain} - Not found in database`);
        }
      } catch (err) {
        console.error(`❌ Error updating ${update.mountain}:`, err.message);
      }
    }

    // Verify the updates
    console.log('\n📋 Verifying updates...\n');
    const [verifyResults] = await db.query(
      'SELECT nama_gunung, pintu_jalur FROM gunung WHERE pintu_jalur IS NOT NULL ORDER BY nama_gunung'
    );

    console.log(`Found ${verifyResults.length} mountains with entry points:\n`);
    verifyResults.forEach(row => {
      const entries = row.pintu_jalur.split(',').map(e => e.trim());
      console.log(`📍 ${row.nama_gunung}`);
      entries.forEach(entry => {
        console.log(`   • ${entry}`);
      });
      console.log();
    });

    console.log('✨ Migration completed successfully!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
