const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  // Create new user
  static async create(userData) {
    const { username, email, password, role = 'ngo' } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.run(
      'INSERT INTO users (username, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, role, 1]
    );
    
    return result.lastID;
  }

  // Find user by email
  static async findByEmail(email) {
    return await db.get('SELECT * FROM users WHERE email = ?', [email]);
  }

  // Find user by ID
  static async findById(id) {
    return await db.get('SELECT id, username, email, role, is_active, created_at FROM users WHERE id = ?', [id]);
  }

  // Verify password
  static async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  // ADMIN FUNCTIONS
  
  // Get all NGOs (users with role = 'ngo')
  static async getAllNGOs() {
    return await db.all(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.role,
        u.is_active,
        u.created_at,
        COUNT(DISTINCT a.id) as total_activities,
        COUNT(DISTINCT b.id) as total_beneficiaries,
        COUNT(DISTINCT d.id) as total_donations,
        COALESCE(SUM(d.amount), 0) as total_funds,
        COUNT(DISTINCT a.location) as active_locations
      FROM users u
      LEFT JOIN activities a ON a.user_id = u.id
      LEFT JOIN beneficiaries b ON b.user_id = u.id
      LEFT JOIN donations d ON d.user_id = u.id
      WHERE u.role = 'ngo'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
  }

  // Get single NGO details with all stats
  static async getNGOById(id) {
    return await db.get(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.role,
        u.is_active,
        u.created_at,
        COUNT(DISTINCT a.id) as total_activities,
        COUNT(DISTINCT b.id) as total_beneficiaries,
        COUNT(DISTINCT d.id) as total_donations,
        COALESCE(SUM(d.amount), 0) as total_funds,
        COUNT(DISTINCT a.location) as active_locations
      FROM users u
      LEFT JOIN activities a ON a.user_id = u.id
      LEFT JOIN beneficiaries b ON b.user_id = u.id
      LEFT JOIN donations d ON d.user_id = u.id
      WHERE u.id = ? AND u.role = 'ngo'
      GROUP BY u.id
    `, [id]);
  }

  // Toggle user active status (enable/disable)
  static async toggleUserStatus(id, is_active) {
    const result = await db.run(
      'UPDATE users SET is_active = ? WHERE id = ? AND role = "ngo"',
      [is_active ? 1 : 0, id]
    );
    return result.changes > 0;
  }

  // Delete NGO user
  static async deleteNGO(id) {
    // First delete all related data
    await db.run('DELETE FROM activities WHERE user_id = ?', [id]);
    await db.run('DELETE FROM beneficiaries WHERE user_id = ?', [id]);
    await db.run('DELETE FROM donations WHERE user_id = ?', [id]);
    
    // Then delete the user
    const result = await db.run('DELETE FROM users WHERE id = ? AND role = "ngo"', [id]);
    return result.changes > 0;
  }

  // Get system-wide statistics
  static async getSystemStats() {
    const stats = await db.get(`
      SELECT 
        COUNT(DISTINCT u.id) as total_ngos,
        COUNT(DISTINCT CASE WHEN u.is_active = 1 THEN u.id END) as active_ngos,
        COUNT(DISTINCT a.id) as total_activities,
        COUNT(DISTINCT b.id) as total_beneficiaries,
        COUNT(DISTINCT d.id) as total_donations,
        COALESCE(SUM(d.amount), 0) as total_funds,
        COUNT(DISTINCT a.location) as total_locations,
        COUNT(DISTINCT b.location) as beneficiary_locations
      FROM users u
      LEFT JOIN activities a ON a.user_id = u.id
      LEFT JOIN beneficiaries b ON b.user_id = u.id
      LEFT JOIN donations d ON d.user_id = u.id
      WHERE u.role = 'ngo'
    `);

    // Get monthly signups
    const monthlySignups = await db.all(`
      SELECT 
        strftime('%m', created_at) as month,
        strftime('%Y', created_at) as year,
        COUNT(*) as count
      FROM users
      WHERE role = 'ngo'
      GROUP BY year, month
      ORDER BY year DESC, month DESC
      LIMIT 6
    `);

    return { ...stats, monthlySignups };
  }
}

module.exports = User;