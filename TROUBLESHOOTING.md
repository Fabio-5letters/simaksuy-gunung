# 🔧 Troubleshooting Guide - SIMAKSI

## Error yang Sudah Diperbaiki

### 1. ❌ EADDRINUSE: Port 8081 Already in Use

**Penyebab:**
- Server sudah berjalan sebelumnya
- Anda mencoba menjalankan `npm start` lagi
- Port 8081 masih digunakan oleh proses yang belum dihentikan

**Solusi Manual:**
```bash
# Windows
netstat -ano | findstr :8081
taskkill /F /PID <PID_ANGKA>
npm start
```

**Solusi Otomatis:** ✅ **SUDAH DIPERBAIKI!**
- Server sekarang memiliki **automatic port fallback**
- Jika port 8081 sudah digunakan, otomatis mencoba 8082, 8083, dst.
- Tidak perlu kill process manual lagi!

**Script Helper:**
- File: `restart.bat`
- Double-click untuk otomatis kill proses lama dan restart server

---

### 2. ❌ "Terjadi kesalahan saat login"

**Penyebab:**
- Password database salah di `db.js`
- Password user di database tidak valid/bukan bcrypt hash

**Solusi:** ✅ **SUDAH DIPERBAIKI!**
- ✅ Password database diubah ke `''` (kosong, default XAMPP)
- ✅ Password user di-generate ulang dengan bcrypt hash valid

**Kredensial Login:**
```
Admin:
  Email: admin@example.com
  Password: password123

User:
  Email: user@example.com
  Password: password123
```

**Jika masih error:**
```bash
node fix-passwords.js
```

---

### 3. ❌ Status pendakian tidak update setelah verifikasi admin

**Penyebab:**
- Tabel `pemesanan` dan `simaksi` tidak sinkron
- Admin update `pemesanan`, tapi `simaksi` tidak terupdate

**Solusi:** ✅ **SUDAH DIPERBAIKI!**
- ✅ Saat admin verifikasi, kedua tabel otomatis terupdate
- ✅ Halaman riwayat menampilkan data dari kedua tabel
- ✅ E-Tiket bisa di-download setelah diverifikasi

---

## Fitur Baru yang Ditambahkan

### ✅ E-Tiket Digital
- Route: `/download-etiket/:kode_booking`
- Hanya bisa diunduh jika status: `diverifikasi`
- Mencakup: kode booking, detail pendaki, barcode, QR placeholder
- Print-friendly (bisa cetak langsung dari browser)

### ✅ Smart Status Handling
- `/riwayat` sekarang menggabungkan data dari:
  - Tabel `pemesanan` (sistem pembayaran modern)
  - Tabel `simaksi` (sistem lama)
- Status ditampilkan dengan benar untuk kedua sistem

### ✅ Automatic Port Fallback
- File: `app.js`
- Fungsi `startServer(port)` otomatis retry di port lain jika EADDRINUSE
- Tidak perlu manual kill process lagi

---

## Cara Restart Server dengan Benar

### Method 1: Automatic (Recommended) ✅
```bash
# Double-click file ini:
restart.bat
```

### Method 2: Manual
```bash
# 1. Kill proses lama
netstat -ano | findstr :8081
taskkill /F /PID <PID>

# 2. Start server baru
npm start
```

### Method 3: Pakai Port Lain
```bash
# Pakai port berbeda
set PORT=8082
npm start
```

---

## Struktur Database

### Tabel Utama:
1. **`users`** - Data pengguna (admin & user biasa)
2. **`gunung`** - Data gunung
3. **`berita`** - Berita/Artikel
4. **`simaksi`** - Sistem pendaftaran lama (legacy)
5. **`pemesanan`** - Sistem pembayaran modern (new)

### Status di `pemesanan`:
- `pending` - Baru dibuat, belum bayar
- `dibayar` - Sudah upload bukti bayar
- `diverifikasi` - Admin sudah verifikasi ✅
- `ditolak` - Admin tolak ❌

### Status di `simaksi`:
- `Pending` - Menunggu
- `Disetujui` - Disetujui admin ✅
- `Ditolak` - Ditolak admin ❌

---

## Server Info

**Default Port:** 8081  
**Database:** MySQL (simaksi_db)  
**Framework:** Express.js  
**Template:** EJS  
**Auth:** Session-based + bcrypt  

---

**Last Updated:** 7 April 2026  
**Status:** ✅ All systems operational
