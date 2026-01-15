const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate, authorize } = require('../middleware/auth');

// Get all leave types
router.get('/', authenticate, async (req, res) => {
  try {
    const { data: leaveTypes, error } = await supabase
      .from('leave_types')
      .select('*')
      .order('name');

    if (error) {
      console.error('Fetch leave types error:', error);
      return res.status(500).json({ message: 'Failed to fetch leave types' });
    }

    res.json(leaveTypes);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Create leave type
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, default_days } = req.body;

    if (!name || !default_days) {
      return res.status(400).json({ message: 'Name and default_days are required' });
    }

    const { data: leaveType, error } = await supabase
      .from('leave_types')
      .insert({ name, default_days })
      .select()
      .single();

    if (error) {
      console.error('Create leave type error:', error);
      return res.status(400).json({ message: error.message });
    }

    res.status(201).json(leaveType);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
