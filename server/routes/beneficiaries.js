const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Beneficiary = require('../models/Beneficiary');
const auth = require('../middleware/auth');

// Get all beneficiaries
router.get('/', auth, async (req, res) => {
  try {
    const beneficiaries = await Beneficiary.findAll();
    res.json(beneficiaries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get beneficiary stats
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Beneficiary.getStats();
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single beneficiary
router.get('/:id', auth, async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findById(req.params.id);
    if (!beneficiary) {
      return res.status(404).json({ message: 'Beneficiary not found' });
    }
    res.json(beneficiary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create beneficiary
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

    const beneficiaryId = await Beneficiary.create(req.body);
    const beneficiary = await Beneficiary.findById(beneficiaryId);
    res.status(201).json(beneficiary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update beneficiary
router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await Beneficiary.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Beneficiary not found' });
    }
    const beneficiary = await Beneficiary.findById(req.params.id);
    res.json(beneficiary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete beneficiary
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Beneficiary.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Beneficiary not found' });
    }
    res.json({ message: 'Beneficiary deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;