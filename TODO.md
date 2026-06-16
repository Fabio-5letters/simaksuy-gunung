# TODO - Perbaikan fitur admin gunung & berita

## Tahap 1 — Analisis & dasar data
- [x] Cek struktur tabel `gunung` dan `berita` (database-init.sql / database.sql)
- [x] Identifikasi CRUD gunung dan berita yang berjalan di `adminController.js`
- [x] Identifikasi form/route yang dipakai di view `kelola-gunung.ejs`, `edit-gunung.ejs`, `kelola-berita.ejs`, `edit-berita.ejs`

## Tahap 2 — Tambah kolom relasi pintu masuk/keluar
- [x] Tambah kolom `pintu_masuk_id` dan `pintu_keluar_id` pada tabel `gunung`
- [ ] Update SQL/migrasi yang sesuai (database-init.sql dan/atau database.sql)
  - Catatan: perubahan kolom dilakukan di `database-init.sql`; migrasi aplikasi (kalau ada script) perlu dijalankan supaya DB mengikuti



## Tahap 3 — Fitur pilih pintu masuk/keluar saat tambah/edit gunung
- [x] Update `controllers/adminController.js`:
  - createGunung menyimpan `pintu_masuk_id` dan `pintu_keluar_id`
  - updateGunung menyimpan `pintu_masuk_id` dan `pintu_keluar_id`
  - editGunung mengirim daftar pintu per gunung untuk dropdown

- [x] Update view `views/kelola-gunung.ejs`:
  - alur tambah: setelah simpan redirect ke halaman edit untuk memilih pintu
  - tambah info helper di form tambah

- [x] Update view `views/edit-gunung.ejs`:
  - tambah dropdown “Pintu Masuk” dan “Pintu Keluar” (pilih dari `pintu_jalur` milik gunung)


## Tahap 4 — Betulkan CRUD berita
- [ ] Cek dan perbaiki mismatch field/action pada `views/kelola-berita.ejs` (modal edit)
- [ ] Pastikan `edit-berita.ejs` konsisten dengan controller (`judul`, `konten`, upload `gambar`)
- [ ] Pastikan delete gambar memakai `gambar_path` (controller) dan view menampilkan `gambar_path`

## Tahap 5 — Testing
- [ ] Jalankan server
- [ ] Test tambah gunung -> otomatis ke edit -> pilih pintu masuk/keluar -> simpan
- [ ] Test edit gunung -> ubah pintu masuk/keluar -> simpan
- [ ] Test CRUD berita: create/upload -> edit/update (ganti gambar) -> delete

