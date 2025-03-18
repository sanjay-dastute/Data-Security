const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, '../db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Connect to SQLite database
const db = new sqlite3.Database(path.join(__dirname, '../quantumtrust.sqlite'));

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

  // Insert test organization
  const orgId = generateUUID();
  db.run(`
    INSERT OR IGNORE INTO organizations (id, name, email, phone)
    VALUES (?, ?, ?, ?)
  `, [orgId, 'Test Organization', 'test@org.com', '1234567890']);

  // Insert test users
  Promise.all([
    hashPassword('Admin@123'),
    hashPassword('Org@123'),
    hashPassword('User@123')
  ]).then(([adminHash, orgAdminHash, userHash]) => {
    // Admin user
    db.run(`
      INSERT OR IGNORE INTO users (id, username, email, password, approved_addresses, role, is_active, approval_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      generateUUID(),
      'admin1',
      'admin@quantumtrust.com',
      adminHash,
      JSON.stringify([{ ip: '127.0.0.1', mac: '00:00:00:00:00:00' }]),
      'ADMIN',
      1,
      'approved'
    ]);

    // Org admin user
    db.run(`
      INSERT OR IGNORE INTO users (id, username, email, password, approved_addresses, role, organizationId, is_active, approval_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      generateUUID(),
      'orgadmin1',
      'orgadmin@quantumtrust.com',
      orgAdminHash,
      JSON.stringify([{ ip: '127.0.0.1', mac: '00:00:00:00:00:00' }]),
      'ORG_ADMIN',
      orgId,
      1,
      'approved'
    ]);

    // Regular user
    db.run(`
      INSERT OR IGNORE INTO users (id, username, email, password, approved_addresses, role, organizationId, is_active, approval_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      generateUUID(),
      'user1',
      'user@quantumtrust.com',
      userHash,
      JSON.stringify([{ ip: '127.0.0.1', mac: '00:00:00:00:00:00' }]),
      'ORG_USER',
      orgId,
      1,
      'approved'
    ]);

    console.log('Database initialized with test data');
  });
});

// Close the database connection
db.close();

// Helper functions
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}
