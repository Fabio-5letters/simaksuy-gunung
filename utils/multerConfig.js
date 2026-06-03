const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../public/uploads/berita');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter: hanya terima jpg, jpeg, png, webp
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];
  
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error('Format file hanya boleh JPG, JPEG, PNG, atau WEBP'), false);
  }
};

// Configure multer with size limit (max 5MB)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = upload;
