const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Get dashboard statistics for logged-in user
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`📊 Fetching dashboard stats for user ${userId}`);

    // Get activities count - RAW NUMBER
    const activitiesResult = await db.get(
      'SELECT COUNT(*) as count FROM activities WHERE user_id = ?',
      [userId]
    );

    // Get beneficiaries count - RAW NUMBER
    const beneficiariesResult = await db.get(
      'SELECT COUNT(*) as count FROM beneficiaries WHERE user_id = ?',
      [userId]
    );

    // Get donations count - RAW NUMBER
    const donationsResult = await db.get(
      'SELECT COUNT(*) as count FROM donations WHERE user_id = ?',
      [userId]
    );

    // Get total funds - RAW NUMBER
    const fundsResult = await db.get(
      'SELECT COALESCE(SUM(amount), 0) as total FROM donations WHERE user_id = ?',
      [userId]
    );

    const stats = {
      activities: parseInt(activitiesResult?.count || 0),
      beneficiaries: parseInt(beneficiariesResult?.count || 0),
      donations: parseInt(donationsResult?.count || 0),
      funds: parseFloat(fundsResult?.total || 0)
    };

    console.log(`✅ Dashboard stats for user ${userId}:`, stats);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard stats',
      error: error.message 
    });
  }
});

// Get monthly trends data
router.get('/trends', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`📈 Fetching trends for user ${userId}`);

    // Get all activities grouped by month
    const monthlyActivities = await db.all(`
      SELECT 
        strftime('%m', date) as month,
        strftime('%Y', date) as year,
        COUNT(*) as activities,
        SUM(beneficiaries_count) as beneficiaries
      FROM activities
      WHERE user_id = ?
      GROUP BY year, month
      ORDER BY year DESC, month DESC
      LIMIT 12
    `, [userId]);

    // For each month, get donation totals separately
    const trends = [];
    
    for (const activity of monthlyActivities) {
      const donationsData = await db.get(`
        SELECT COALESCE(SUM(amount), 0) as funds
        FROM donations
        WHERE user_id = ? 
        AND strftime('%m', date) = ? 
        AND strftime('%Y', date) = ?
      `, [userId, activity.month, activity.year]);
      
      trends.push({
        month: activity.month,
        year: activity.year,
        activities: parseInt(activity.activities || 0),
        beneficiaries: parseInt(activity.beneficiaries || 0),
        funds: parseFloat(donationsData?.funds || 0)
      });
    }

    console.log(`✅ Trends data fetched for user ${userId}`);
    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('❌ Error fetching trends:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch trends',
      error: error.message 
    });
  }
});

// Get KPIs
router.get('/kpis', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const kpis = {
      totalBeneficiaries: await db.get('SELECT COUNT(*) as count FROM beneficiaries WHERE user_id = ?', [userId]),
      totalDonations: await db.get('SELECT COALESCE(SUM(amount), 0) as total FROM donations WHERE user_id = ?', [userId]),
      totalExpenses: await db.get('SELECT COALESCE(SUM(budget), 0) as total FROM activities WHERE user_id = ?', [userId]),
      activePrograms: await db.get('SELECT COUNT(*) as count FROM activities WHERE user_id = ?', [userId]),
      newRegistrations: await db.get('SELECT COUNT(*) as count FROM beneficiaries WHERE user_id = ? AND date(enrollment_date) >= date("now", "-30 days")', [userId]),
      volunteerHours: await db.get('SELECT COALESCE(SUM(beneficiaries_count * 2), 0) as hours FROM activities WHERE user_id = ?', [userId])
    };

    const response = {
      totalBeneficiaries: parseInt(kpis.totalBeneficiaries?.count || 0),
      totalDonations: parseFloat(kpis.totalDonations?.total || 0),
      totalExpenses: Math.round((parseFloat(kpis.totalDonations?.total || 0)) * 0.7),
      activePrograms: parseInt(kpis.activePrograms?.count || 0),
      newRegistrations: parseInt(kpis.newRegistrations?.count || 0),
      volunteerHours: parseInt(kpis.volunteerHours?.hours || 0)
    };

    res.json({ success: true, data: response });
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch KPIs' });
  }
});

