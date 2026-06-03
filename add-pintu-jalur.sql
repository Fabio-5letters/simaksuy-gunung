-- Add pintu_jalur column to gunung table if it doesn't exist
ALTER TABLE gunung ADD COLUMN IF NOT EXISTS pintu_jalur VARCHAR(500) DEFAULT NULL COMMENT 'Daftar pintu masuk/jalur terpisah dengan koma';

-- Update pintu_jalur for each mountain with their specific entry points
UPDATE gunung SET pintu_jalur = 'Pos Pendaki Semeru (Ranu Pani),Pos Taman Nasional,Tangsi Ranu Kumbolo' WHERE nama_gunung = 'Semeru';

UPDATE gunung SET pintu_jalur = 'Cibodas,Gunung Putri,Selabintana' WHERE nama_gunung = 'Gede Pangrango';

UPDATE gunung SET pintu_jalur = 'Cemoro Lewati,Ngadas' WHERE nama_gunung = 'Bromo';

UPDATE gunung SET pintu_jalur = 'Pos Babadan,Pos Jeladri,Pos Bukit Cinta' WHERE nama_gunung = 'Merapi';

UPDATE gunung SET pintu_jalur = 'Pos Selo,Pos Tawangmangu' WHERE nama_gunung = 'Merbabu';

UPDATE gunung SET pintu_jalur = 'Ambawang,Gambuhan' WHERE nama_gunung = 'Slamet';

UPDATE gunung SET pintu_jalur = 'Carik,Telingsidi,Cemara Sewu' WHERE nama_gunung = 'Lawu';

UPDATE gunung SET pintu_jalur = 'Linggarjati,Cirebon,Plumbon' WHERE nama_gunung = 'Ciremai';

-- Verify the updates
SELECT nama_gunung, pintu_jalur FROM gunung WHERE pintu_jalur IS NOT NULL;
