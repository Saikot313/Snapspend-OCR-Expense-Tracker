const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Expense = sequelize.define('Expense', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  merchant: { type: DataTypes.STRING, allowNull: true },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  category: {
    type: DataTypes.ENUM(
      'groceries', 'dining', 'transport', 'utilities', 'shopping',
      'health', 'entertainment', 'rent', 'other'
    ),
    defaultValue: 'other',
  },
  note: { type: DataTypes.STRING, allowNull: true },
  expenseDate: { type: DataTypes.DATEONLY, allowNull: false },
  receiptImagePath: { type: DataTypes.STRING, allowNull: true },
  ocrRawText: { type: DataTypes.TEXT, allowNull: true },
  source: {
    type: DataTypes.ENUM('manual', 'receipt_scan'),
    defaultValue: 'manual',
  },
}, {
  timestamps: true,
});

module.exports = Expense;
