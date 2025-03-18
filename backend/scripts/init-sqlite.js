const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Connect to SQLite database
const db = new sqlite3.Database('quantumtrust.sqlite');

// Create tables
db.serialize(() => {
  // Create organizations table
  db.run(`
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      approved_addresses TEXT DEFAULT '[]',
      role TEXT DEFAULT 'ORG_USER',
      organizationId TEXT,
      is_active INTEGER DEFAULT 0,
      approval_status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (organizationId) REFERENCES organizations (id)
    )
  `);
});

// Insert test organization
const orgId = uuidv4();
db.run(`
  INSERT OR IGNORE INTO organizations (id, name, email, phone)
  VALUES (?, ?, ?, ?)
`, [orgId, 'Test Organization', 'test@org.com', '1234567890'], function(err) {
  if (err) {
    console.error('Error inserting organization:', err.message);
    return;
  }
  
  // Insert test users after organization is created
  Promise.all([
    bcrypt.hash('Admin@123', 10),
    bcrypt.hash('Org@123', 10),
    bcrypt.hash('User@123', 10)
  ]).then(([adminHash, orgAdminHash, userHash]) => {
    // Admin user
    db.run(`
      INSERT OR IGNORE INTO users (id, username, email, password, approved_addresses, role, is_active, approval_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      'admin1',
      'admin@quantumtrust.com',
      adminHash,
      JSON.stringify([{ ip: '127.0.0.1', mac: '00:00:00:00:00:00' }]),
      'ADMIN',
      1,
      'approved'
    ], function(err) {
      if (err) console.error('Error inserting admin user:', err.message);
    });

    // Org admin user
    db.run(`
      INSERT OR IGNORE INTO users (id, username, email, password, approved_addresses, role, organizationId, is_active, approval_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      'orgadmin1',
      'orgadmin@quantumtrust.com',
      orgAdminHash,
      JSON.stringify([{ ip: '127.0.0.1', mac: '00:00:00:00:00:00' }]),
      'ORG_ADMIN',
      orgId,
      1,
      'approved'
    ], function(err) {
      if (err) console.error('Error inserting org admin user:', err.message);
    });

    // Regular user
    db.run(`
      INSERT OR IGNORE INTO users (id, username, email, password, approved_addresses, role, organizationId, is_active, approval_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      'user1',
      'user@quantumtrust.com',
      userHash,
      JSON.stringify([{ ip: '127.0.0.1', mac: '00:00:00:00:00:00' }]),
      'ORG_USER',
      orgId,
      1,
      'approved'
    ], function(err) {
      if (err) console.error('Error inserting regular user:', err.message);
      else console.log('Database initialized with test data');
      
      // Close the database connection after all operations are complete
      db.close();
    });
  }).catch(err => {
    console.error('Error hashing passwords:', err);
    db.close();
  });
});
