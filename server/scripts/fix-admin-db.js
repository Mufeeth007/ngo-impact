const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Fixing database for admin panel...\n');

db.serialize(() => {
  // Check if is_active column exists in users table
  db.all("PRAGMA table_info(users)", (err, columns) => {
    if (err) {
      console.error('Error checking users table:', err);
      return;
    }
    
    const hasIsActive = columns.some(col => col.name === 'is_active');
    
    if (!hasIsActive) {
      console.log('Adding is_active column to users table...');
      db.run("ALTER TABLE users ADD COLUMN is_active INTEGER DEFAULT 1", (err) => {
        if (err) {
          console.error('Error adding is_active:', err.message);
        } else {
          console.log('✅ Added is_active column');
          
          // Set all existing users to active
          db.run("UPDATE users SET is_active = 1 WHERE is_active IS NULL", function(err) {
            if (err) {
              console.error('Error updating is_active:', err);
            } else {
              console.log(`✅ Updated ${this.changes} users to active`);
            }
          });
        }
      });
    } else {
      console.log('✅ is_active column already exists');
    }
  });

  // Create admin user if not exists
  db.get("SELECT * FROM users WHERE email = ?", ['admin@ngo.com'], (err, row) => {
    if (err) {
      console.error('Error checking admin user:', err);
    } else if (!row) {
      console.log('Creating admin user...');
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      
      db.run(
        "INSERT INTO users (username, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)",
        ['Admin', 'admin@ngo.com', hashedPassword, 'admin', 1],
        function(err) {
          if (err) {
            console.error('Error creating admin:', err);
          } else {
            console.log('✅ Admin user created with ID:', this.lastID);
          }
        }
      );
    } else {
      console.log('✅ Admin user already exists');
      
      // Ensure admin has correct role
      if (row.role !== 'admin') {
        db.run("UPDATE users SET role = 'admin' WHERE email = 'admin@ngo.com'", (err) => {
          if (err) {
            console.error('Error updating admin role:', err);
          } else {
            console.log('✅ Updated admin role');
          }
        });
      }
    }
  });

  // Create some sample NGO users for testing
  setTimeout(() => {
    const sampleNGOs = [
      ['Helping Hands Foundation', 'helping@ngo.com', 'ngo123', 'ngo', 1],
      ['Care International', 'care@ngo.org', 'ngo123', 'ngo', 1],
      ['Education For All', 'education@ngo.org', 'ngo123', 'ngo', 1],
      ['Health First', 'health@ngo.com', 'ngo123', 'ngo', 0] // Disabled
    ];

    sampleNGOs.forEach(([username, email, password, role, is_active]) => {
      db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
        if (!row) {
          const hashedPassword = bcrypt.hashSync(password, 10);
          db.run(
            "INSERT INTO users (username, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)",
            [username, email, hashedPassword, role, is_active],
            function(err) {
              if (!err) {
                console.log(`✅ Created NGO: ${username}`);
              }
            }
          );
        }
      });
    });
  }, 1000);
});

setTimeout(() => {
  console.log('\n🎉 Database fix complete!');
  console.log('Restart your backend server: npm run dev');
  db.close();
}, 3000);