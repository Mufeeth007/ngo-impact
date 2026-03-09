const db = require('../config/db');

class Donation {
  static async create(donationData) {
    const { donor_name, amount, date, category, payment_method } = donationData;
    
    const result = await db.run(
      'INSERT INTO donations (donor_name, amount, date, category, payment_method) VALUES (?, ?, ?, ?, ?)',
      [donor_name, amount, date, category, payment_method]
    );
    
    return result.lastID;
  }

  static async findAll() {
    return await db.all('SELECT * FROM donations ORDER BY date DESC');
  }

  static async findById(id) {
    return await db.get('SELECT * FROM donations WHERE id = ?', [id]);
  }

  static async update(id, donationData) {
    const { donor_name, amount, date, category, payment_method } = donationData;
    
    const result = await db.run(
      'UPDATE donations SET donor_name = ?, amount = ?, date = ?, category = ?, payment_method = ? WHERE id = ?',
      [donor_name, amount, date, category, payment_method, id]
    );
    
    return result.changes > 0;
  }

  static async delete(id) {
    const result = await db.run('DELETE FROM donations WHERE id = ?', [id]);
    return result.changes > 0;
  }

  static async getStats() {
    const rows = await db.all(`
      SELECT 
        SUM(amount) as total_donations,
        COUNT(*) as total_donors,
        AVG(amount) as avg_donation,
        category,
        SUM(amount) as category_total,
        strftime('%m', date) as month,
        strftime('%Y', date) as year,
        SUM(amount) as monthly_total
      FROM donations
      GROUP BY category
    `);
    return rows;
  }
}

module.exports = Donation;