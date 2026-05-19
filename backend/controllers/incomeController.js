const Income = require('../models/Income');

// @desc    Get all income
// @route   GET /api/income
// @access  Private
const getIncome = async (req, res, next) => {
  try {
    const income = await Income.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json(income);
  } catch (error) {
    next(error);
  }
};

// @desc    Add new income
// @route   POST /api/income
// @access  Private
const addIncome = async (req, res, next) => {
  try {
    const { sourceName, amount, date, notes } = req.body;

    if (!sourceName || !amount) {
      res.status(400);
      throw new Error('Please add required fields (sourceName, amount)');
    }

    const income = await Income.create({
      user: req.user.id,
      sourceName,
      amount,
      date: date || Date.now(),
      notes,
    });

    res.status(201).json(income);
  } catch (error) {
    next(error);
  }
};

// @desc    Update income
// @route   PUT /api/income/:id
// @access  Private
const updateIncome = async (req, res, next) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      res.status(404);
      throw new Error('Income not found');
    }

    if (income.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized');
    }

    const updatedIncome = await Income.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json(updatedIncome);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete income
// @route   DELETE /api/income/:id
// @access  Private
const deleteIncome = async (req, res, next) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      res.status(404);
      throw new Error('Income not found');
    }

    if (income.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized');
    }

    await income.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getIncome,
  addIncome,
  updateIncome,
  deleteIncome,
};
