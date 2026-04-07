// Fix: Update admin and user passwords to real bcrypt hashes
const db = require('./db');
const bcrypt = require('bcryptjs');

async function fixPasswords() {
  try {
    console.log('🔧 Fixing admin and user passwords...\n');

    // Generate real hash for password123
    const hash = await bcrypt.hash('password123', 10);
    
    // Verify first
    const isMatch = await bcrypt.compare('password123', hash);
    if (!isMatch) {
      console.log('❌ Hash verification failed!');
      process.exit(1);
    }
    
    console.log('✅ Generated valid bcrypt hash');
    console.log('   Hash:', hash);
    
    // Update admin password
    const [adminResult] = await db.query(
      "UPDATE users SET password = ? WHERE email = 'admin@example.com'",
      [hash]
    );
    console.log('\n✅ Admin password updated:', adminResult.affectedRows, 'rows affected');
    
    // Update user password
    const [userResult] = await db.query(
      "UPDATE users SET password = ? WHERE email = 'user@example.com'",
      [hash]
    );
    console.log('✅ User password updated:', userResult.affectedRows, 'rows affected');
    
    // Verify by fetching and comparing
    const [adminCheck] = await db.query(
      "SELECT password FROM users WHERE email = 'admin@example.com'"
    );
    const adminMatch = await bcrypt.compare('password123', adminCheck[0].password);
    
    const [userCheck] = await db.query(
      "SELECT password FROM users WHERE email = 'user@example.com'"
    );
    const userMatch = await bcrypt.compare('password123', userCheck[0].password);
    
    console.log('\n🔍 Verification:');
    console.log('   Admin login:', adminMatch ? '✅ WORKS' : '❌ FAILED');
    console.log('   User login:', userMatch ? '✅ WORKS' : '❌ FAILED');
    
    console.log('\n✅ DONE! You can now login with:');
    console.log('   Admin: admin@example.com / password123');
    console.log('   User:  user@example.com / password123');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fixPasswords();
