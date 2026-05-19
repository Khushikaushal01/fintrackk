import { useState, useEffect } from 'react';
import { Download, Search, Filter } from 'lucide-react';
import api from '../services/api';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const [incRes, expRes] = await Promise.all([
        api.get('/income'),
        api.get('/expenses')
      ]);
      
      const allTransactions = [
        ...incRes.data.map(i => ({ ...i, type: 'income', title: i.sourceName })),
        ...expRes.data.map(e => ({ ...e, type: 'expense' }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(allTransactions);
    } catch (error) {
      console.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => 
    t.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Title', 'Category', 'Amount'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.type,
        t.title ? `"${t.title}"` : '',
        t.category || '',
        t.amount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-700/50 rounded-xl bg-card-dark text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            placeholder="Search transactions..."
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 border border-slate-700/50 rounded-xl bg-card-dark text-slate-300 hover:bg-slate-800 transition-colors">
            <Filter className="w-5 h-5 mr-2" />
            Filter
          </button>
          <button
            onClick={exportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
          >
            <Download className="w-5 h-5 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Type/Category</th>
                <th className="p-4 font-medium text-right">Amount</th>
                <th className="p-4 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400">Loading...</td></tr>
              ) : filteredTransactions.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-400">No transactions found</td></tr>
              ) : (
                filteredTransactions.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 text-slate-400 text-sm">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="p-4 text-white font-medium capitalize">{tx.title}</td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${tx.type === 'income' ? 'bg-success' : 'bg-danger'}`}></span>
                        <span className="text-slate-300 text-sm capitalize">{tx.category || 'Income'}</span>
                      </div>
                    </td>
                    <td className={`p-4 text-right font-semibold ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount}
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-1 rounded-md text-xs font-medium bg-success/10 text-success">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
