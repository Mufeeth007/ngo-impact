const db = require('../config/db');

class Activity {
  // Create new activity with user_id
  static async create(activityData, userId) {
    const { name, category, location, date, beneficiaries_count, budget, description } = activityData;
    
    const result = await db.run(
      `INSERT INTO activities 
       (name, category, location, date, beneficiaries_count, budget, description, user_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, category, location, date, beneficiaries_count, budget, description, userId]
    );
    
    return result.lastID;
  }

  // Get all activities for specific user
  static async findAllByUser(userId) {
    return await db.all(
      'SELECT * FROM activities WHERE user_id = ? ORDER BY date DESC',
      [userId]
    );
  }

  // Get single activity (with user check)
  static async findById(id, userId) {
    return await db.get(
      'SELECT * FROM activities WHERE id = ? AND user_id = ?',
      [id, userId]
    );
  }

  // Update activity (with user check)
  static async update(id, activityData, userId) {
    const { name, category, location, date, beneficiaries_count, budget, description } = activityData;
    
    const result = await db.run(
      `UPDATE activities 
       SET name = ?, category = ?, location = ?, date = ?, 
           beneficiaries_count = ?, budget = ?, description = ? 
       WHERE id = ? AND user_id = ?`,
      [name, category, location, date, beneficiaries_count, budget, description, id, userId]
    );
    
    return result.changes > 0;
  }

  // Delete activity (with user check)
  static async delete(id, userId) {
    const result = await db.run(
      'DELETE FROM activities WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.changes > 0;
  }

  // Get statistics for specific user
  static async getStats(userId) {
    const monthlyStats = await db.all(`
      SELECT 
        COUNT(*) as total_activities,
        SUM(beneficiaries_count) as total_beneficiaries,
        SUM(budget) as total_budget,
        COUNT(DISTINCT location) as total_locations,
        strftime('%m', date) as month,
        strftime('%Y', date) as year,
        SUM(beneficiaries_count) as monthly_beneficiaries
      FROM activities
      WHERE user_id = ?
      GROUP BY strftime('%Y', date), strftime('%m', date)
      ORDER BY year DESC, month DESC
    `, [userId]);

    const categoryStats = await db.all(`
      SELECT 
        category,
        COUNT(*) as count,
        SUM(beneficiaries_count) as total_beneficiaries,
        SUM(budget) as total_budget
      FROM activities
      WHERE user_id = ?
      GROUP BY category
    `, [userId]);

    return { monthlyStats, categoryStats };
  }
}

module.exports = Activity;