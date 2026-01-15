const supabase = require('../config/supabase');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({ message: 'User profile not found' });
    }

    // Attach user data to request
    req.user = {
      id: user.id,
      email: user.email,
      role: profile.role,
      full_name: profile.full_name
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Server error during authentication' });
  }
};

const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
