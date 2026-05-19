import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, Trash2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', targetAmount: '', currentAmount: 0, deadline: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await api.get('/goals');
      setGoals(res.data);
    } catch (error) {
      toast.error('Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/goals', formData);
      toast.success('Goal added successfully');
      setIsModalOpen(false);
      fetchGoals();
      setFormData({ title: '', targetAmount: '', currentAmount: 0, deadline: new Date().toISOString().split('T')[0] });
    } catch (error) {
      toast.error('Failed to add goal');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await api.delete(`/goals/${id}`);
        toast.success('Goal deleted');
        fetchGoals();
      } catch (error) {
        toast.error('Failed to delete goal');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Savings Goals</h2>
          <p className="text-slate-400 mt-1">Track your progress towards your financial dreams.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-lg shadow-purple-600/20"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Goal
        </button>
      </div>

      {loading ? (
        <div className="text-center text-slate-400 py-10">Loading...</div>
      ) : goals.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center">
          <div className="mx-auto w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
            <Target className="w-8 h-8 text-purple-500" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No goals set yet</h3>
          <p className="text-slate-400 max-w-md mx-auto">Create your first savings goal to start tracking your progress towards a new laptop, emergency fund, or vacation.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal, idx) => {
            const progress = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const isCompleted = progress >= 100;
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={goal._id}
                className={`glass-card rounded-2xl p-6 border-t-4 ${isCompleted ? 'border-success' : 'border-purple-500'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-800 rounded-xl">
                    <Target className={`w-6 h-6 ${isCompleted ? 'text-success' : 'text-purple-500'}`} />
                  </div>
                  <button 
                    onClick={() => handleDelete(goal._id)}
                    className="p-1.5 text-slate-400 hover:text-danger hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{goal.title}</h3>
                <p className="text-sm text-slate-400 mb-4">Target: {new Date(goal.deadline).toLocaleDateString()}</p>
                
                <div className="mb-2 flex justify-between items-end">
                  <span className="text-2xl font-bold text-white">₹{goal.currentAmount}</span>
                  <span className="text-sm text-slate-400">of ₹{goal.targetAmount}</span>
                </div>
                
                <div className="w-full bg-slate-800 rounded-full h-2.5 mb-2 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`h-2.5 rounded-full ${isCompleted ? 'bg-success' : 'bg-gradient-to-r from-purple-500 to-indigo-500'}`}
                  ></motion.div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className={isCompleted ? 'text-success font-medium' : 'text-purple-400 font-medium'}>{progress}% complete</span>
                  <span className="text-slate-400">₹{goal.targetAmount - goal.currentAmount} remaining</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Goal Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl w-full max-w-md p-6 border border-slate-700"
          >
            <h3 className="text-xl font-bold text-white mb-6">Create Savings Goal</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Goal Title</label>
                <input
                  type="text" required
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-600 rounded-xl bg-slate-800/50 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="e.g. Dream Vacation"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Target Amount</label>
                  <input
                    type="number" required min="1"
                    value={formData.targetAmount} onChange={e => setFormData({...formData, targetAmount: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-600 rounded-xl bg-slate-800/50 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Current Savings</label>
                  <input
                    type="number" min="0"
                    value={formData.currentAmount} onChange={e => setFormData({...formData, currentAmount: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-600 rounded-xl bg-slate-800/50 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Target Date</label>
                <input
                  type="date" required
                  value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-600 rounded-xl bg-slate-800/50 text-white focus:ring-2 focus:ring-purple-500 outline-none"
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
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors shadow-lg shadow-purple-600/20"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Goals;
