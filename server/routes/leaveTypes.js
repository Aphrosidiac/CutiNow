const express = require('express');
const router = express.Router();
const { LeaveType } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// Get all leave types
router.get('/', authenticate, async (req, res) => {
  try {
    const types = await LeaveType.findAll();
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Create leave type
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, default_days } = req.body;
    const type = await LeaveType.create({ name, default_days });
    res.status(201).json(type);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
