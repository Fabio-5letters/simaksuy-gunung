require('dotenv').config();
const db = require('./db');
const bcrypt = require('bcryptjs');

async function fullMigration() {
  try {
    console.log('🚀 Memulai migrasi database lengkap...\n');

    // 1. Tambah kolom deskripsi ke tabel gunung jika belum ada
    const [columns] = await db.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'simaksi_db'}' 
      AND TABLE_NAME = 'gunung' 
      AND COLUMN_NAME = 'deskripsi'
    `);

    if (columns.length === 0) {
      console.log('✗ Kolom deskripsi tidak ada di tabel gunung. Menambahkan...');
      await db.query('ALTER TABLE gunung ADD COLUMN deskripsi TEXT AFTER status');
      console.log('✓ Kolom deskripsi berhasil ditambahkan\n');
    } else {
      console.log('✓ Kolom deskripsi sudah ada\n');
    }

    // 2. Update deskripsi gunung
    console.log('📝 Mengupdate deskripsi gunung...');
    const gunungUpdates = [
      {
        id: 1,
        deskripsi: `Gunung Merbabu adalah gunung berapi yang sudah tidak aktif lagi di Jawa Tengah. Dengan ketinggian 3.142 mdpl, gunung ini menawarkan pemandangan spektakuler dari puncaknya yang terkenal dengan padang rumput alpine yang luas.`
      },
      {
        id: 2,
        deskripsi: `Gunung Merapi adalah salah satu gunung berapi paling aktif di Indonesia yang terletak di perbatasan DIY Yogyakarta dan Jawa Tengah. Dengan ketinggian 2.911 mdpl, Merapi terkenal dengan aktivitas vulkaniknya yang tinggi.`
      },
      {
        id: 3,
        deskripsi: `Gunung Lawu adalah gunung tertinggi di perbatasan Jawa Tengah dan Jawa Timur dengan puncak mencapai 3.265 mdpl. Gunung ini dikenal sebagai tempat spiritual dengan banyak petilasan dan makam keramat di sepanjang jalur pendakian.`
      },
      {
        id: 4,
        deskripsi: `Gunung Sindoro adalah gunung berapi tipe A di Kabupaten Wonosobo dan Temanggung dengan ketinggian 3.136 mdpl. Bersama dengan Gunung Sumbing yang berdampingan, Sindoro menawarkan keindahan alam yang luar biasa dengan kaldera yang luas di puncaknya.`
      }
    ];

    for (const update of gunungUpdates) {
      await db.query('UPDATE gunung SET deskripsi = ? WHERE id = ?', [update.deskripsi, update.id]);
      console.log(`  ✓ Deskripsi ${update.id} diupdate`);
    }

    // 3. Cek dan tambah berita lebih banyak
    console.log('\n📰 Menambahkan berita...');
    const [existingBerita] = await db.query('SELECT COUNT(*) as count FROM berita');
    const count = existingBerita[0].count;

    if (count < 6) {
      const beritaBaru = [
        {
          judul: 'Gunung Merbabu Buka Kuota Pendakian 150 Orang Per Hari',
          isi_berita: 'Setelah melalui proses evaluasi dan penataan jalur, Gunung Merbabu resmi membuka kuota pendakian hingga 150 orang per hari mulai Mei 2026. Para pendaki wajib mendaftar melalui sistem SIMAKSI online.',
          tanggal: '2026-04-07'
        },
        {
          judul: 'Waspada! Gunung Merapi Tingkatkan Status Menjadi Siaga II',
          isi_berita: 'BNPB meningkatkan status Gunung Merapi menjadi Siaga Level II sejak awal April 2026 akibat peningkatan aktivitas vulkanik. Pendakian masih diperbolehkan dengan pengawasan ketat.',
          tanggal: '2026-04-06'
        },
        {
          judul: 'Festival Sunrise di Gunung Lawu Menarik Ribuan Pendaki',
          isi_berita: 'Festival Sunrise Gunung Lawu 2026 berhasil menarik lebih dari 2.000 pendaki dari berbagai daerah. Acara ini menyajikan panorama matahari terbit yang spektakuler dari puncak tertinggi Lawu.',
          tanggal: '2026-04-05'
        },
        {
          judul: 'Gunung Sindoro: Surga Tersembunyi bagi Pendaki Profesional',
          isi_berita: 'Gunung Sindoro semakin dikenal luas di kalangan pendaki sebagai destinasi yang menawarkan tantangan nyata. Dengan ketinggian 3.136 mdpl, gunung ini memiliki jalur pendakian yang cukup ekstrem.',
          tanggal: '2026-04-04'
        },
        {
          judul: 'Tips Aman Mendaki Gunung untuk Pemula di Musim Hujan',
          isi_berita: 'Musim hujan bukan halangan untuk mendaki gunung, namun memerlukan persiapan ekstra. Selalu cek cuaca, bawa peralatan waterproofing, dan jaga tubuh tetap kering untuk menghindari hipotermia.',
          tanggal: '2026-04-03'
        },
        {
          judul: 'Pendakian Ramah Lingkungan: Kampanye Bersih di Semua Jalur Gunung',
          isi_berita: 'Gerakan "Leave No Trace" semakin gencar dikampanyekan di seluruh jalur pendakian. Setiap pendaki diwajibkan untuk membawa turun semua sampah yang mereka hasilkan selama pendakian.',
          tanggal: '2026-04-02'
        }
      ];

      for (const berita of beritaBaru) {
        // Cek apakah berita dengan tanggal ini sudah ada
        const [exists] = await db.query('SELECT id FROM berita WHERE tanggal = ? AND judul = ?', [berita.tanggal, berita.judul]);
        if (exists.length === 0) {
          await db.query('INSERT INTO berita (judul, isi_berita, tanggal) VALUES (?, ?, ?)', [berita.judul, berita.isi_berita, berita.tanggal]);
          console.log(`  ✓ "${berita.judul.substring(0, 40)}..." ditambahkan`);
        }
      }
    } else {
      console.log(`✓ Berita sudah ada (${count} berita)`);
    }

    // 4. Tambah admin jika belum ada
    console.log('\n👤 Cek admin...');
    const [admins] = await db.query('SELECT * FROM users WHERE role = "admin"');
    if (admins.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.query(`INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, 'admin')`, 
        ['Admin', 'admin@example.com', hashedPassword]);
      console.log('✓ Admin ditambahkan (email: admin@example.com, password: admin123)');
    } else {
      console.log(`✓ Admin sudah ada (${admins.length} admin)`);
    }

    // Summary
    const [totalGunung] = await db.query('SELECT COUNT(*) as total FROM gunung');
    const [totalBerita] = await db.query('SELECT COUNT(*) as total FROM berita');
    const [totalUsers] = await db.query('SELECT COUNT(*) as total FROM users');
    const [totalPemesanan] = await db.query('SELECT COUNT(*) as total FROM pemesanan');

    console.log('\n✅ Migrasi selesai!');
    console.log('\n📊 Data saat ini:');
    console.log(`   - Users: ${totalUsers[0].total}`);
    console.log(`   - Gunung: ${totalGunung[0].total}`);
    console.log(`   - Berita: ${totalBerita[0].total}`);
    console.log(`   - Pemesanan: ${totalPemesanan[0].total}`);

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

fullMigration();
