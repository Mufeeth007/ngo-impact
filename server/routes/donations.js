const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Donation = require('../models/Donation');
const auth = require('../middleware/auth');

// Get all donations for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const donations = await Donation.findAllByUser(req.user.id);
    res.json(donations);
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get donation statistics for logged-in user
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await Donation.getStats(req.user.id);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single donation (with user check)
router.get('/:id', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id, req.user.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    res.json(donation);
  } catch (error) {
    console.error('Error fetching donation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create donation (associate with logged-in user)
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

    const donationId = await Donation.create(req.body, req.user.id);
    const donation = await Donation.findById(donationId, req.user.id);
    res.status(201).json(donation);
  } catch (error) {
    console.error('Error creating donation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update donation (with user check)
router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await Donation.update(req.params.id, req.body, req.user.id);
    if (!updated) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    const donation = await Donation.findById(req.params.id, req.user.id);
    res.json(donation);
  } catch (error) {
    console.error('Error updating donation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete donation (with user check)
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Donation.delete(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    res.json({ message: 'Donation deleted successfully' });
  } catch (error) {
    console.error('Error deleting donation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;