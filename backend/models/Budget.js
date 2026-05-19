const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Education', 'Health', 'Other', 'Total'],
  },
  amount: {
    type: Number,
    required: [true, 'Please add a budget amount'],
  },
  month: {
    type: Number,
    required: [true, 'Please specify the month (1-12)'],
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: [true, 'Please specify the year'],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Budget', budgetSchema);
