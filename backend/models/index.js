const { sequelize } = require('../config/db');
const User = require('./User');
const Expense = require('./Expense');

User.hasMany(Expense, { as: 'expenses', foreignKey: 'userId', onDelete: 'CASCADE' });
Expense.belongsTo(User, { as: 'user', foreignKey: 'userId' });

module.exports = { sequelize, User, Expense };
