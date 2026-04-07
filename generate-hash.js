// Quick script to generate proper bcrypt hash for password123
const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'password123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Hash:', hash);
  
  // Verify it works
  const isMatch = await bcrypt.compare(password, hash);
  console.log('Verification:', isMatch ? '✅ MATCH' : '❌ NO MATCH');
}

generateHash();
