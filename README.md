# 🏔️ SIMAKSI - Sistem Informasi Manajemen Pendakian Gunung

> Platform web modern untuk mengelola pendaftaran dan administrasi pendakian gunung di Indonesia

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18%2B-blue.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-orange.svg)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

---

## ✨ Fitur Utama

### 🔐 Keamanan & Keamanan
- ✅ **Environment Variables** - Konfigurasi sensitif di `.env`
- ✅ **Rate Limiting** - Proteksi terhadap brute force attacks
- ✅ **Security Headers** - Helmet.js untuk HTTP security headers
- ✅ **Password Hashing** - bcrypt dengan salt rounds
- ✅ **Session Management** - Secure session dengan environment-based secret
- ✅ **SQL Injection Protection** - Parameterized queries
- ✅ **Path Traversal Protection** - Validasi path untuk file downloads

### 🎨 User Experience
- ✅ **Responsive Design** - Tailwind CSS untuk semua ukuran layar
- ✅ **Real Mountain Images** - Foto asli dari Unsplash untuk setiap gunung
- ✅ **Search & Pagination** - Pencarian dan pagination di semua list
- ✅ **Forgot Password** - Reset password via email dengan token
- ✅ **Flash Messages** - Notifikasi user-friendly
- ✅ **Profile Management** - Edit profil dan ganti password

### 📊 Fitur Administratif
- ✅ **User Dashboard** - Overview pendakian dan status
- ✅ **Admin Dashboard** - Manajemen gunung, berita, dan verifikasi
- ✅ **Payment System** - Booking, pembayaran, dan verifikasi
- ✅ **Status Tracking** - Tracking status aplikasi real-time
- ✅ **E-Ticket Download** - Download tiket setelah verifikasi

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.0 atau lebih tinggi
- **MySQL** 8.0 atau lebih tinggi
- **XAMPP** (opsional, untuk MySQL lokal)

### 1. Clone Repository

```bash
git clone <repository-url>
cd simaksuy-gunung
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

```bash
# Copy template environment
cp .env.example .env

# Edit .env dan update credentials Anda
# DB_USER=root
# DB_PASSWORD=your_password
# SESSION_SECRET=random_string_64_chars
```

### 4. Setup Database

```bash
# Buat database 'simaksi_db' di MySQL
# Lalu jalankan:
npm run setup

# Atau manual:
mysql -u root -p simaksi_db < database.sql
mysql -u root -p simaksi_db < database-indexes.sql
```

### 5. Start Server

```bash
# Production mode
npm start

# Development mode (auto-restart)
npm run dev
```

Server akan berjalan di: **http://localhost:8081**

---

## 📁 Struktur Project

```
simaksuy-gunung/
├── 📄 app.js                    # Main entry point
├── 📄 db.js                     # Database connection pool
├── 📄 .env                      # Environment variables (JANGAN COMMIT!)
├── 📄 .env.example              # Environment template
├── 📄 database.sql              # Database schema
├── 📄 database-indexes.sql      # Performance indexes
├── 📄 package.json              # Dependencies & scripts
│
├── 📂 routes/                   # Route handlers
│   ├── authRoutes.js            # Login, register, forgot password
│   ├── userRoutes.js            # User dashboard
│   ├── adminRoutes.js           # Admin management
│   ├── generalRoutes.js         # Public pages (profile, berita, etc)
│   └── pembayaranRoutes.js      # Payment flow
│
├── 📂 controllers/              # Business logic (partially implemented)
├── 📂 views/                    # EJS templates
│   ├── beranda.ejs              # Homepage
│   ├── login.ejs                # Login page
│   ├── register.ejs             # Registration
│   ├── profile.ejs              # User profile
│   ├── forgot-password.ejs      # Forgot password
│   ├── reset-password.ejs       # Reset password
│   └── ...                      # More pages
│
├── 📂 public/                   # Static files
│   ├── css/                     # Stylesheets
│   └── uploads/                 # User uploads
│
└── 📂 middleware/                # Custom middleware (TODO)
```

---

## 🗄️ Database Setup

### 1. Create Database

```sql
CREATE DATABASE simaksi_db;
```

### 2. Import Schema

```bash
mysql -u root -p simaksi_db < database.sql
```

### 3. Add Performance Indexes

```bash
mysql -u root -p simaksi_db < database-indexes.sql
```

### 4. Verify Setup

```sql
USE simaksi_db;
SHOW TABLES;
SHOW INDEX FROM pemesanan;
SHOW INDEX FROM users;
```

---

## 🔐 Default Credentials

### Admin Account
- **Email:** `admin@example.com`
- **Password:** `admin123`

### User Account
- **Email:** `user@example.com`
- **Password:** `user123`

**⚠️ PENTING:** Ganti password default setelah login pertama!

---

## 📡 API Endpoints

### Public Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Redirect to login |
| GET | `/login` | Login page |
| POST | `/login` | Process login |
| GET | `/register` | Registration page |
| POST | `/register` | Process registration |
| GET | `/forgot-password` | Forgot password form |
| POST | `/forgot-password` | Send reset link |
| GET | `/reset-password/:token` | Reset password form |
| POST | `/reset-password/:token` | Process reset |

### User Routes (Requires Authentication)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/beranda` | User dashboard |
| GET | `/profile` | User profile |
| POST | `/profile/update` | Update profile |
| POST | `/profile/change-password` | Change password |
| GET | `/riwayat` | Hiking history |
| GET | `/status` | Application status |

