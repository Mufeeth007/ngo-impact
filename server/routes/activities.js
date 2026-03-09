const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Activity = require('../models/Activity');
const auth = require('../middleware/auth');

// Get all activities
router.get('/', auth, async (req, res) => {
  try {
    const activities = await Activity.findAll();
    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get activity stats
router.get('/stats', auth, async (req, res) => {
  try {
    const monthlyStats = await Activity.getStats();
    const categoryStats = await Activity.getCategoryStats();
    
    // Calculate impact score
    const totalBeneficiaries = monthlyStats.reduce((sum, stat) => sum + (stat.total_beneficiaries || 0), 0);
    const totalLocations = monthlyStats[0]?.total_locations || 0;
    const impactScore = Math.min(Math.round((totalBeneficiaries / 1000) * 100), 100);
    
    res.json({
      monthly: monthlyStats,
      category: categoryStats,
      impactScore
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single activity
router.get('/:id', auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json(activity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create activity
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

    const activityId = await Activity.create(req.body);
    const activity = await Activity.findById(activityId);
    res.status(201).json(activity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update activity
router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await Activity.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    const activity = await Activity.findById(req.params.id);
    res.json(activity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete activity
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Activity.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;