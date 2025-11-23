const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { LeaveRequest, LeaveBalance, LeaveType, User, sequelize } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const { Op } = require('sequelize');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const fs = require('fs');
    const dir = 'uploads';
    if (!fs.existsSync(dir)){
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
    const balanceRecord = await LeaveBalance.findOne({
      where: { userId, leaveTypeId }
    });

    if (!balanceRecord) {
      return res.status(400).json({ message: 'Leave balance not found for this type' });
    }

    if (balanceRecord.balance < days_count) {
      return res.status(400).json({ message: `Insufficient leave balance. You have ${balanceRecord.balance} days, but requested ${days_count} days.` });
    }

    // Create Request
    const request = await LeaveRequest.create({
      userId,
      leaveTypeId,
      start_date,
      end_date,
      days_count,
      reason,
      file_path,
      status: 'pending'
    });

    res.status(201).json(request);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get User's Leave History
router.get('/', authenticate, async (req, res) => {
  try {
    const requests = await LeaveRequest.findAll({
      where: { userId: req.user.id },
      include: [{ model: LeaveType, attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get User's Leave Balances
router.get('/balances', authenticate, async (req, res) => {
  try {
    const balances = await LeaveBalance.findAll({
      where: { userId: req.user.id },
      include: [{ model: LeaveType, attributes: ['name'] }]
    });
    res.json(balances);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- ADMIN ROUTES ---

// Get All Requests (Admin)
router.get('/admin', authenticate, authorize('admin'), async (req, res) => {
  try {
    const requests = await LeaveRequest.findAll({
      include: [
        { model: User, attributes: ['full_name', 'email'] },
        { model: LeaveType, attributes: ['name'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/Reject Request (Admin)
router.put('/:id/status', authenticate, authorize('admin'), async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status, admin_remarks } = req.body; // status: 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const request = await LeaveRequest.findByPk(id, { transaction });
    if (!request) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Request is already processed' });
    }

    // If approving, deduct balance
    if (status === 'approved') {
      const balanceRecord = await LeaveBalance.findOne({
        where: { userId: request.userId, leaveTypeId: request.leaveTypeId },
        transaction
      });

      if (!balanceRecord || balanceRecord.balance < request.days_count) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Insufficient balance to approve this request (User balance may have changed)' });
      }

      await balanceRecord.decrement('balance', { by: request.days_count, transaction });
    }

    // Update request
    request.status = status;
    request.admin_remarks = admin_remarks;
    await request.save({ transaction });

    await transaction.commit();
    res.json({ message: `Leave request ${status}`, request });

  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
