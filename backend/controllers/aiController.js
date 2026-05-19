const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Budget = require('../models/Budget');
const SavingsGoal = require('../models/SavingsGoal');

// @desc    Process AI Question
// @route   POST /api/ai/ask
// @access  Private
const processAIQuestion = async (req, res, next) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      res.status(400);
      throw new Error('Please provide a question');
    }

    // Convert question to lowercase for simple NLP matching
    const q = question.toLowerCase();
    
    // Fetch user's data
    const userId = req.user.id;
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const [expenses, incomes, budgets, goals] = await Promise.all([
      Expense.find({ user: userId }),
      Income.find({ user: userId }),
      Budget.find({ user: userId, month: currentMonth, year: currentYear }),
      SavingsGoal.find({ user: userId })
    ]);

    let response = "I'm not quite sure how to answer that based on your data. Try asking about your budget, expenses, income, or savings goals!";

    // --- RULE-BASED LOGIC (Simulated AI) ---
    
    // 1. Total Income / Balance Queries
    if (q.includes('total income') || q.includes('how much have i earned')) {
      const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
      response = `Your total recorded income is ₹${totalIncome.toLocaleString()}.`;
    }
    else if (q.includes('total expense') || q.includes('how much have i spent')) {
      const totalExp = expenses.reduce((acc, curr) => acc + curr.amount, 0);
      response = `You have spent a total of ₹${totalExp.toLocaleString()} so far.`;
    }
    // 2. Budget Specific Queries
    else if (q.includes('budget') || q.includes('left for')) {
      // Find category in question
      const categories = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Education', 'Health', 'Other', 'Total'];
      let matchedCategory = categories.find(c => q.includes(c.toLowerCase()));
      
      if (matchedCategory) {
        const budget = budgets.find(b => b.category === matchedCategory);
        if (budget) {
          const spent = expenses.reduce((acc, exp) => {
            const expDate = new Date(exp.date);
            const isSameMonth = expDate.getFullYear() === currentYear && expDate.getMonth() + 1 === currentMonth;
            const isCategoryMatch = budget.category === 'Total' || exp.category === budget.category;
            return (isSameMonth && isCategoryMatch) ? acc + exp.amount : acc;
          }, 0);
          
          const remaining = budget.amount - spent;
          if (remaining < 0) {
            response = `You are currently **over budget** for ${matchedCategory} by ₹${Math.abs(remaining).toLocaleString()}. (Budget: ₹${budget.amount}, Spent: ₹${spent})`;
          } else {
            response = `You have **₹${remaining.toLocaleString()}** remaining in your ${matchedCategory} budget for this month.`;
          }
        } else {
          response = `You haven't set a budget for ${matchedCategory} this month.`;
        }
      } else {
        response = `You currently have ${budgets.length} budgets set for this month. Try asking about a specific category like "How is my Food budget?".`;
      }
    }
    // 3. Savings Goals Queries
    else if (q.includes('goal') || q.includes('saving')) {
      if (goals.length > 0) {
        const closestGoal = goals.reduce((prev, curr) => {
          const prevProgress = prev.currentAmount / prev.targetAmount;
          const currProgress = curr.currentAmount / curr.targetAmount;
          return currProgress > prevProgress ? curr : prev;
        });
        const progress = Math.round((closestGoal.currentAmount / closestGoal.targetAmount) * 100);
        response = `You have ${goals.length} active savings goals. You are closest to completing "${closestGoal.title}" which is ${progress}% funded!`;
      } else {
        response = "You don't have any savings goals set up yet. Go to the Goals page to create one!";
      }
    }
    // 4. Summarize / Analyze
    else if (q.includes('summarize') || q.includes('analyze') || q.includes('insight') || q.includes('how am i doing')) {
      const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
      const totalExp = expenses.reduce((acc, curr) => acc + curr.amount, 0);
      const savings = totalIncome - totalExp;
      
      if (savings > 0) {
        response = `You're doing well! Your total income is ₹${totalIncome.toLocaleString()} and expenses are ₹${totalExp.toLocaleString()}, leaving you with ₹${savings.toLocaleString()} in net savings. Keep it up!`;
      } else {
        response = `Be careful! Your expenses (₹${totalExp.toLocaleString()}) have exceeded your income (₹${totalIncome.toLocaleString()}) by ₹${Math.abs(savings).toLocaleString()}. Review your budgets to cut down on spending.`;
      }
    }
    else if (q.includes('hi') || q.includes('hello')) {
      response = "Hello! I am your FinTrack AI Assistant. I can analyze your financial data and answer questions like 'How much budget do I have left for food?' or 'Summarize my finances'.";
    }

    // Simulate AI typing delay for realism
    setTimeout(() => {
      res.status(200).json({ answer: response });
    }, 1500);

  } catch (error) {
    next(error);
  }
};

module.exports = {
  processAIQuestion
};
