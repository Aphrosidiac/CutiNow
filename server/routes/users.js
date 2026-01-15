const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate, authorize } = require('../middleware/auth');

// Get all users (Admin only)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch users error:', error);
      return res.status(500).json({ message: 'Failed to fetch users' });
    }

    // Get emails from auth.users
    const usersWithEmail = await Promise.all(profiles.map(async (profile) => {
      const { data: { user } } = await supabase.auth.admin.getUserById(profile.id);
      return {
        ...profile,
        email: user?.email || ''
      };
    }));

    res.json(usersWithEmail);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role (Admin only)
router.put('/:id/role', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['employee', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update role error:', error);
      return res.status(500).json({ message: 'Failed to update user role' });
    }

    res.json({ message: 'User role updated', user: data });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
