require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { sequelize, connectDB } = require('./config/db');
require('./models'); // register associations

const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const analyticsRoutes = require('./routes/analytics');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3001' }));
app.use(express.json());

// Serve uploaded receipt images statically (e.g. to display thumbnails in the frontend)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5001;

const start = async () => {
  await connectDB();
  await sequelize.sync();
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

start();