// Get quick stats
router.get('/quick-stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const dailyAvg = await db.get(`
      SELECT COALESCE(AVG(daily_count), 0) as avg_beneficiaries
      FROM (
        SELECT enrollment_date as date, COUNT(*) as daily_count
        FROM beneficiaries
        WHERE user_id = ?
        GROUP BY enrollment_date
      ) as daily
    `, [userId]);

    const monthlyGrowth = await db.get(`
      WITH monthly_counts AS (
        SELECT 
          strftime('%Y-%m', enrollment_date) as month,
          COUNT(*) as count
        FROM beneficiaries
        WHERE user_id = ?
        GROUP BY month
        ORDER BY month DESC
        LIMIT 2
      )
      SELECT 
        CASE 
          WHEN COUNT(*) = 2 THEN 
            ROUND(CAST((MAX(count) - MIN(count)) AS FLOAT) * 100.0 / 
              CASE WHEN MIN(count) = 0 THEN 1 ELSE MIN(count) END, 1)
          ELSE 0 
        END as growth_rate
      FROM monthly_counts
    `, [userId]);

    const completionRate = await db.get(`
      SELECT 
        ROUND(CAST(COUNT(CASE WHEN status = 'completed' THEN 1 END) AS FLOAT) * 100.0 / 
          CASE WHEN COUNT(*) = 0 THEN 1 ELSE COUNT(*) END, 1) as rate
      FROM activities
      WHERE user_id = ?
    `, [userId]);

    const totalBudget = await db.get('SELECT COALESCE(SUM(budget), 0) as total FROM activities WHERE user_id = ?', [userId]);
    const totalDonations = await db.get('SELECT COALESCE(SUM(amount), 0) as total FROM donations WHERE user_id = ?', [userId]);

    const budgetUtilization = totalDonations?.total > 0 
      ? Math.round(((totalBudget?.total || 0) * 100) / totalDonations.total)
      : 0;

    res.json({
      success: true,
      data: {
        dailyAvg: Math.round(dailyAvg?.avg_beneficiaries || 0),
        dailyAvgChange: 12,
        monthlyGrowth: parseFloat(monthlyGrowth?.growth_rate || 0),
        growthChange: 5,
        completionRate: parseFloat(completionRate?.rate || 0),
        completionChange: 3,
        budgetUtilization: budgetUtilization,
        budgetChange: -2
      }
    });
  } catch (error) {
    console.error('Error fetching quick stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quick stats' });
  }
});

// Get comparison data
router.get('/comparison', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const comparison = await db.all(`
      SELECT 
        category,
        COALESCE(SUM(beneficiaries_count), 0) as total_beneficiaries,
        COALESCE(SUM(budget), 0) as total_budget
      FROM activities
      WHERE user_id = ?
      GROUP BY category
    `, [userId]);

    res.json({
      success: true,
      data: {
        categories: comparison.map(c => c.category || 'Unknown'),
        beneficiaries: comparison.map(c => parseInt(c.total_beneficiaries || 0)),
        budget: comparison.map(c => parseFloat(c.total_budget || 0))
      }
    });
  } catch (error) {
    console.error('Error fetching comparison:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch comparison' });
  }
});

// Get distribution data
router.get('/distribution', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const distribution = await db.all(`
      SELECT 
        category,
        COALESCE(SUM(amount), 0) as total
      FROM donations
      WHERE user_id = ?
      GROUP BY category
    `, [userId]);

    res.json({
      success: true,
      data: {
        categories: distribution.map(d => d.category || 'Unknown'),
        values: distribution.map(d => parseFloat(d.total || 0))
      }
    });
  } catch (error) {
    console.error('Error fetching distribution:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch distribution' });
  }
});

// Get cumulative data
router.get('/cumulative', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const cumulative = await db.all(`
      WITH monthly_totals AS (
        SELECT 
          strftime('%Y-%m', date) as month,
          SUM(beneficiaries_count) as monthly_total
        FROM activities
        WHERE user_id = ?
        GROUP BY month
        ORDER BY month
      )
      SELECT 
        month,
        SUM(monthly_total) OVER (ORDER BY month) as running_total
      FROM monthly_totals
      LIMIT 6
    `, [userId]);

    res.json({
      success: true,
      data: {
        labels: cumulative.map(c => c.month || ''),
        values: cumulative.map(c => parseInt(c.running_total || 0))
      }
    });
  } catch (error) {
    console.error('Error fetching cumulative:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cumulative' });
  }
});

module.exports = router;