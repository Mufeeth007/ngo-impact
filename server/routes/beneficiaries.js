const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Beneficiary = require('../models/Beneficiary');
const auth = require('../middleware/auth');

// Get all beneficiaries for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const beneficiaries = await Beneficiary.findAllByUser(req.user.id);
    res.json(beneficiaries);
  } catch (error) {
    console.error('Error fetching beneficiaries:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get beneficiary statistics for logged-in user
router.get('/stats', auth, async (req, res) => {
  try {
    const { stats, total } = await Beneficiary.getStats(req.user.id);
    res.json({ 
      stats,
      total,
      byLocation: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single beneficiary (with user check)
router.get('/:id', auth, async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findById(req.params.id, req.user.id);
    if (!beneficiary) {
      return res.status(404).json({ message: 'Beneficiary not found' });
    }
    res.json(beneficiary);
  } catch (error) {
    console.error('Error fetching beneficiary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create beneficiary (associate with logged-in user)
router.post('/', [
  auth,
  body('name').notEmpty(),
  body('age').isInt({ min: 0, max: 120 }),
  body('gender').isIn(['Male', 'Female', 'Other']),
  body('location').notEmpty(),
  body('category').notEmpty(),
  body('enrollment_date').isDate()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const beneficiaryId = await Beneficiary.create(req.body, req.user.id);
    const beneficiary = await Beneficiary.findById(beneficiaryId, req.user.id);
    res.status(201).json(beneficiary);
  } catch (error) {
    console.error('Error creating beneficiary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update beneficiary (with user check)
router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await Beneficiary.update(req.params.id, req.body, req.user.id);
    if (!updated) {
      return res.status(404).json({ message: 'Beneficiary not found' });
    }
    const beneficiary = await Beneficiary.findById(req.params.id, req.user.id);
    res.json(beneficiary);
  } catch (error) {
    console.error('Error updating beneficiary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete beneficiary (with user check)
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Beneficiary.delete(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Beneficiary not found' });
    }
    res.json({ message: 'Beneficiary deleted successfully' });
  } catch (error) {
    console.error('Error deleting beneficiary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;