const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Get monthly report
router.get('/monthly', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ 
        success: false, 
        message: 'Month and year are required' 
      });
    }

    const formattedMonth = month.padStart(2, '0');

    const activitiesCount = await db.get(`
      SELECT COUNT(*) as count 
      FROM activities 
      WHERE user_id = ? AND strftime('%m', date) = ? AND strftime('%Y', date) = ?
    `, [userId, formattedMonth, year]);

    const beneficiariesCount = await db.get(`
      SELECT COUNT(*) as count 
      FROM beneficiaries 
      WHERE user_id = ? AND strftime('%m', enrollment_date) = ? AND strftime('%Y', enrollment_date) = ?
    `, [userId, formattedMonth, year]);

    // UPDATED: Added CAST to FLOAT to ensure clean numeric data
    const donationsData = await db.get(`
      SELECT 
        COUNT(*) as count, 
        CAST(COALESCE(SUM(amount), 0) AS FLOAT) as total
      FROM donations 
      WHERE user_id = ? AND strftime('%m', date) = ? AND strftime('%Y', date) = ?
    `, [userId, formattedMonth, year]);

    const activities = await db.all(`
      SELECT 
        name, 
        category, 
        location, 
        date, 
        COALESCE(beneficiaries_count, 0) as beneficiaries_count,
        CAST(COALESCE(budget, 0) AS FLOAT) as budget
      FROM activities 
      WHERE user_id = ? AND strftime('%m', date) = ? AND strftime('%Y', date) = ?
      ORDER BY date DESC
    `, [userId, formattedMonth, year]);

    const report = {
      month: parseInt(month),
      year: parseInt(year),
      activities: parseInt(activitiesCount?.count || 0),
      beneficiaries: parseInt(beneficiariesCount?.count || 0),
      donations: parseInt(donationsData?.count || 0),
      funds: parseFloat(donationsData?.total || 0),
      activitiesList: activities.map(activity => ({
        name: activity.name || '',
        category: activity.category || '',
        location: activity.location || '',
        date: activity.date || '',
        beneficiaries_count: parseInt(activity.beneficiaries_count || 0),
        budget: parseFloat(activity.budget || 0)
      }))
    };

    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Error generating monthly report:', error);
    res.status(500).json({ success: false, message: 'Failed to generate monthly report' });
  }
});

// Get yearly report
router.get('/yearly', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { year } = req.query;

    if (!year) {
      return res.status(400).json({ success: false, message: 'Year is required' });
    }

    const monthlyBreakdown = [];
    
    for (let month = 1; month <= 12; month++) {
      const formattedMonth = month.toString().padStart(2, '0');
      
      const activitiesData = await db.get(`
        SELECT 
          COUNT(*) as count, 
          COALESCE(SUM(beneficiaries_count), 0) as beneficiaries
        FROM activities
        WHERE user_id = ? AND strftime('%m', date) = ? AND strftime('%Y', date) = ?
      `, [userId, formattedMonth, year]);

      // UPDATED: Added CAST to FLOAT for monthly breakdown funds
      const donationsData = await db.get(`
        SELECT CAST(COALESCE(SUM(amount), 0) AS FLOAT) as funds
        FROM donations
        WHERE user_id = ? AND strftime('%m', date) = ? AND strftime('%Y', date) = ?
      `, [userId, formattedMonth, year]);

      monthlyBreakdown.push({
        month: month.toString(),
        activities: parseInt(activitiesData?.count || 0),
        beneficiaries: parseInt(activitiesData?.beneficiaries || 0),
        funds: parseFloat(donationsData?.funds || 0)
      });
    }

    const totalActivities = await db.get(`
      SELECT COUNT(*) as count FROM activities WHERE user_id = ? AND strftime('%Y', date) = ?
    `, [userId, year]);

    const totalBeneficiaries = await db.get(`
      SELECT COUNT(*) as count FROM beneficiaries WHERE user_id = ? AND strftime('%Y', enrollment_date) = ?
    `, [userId, year]);

    const totalDonations = await db.get(`
      SELECT COUNT(*) as count FROM donations WHERE user_id = ? AND strftime('%Y', date) = ?
    `, [userId, year]);

    // UPDATED: Added CAST to FLOAT for yearly total funds
    const totalFunds = await db.get(`
      SELECT CAST(COALESCE(SUM(amount), 0) AS FLOAT) as total 
      FROM donations 
      WHERE user_id = ? AND strftime('%Y', date) = ?
    `, [userId, year]);

    const report = {
      year: parseInt(year),
      monthlyBreakdown: monthlyBreakdown,
      totals: {
        activities: parseInt(totalActivities?.count || 0),
        beneficiaries: parseInt(totalBeneficiaries?.count || 0),
        donations: parseInt(totalDonations?.count || 0),
        funds: parseFloat(totalFunds?.total || 0)
      }
    };

    res.json({ success: true, data: report });
  } catch (error) {
    console.error('Error generating yearly report:', error);
    res.status(500).json({ success: false, message: 'Failed to generate yearly report' });
  }
});

module.exports = router;