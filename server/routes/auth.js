const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { authenticate } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        role: 'employee'
      }
    });

    if (authError) {
      console.error('Registration error:', authError);
      return res.status(400).json({
        message: authError.message || 'Registration failed'
      });
    }

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name
      }
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({ message: 'Failed to fetch user profile' });
    }

    res.json({
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: profile.full_name,
        role: profile.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Current User
router.get('/me', authenticate, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, full_name, role, join_date')
      .eq('id', req.user.id)
      .single();

    if (error || !profile) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: profile.id,
      email: req.user.email,
      full_name: profile.full_name,
      role: profile.role,
      join_date: profile.join_date
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
