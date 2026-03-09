const db = require('../config/db');

class Beneficiary {
  static async create(beneficiaryData) {
    const { name, age, gender, location, category, enrollment_date, status } = beneficiaryData;
    
    const result = await db.run(
      'INSERT INTO beneficiaries (name, age, gender, location, category, enrollment_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, age, gender, location, category, enrollment_date, status || 'active']
    );
    
    return result.lastID;
  }

  static async findAll() {
    return await db.all('SELECT * FROM beneficiaries ORDER BY enrollment_date DESC');
  }

  static async findById(id) {
    return await db.get('SELECT * FROM beneficiaries WHERE id = ?', [id]);
  }

  static async update(id, beneficiaryData) {
    const { name, age, gender, location, category, enrollment_date, status } = beneficiaryData;
    
    const result = await db.run(
      'UPDATE beneficiaries SET name = ?, age = ?, gender = ?, location = ?, category = ?, enrollment_date = ?, status = ? WHERE id = ?',
      [name, age, gender, location, category, enrollment_date, status, id]
    );
    
    return result.changes > 0;
  }

  static async delete(id) {
    const result = await db.run('DELETE FROM beneficiaries WHERE id = ?', [id]);
    return result.changes > 0;
  }

  static async getStats() {
    const rows = await db.all(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN gender = 'Male' THEN 1 ELSE 0 END) as male,
        SUM(CASE WHEN gender = 'Female' THEN 1 ELSE 0 END) as female,
        AVG(age) as avg_age,
        location,
        COUNT(*) as location_count
      FROM beneficiaries
      GROUP BY location
    `);
    return rows;
  }
}

module.exports = Beneficiary;