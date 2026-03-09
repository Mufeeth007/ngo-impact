const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { username, email, password, role } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.run(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role || 'admin']
    );
    
    return result.lastID;
  }

  static async findByEmail(email) {
    return await db.get('SELECT * FROM users WHERE email = ?', [email]);
  }

  static async findById(id) {
    return await db.get('SELECT id, username, email, role FROM users WHERE id = ?', [id]);
  }

  static async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
}

module.exports = User;