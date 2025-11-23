const express = require('express');
const router = express.Router();
const { User, LeaveBalance, LeaveType } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');

// Get all users (Admin only)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'full_name', 'email', 'role', 'join_date'],
      order: [['full_name', 'ASC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get balances for a specific user
router.get('/:id/balances', authenticate, authorize('admin'), async (req, res) => {
  try {
    const balances = await LeaveBalance.findAll({
      where: { userId: req.params.id },
      include: [{ model: LeaveType, attributes: ['name'] }]
    });
    res.json(balances);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a specific balance record
router.put('/balances/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { balance } = req.body;
    const record = await LeaveBalance.findByPk(req.params.id);

    if (!record) {
      return res.status(404).json({ message: 'Balance record not found' });
    }

    record.balance = balance;
    await record.save();

    res.json(record);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
