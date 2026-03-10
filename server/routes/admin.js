const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

/**
 * Get all NGOs with their statistics
 * GET /api/admin/ngos
 */
router.get('/ngos', auth, adminAuth, async (req, res) => {
  try {
    console.log('📊 Admin fetching all NGOs...');
    
    const ngos = await db.all(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.role,
        u.is_active,
        u.created_at,
        COALESCE((SELECT COUNT(*) FROM activities WHERE user_id = u.id), 0) as total_activities,
        COALESCE((SELECT COUNT(*) FROM beneficiaries WHERE user_id = u.id), 0) as total_beneficiaries,
        COALESCE((SELECT COUNT(*) FROM donations WHERE user_id = u.id), 0) as total_donations,
        COALESCE((SELECT SUM(amount) FROM donations WHERE user_id = u.id), 0) as total_funds,
        COALESCE((SELECT COUNT(DISTINCT location) FROM activities WHERE user_id = u.id), 0) as active_locations
      FROM users u
      WHERE u.role IN ('ngo', 'user')
      ORDER BY u.created_at DESC
    `);

    console.log(`✅ Found ${ngos.length} NGOs`);
    res.json({
      success: true,
      count: ngos.length,
      data: ngos
    });
  } catch (error) {
    console.error('❌ Error fetching NGOs:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch NGOs',
      error: error.message 
    });
  }
});

/**
 * Get single NGO details
 * GET /api/admin/ngos/:id
 */
router.get('/ngos/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📊 Admin fetching NGO details for ID: ${id}`);

    const ngo = await db.get(`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.role,
        u.is_active,
        u.created_at,
        COALESCE((SELECT COUNT(*) FROM activities WHERE user_id = u.id), 0) as total_activities,
        COALESCE((SELECT COUNT(*) FROM beneficiaries WHERE user_id = u.id), 0) as total_beneficiaries,
        COALESCE((SELECT COUNT(*) FROM donations WHERE user_id = u.id), 0) as total_donations,
        COALESCE((SELECT SUM(amount) FROM donations WHERE user_id = u.id), 0) as total_funds,
        COALESCE((SELECT COUNT(DISTINCT location) FROM activities WHERE user_id = u.id), 0) as active_locations
      FROM users u
      WHERE u.id = ? AND u.role IN ('ngo', 'user')
    `, [id]);

    if (!ngo) {
      return res.status(404).json({ 
        success: false,
        message: 'NGO not found' 
      });
    }

    // Get recent activities
    const recentActivities = await db.all(`
      SELECT * FROM activities 
      WHERE user_id = ? 
      ORDER BY date DESC 
      LIMIT 5
    `, [id]);

    // Get recent donations
    const recentDonations = await db.all(`
      SELECT * FROM donations 
      WHERE user_id = ? 
      ORDER BY date DESC 
      LIMIT 5
    `, [id]);

    res.json({
      success: true,
      data: {
        ...ngo,
        recentActivities,
        recentDonations
      }
    });
  } catch (error) {
    console.error('❌ Error fetching NGO:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch NGO details',
      error: error.message 
    });
  }
});

/**
 * Toggle NGO status (enable/disable)
 * PATCH /api/admin/ngos/:id/toggle-status
 */
router.patch('/ngos/:id/toggle-status', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    console.log(`🔄 Admin toggling NGO ${id} status to: ${is_active ? 'active' : 'inactive'}`);

    // Check if NGO exists
    const ngo = await db.get(
      'SELECT * FROM users WHERE id = ? AND role IN ("ngo", "user")', 
      [id]
    );
    
    if (!ngo) {
      return res.status(404).json({ 
        success: false,
        message: 'NGO not found' 
      });
    }

    await db.run(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [is_active ? 1 : 0, id]
    );
    
    console.log(`✅ NGO ${id} status updated successfully`);
    res.json({ 
      success: true,
      message: `NGO ${is_active ? 'enabled' : 'disabled'} successfully`,
      is_active: is_active ? 1 : 0
    });
  } catch (error) {
    console.error('❌ Error toggling NGO status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update NGO status',
      error: error.message 
    });
  }
});

/**
 * Delete NGO and all their data
 * DELETE /api/admin/ngos/:id
 */
