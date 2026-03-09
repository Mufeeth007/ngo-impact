const db = require('../config/db');

class Beneficiary {
  // Create new beneficiary with user_id
  static async create(beneficiaryData, userId) {
    const { name, age, gender, location, category, enrollment_date, status } = beneficiaryData;
    
    const result = await db.run(
      `INSERT INTO beneficiaries 
       (name, age, gender, location, category, enrollment_date, status, user_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, age, gender, location, category, enrollment_date, status || 'active', userId]
    );
    
    return result.lastID;
  }

  // Get all beneficiaries for specific user
  static async findAllByUser(userId) {
    return await db.all(
      'SELECT * FROM beneficiaries WHERE user_id = ? ORDER BY enrollment_date DESC',
      [userId]
    );
  }

  // Get single beneficiary (with user check)
  static async findById(id, userId) {
    return await db.get(
      'SELECT * FROM beneficiaries WHERE id = ? AND user_id = ?',
      [id, userId]
    );
  }

  // Update beneficiary (with user check)
  static async update(id, beneficiaryData, userId) {
    const { name, age, gender, location, category, enrollment_date, status } = beneficiaryData;
    
    const result = await db.run(
      `UPDATE beneficiaries 
       SET name = ?, age = ?, gender = ?, location = ?, 
           category = ?, enrollment_date = ?, status = ? 
       WHERE id = ? AND user_id = ?`,
      [name, age, gender, location, category, enrollment_date, status, id, userId]
    );
    
    return result.changes > 0;
  }

  // Delete beneficiary (with user check)
  static async delete(id, userId) {
    const result = await db.run(
      'DELETE FROM beneficiaries WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.changes > 0;
  }

  // Get statistics for specific user
  static async getStats(userId) {
    const stats = await db.all(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END) as male,
        SUM(CASE WHEN gender = 'Female' THEN 1 ELSE 0 END) as female,
        AVG(age) as avg_age,
        location,
        COUNT(*) as location_count
      FROM beneficiaries
      WHERE user_id = ?
      GROUP BY location
    `, [userId]);

    const totalCount = await db.get(
      'SELECT COUNT(*) as count FROM beneficiaries WHERE user_id = ?',
      [userId]
    );

    return { stats, total: totalCount?.count || 0 };
  }
}

module.exports = Beneficiary;