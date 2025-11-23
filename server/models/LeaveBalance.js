const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LeaveBalance = sequelize.define('LeaveBalance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // Foreign keys are added in index.js associations, but explicit definition here is good for clarity if needed.
  // We'll rely on Sequelize associations for FK columns usually, but to ensure they exist on init:
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  leaveTypeId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  balance: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

module.exports = LeaveBalance;
