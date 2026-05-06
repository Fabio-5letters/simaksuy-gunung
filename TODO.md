# TODO - Revisi Tahap Kedua (SIMAKSI Gunung)

- [ ] Implement Tombol “Lihat Detail Peringatan” di halaman Cuaca:
  - [ ] Buat modal/section detail peringatan.
  - [ ] Hubungkan logika status peringatan dari data cuaca.
  - [ ] Tambahkan route/controller atau render-ready data yang diperlukan.

- [ ] Implement Logika Ketersediaan Gunung:
  - [ ] Filter list gunung di halaman `/pendakian` agar tidak menampilkan gunung dengan status `Tutup` atau `Tidak Bisa Didaki`.
  - [ ] Pastikan tombol daftar tidak muncul pada gunung yang ditutup.

- [ ] Implement/rapikan Tombol “Daftar Pendakian”:
  - [ ] Pastikan alur klik tombol mengarah ke `/daftar/:id` (form pendaftaran) saat gunung berstatus `Buka`.
  - [ ] Audit tombol di `gunung-detail.ejs` dan `pendakian.ejs` agar konsisten.

- [ ] Perbaikan Halaman “Panduan”:
  - [ ] Rapikan layout `views/panduan.ejs` agar lebih responsif dan tidak terlihat berantakan.
  - [ ] Hilangkan struktur elemen yang berulang/aneh jika ada.
  - [ ] Pastikan styling konsisten (grid, spacing, tipografi).

