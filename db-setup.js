const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: ''
});

function query(sql) {
  return new Promise((resolve, reject) => {
    connection.query(sql, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(result);
    });
  });
}

async function initializeDatabase() {
  try {
    await query('CREATE DATABASE IF NOT EXISTS simaksi_db');
    console.log('Database simaksi_db ready');

    await query('USE simaksi_db');

    const sqlFile = path.join(__dirname, 'database-init.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    const statements = sql.split(';').filter(statement => statement.trim());

    for (let index = 0; index < statements.length; index += 1) {
      try {
        await query(statements[index]);
      } catch (error) {
        console.error(`Error executing statement ${index + 1}:`, error);
        throw error;
      }
    }

    console.log('Database tables initialized successfully');
  } finally {
    connection.end();
  }
}

if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database setup failed:', error.message);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
