USE simaksi_db;

-- Add gambar column to berita table if it doesn't exist
ALTER TABLE berita ADD COLUMN gambar_path VARCHAR(255) DEFAULT NULL AFTER isi_berita;

-- Create uploads directory structure if needed (this is for reference)
-- Directory structure: public/uploads/berita/