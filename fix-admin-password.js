const bcrypt = require('bcryptjs');
const db = require('./db');

async function fixAdminPassword() {
  const plainPassword = 'password123';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  console.log('Plain password:', plainPassword);
  console.log('Generated hash:', hashedPassword);

  await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, 'admin@example.com']);
  console.log('✓ Admin password updated successfully');

  // Verify
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', ['admin@example.com']);
  const user = rows[0];
  const isMatch = await bcrypt.compare(plainPassword, user.password);
  console.log('Verification - Password match:', isMatch);

  process.exit(0);
}

fixAdminPassword().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
