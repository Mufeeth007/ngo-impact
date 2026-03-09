const db = require('../config/db');

class Donation {
  // Create new donation with user_id
  static async create(donationData, userId) {
    const { donor_name, amount, date, category, payment_method } = donationData;
    
    const result = await db.run(
      `INSERT INTO donations 
       (donor_name, amount, date, category, payment_method, user_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [donor_name, amount, date, category, payment_method, userId]
    );
    
    return result.lastID;
  }

  // Get all donations for specific user
  static async findAllByUser(userId) {
    return await db.all(
      'SELECT * FROM donations WHERE user_id = ? ORDER BY date DESC',
      [userId]
    );
  }

  // Get single donation (with user check)
  static async findById(id, userId) {
    return await db.get(
      'SELECT * FROM donations WHERE id = ? AND user_id = ?',
      [id, userId]
    );
  }

  // Update donation (with user check)
  static async update(id, donationData, userId) {
    const { donor_name, amount, date, category, payment_method } = donationData;
    
    const result = await db.run(
      `UPDATE donations 
       SET donor_name = ?, amount = ?, date = ?, category = ?, payment_method = ? 
       WHERE id = ? AND user_id = ?`,
      [donor_name, amount, date, category, payment_method, id, userId]
    );
    
    return result.changes > 0;
  }

  // Delete donation (with user check)
  static async delete(id, userId) {
    const result = await db.run(
      'DELETE FROM donations WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.changes > 0;
  }

  // Get statistics for specific user
  static async getStats(userId) {
    const categoryStats = await db.all(`
      SELECT 
        category,
        SUM(amount) as total,
        COUNT(*) as count
      FROM donations
      WHERE user_id = ?
      GROUP BY category
    `, [userId]);

    const totals = await db.get(`
      SELECT 
        SUM(amount) as total_amount,
        COUNT(*) as total_count,
        AVG(amount) as avg_amount
      FROM donations
      WHERE user_id = ?
    `, [userId]);

    return {
      categoryStats: categoryStats || [],
      totals: totals || { total_amount: 0, total_count: 0, avg_amount: 0 }
    };
  }
}

module.exports = Donation;