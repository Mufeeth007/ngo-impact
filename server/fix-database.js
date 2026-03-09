const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Fixing database schema...\n');

db.serialize(() => {
  // Check if user_id column exists in activities
  db.all("PRAGMA table_info(activities)", (err, columns) => {
    if (err) {
      console.error('Error checking activities:', err);
      return;
    }
    
    const hasUserId = columns.some(col => col.name === 'user_id');
    
    if (!hasUserId) {
      console.log('Adding user_id to activities...');
      db.run("ALTER TABLE activities ADD COLUMN user_id INTEGER", (err) => {
        if (err) {
          console.error('Error:', err.message);
        } else {
          console.log('✅ Added user_id to activities');
        }
      });
    } else {
      console.log('✅ activities table already has user_id');
    }
  });

  // Check beneficiaries table
  db.all("PRAGMA table_info(beneficiaries)", (err, columns) => {
    if (err) {
      console.error('Error checking beneficiaries:', err);
      return;
    }
    
    const hasUserId = columns.some(col => col.name === 'user_id');
    
    if (!hasUserId) {
      console.log('Adding user_id to beneficiaries...');
      db.run("ALTER TABLE beneficiaries ADD COLUMN user_id INTEGER", (err) => {
        if (err) {
          console.error('Error:', err.message);
        } else {
          console.log('✅ Added user_id to beneficiaries');
        }
      });
    } else {
      console.log('✅ beneficiaries table already has user_id');
    }
  });

  // Check donations table
  db.all("PRAGMA table_info(donations)", (err, columns) => {
    if (err) {
      console.error('Error checking donations:', err);
      return;
    }
    
    const hasUserId = columns.some(col => col.name === 'user_id');
    
    if (!hasUserId) {
      console.log('Adding user_id to donations...');
      db.run("ALTER TABLE donations ADD COLUMN user_id INTEGER", (err) => {
        if (err) {
          console.error('Error:', err.message);
        } else {
          console.log('✅ Added user_id to donations');
        }
      });
    } else {
      console.log('✅ donations table already has user_id');
    }
  });

  // Update existing records to associate with admin user (id=1)
  setTimeout(() => {
    console.log('\nUpdating existing records...');
    
    db.run("UPDATE activities SET user_id = 1 WHERE user_id IS NULL", function(err) {
      if (err) {
        console.error('Error updating activities:', err.message);
      } else {
        console.log(`✅ Updated ${this.changes} activities`);
      }
    });

    db.run("UPDATE beneficiaries SET user_id = 1 WHERE user_id IS NULL", function(err) {
      if (err) {
        console.error('Error updating beneficiaries:', err.message);
      } else {
        console.log(`✅ Updated ${this.changes} beneficiaries`);
      }
    });

    db.run("UPDATE donations SET user_id = 1 WHERE user_id IS NULL", function(err) {
      if (err) {
        console.error('Error updating donations:', err.message);
      } else {
        console.log(`✅ Updated ${this.changes} donations`);
      }
    });

    console.log('\n🎉 Database fix complete!');
    console.log('Restart your backend server: npm run dev');
  }, 2000);
});

// Close database after 5 seconds
setTimeout(() => {
  db.close();
}, 5000);