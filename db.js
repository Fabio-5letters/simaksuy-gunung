const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root', // Replace with your actual MySQL password
  database: 'simaksi_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true
});

// Test connection
pool.getConnection(function(err, connection) {
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.');
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.');
    }
    if (err.code === 'ER_INSIDE_TRANSACTION_CONTROL') {
      console.error('Database connection used outside of transaction');
    }
    console.error('Database connection error:', err);
  } else {
    connection.release();
    console.log('✓ Database connected successfully');
  }
});

module.exports = pool.promise();