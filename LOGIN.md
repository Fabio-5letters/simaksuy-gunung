# 🔐 Panduan Login SIMAKSI

## Kredensial Login

### Admin
- **Email:** `admin@example.com`
- **Password:** `password123`
- **Dashboard:** http://localhost:8081/admin

### User Biasa
- **Email:** `user@example.com`
- **Password:** `password123`
- **Dashboard:** http://localhost:8081/beranda

## Cara Login

1. Buka browser dan akses: **http://localhost:8081/login**
2. Masukkan email dan password
3. Klik tombol "Login"
4. Anda akan diarahkan ke dashboard sesuai role

## Troubleshooting

### Jika muncul error "Terjadi kesalahan saat login":
1. Pastikan MySQL sudah berjalan (XAMPP Control Panel → Start MySQL)
2. Pastikan server Node.js sudah running
3. Cek koneksi database di file `db.js`
4. Jalankan script fix password: `node fix-passwords.js`

### Jika redirect gagal setelah login:
1. Pastikan cookies di-enable di browser
2. Coba clear browser cache
3. Restart browser dan coba lagi

## Register User Baru

Anda juga bisa mendaftar user baru di: **http://localhost:8081/register**

---
**Server:** http://localhost:8081
**Database:** simaksi_db (MySQL)
