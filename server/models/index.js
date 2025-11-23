const sequelize = require('../config/database');
const User = require('./User');
const LeaveType = require('./LeaveType');
const LeaveBalance = require('./LeaveBalance');
const LeaveRequest = require('./LeaveRequest');

// Associations

// User has many LeaveBalances
User.hasMany(LeaveBalance, { foreignKey: 'userId' });
LeaveBalance.belongsTo(User, { foreignKey: 'userId' });

// LeaveBalance belongs to LeaveType
LeaveType.hasMany(LeaveBalance, { foreignKey: 'leaveTypeId' });
LeaveBalance.belongsTo(LeaveType, { foreignKey: 'leaveTypeId' });

// User has many LeaveRequests
User.hasMany(LeaveRequest, { foreignKey: 'userId' });
LeaveRequest.belongsTo(User, { foreignKey: 'userId' });

// LeaveRequest belongs to LeaveType
LeaveType.hasMany(LeaveRequest, { foreignKey: 'leaveTypeId' });
LeaveRequest.belongsTo(LeaveType, { foreignKey: 'leaveTypeId' });

module.exports = {
  sequelize,
  User,
  LeaveType,
  LeaveBalance,
  LeaveRequest
};
