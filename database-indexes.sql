-- ========================================
-- DATABASE INDEXES FOR PERFORMANCE
-- ========================================
-- Run this script to improve query performance
-- Execute: mysql -u root -p simaksi_db < database-indexes.sql

-- Index untuk tabel pemesanan (frequently queried columns)
ALTER TABLE pemesanan 
ADD INDEX idx_user_id (id_user),
ADD INDEX idx_status (status),
ADD INDEX idx_gunung_id (id_gunung),
ADD INDEX idx_created_at (created_at),
ADD INDEX idx_kode_booking (kode_booking);

-- Index untuk tabel simaksi (legacy system)
ALTER TABLE simaksi 
ADD INDEX idx_user_id (id_user),
ADD INDEX idx_gunung_id (id_gunung),
ADD INDEX idx_status_pengajuan (status_pengajuan),
ADD INDEX idx_tanggal_pendakian (tanggal_pendakian);

-- Index untuk tabel users (password reset & authentication)
ALTER TABLE users 
ADD INDEX idx_reset_token (reset_token),
ADD INDEX idx_email (email);

-- Index untuk tabel berita (search & display)
ALTER TABLE berita 
ADD INDEX idx_tanggal (tanggal),
ADD FULLTEXT idx_berita_search (judul, isi_berita);

-- Index untuk tabel gunung (search by name & location)
ALTER TABLE gunung 
ADD INDEX idx_nama_gunung (nama_gunung),
ADD INDEX idx_lokasi (lokasi),
ADD INDEX idx_status (status);

-- Verify indexes were created
SHOW INDEX FROM pemesanan;
SHOW INDEX FROM simaksi;
SHOW INDEX FROM users;
SHOW INDEX FROM berita;
SHOW INDEX FROM gunung;

SELECT 'Indexes created successfully!' AS result;
