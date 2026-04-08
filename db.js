require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'simaksi_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true
});

// Test connection
pool.getConnection(function(err, connection) {
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('❌ Database connection was closed.');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('❌ Database has too many connections.');
    }
    console.error('❌ Database connection error:', err.message);
  } else {
    connection.release();
    console.log('✓ Database connected successfully');
  }
});

module.exports = pool.promise();