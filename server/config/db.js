const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbPath = path.resolve(__dirname, '../database.sqlite');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database with tables
function initializeDatabase() {
  db.serialize(() => {
    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create activities table
    db.run(`CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      location TEXT NOT NULL,
      date DATE NOT NULL,
      beneficiaries_count INTEGER DEFAULT 0,
      budget REAL DEFAULT 0,
      description TEXT,
      status TEXT DEFAULT 'planned',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create beneficiaries table
    db.run(`CREATE TABLE IF NOT EXISTS beneficiaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      location TEXT,
      category TEXT,
      enrollment_date DATE,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create donations table
    db.run(`CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      donor_name TEXT NOT NULL,
      amount REAL NOT NULL,
      date DATE NOT NULL,
      category TEXT,
      payment_method TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Check if admin user exists, if not create one
    db.get("SELECT * FROM users WHERE email = ?", ['admin@ngo.com'], (err, row) => {
      if (err) {
        console.error('Error checking for admin user:', err);
      } else if (!row) {
        // Create default admin user (password: admin123)
        const bcrypt = require('bcryptjs');
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        
        db.run(
          "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
          ['Admin', 'admin@ngo.com', hashedPassword, 'admin'],
          function(err) {
            if (err) {
              console.error('Error creating admin user:', err);
            } else {
              console.log('Default admin user created');
            }
          }
        );
      }
    });

    // Insert sample data if tables are empty
    db.get("SELECT COUNT(*) as count FROM activities", (err, row) => {
      if (err) {
        console.error('Error checking activities:', err);
      } else if (row.count === 0) {
        insertSampleData();
      }
    });
  });
}

function insertSampleData() {
  const sampleActivities = [
    ['Education Drive Chennai', 'Education', 'Chennai', '2024-03-15', 450, 250000, 'Providing educational materials to underprivileged children', 'completed'],
    ['Health Camp Mumbai', 'Healthcare', 'Mumbai', '2024-03-10', 320, 180000, 'Free health checkup camp', 'completed'],
    ['Food Distribution Delhi', 'Food Distribution', 'Delhi', '2024-02-28', 580, 150000, 'Monthly food distribution drive', 'ongoing'],
    ['Women Empowerment Workshop', 'Training', 'Pune', '2024-02-20', 210, 90000, 'Skill development workshop for women', 'completed'],
    ['Winter Relief Campaign', 'Emergency Relief', 'Multiple', '2024-01-15', 720, 450000, 'Winter clothing and blanket distribution', 'completed']
  ];

  const sampleBeneficiaries = [
    ['Rahul Sharma', 12, 'Male', 'Chennai', 'Education', '2024-01-10', 'active'],
    ['Priya Patel', 35, 'Female', 'Mumbai', 'Healthcare', '2024-01-15', 'active'],
    ['Abdul Khan', 45, 'Male', 'Delhi', 'Food Distribution', '2024-02-01', 'active'],
    ['Lakshmi Narayan', 28, 'Female', 'Bangalore', 'Training', '2024-02-10', 'active'],
    ['John Doe', 8, 'Male', 'Chennai', 'Education', '2024-02-15', 'active'],
    ['Mary Joseph', 52, 'Female', 'Kerala', 'Healthcare', '2024-02-20', 'active'],
    ['Arun Kumar', 19, 'Male', 'Pune', 'Employment', '2024-03-01', 'active'],
    ['Sita Devi', 60, 'Female', 'Delhi', 'Shelter', '2024-03-05', 'active']
  ];

  const sampleDonations = [
    ['Tata Foundation', 500000, '2024-03-01', 'Education', 'Bank Transfer', 'Annual education grant'],
    ['Infosys Foundation', 350000, '2024-03-05', 'Healthcare', 'Bank Transfer', 'Healthcare initiative support'],
    ['Local Donor - Ramesh', 5000, '2024-03-10', 'Food Distribution', 'UPI', 'Monthly donation'],
    ['Corporate CSR', 250000, '2024-02-15', 'Shelter', 'Cheque', 'Housing project'],
    ['Anonymous', 10000, '2024-02-20', 'Training', 'Cash', 'Skill development'],
    ['Wipro Cares', 400000, '2024-02-25', 'Emergency Relief', 'Bank Transfer', 'Disaster relief fund'],
    ['Individual Donor', 2500, '2024-03-12', 'Education', 'Credit Card', 'Monthly subscription'],
    ['Rotary Club', 150000, '2024-03-08', 'Healthcare', 'Cheque', 'Medical camp sponsorship']
  ];

  const stmt = db.prepare("INSERT INTO activities (name, category, location, date, beneficiaries_count, budget, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  sampleActivities.forEach(activity => stmt.run(activity));
  stmt.finalize();

  const stmt2 = db.prepare("INSERT INTO beneficiaries (name, age, gender, location, category, enrollment_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
  sampleBeneficiaries.forEach(beneficiary => stmt2.run(beneficiary));
  stmt2.finalize();

  const stmt3 = db.prepare("INSERT INTO donations (donor_name, amount, date, category, payment_method, notes) VALUES (?, ?, ?, ?, ?, ?)");
  sampleDonations.forEach(donation => stmt3.run(donation));
  stmt3.finalize();

  console.log('Sample data inserted successfully');
}

// Promisify database operations
const dbAsync = {
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  },
  
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  },
  
  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  
  exec: (sql) => {
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

module.exports = dbAsync;