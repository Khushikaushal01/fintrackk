import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import { Wallet, ArrowDownToLine, ArrowUpFromLine, Target, Lightbulb } from 'lucide-react';
import api from '../services/api';

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#64748B'];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    summary: { totalBalance: 0, totalIncome: 0, totalExpenses: 0, monthlySavings: 0 },
    expensesByCategory: [],
    recentTransactions: [],
    monthlyData: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // In a real app, this would be a single optimized endpoint
      const [incomeRes, expenseRes] = await Promise.all([
        api.get('/income'),
        api.get('/expenses')
      ]);

      const incomes = incomeRes.data;
      const expenses = expenseRes.data;

      const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
      const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);

      // Calculate expenses by category
      const categoryMap = {};
      expenses.forEach(exp => {
        categoryMap[exp.category] = (categoryMap[exp.category] || 0) + exp.amount;
      });
      const expensesByCategory = Object.keys(categoryMap).map(key => ({
        name: key, value: categoryMap[key]
      }));

      // Combine and sort for recent transactions
      const transactions = [
        ...incomes.map(i => ({ ...i, type: 'income' })),
        ...expenses.map(e => ({ ...e, type: 'expense' }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

      // Dummy monthly data for charts
      const monthlyData = [
        { name: 'Jan', income: totalIncome * 0.8, expense: totalExpenses * 0.9 },
        { name: 'Feb', income: totalIncome * 0.9, expense: totalExpenses * 0.8 },
        { name: 'Mar', income: totalIncome, expense: totalExpenses },
      ];

      setData({
        summary: {
          totalBalance: totalIncome - totalExpenses,
          totalIncome,
          totalExpenses,
          monthlySavings: totalIncome - totalExpenses // Simplified
        },
        expensesByCategory,
        recentTransactions: transactions,
        monthlyData
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const SummaryCard = ({ title, amount, icon: Icon, colorClass, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-card rounded-2xl p-6 relative overflow-hidden group"
    >
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150 ${colorClass.bg}`} />
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white">₹{amount.toLocaleString()}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorClass.bg} bg-opacity-20`}>
          <Icon className={`w-6 h-6 ${colorClass.text}`} />
        </div>
      </div>
      <div className="flex items-center text-sm">
        <span className="text-success flex items-center">
          <ArrowUpFromLine className="w-3 h-3 mr-1" /> 12%
        </span>
        <span className="text-slate-400 ml-2">vs last month</span>
      </div>
    </motion.div>
  );

  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Total Balance" 
          amount={data.summary.totalBalance} 
          icon={Wallet} 
          colorClass={{ bg: 'bg-primary', text: 'text-primary' }}
          delay={0.1}
        />
        <SummaryCard 
          title="Total Income" 
          amount={data.summary.totalIncome} 
          icon={ArrowDownToLine} 
          colorClass={{ bg: 'bg-success', text: 'text-success' }}
          delay={0.2}
        />
        <SummaryCard 
          title="Total Expenses" 
          amount={data.summary.totalExpenses} 
          icon={ArrowUpFromLine} 
          colorClass={{ bg: 'bg-danger', text: 'text-danger' }}
          delay={0.3}
        />
        <SummaryCard 
          title="Monthly Savings" 
          amount={data.summary.monthlySavings} 
          icon={Target} 
          colorClass={{ bg: 'bg-warning', text: 'text-warning' }}
          delay={0.4}
        />
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="glass-card rounded-2xl p-6 border-l-4 border-l-primary bg-gradient-to-r from-primary/10 to-transparent"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/20 rounded-xl">
            <Lightbulb className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">AI Financial Insight</h3>
            <p className="text-slate-300">
              "Your entertainment spending is 20% higher this month. Consider reducing it to stay on track with your Vacation savings goal."
            </p>
          </div>
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Breakdown */}
        <div className="glass-card rounded-2xl p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold text-white mb-6">Expense Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.expensesByCategory}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {data.expensesByCategory.map((entry, index) => (
              <div key={entry.name} className="flex items-center">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="text-slate-400 capitalize">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Income vs Expense Trend */}
        <div className="glass-card rounded-2xl p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-6">Cash Flow Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} dy={10} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                  itemStyle={{ color: '#fff', fontWeight: 500 }}
                />
                <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
          <button className="text-sm text-primary hover:text-primary-dark transition-colors">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700/50 text-slate-400 text-sm">
                <th className="pb-3 font-medium">Transaction</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.recentTransactions.map((tx, idx) => (
                <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 text-white capitalize">{tx.title || tx.sourceName}</td>
                  <td className="py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 capitalize">
                      {tx.category || 'Income'}
                    </span>
                  </td>
                  <td className="py-4 text-slate-400 text-sm">
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td className={`py-4 text-right font-medium ${tx.type === 'income' ? 'text-success' : 'text-danger'}`}>
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount}
                  </td>
                </tr>
              ))}
              {data.recentTransactions.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-slate-500">No recent transactions</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
