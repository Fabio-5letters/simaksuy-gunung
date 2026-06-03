-- Create pintu_jalur table
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for each mountain
INSERT INTO pintu_jalur (id_gunung, nama_pintu, lokasi, keterangan, status) 
SELECT id, 'Pos Pendaki Semeru (Ranu Pani)', 'Ranu Pani, Lumajang', 'Pintu masuk utama via Ranu Pani', 'aktif' FROM gunung WHERE nama_gunung = 'Semeru'
UNION ALL
SELECT id, 'Pos Taman Nasional', 'Taman Nasional Bromo Tengger Semeru', 'Pos resmi dari pengelola taman nasional', 'aktif' FROM gunung WHERE nama_gunung = 'Semeru'
UNION ALL
SELECT id, 'Tangsi Ranu Kumbolo', 'Ranu Kumbolo, Semeru', 'Basecamp alternatif di ketinggian 2400m', 'aktif' FROM gunung WHERE nama_gunung = 'Semeru'
UNION ALL
SELECT id, 'Cibodas', 'Cibodas, Sukabumi', 'Pintu masuk utama dari Sukabumi', 'aktif' FROM gunung WHERE nama_gunung = 'Gede Pangrango'
UNION ALL
SELECT id, 'Gunung Putri', 'Gunung Putri, Bogor', 'Akses dari Bogor via Gunung Putri', 'aktif' FROM gunung WHERE nama_gunung = 'Gede Pangrango'
UNION ALL
SELECT id, 'Selabintana', 'Selabintana, Sukabumi', 'Rute alternatif dari Selabintana', 'aktif' FROM gunung WHERE nama_gunung = 'Gede Pangrango'
UNION ALL
SELECT id, 'Cemoro Lewati', 'Cemoro Lewati, Probolinggo', 'Pintu masuk utama Bromo dari arah Probolinggo', 'aktif' FROM gunung WHERE nama_gunung = 'Bromo'
UNION ALL
SELECT id, 'Ngadas', 'Ngadas, Pasuruan', 'Akses dari Pasuruan via Ngadas', 'aktif' FROM gunung WHERE nama_gunung = 'Bromo'
UNION ALL
SELECT id, 'Pos Babadan', 'Babadan, Sleman', 'Pintu masuk utama Merapi dari Sleman', 'aktif' FROM gunung WHERE nama_gunung = 'Merapi'
UNION ALL
SELECT id, 'Pos Jeladri', 'Jeladri, Sleman', 'Pos resmi Taman Nasional Merapi', 'aktif' FROM gunung WHERE nama_gunung = 'Merapi'
UNION ALL
SELECT id, 'Pos Bukit Cinta', 'Bukit Cinta, Magelang', 'Rute alternatif dari Magelang', 'aktif' FROM gunung WHERE nama_gunung = 'Merapi'
UNION ALL
SELECT id, 'Pos Selo', 'Selo, Boyolali', 'Pintu masuk utama Merbabu dari Selo', 'aktif' FROM gunung WHERE nama_gunung = 'Merbabu'
UNION ALL
SELECT id, 'Pos Tawangmangu', 'Tawangmangu, Karanganyar', 'Rute dari Karanganyar via Tawangmangu', 'aktif' FROM gunung WHERE nama_gunung = 'Merbabu'
UNION ALL
SELECT id, 'Ambawang', 'Ambawang, Purbalingga', 'Pintu masuk utama Slamet dari Purbalingga', 'aktif' FROM gunung WHERE nama_gunung = 'Slamet'
UNION ALL
SELECT id, 'Gambuhan', 'Gambuhan, Batang', 'Rute alternatif dari Batang', 'aktif' FROM gunung WHERE nama_gunung = 'Slamet'
UNION ALL
SELECT id, 'Carik', 'Carik, Karanganyar', 'Pintu masuk utama Lawu dari Karanganyar', 'aktif' FROM gunung WHERE nama_gunung = 'Lawu'
UNION ALL
SELECT id, 'Telingsidi', 'Telingsidi, Karanganyar', 'Pos alternatif dari Karanganyar', 'aktif' FROM gunung WHERE nama_gunung = 'Lawu'
UNION ALL
SELECT id, 'Cemara Sewu', 'Cemara Sewu, Magetan', 'Rute dari Magetan via Cemara Sewu', 'aktif' FROM gunung WHERE nama_gunung = 'Lawu'
UNION ALL
SELECT id, 'Linggarjati', 'Linggarjati, Kuningan', 'Pintu masuk utama Ciremai dari Kuningan', 'aktif' FROM gunung WHERE nama_gunung = 'Ciremai'
UNION ALL
SELECT id, 'Cirebon', 'Cirebon', 'Akses dari kota Cirebon', 'aktif' FROM gunung WHERE nama_gunung = 'Ciremai'
UNION ALL
SELECT id, 'Plumbon', 'Plumbon, Majalengka', 'Rute dari Majalengka via Plumbon', 'aktif' FROM gunung WHERE nama_gunung = 'Ciremai';

-- Create relationship table if gunung doesn't have pintu_jalur
-- This allows us to track which entry/exit points are valid for each mountain
