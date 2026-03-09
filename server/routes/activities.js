const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');

// Get all activities for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const activities = await Activity.findAllByUser(req.user.id);
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get activity statistics for logged-in user
router.get('/stats', auth, async (req, res) => {
  try {
    const { monthlyStats, categoryStats } = await Activity.getStats(req.user.id);
    
    // Calculate impact score based on user's data
    const totalBeneficiaries = monthlyStats.reduce((sum, stat) => sum + (stat.total_beneficiaries || 0), 0);
    const impactScore = Math.min(Math.round((totalBeneficiaries / 100) * 10), 100);
    
    res.json({
      monthly: monthlyStats,
      category: categoryStats,
      impactScore: impactScore || 0
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single activity (with user check)
router.get('/:id', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id, req.user.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create activity (associate with logged-in user)
router.post('/', [
  auth,
  body('name').notEmpty(),
  body('category').notEmpty(),
  body('location').notEmpty(),
  body('date').isDate(),
  body('beneficiaries_count').isInt({ min: 0 }),
  body('budget').isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Pass user ID from token to model
    const activityId = await Activity.create(req.body, req.user.id);
    const activity = await Activity.findById(activityId, req.user.id);
    res.status(201).json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update activity (with user check)
router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await Activity.update(req.params.id, req.body, req.user.id);
    if (!updated) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    const activity = await Activity.findById(req.params.id, req.user.id);
    res.json(activity);
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete activity (with user check)
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Activity.delete(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;