router.delete('/ngos/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Admin deleting NGO ${id} and all associated data`);

    // Check if NGO exists
    const ngo = await db.get(
      'SELECT username FROM users WHERE id = ? AND role IN ("ngo", "user")', 
      [id]
    );
    
    if (!ngo) {
      return res.status(404).json({ 
        success: false,
        message: 'NGO not found' 
      });
    }

    const ngoName = ngo.username;

    // Start a transaction
    await db.run('BEGIN TRANSACTION');
    
    // Delete all related data
    const activitiesDeleted = await db.run('DELETE FROM activities WHERE user_id = ?', [id]);
    const beneficiariesDeleted = await db.run('DELETE FROM beneficiaries WHERE user_id = ?', [id]);
    const donationsDeleted = await db.run('DELETE FROM donations WHERE user_id = ?', [id]);
    
    // Delete the user
    const userDeleted = await db.run('DELETE FROM users WHERE id = ?', [id]);
    
    await db.run('COMMIT');
    
    console.log(`✅ NGO ${ngoName} (ID: ${id}) deleted successfully`);
    console.log(`   - Activities deleted: ${activitiesDeleted.changes}`);
    console.log(`   - Beneficiaries deleted: ${beneficiariesDeleted.changes}`);
    console.log(`   - Donations deleted: ${donationsDeleted.changes}`);
    
    res.json({ 
      success: true,
      message: `NGO "${ngoName}" and all associated data deleted successfully`,
      deleted: {
        activities: activitiesDeleted.changes,
        beneficiaries: beneficiariesDeleted.changes,
        donations: donationsDeleted.changes
      }
    });
  } catch (error) {
    await db.run('ROLLBACK');
    console.error('❌ Error deleting NGO:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete NGO',
      error: error.message 
    });
  }
});

/**
 * Get system-wide statistics
 * GET /api/admin/stats
 */
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    console.log('📈 Admin fetching system statistics...');

    const stats = await db.get(`
      SELECT 
        COUNT(DISTINCT u.id) as total_ngos,
        COUNT(DISTINCT CASE WHEN u.is_active = 1 THEN u.id END) as active_ngos,
        COUNT(DISTINCT a.id) as total_activities,
        COUNT(DISTINCT b.id) as total_beneficiaries,
        COUNT(DISTINCT d.id) as total_donations,
        COALESCE(SUM(d.amount), 0) as total_funds,
        COUNT(DISTINCT a.location) as activity_locations,
        COUNT(DISTINCT b.location) as beneficiary_locations
      FROM users u
      LEFT JOIN activities a ON a.user_id = u.id
      LEFT JOIN beneficiaries b ON b.user_id = u.id
      LEFT JOIN donations d ON d.user_id = u.id
      WHERE u.role IN ('ngo', 'user')
    `);

    // Get monthly signups for chart
    const monthlySignups = await db.all(`
      SELECT 
        strftime('%m', created_at) as month,
        strftime('%Y', created_at) as year,
        COUNT(*) as count
      FROM users
      WHERE role IN ('ngo', 'user')
      GROUP BY year, month
      ORDER BY year DESC, month DESC
      LIMIT 6
    `);

    // Get top NGOs by beneficiaries
    const topNGOs = await db.all(`
      SELECT 
        u.username,
        COUNT(b.id) as beneficiary_count
      FROM users u
      LEFT JOIN beneficiaries b ON b.user_id = u.id
      WHERE u.role IN ('ngo', 'user')
      GROUP BY u.id
      ORDER BY beneficiary_count DESC
      LIMIT 5
    `);

    // Get category distribution
    const categoryStats = await db.all(`
      SELECT 
        category,
        COUNT(*) as count,
        SUM(amount) as total
      FROM donations
      GROUP BY category
      ORDER BY total DESC
    `);

    console.log('✅ System statistics fetched successfully');
    res.json({
      success: true,
      data: {
        overview: stats,
        monthlySignups: monthlySignups || [],
        topNGOs: topNGOs || [],
        categoryStats: categoryStats || []
      }
    });
  } catch (error) {
    console.error('❌ Error fetching system stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch system statistics',
      error: error.message 
    });
  }
});

/**
 * Get all users (for debugging)
 * GET /api/admin/users
 */
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await db.all(`
      SELECT id, username, email, role, is_active, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch users',
      error: error.message 
    });
  }
});

module.exports = router;