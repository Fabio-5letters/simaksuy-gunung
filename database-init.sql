-- Create database if not exists
CREATE DATABASE IF NOT EXISTS simaksi_db;
USE simaksi_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    reset_token VARCHAR(255) NULL,
    reset_token_expiry DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create gunung table
CREATE TABLE IF NOT EXISTS gunung (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_gunung VARCHAR(100) NOT NULL,
    lokasi VARCHAR(100) NOT NULL,
    ketinggian INT NOT NULL,
    kuota_harian INT NOT NULL,
    status ENUM('Buka', 'Tutup') NOT NULL DEFAULT 'Buka',
    -- pintu pilihan admin (ambil dari tabel pintu_jalur)
    pintu_masuk_id INT NULL,
    pintu_keluar_id INT NULL,
    -- daftar pintu legacy untuk form pendaftaran lama
    pintu_jalur VARCHAR(500) NULL,
    pintu_masuk_ids TEXT NULL,
    pintu_keluar_ids TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create pintu_jalur table before admin edit pages use it
CREATE TABLE IF NOT EXISTS pintu_jalur (
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
);

-- Create berita table
CREATE TABLE IF NOT EXISTS berita (
    id INT AUTO_INCREMENT PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    isi_berita TEXT NOT NULL,
    gambar_path VARCHAR(255) NULL,
    tanggal DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create simaksi table
CREATE TABLE IF NOT EXISTS simaksi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    id_gunung INT NOT NULL,
    tanggal_pendakian DATE NOT NULL,
    jumlah_anggota INT NOT NULL,
    status_pengajuan ENUM('Pending', 'Disetujui', 'Ditolak') NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (id_gunung) REFERENCES gunung(id) ON DELETE CASCADE
);

-- Create pemesanan table (payment/booking system)
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
    catatan_admin VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_user) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (id_gunung) REFERENCES gunung(id) ON DELETE CASCADE
);

-- Create pendakian table (events/schedule)
CREATE TABLE IF NOT EXISTS pendakian (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_pendakian VARCHAR(255) NOT NULL,
    tanggal DATE NOT NULL,
    status ENUM('Buka', 'Tutup', 'Penuh') NOT NULL DEFAULT 'Buka',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert dummy data into users table if empty
INSERT IGNORE INTO users (id, nama, email, password, role) VALUES
(1, 'Admin', 'admin@example.com', '$2a$10$yXvzU7.Ygbn7l8bZSHXtLeEFgL5w3gB7C1K7d2hW5hK1mQ5Jq2OQq', 'admin'),
(2, 'User Test', 'user@example.com', '$2a$10$yXvzU7.Ygbn7l8bZSHXtLeEFgL5w3gB7C1K7d2hW5hK1mQ5Jq2OQq', 'user');

-- Insert dummy data into gunung table if empty
INSERT IGNORE INTO gunung (id, nama_gunung, lokasi, ketinggian, kuota_harian, status) VALUES
(1, 'Gunung Merbabu', 'Jakarta, Indonesia', 3142, 100, 'Buka'),
(2, 'Gunung Merapi', 'Yogyakarta, Jawa Tengah', 2911, 150, 'Buka'),
(3, 'Gunung Lawu', 'Karanganyar, Jawa Tengah', 3265, 80, 'Buka'),
(4, 'Gunung Sindoro', 'Wonosobo, Jawa Tengah', 3136, 120, 'Buka');

-- Insert sample pintu_jalur data if empty
INSERT IGNORE INTO pintu_jalur (id_gunung, nama_pintu, lokasi, keterangan, status) VALUES
(1, 'Selo', 'Boyolali, Jawa Tengah', 'Jalur populer Gunung Merbabu via Selo', 'aktif'),
(1, 'Wekas', 'Magelang, Jawa Tengah', 'Jalur Gunung Merbabu via Wekas', 'aktif'),
(1, 'Suwanting', 'Magelang, Jawa Tengah', 'Jalur Gunung Merbabu via Suwanting', 'aktif'),
(2, 'Selo', 'Boyolali, Jawa Tengah', 'Jalur Gunung Merapi via Selo', 'aktif'),
(2, 'Babadan', 'Magelang, Jawa Tengah', 'Jalur Gunung Merapi via Babadan', 'aktif'),
(3, 'Cemoro Sewu', 'Magetan, Jawa Timur', 'Jalur Gunung Lawu via Cemoro Sewu', 'aktif'),
(3, 'Cemoro Kandang', 'Karanganyar, Jawa Tengah', 'Jalur Gunung Lawu via Cemoro Kandang', 'aktif'),
(4, 'Kledung', 'Temanggung, Jawa Tengah', 'Jalur Gunung Sindoro via Kledung', 'aktif'),
(4, 'Sigedang', 'Wonosobo, Jawa Tengah', 'Jalur Gunung Sindoro via Sigedang', 'aktif');

-- Insert dummy data into berita table if empty
INSERT IGNORE INTO berita (id, judul, isi_berita, tanggal) VALUES
(1, 'Pendakian gunung dibuka', 'Semua gunung telah dibuka kembali untuk pendakian mulai bulan ini', '2026-04-01'),
(2, 'Peningkatan keamanan', 'Kami meningkatkan sistem keamanan dan koordinasi untuk semua pendaki', '2026-04-03');

-- Insert dummy data into simaksi table if empty
INSERT IGNORE INTO simaksi (id, id_user, id_gunung, tanggal_pendakian, jumlah_anggota, status_pengajuan) VALUES
(1, 2, 1, '2026-04-15', 5, 'Pending'),
(2, 2, 2, '2026-04-20', 3, 'Disetujui');

-- Insert dummy data into pendakian table if empty
INSERT IGNORE INTO pendakian (id, nama_pendakian, tanggal, status) VALUES
(1, 'Ekspedisi Merbabu 2026', '2026-05-10', 'Buka'),
(2, 'Pendakian Bersama Merapi', '2026-05-15', 'Buka');
