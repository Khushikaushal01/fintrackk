import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, AlertCircle } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: 'Food', amount: '', month: new Date().toISOString().substring(0, 7) // YYYY-MM
  });

  const categories = ['Total', 'Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Education', 'Health', 'Other'];

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const res = await api.get('/budget');
      // Calculate spent amount based on expenses - assuming backend doesn't do this, 
      // but ideally backend should provide "spent" per budget.
      // For this demo, let's fetch expenses and manually calculate if needed, or use dummy if backend doesn't support it yet.
      // Actually backend budgetController has some logic. Let's assume it returns budget.amount. 
      // Let's fetch expenses to calculate spent.
      const expenseRes = await api.get('/expenses');
      const expenses = expenseRes.data;

      const budgetsWithSpent = res.data.map(budget => {
        const year = budget.year;
        const month = budget.month;
        const spent = expenses.reduce((acc, exp) => {
          const expDate = new Date(exp.date);
          const isSameMonth = expDate.getFullYear() === year && expDate.getMonth() + 1 === month;
          const isCategoryMatch = budget.category === 'Total' || exp.category === budget.category;
          
          if (isSameMonth && isCategoryMatch) {
            return acc + exp.amount;
          }
          return acc;
        }, 0);
        return { ...budget, spent };
      });

      setBudgets(budgetsWithSpent);
    } catch (error) {
      toast.error('Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const [year, month] = formData.month.split('-');
      const payload = {
        category: formData.category,
        amount: Number(formData.amount),
        year: parseInt(year),
        month: parseInt(month)
      };
      await api.post('/budget', payload);
      toast.success('Budget set successfully');
      setIsModalOpen(false);
      fetchBudgets();
    } catch (error) {
      toast.error('Failed to set budget');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Monthly Budgets</h2>
          <p className="text-slate-400 mt-1">Plan your spending and track your limits.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
        >
          <Wallet className="w-5 h-5 mr-2" />
          Set Budget
        </button>
      </div>

      {loading ? (
        <div className="text-center text-slate-400 py-10">Loading...</div>
      ) : budgets.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No budgets set</h3>
          <p className="text-slate-400 max-w-md mx-auto">Take control of your finances by setting monthly limits for different categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {budgets.map((budget, idx) => {
            const spent = budget.spent || 0;
            const progress = Math.min(100, (spent / budget.amount) * 100);
            const isOver = spent > budget.amount;
            const isNear = progress >= 80 && !isOver;

            let colorClass = 'bg-primary';
            let trackClass = 'bg-primary/20';
            if (isOver) { colorClass = 'bg-danger'; trackClass = 'bg-danger/20'; }
            else if (isNear) { colorClass = 'bg-warning'; trackClass = 'bg-warning/20'; }

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={budget._id}
                className={`glass-card rounded-2xl p-6 border-l-4 ${isOver ? 'border-danger' : isNear ? 'border-warning' : 'border-primary'}`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">{budget.category}</h3>
                  <span className="text-sm font-medium text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
                    {budget.year}-{String(budget.month).padStart(2, '0')}
                  </span>
                </div>
                
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <span className="text-2xl font-bold text-white">₹{spent}</span>
                    <span className="text-sm text-slate-400 ml-2">spent of ₹{budget.amount}</span>
                  </div>
                  {isOver && (
                    <span className="flex items-center text-xs text-danger font-medium bg-danger/10 px-2 py-1 rounded">
                      <AlertCircle className="w-3 h-3 mr-1" /> Over budget
                    </span>
                  )}
                </div>

                <div className={`w-full ${trackClass} rounded-full h-2.5 mb-2 overflow-hidden`}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className={`h-2.5 rounded-full ${colorClass}`}
                  ></motion.div>
                </div>
                <div className="flex justify-between text-xs font-medium">
                  <span className={isOver ? 'text-danger' : isNear ? 'text-warning' : 'text-slate-400'}>
                    {progress.toFixed(1)}% Used
                  </span>
                  <span className={isOver ? 'text-danger' : 'text-slate-400'}>
                    {isOver ? `Over by ₹${spent - budget.amount}` : `₹${budget.amount - spent} left`}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl w-full max-w-md p-6 border border-slate-700"
          >
            <h3 className="text-xl font-bold text-white mb-6">Set Monthly Budget</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-600 rounded-xl bg-slate-800/50 text-white focus:ring-2 focus:ring-primary outline-none"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Monthly Limit</label>
                <input
                  type="number" required min="1"
                  value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-600 rounded-xl bg-slate-800/50 text-white focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Month</label>
                <input
                  type="month" required
                  value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-600 rounded-xl bg-slate-800/50 text-white focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-300 hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl transition-colors shadow-lg shadow-primary/20"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Budget;
