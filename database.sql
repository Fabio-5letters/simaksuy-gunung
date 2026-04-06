-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL
);

-- Insert dummy data into users table
INSERT INTO users (nama, email, password, role) VALUES
('Admin', 'admin@example.com', '$2a$10$hashedpassword1', 'admin'),
('User', 'user@example.com', '$2a$10$hashedpassword2', 'user');

-- Create gunung table
CREATE TABLE gunung (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_gunung VARCHAR(100) NOT NULL,
    lokasi VARCHAR(100) NOT NULL,
    ketinggian INT NOT NULL,
    kuota_harian INT NOT NULL,
    status ENUM('Buka', 'Tutup') NOT NULL
);

-- Insert dummy data into gunung table
INSERT INTO gunung (nama_gunung, lokasi, ketinggian, kuota_harian, status) VALUES
('Rinjani', 'Lombok', 3726, 100, 'Buka'),
('Semeru', 'Jawa Timur', 3676, 150, 'Buka'),
('Gede', 'Jawa Barat', 2958, 200, 'Buka');

-- Create berita table
CREATE TABLE berita (
    id INT AUTO_INCREMENT PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    isi_berita TEXT NOT NULL,
    tanggal DATE NOT NULL
);

-- Insert dummy data into berita table
INSERT INTO berita (judul, isi_berita, tanggal) VALUES
('Pendakian Dibuka', 'Pendakian Gunung Rinjani dibuka kembali mulai 1 Mei.', '2026-04-01'),
('Kuota Pendakian', 'Kuota pendakian Gunung Semeru ditingkatkan menjadi 150 orang per hari.', '2026-04-02');

-- Create simaksi table
CREATE TABLE simaksi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_user INT NOT NULL,
    id_gunung INT NOT NULL,
    tanggal_pendakian DATE NOT NULL,
    jumlah_anggota INT NOT NULL,
    status_pengajuan ENUM('Pending', 'Disetujui', 'Ditolak') NOT NULL,
    FOREIGN KEY (id_user) REFERENCES users(id),
    FOREIGN KEY (id_gunung) REFERENCES gunung(id)
);

-- Insert dummy data into simaksi table
INSERT INTO simaksi (id_user, id_gunung, tanggal_pendakian, jumlah_anggota, status_pengajuan) VALUES
(2, 1, '2026-04-10', 4, 'Pending'),
(2, 2, '2026-04-15', 3, 'Disetujui');