const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Donation = require('../models/Donation');
const auth = require('../middleware/auth');

// Get all donations
router.get('/', auth, async (req, res) => {
  try {
    const donations = await Donation.findAll();
    res.json(donations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get donation stats
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Donation.getStats();
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single donation
router.get('/:id', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    res.json(donation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create donation
router.post('/', [
  auth,
  body('donor_name').notEmpty(),
  body('amount').isFloat({ min: 0 }),
  body('date').isDate(),
  body('category').notEmpty(),
  body('payment_method').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const donationId = await Donation.create(req.body);
    const donation = await Donation.findById(donationId);
    res.status(201).json(donation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update donation
router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await Donation.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    const donation = await Donation.findById(req.params.id);
    res.json(donation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete donation
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Donation.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    res.json({ message: 'Donation deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;