const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Multi-user Data Migration Tool');
console.log('================================\n');

rl.question('Enter the user ID to assign to all existing data: ', (userId) => {
  if (!userId || isNaN(userId)) {
    console.error('❌ Invalid user ID');
    process.exit(1);
  }

  db.serialize(() => {
    // Check if user exists
    db.get('SELECT id FROM users WHERE id = ?', [userId], (err, user) => {
      if (err) {
        console.error('❌ Database error:', err);
        process.exit(1);
      }
      
      if (!user) {
        console.error(`❌ User with ID ${userId} not found`);
        console.log('\nAvailable users:');
        db.all('SELECT id, username, email FROM users', (err, users) => {
          if (err) {
            console.error('Error fetching users:', err);
          } else {
            users.forEach(u => {
              console.log(`  ID: ${u.id} - ${u.username} (${u.email})`);
            });
          }
          process.exit(1);
        });
        return;
      }

      console.log(`\n📊 Updating tables for user ID: ${userId}\n`);

      // Update activities
      db.run('UPDATE activities SET user_id = ? WHERE user_id IS NULL', [userId], function(err) {
        if (err) {
          console.error('❌ Error updating activities:', err);
        } else {
          console.log(`✅ Activities updated: ${this.changes} rows`);
        }
      });

      // Update beneficiaries
      db.run('UPDATE beneficiaries SET user_id = ? WHERE user_id IS NULL', [userId], function(err) {
        if (err) {
          console.error('❌ Error updating beneficiaries:', err);
        } else {
          console.log(`✅ Beneficiaries updated: ${this.changes} rows`);
        }
      });

      // Update donations
      db.run('UPDATE donations SET user_id = ? WHERE user_id IS NULL', [userId], function(err) {
        if (err) {
          console.error('❌ Error updating donations:', err);
        } else {
          console.log(`✅ Donations updated: ${this.changes} rows`);
        }
      });

      console.log('\n🎉 Migration complete!');
      console.log(`All existing data is now associated with user ID: ${userId}`);
    });
  });

  rl.close();
});