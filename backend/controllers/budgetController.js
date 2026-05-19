const Budget = require('../models/Budget');

// @desc    Get budgets
// @route   GET /api/budget
// @access  Private
const getBudgets = async (req, res, next) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });
    res.status(200).json(budgets);
  } catch (error) {
    next(error);
  }
};

// @desc    Set budget
// @route   POST /api/budget
// @access  Private
const setBudget = async (req, res, next) => {
  try {
    const { category, amount, month, year } = req.body;

    if (!category || !amount || !month || !year) {
      res.status(400);
      throw new Error('Please add all fields');
    }

    // Check if budget for this category and month/year already exists
    const existingBudget = await Budget.findOne({
      user: req.user.id,
      category,
      month,
      year,
    });

    if (existingBudget) {
      existingBudget.amount = amount;
      const updatedBudget = await existingBudget.save();
      return res.status(200).json(updatedBudget);
    }

    const budget = await Budget.create({
      user: req.user.id,
      category,
      amount,
      month,
      year,
    });

    res.status(201).json(budget);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgets,
  setBudget,
};
