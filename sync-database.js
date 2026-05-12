require('dotenv').config();
const db = require('./db');
const bcrypt = require('bcryptjs');

async function syncDatabase() {
  try {
    console.log('🔄 Memulai sinkronisasi database...\n');

    // 1. Cek dan tambah admin jika belum ada
    const [users] = await db.query('SELECT * FROM users WHERE role = "admin"');
    if (users.length === 0) {
      console.log('✗ Admin tidak ditemukan. Menambahkan admin...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await db.query(`
        INSERT INTO users (nama, email, password, role) 
        VALUES (?, ?, ?, 'admin')
      `, ['Admin', 'admin@example.com', hashedPassword]);
      console.log('✓ Admin berhasil ditambahkan (email: admin@example.com, password: admin123)');
    } else {
      console.log(`✓ Admin sudah ada (${users.length} admin ditemukan)`);
    }

    // 2. Cek dan tambah data gunung jika belum ada
    const [gunung] = await db.query('SELECT * FROM gunung');
    if (gunung.length === 0) {
      console.log('\n✗ Data gunung kosong. Menambahkan data gunung...');
      await db.query(`
        INSERT INTO gunung (nama_gunung, lokasi, ketinggian, kuota_harian, status) VALUES
        ('Gunung Merbabu', 'Semarang, Jawa Tengah', 3142, 100, 'Buka'),
        ('Gunung Merapi', 'Yogyakarta, Jawa Tengah', 2911, 150, 'Buka'),
        ('Gunung Lawu', 'Karanganyar, Jawa Tengah', 3265, 80, 'Buka'),
        ('Gunung Sindoro', 'Wonosobo, Jawa Tengah', 3136, 120, 'Buka')
      `);
      console.log('✓ Data gunung berhasil ditambahkan (4 gunung)');
    } else {
      console.log(`\n✓ Data gunung sudah ada (${gunung.length} gunung ditemukan)`);
    }

    // 3. Cek dan tambah berita jika belum ada
    const [berita] = await db.query('SELECT * FROM berita');
    if (berita.length === 0) {
      console.log('\n✗ Berita kosong. Menambahkan berita...');
      await db.query(`
        INSERT INTO berita (judul, isi_berita, tanggal) VALUES
        ('Pendakian gunung dibuka', 'Semua gunung telah dibuka kembali untuk pendakian mulai bulan ini', '2026-04-01'),
        ('Peningkatan keamanan', 'Kami meningkatkan sistem keamanan dan koordinasi untuk semua pendaki', '2026-04-03'),
        ('Cuaca cerah untuk pendakian', 'BMKG memprediksi cuaca cerah untuk wilayah pegunungan minggu ini', '2026-04-05'),
        ('Jalur pendakian baru', 'Dibuka jalur pendakian baru untuk Gunung Merbabu via Wekas', '2026-04-07')
      `);
      console.log('✓ Berita berhasil ditambahkan (4 berita)');
    } else {
      console.log(`\n✓ Berita sudah ada (${berita.length} berita ditemukan)`);
    }

    // 4. Cek user biasa
    const [userBiasa] = await db.query('SELECT * FROM users WHERE role = "user"');
    if (userBiasa.length === 0) {
      console.log('\n✗ User biasa tidak ditemukan. Menambahkan user test...');
      const hashedPassword = await bcrypt.hash('user123', 10);
      await db.query(`
        INSERT INTO users (nama, email, password, role) 
        VALUES (?, ?, ?, 'user')
      `, ['User Test', 'user@example.com', hashedPassword]);
      console.log('✓ User test berhasil ditambahkan (email: user@example.com, password: user123)');
    } else {
      console.log(`\n✓ User biasa sudah ada (${userBiasa.length} user ditemukan)`);
    }

    console.log('\n✅ Sinkronisasi database selesai!');
    console.log('\n📋 Akun yang tersedia:');
    console.log('  - Admin: admin@example.com / admin123');
    console.log('  - User: user@example.com / user123');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

syncDatabase();
