const express = require('express');
const { Op, fn, col } = require('sequelize');
const { Expense, User } = require('../models');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// @route   GET /api/analytics/summary?month=YYYY-MM
// @desc    Total spend, spend by category, and budget comparison for a given month
router.get('/summary', async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const start = `${month}-01`;
    const end = new Date(new Date(start).getFullYear(), new Date(start).getMonth() + 1, 0)
      .toISOString()
      .split('T')[0];

    const expenses = await Expense.findAll({
      where: { userId: req.user.id, expenseDate: { [Op.between]: [start, end] } },
    });

    const totalSpent = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

    const byCategory = {};
    expenses.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + parseFloat(e.amount);
    });

    const categoryBreakdown = Object.entries(byCategory).map(([category, total]) => ({
      category,
      total: Math.round(total * 100) / 100,
    }));

    res.json({
      month,
      totalSpent: Math.round(totalSpent * 100) / 100,
      monthlyBudget: parseFloat(req.user.monthlyBudget) || 0,
      remaining: Math.round((parseFloat(req.user.monthlyBudget) - totalSpent) * 100) / 100,
      categoryBreakdown,
      transactionCount: expenses.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/analytics/trend
// @desc    Last 6 months of total spend, for a line/bar trend chart
router.get('/trend', async (req, res) => {
  try {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toISOString().slice(0, 7));
    }

    const results = [];
    for (const month of months) {
      const start = `${month}-01`;
      const end = new Date(new Date(start).getFullYear(), new Date(start).getMonth() + 1, 0)
        .toISOString()
        .split('T')[0];

      const total = await Expense.sum('amount', {
        where: { userId: req.user.id, expenseDate: { [Op.between]: [start, end] } },
      });

      results.push({ month, total: Math.round((total || 0) * 100) / 100 });
    }

    res.json({ trend: results });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
