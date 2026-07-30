const express = require('express');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const { Expense } = require('../models');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { extractTextFromImage } = require('../services/ocrService');
const { categorizeExpense, extractAmount, extractMerchant } = require('../services/categorizer');

const router = express.Router();
router.use(protect);

// @route   POST /api/expenses/scan
// @desc    Upload a receipt image, run OCR, and return a pre-filled expense draft
//          (does NOT save to DB yet - user confirms/edits on the frontend first)
router.post('/scan', upload.single('receipt'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No receipt image uploaded' });

  try {
    const rawText = await extractTextFromImage(req.file.path);
    const merchant = extractMerchant(rawText);
    const amount = extractAmount(rawText);
    const category = categorizeExpense(`${merchant || ''} ${rawText}`);

    res.json({
      draft: {
        merchant,
        amount,
        category,
        ocrRawText: rawText,
        receiptImagePath: req.file.filename,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'OCR processing failed', error: error.message });
  }
});

// @route   POST /api/expenses - save a confirmed expense (manual or post-scan)
router.post(
  '/',
  [
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
    body('expenseDate').notEmpty().withMessage('Expense date is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { merchant, amount, category, note, expenseDate, receiptImagePath, ocrRawText, source } = req.body;

      const expense = await Expense.create({
        merchant,
        amount,
        category: category || 'other',
        note,
        expenseDate,
        receiptImagePath,
        ocrRawText,
        source: source || 'manual',
        userId: req.user.id,
      });

      res.status(201).json({ expense });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

// @route   GET /api/expenses - list current user's expenses (optional filters)
router.get('/', async (req, res) => {
  try {
    const { category, month } = req.query; // month format: YYYY-MM
    const where = { userId: req.user.id };

    if (category) where.category = category;
    if (month) {
      const { Op } = require('sequelize');
      const start = `${month}-01`;
      const end = new Date(new Date(start).getFullYear(), new Date(start).getMonth() + 1, 0)
        .toISOString()
        .split('T')[0];
      where.expenseDate = { [Op.between]: [start, end] };
    }

    const expenses = await Expense.findAll({ where, order: [['expenseDate', 'DESC']] });
    res.json({ expenses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/expenses/:id
router.put('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    const allowedFields = ['merchant', 'amount', 'category', 'note', 'expenseDate'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) expense[field] = req.body[field];
    });

    await expense.save();
    res.json({ expense });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/expenses/:id
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    if (expense.receiptImagePath) {
      const filePath = require('path').join(__dirname, '..', 'uploads', expense.receiptImagePath);
      fs.unlink(filePath, () => {}); // best-effort cleanup, ignore errors
    }

    await expense.destroy();
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
