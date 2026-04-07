SETUP & RUNNING GUIDE - SIMAKSI Gunung Pendakian

═══════════════════════════════════════════════════════════════════════════════

## 🚀 QUICK START

### 1. Prerequisites
- Node.js v16+ (https://nodejs.org/)
- MySQL Server (https://www.mysql.com/)
- Git (optional)

### 2. Initial Setup

#### Step 1: Install Dependencies
```bash
npm install
```

#### Step 2: Setup Database
```bash
npm run setup
```
This will automatically:
- Create database `simaksi_db`
- Create all required tables
- Insert dummy data (admin + test user)

#### Step 3: Start the Application
```bash
npm start
```

The application will run on: **http://localhost:4000**

═══════════════════════════════════════════════════════════════════════════════

## 📝 Test Accounts

### Admin Account:
- Email: `admin@example.com`
- Password: `password` (default test password from dummy data)

### User Account:
- Email: `user@example.com`
- Password: `password` (default test password from dummy data)

**Note:** After setup, you can register new accounts using the register page.

═══════════════════════════════════════════════════════════════════════════════

## 🔧 Configuration

### Database Connection
Edit `db.js` if you need to change:
- Host: `localhost` (default)
- User: `root` (default)
- Password: `` (leave empty by default, change if your MySQL has password)
- Database: `simaksi_db` (auto-created)

```javascript
// In db.js, modify the pool configuration:
const pool = mysql.createPool({
  host: 'localhost',      // Your MySQL host
  user: 'root',           // Your MySQL user
  password: '',           // Your MySQL password (if any)
  database: 'simaksi_db', // Database name
  ...
});
```

### Application Port
Default port is **4000**. To change:

Edit `app.js`:
```javascript
const PORT = process.env.PORT || 4000; // Change 4000 to your desired port
```

═══════════════════════════════════════════════════════════════════════════════

## 📚 Available Scripts

```bash
# Start the application
npm start

# Setup database (run once)
npm run setup
```

═══════════════════════════════════════════════════════════════════════════════

## 🌐 Application Routes

### Public Routes (No Login Required)
- `GET /login` - Login page
- `POST /login` - Submit login form
- `GET /register` - Register page
- `POST /register` - Submit register form
- `GET /logout` - Logout

### User Routes (Login Required as User)
- `GET /beranda` - User dashboard/home page
- `POST /simaksi` - Submit hiking registration

### Admin Routes (Login Required as Admin)
- `GET /admin` - Admin dashboard
- `POST /admin/gunung` - Add new mountain
- `POST /admin/berita` - Add news article
- `POST /admin/simaksi/:id` - Update hiking registration status

═══════════════════════════════════════════════════════════════════════════════

## 🎨 Styling

The application uses:
- **Tailwind CSS** (CDN) - For utility CSS
- **Font Awesome 6.4.0** - For icons
- **Custom CSS** - In `/public/css/` directory

Main CSS files:
- `/public/css/style.css` - Custom styles
- `/public/css/output.css` - Tailwind compiled output
- `/public/css/modern.css` - Modern utilities

═══════════════════════════════════════════════════════════════════════════════

## 📁 Project Structure

```
simaksuy gunung/
├── app.js                      # Main application file
├── db.js                       # Database connection
├── db-setup.js                 # Database initialization script
├── database.sql                # Original database schema
├── database-init.sql           # Complete database initialization
├── package.json                # NPM dependencies
│
├── controllers/
│   ├── authController.js       # Auth logic (currently empty)
│   ├── userController.js       # User logic (currently empty)
│   └── adminController.js      # Admin logic (currently empty)
│
├── routes/
│   ├── authRoutes.js           # Login/Register routes
│   ├── userRoutes.js           # User dashboard routes
│   └── adminRoutes.js          # Admin management routes
│
├── views/                      # EJS template files
│   ├── login.ejs               # Login page
│   ├── register.ejs            # Register page
│   ├── beranda.ejs             # User dashboard
│   └── admin.ejs               # Admin dashboard
│
├── public/
│   └── css/
│       ├── style.css           # Custom styles
│       ├── output.css          # Tailwind output
│       ├── modern.css          # Modern utilities
│       └── images/             # Images folder
│
└── image/                      # Image assets
```

═══════════════════════════════════════════════════════════════════════════════

## ✨ Features

### Login & Register
- ✅ Email validation
- ✅ Password hashing with bcrypt
- ✅ Session management
- ✅ Error messages
- ✅ Beautiful animated UI

### User Dashboard
- ✅ View available mountains
- ✅ Read news articles
- ✅ Register hiking applications
- ✅ Check registration status
- ✅ Modern responsive design

### Admin Dashboard
- ✅ Manage mountains (add, view)
- ✅ Manage news articles (add, view)
- ✅ Review hiking registrations
- ✅ Approve/Reject registrations
- ✅ View statistics
- ✅ Enterprise-level UI

═══════════════════════════════════════════════════════════════════════════════

## 🐛 Troubleshooting

### "Database connection error"
1. Ensure MySQL is running
2. Run: `npm run setup`
3. Check db.js configuration

### "Port 4000 is already in use"
Change the port in app.js or kill the process using port 4000:
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :4000
kill -9 <PID>
```

### "Module not found"
Run: `npm install`

### Login showing "Server error"
Check browser console and server logs for details. Common causes:
- Database connection failed
- Email already registered
- Invalid password format

═══════════════════════════════════════════════════════════════════════════════

## 📱 Browser Support

✅ Chrome (latest)
✅ Firefox (latest)
✅ Safari (latest)
✅ Edge (latest)
✅ Mobile browsers

═══════════════════════════════════════════════════════════════════════════════

## 🔐 Security Notes

⚠️ This is a development application. For production:
- [ ] Change session secret in app.js
- [ ] Add HTTPS
- [ ] Implement CSRF protection
- [ ] Add input sanitization
- [ ] Use environment variables for sensitive data
- [ ] Add rate limiting
- [ ] Add email verification for registration

═══════════════════════════════════════════════════════════════════════════════

## 📞 Support

For issues:
1. Check the MongoDB has correct data
2. Ensure all npm packages are installed
3. Check browser console for JavaScript errors
4. Check server logs in terminal

═══════════════════════════════════════════════════════════════════════════════

Happy Hiking! 🏔️
