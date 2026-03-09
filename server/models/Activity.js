const db = require('../config/db');

class Activity {
  static async create(activityData) {
    const { name, category, location, date, beneficiaries_count, budget, description } = activityData;
    
    const result = await db.run(
      'INSERT INTO activities (name, category, location, date, beneficiaries_count, budget, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, category, location, date, beneficiaries_count, budget, description]
    );
    
    return result.lastID;
  }

  static async findAll() {
    return await db.all('SELECT * FROM activities ORDER BY date DESC');
  }

  static async findById(id) {
    return await db.get('SELECT * FROM activities WHERE id = ?', [id]);
  }

  static async update(id, activityData) {
    const { name, category, location, date, beneficiaries_count, budget, description } = activityData;
    
    const result = await db.run(
      'UPDATE activities SET name = ?, category = ?, location = ?, date = ?, beneficiaries_count = ?, budget = ?, description = ? WHERE id = ?',
      [name, category, location, date, beneficiaries_count, budget, description, id]
    );
    
    return result.changes > 0;
  }

  static async delete(id) {
    const result = await db.run('DELETE FROM activities WHERE id = ?', [id]);
    return result.changes > 0;
  }

  static async getStats() {
    const rows = await db.all(`
      SELECT 
        COUNT(*) as total_activities,
        SUM(beneficiaries_count) as total_beneficiaries,
        SUM(budget) as total_budget,
        COUNT(DISTINCT location) as total_locations,
        strftime('%m', date) as month,
        strftime('%Y', date) as year,
        SUM(beneficiaries_count) as monthly_beneficiaries
      FROM activities
      GROUP BY strftime('%Y', date), strftime('%m', date)
      ORDER BY year DESC, month DESC
    `);
    return rows;
  }

  static async getCategoryStats() {
    return await db.all(`
      SELECT 
        category,
        COUNT(*) as count,
        SUM(beneficiaries_count) as total_beneficiaries,
        SUM(budget) as total_budget
      FROM activities
      GROUP BY category
    `);
  }
}

module.exports = Activity;