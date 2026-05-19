import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, Edit2, Filter } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    sourceName: '', amount: '', date: new Date().toISOString().split('T')[0], notes: ''
  });

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      const res = await api.get('/income');
      setIncomes(res.data);
    } catch (error) {
      toast.error('Failed to fetch income records');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/income', formData);
      toast.success('Income added successfully');
      setIsModalOpen(false);
      fetchIncomes();
      setFormData({ sourceName: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
    } catch (error) {
      toast.error('Failed to add income');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this income record?')) {
      try {
        await api.delete(`/income/${id}`);
        toast.success('Income deleted');
        fetchIncomes();
      } catch (error) {
        toast.error('Failed to delete income');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 w-full max-w-md relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-700/50 rounded-xl bg-card-dark text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-success transition-all"
            placeholder="Search income..."
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 border border-slate-700/50 rounded-xl bg-card-dark text-slate-300 hover:bg-slate-800 transition-colors">
            <Filter className="w-5 h-5 mr-2" />
            Filter
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 rounded-xl bg-success text-white hover:bg-emerald-600 transition-colors shadow-lg shadow-success/20"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Income
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Source</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Notes</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400">Loading...</td></tr>
              ) : incomes.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400">No income records found</td></tr>
              ) : (
                incomes.map((income) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={income._id} 
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="p-4 text-white font-medium">{income.sourceName}</td>
                    <td className="p-4 text-slate-400">{new Date(income.date).toLocaleDateString()}</td>
                    <td className="p-4 text-success font-semibold">₹{income.amount}</td>
                    <td className="p-4 text-slate-400 text-sm max-w-[200px] truncate">{income.notes || '-'}</td>
                    <td className="p-4 flex justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-success transition-colors bg-slate-800 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(income._id)}
                        className="p-2 text-slate-400 hover:text-danger transition-colors bg-slate-800 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Income Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card rounded-2xl w-full max-w-md p-6 border border-slate-700"
          >
            <h3 className="text-xl font-bold text-white mb-6">Add New Income</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Source Name</label>
                <input
                  type="text" required
                  value={formData.sourceName} onChange={e => setFormData({...formData, sourceName: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-600 rounded-xl bg-slate-800/50 text-white focus:ring-2 focus:ring-success outline-none"
                  placeholder="e.g. Salary, Freelance"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Amount</label>
                  <input
                    type="number" required min="0"
                    value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-600 rounded-xl bg-slate-800/50 text-white focus:ring-2 focus:ring-success outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Date</label>
                  <input
                    type="date" required
                    value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-600 rounded-xl bg-slate-800/50 text-white focus:ring-2 focus:ring-success outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Notes (Optional)</label>
                <textarea
                  rows="3"
                  value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-600 rounded-xl bg-slate-800/50 text-white focus:ring-2 focus:ring-success outline-none resize-none"
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
                  className="px-4 py-2 bg-success hover:bg-emerald-600 text-white rounded-xl transition-colors shadow-lg shadow-success/20"
                >
                  Save Income
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Income;
