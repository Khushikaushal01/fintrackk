const SavingsGoal = require('../models/SavingsGoal');

// @desc    Get goals
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res, next) => {
  try {
    const goals = await SavingsGoal.find({ user: req.user.id });
    res.status(200).json(goals);
  } catch (error) {
    next(error);
  }
};

// @desc    Set goal
// @route   POST /api/goals
// @access  Private
const setGoal = async (req, res, next) => {
  try {
    const { title, targetAmount, deadline } = req.body;

    if (!title || !targetAmount || !deadline) {
      res.status(400);
      throw new Error('Please add all required fields');
    }

    const goal = await SavingsGoal.create({
      user: req.user.id,
      title,
      targetAmount,
      deadline,
    });

    res.status(201).json(goal);
  } catch (error) {
    next(error);
  }
};

// @desc    Update goal (e.g. adding to current amount)
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findById(req.params.id);

    if (!goal) {
      res.status(404);
      throw new Error('Goal not found');
    }

    if (goal.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized');
    }

    const updatedGoal = await SavingsGoal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json(updatedGoal);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findById(req.params.id);

    if (!goal) {
      res.status(404);
      throw new Error('Goal not found');
    }

    if (goal.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized');
    }

    await goal.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGoals,
  setGoal,
  updateGoal,
  deleteGoal,
};
