# 📰 Berita & Informasi Gunung - SIMAKSI

## ✅ Fitur yang Sudah Ditambahkan

### 1. **Berita Terbaru (6 Berita Baru)**

#### 📊 Total Berita: 8 (dari 2 sebelumnya)

**Berita Baru yang Ditambahkan:**

1. **Gunung Merbabu Buka Kuota Pendakian 150 Orang Per Hari** (7 April 2026)
   - Informasi kuota baru untuk Merbabu
   - Persyaratan SIMAKSI online
   - Peningkatan keamanan di jalur pendakian

2. **Waspada! Gunung Merapi Tingkatkan Status Menjadi Siaga II** (6 April 2026)
   - Update status aktivitas Merapi
   -Radius aman untuk pendakian
   - Panduan keselamatan untuk pendaki

3. **Festival Sunrise di Gunung Lawu Menarik Ribuan Pendaki** (5 April 2026)
   - Laporan event festival sunrise
   - Kegiatan festival (yoga, foto hunting, talkshow)
   - Promosi wisata Gunung Lawu

4. **Gunung Sindoro: Surga Tersembunyi bagi Pendaki Profesional** (4 April 2026)
   - Profil lengkap Gunung Sindoro
   - Deskripsi jalur pendakian
   - Tips untuk pendaki berpengalaman

5. **Tips Aman Mendaki Gunung untuk Pemula di Musim Hujan** (3 April 2026)
   - 6 tips penting pendakian musim hujan
   - Checklist perlengkapan
   - Panduan keselamatan

6. **Pendakian Ramah Lingkungan: Kampanye Bersih di Semua Jalur Gunung** (2 April 2026)
   - Gerakan "Leave No Trace"
   - Aturan sampah di jalur pendakian
   - Sanksi untuk pelanggar

---

### 2. **Deskripsi Lengkap untuk Semua Gunung (4 Gunung)**

#### 🏔️ Data Gunung yang Sudah Diperkaya:

| Gunung | Ketinggian | Lokasi | Deskripsi |
|--------|-----------|--------|-----------|
| **Merbabu** | 3,142 mdpl | Semarang, Jawa Tengah | ✓ Deskripsi lengkap tentang padang alpine, jalur pendakian (Selo, Wekas, Suwanting), sunrise spektakuler |
| **Merapi** | 2,911 mdpl | Yogyakarta, Jawa Tengah | ✓ Deskripsi aktivitas vulkanik, status siaga, kawah aktif, pendakian untuk berpengalaman |
| **Lawu** | 3,265 mdpl | Karanganyar, Jawa Tengah | ✓ Deskripsi tempat spiritual, petilasan, jalur (Cemoro Sewu, Kandang, Candi Cetho), sunrise & lautan awan |
| **Sindoro** | 3,136 mdpl | Wonosobo, Jawa Tengah | ✓ Deskripsi kaldera puncak, jalur (Kledung, Sigedang), vegetasi alami, panorama Sumbing |

---

### 3. **Halaman Informasi Gunung yang Diperkaya**

#### 📍 Route Baru:
- **GET `/pendakian/:id`** - Halaman detail gunung individual
  - Deskripsi lengkap gunung
  - Informasi statistik (ketinggian, lokasi, kuota, status)
  - Berita terkait gunung
  - Tips pendakian
  - Tombol daftar pendakian

#### 🎨 Fitur Tampilan:

**Halaman `/pendakian`:**
- ✅ Card grid 2 kolom dengan gambar hero
- ✅ Statistik ringkas (kuota, status, ketinggian)
- ✅ Deskripsi singkat dengan "Baca Selengkapnya"
- ✅ Tombol daftar langsung di setiap card

**Halaman `/pendakian/:id`:**
- ✅ Hero section besar dengan nama gunung
- ✅ Deskripsi lengkap (full text)
- ✅ Sidebar info card (sticky)
- ✅ Berita terkait (max 3)
- ✅ Tips pendakian
- ✅ Tombol daftar (responsive untuk user yang sudah login)

---

## 📁 File yang Dibuat/Diubah

### File Baru:
1. ✅ `add-news-and-info.js` - Script untuk menambahkan berita & deskripsi
2. ✅ `views/gunung-detail.ejs` - Template halaman detail gunung

### File Diubah:
1. ✅ `routes/generalRoutes.js` - Tambah route `/pendakian/:id`
2. ✅ `views/pendakian.ejs` - Tambah section "Informasi Gunung" dengan deskripsi
3. ✅ Database: Kolom `deskripsi` ditambahkan ke tabel `gunung`
4. ✅ Database: 6 berita baru ditambahkan ke tabel `berita`

---

## 🎯 Cara Mengakses

### Untuk User:
1. **Lihat semua berita:** http://localhost:8081/berita
2. **Lihat daftar gunung:** http://localhost:8081/pendakian
3. **Lihat detail gunung:** http://localhost:8081/pendakian/1 (ganti angka untuk gunung lain)
4. **Baca berita lengkap:** http://localhost:8081/berita/:id

### Untuk Admin:
Tambah berita baru melalui dashboard admin di: http://localhost:8081/admin
- Scroll ke section "Kelola Berita"
- Isi form: Judul, Isi Berita, Tanggal
- Submit untuk menambahkan berita baru

---

## 📊 Statistik Konten

| Jenis | Sebelum | Sesudah | Penambahan |
|-------|---------|---------|------------|
| **Berita** | 2 | 8 | +6 ✅ |
| **Deskripsi Gunung** | 0 | 4 | +4 ✅ |
| **Halaman Detail** | Tidak ada | Ada | +4 ✅ |

---

## 💡 Tips Penggunaan

### Untuk Admin:
1. **Tambah Berita:** Gunakan dashboard admin form
2. **Update Deskripsi Gunung:** Bisa langsung via database atau tambahkan form di dashboard
3. **Gambar Berita:** Saat ini menggunakan placeholder, bisa diganti dengan gambar asli

### Untuk User:
1. **Pelajari Dulu:** Baca deskripsi & berita sebelum mendaftar
2. **Cek Status:** Pastikan status gunung "Buka" sebelum mendaftar
3. **Perhatikan Kuota:** Setiap gunung punya kuota harian berbeda

---

## 🚀 Fitur yang Bisa Ditambahkan Selanjutnya (Opsional)

- [ ] Upload gambar untuk setiap berita
- [ ] Form edit deskripsi gunung di dashboard admin
- [ ] Galeri foto untuk setiap gunung
- [ ] Video panduan pendakian
- [ ] Peta interaktif jalur pendakian
- [ ] Review & rating dari pendaki lain
- [ ] Cuaca real-time di setiap gunung

---

**Status:** ✅ Selesai & Siap Digunakan  
**Last Updated:** 7 April 2026
