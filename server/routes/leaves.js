const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const supabase = require('../config/supabase');
const { authenticate, authorize } = require('../middleware/auth');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const fs = require('fs');
    const dir = 'uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // accept images and pdfs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDFs are allowed'));
    }
  }
});

// Helper: Calculate working days (Mon-Fri)
function calculateWorkingDays(startDate, endDate) {
  let count = 0;
  const curDate = new Date(startDate);
  const stopDate = new Date(endDate);

  while (curDate <= stopDate) {
    const dayOfWeek = curDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Sun, 6 = Sat
      count++;
    }
    curDate.setDate(curDate.getDate() + 1);
  }
  return count;
}

// Apply for Leave
router.post('/', authenticate, upload.single('document'), async (req, res) => {
  try {
    const { leaveTypeId, start_date, end_date, reason } = req.body;
    const userId = req.user.id;
    const file_path = req.file ? req.file.path : null;

    if (!start_date || !end_date || !leaveTypeId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Calculate days
    const days_count = calculateWorkingDays(start_date, end_date);
    if (days_count === 0) {
      return res.status(400).json({ message: 'Selected dates contain no working days' });
    }

    // Check Balance
    const { data: balanceRecord, error: balanceError } = await supabase
      .from('leave_balances')
      .select('*')
      .eq('user_id', userId)
      .eq('leave_type_id', leaveTypeId)
      .single();

    if (balanceError || !balanceRecord) {
      return res.status(400).json({ message: 'Leave balance not found for this type' });
    }

    if (balanceRecord.balance < days_count) {
      return res.status(400).json({
        message: `Insufficient leave balance. You have ${balanceRecord.balance} days, but requested ${days_count} days.`
      });
    }

    // Create Request
    const { data: request, error: requestError } = await supabase
      .from('leave_requests')
      .insert({
        user_id: userId,
        leave_type_id: leaveTypeId,
        start_date,
        end_date,
        days_count,
        reason,
        file_path,
        status: 'pending'
      })
      .select()
      .single();

    if (requestError) {
      console.error('Request creation error:', requestError);
      return res.status(500).json({ message: 'Failed to create leave request' });
    }

    res.status(201).json(request);

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get User's Leave History
router.get('/', authenticate, async (req, res) => {
  try {
    const { data: requests, error } = await supabase
      .from('leave_requests')
      .select(`
        *,
        leave_types (name)
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch requests error:', error);
      return res.status(500).json({ message: 'Failed to fetch leave requests' });
    }

    res.json(requests);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get User's Leave Balances
router.get('/balances', authenticate, async (req, res) => {
  try {
    const { data: balances, error } = await supabase
      .from('leave_balances')
      .select(`
        *,
        leave_types (name)
      `)
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Fetch balances error:', error);
      return res.status(500).json({ message: 'Failed to fetch leave balances' });
    }

    res.json(balances);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// --- ADMIN ROUTES ---

// Get All Requests (Admin)
router.get('/admin', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { data: requests, error } = await supabase
      .from('leave_requests')
      .select(`
        *,
        profiles!leave_requests_user_id_fkey (full_name, id),
        leave_types (name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch admin requests error:', error);
      return res.status(500).json({ message: 'Failed to fetch leave requests' });
    }

    // Transform to match old format (include email from auth)
    const requestsWithEmail = await Promise.all(requests.map(async (req) => {
      const { data: { user } } = await supabase.auth.admin.getUserById(req.user_id);
      return {
        ...req,
        User: {
          full_name: req.profiles.full_name,
          email: user?.email || ''
        },
        LeaveType: req.leave_types
      };
    }));

    res.json(requestsWithEmail);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/Reject Request (Admin)
router.put('/:id/status', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_remarks } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Use the Supabase RPC function for transaction handling
    const { data, error } = await supabase.rpc('process_leave_request', {
      request_id: id,
      new_status: status,
      remarks: admin_remarks || null
    });

    if (error) {
      console.error('Process request error:', error);
      return res.status(400).json({ message: error.message });
    }

    res.json({
      message: `Leave request ${status}`,
      result: data
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
