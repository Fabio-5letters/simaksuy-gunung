const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// Connect without specifying database first
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '' // Update if you have a password
});

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    // Create database
    connection.query('CREATE DATABASE IF NOT EXISTS simaksi_db', (error) => {
      if (error) {
        console.error('Error creating database:', error);
        return reject(error);
      }
      
      console.log('✓ Database simaksi_db ready');
      
      // Select the database
      connection.query('USE simaksi_db', (error) => {
        if (error) {
          console.error('Error selecting database:', error);
          return reject(error);
        }
        
        // Read and execute initialization SQL
        const sqlFile = path.join(__dirname, 'database-init.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');
        
        // Split by semicolon and execute each statement
        const statements = sql.split(';').filter(statement => statement.trim());
        let executed = 0;
        
        statements.forEach((statement, index) => {
          connection.query(statement, (error) => {
            if (error) {
              console.error(`Error executing statement ${index + 1}:`, error);
            } else {
              executed++;
            }
            
            if (executed === statements.length) {
              console.log('✓ Database tables initialized successfully');
              connection.end();
              resolve();
            }
          });
        });
      });
    });
  });
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✓ Database setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('✗ Database setup failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