### Admin Routes (Requires Admin Role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin` | Admin dashboard |
| POST | `/admin/gunung` | Add mountain |
| POST | `/admin/berita` | Add news |
| POST | `/admin/verifikasi/:id` | Verify payment |

---

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with auto-restart |
| `npm run setup` | Run database setup script |
| `npm run setup-db` | Initialize database schema |
| `npm run migrate` | Run payment migration |

---

## 🔧 Configuration

### Environment Variables

```env
# Database
DB_HOST=localhost
DB_USER=simaksi_user
DB_PASSWORD=your_secure_password
DB_NAME=simaksi_db
DB_PORT=3306

# Session
SESSION_SECRET=random_64_character_string_here
SESSION_MAX_AGE=86400000

# Server
NODE_ENV=development
PORT=8081

# Email (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
EMAIL_FROM=SIMAKSI <noreply@simaksi.com>
```

---

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `SESSION_SECRET` (64+ chars)
- [ ] Use HTTPS and set `secure: true` in session config
- [ ] Create dedicated database user (NOT root)
- [ ] Enable firewall and restrict database access
- [ ] Setup automated backups
- [ ] Configure error monitoring (e.g., Sentry)
- [ ] Enable logging and monitoring
- [ ] Setup email service (SendGrid, Mailgun, etc.)
- [ ] Configure CDN for static assets (optional)

### Platform Recommendations

- **Hosting:** AWS, DigitalOcean, Heroku, Railway
- **Database:** MySQL 8.0+, AWS RDS, or managed MySQL
- **Email:** SendGrid, Mailgun, or AWS SES
- **Monitoring:** Sentry, LogRocket, or New Relic

---

## 📊 Performance

### Database Indexes

15+ indexes telah ditambahkan untuk meningkatkan performa query:

- **pemesanan:** `idx_user_id`, `idx_status`, `idx_gunung_id`, `idx_created_at`
- **simaksi:** `idx_user_id`, `idx_status_pengajuan`, `idx_tanggal_pendakian`
- **users:** `idx_reset_token`, `idx_email`
- **berita:** `idx_tanggal`, FULLTEXT `idx_berita_search`

### Expected Performance

- Query time: **< 50ms** untuk 10,000 rows
- Page load: **< 2s** pada koneksi 3G
- Rate limiting: **8 requests/15min** untuk auth endpoints

---

## 🛡️ Security Features

| Feature | Status | Description |
|---------|--------|-------------|
| Environment Variables | ✅ | Sensitive credentials in `.env` |
| Rate Limiting | ✅ | 8 req/15min auth, 100 req/15min general |
| Security Headers | ✅ | Helmet.js with CSP |
| Password Hashing | ✅ | bcrypt with salt |
| Session Security | ✅ | HTTP-only, SameSite lax |
| SQL Injection | ✅ | Parameterized queries |
| Path Traversal | ✅ | Path validation |
| XSS Protection | ✅ | EJS auto-escaping + CSP |
| CSRF Protection | ⏳ | Ready (needs implementation) |

---

## 📝 Changelog

### Version 2.0.0 (Security Update) - April 2026

**Critical:**
- ✅ Environment variables for all sensitive configuration
- ✅ Rate limiting on authentication endpoints
- ✅ Security headers with Helmet.js
- ✅ Password logging removed
- ✅ Path traversal vulnerability fixed

**High:**
- ✅ Database indexes for performance (15+ indexes)
- ✅ Real mountain images from database
- ✅ Forgot password functionality
- ✅ Search and pagination on all lists

**Changes:**
- `app.js` - Security middleware added
- `db.js` - Environment-based configuration
- `authRoutes.js` - Password logging removed
- `generalRoutes.js` - Path traversal fixed, search & pagination
- `beranda.ejs` - Real mountain images
- Views - Added forgot/reset password pages

### Version 1.0.0 - Initial Release

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👥 Team

- **Developer:** SIMAKSI Team
- **Maintainer:** Chris

---

## 📞 Support

- **Email:** info@simaksi.com
- **Phone:** +62 274 515 912
- **Address:** Semarang, Indonesia

---

## 🙏 Acknowledgments

- **Tailwind CSS** - For the beautiful UI components
- **Font Awesome** - For the icons
- **Unsplash** - For the stunning mountain photography
- **Express.js** - For the robust web framework
- **MySQL** - For the reliable database

---

<div align="center">

**Made with ❤️ by SIMAKSI Team**

[Website](#) • [Documentation](#) • [Support](#)

</div>
