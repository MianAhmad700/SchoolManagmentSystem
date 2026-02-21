import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { getAllFees, getAllExpenses } from '../../services/finance';

const MONTHS_MAP = {
  "January": 0, "February": 1, "March": 2, "April": 3, "May": 4, "June": 5,
  "July": 6, "August": 7, "September": 8, "October": 9, "November": 10, "December": 11
};

const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function RevenueChart() {
  const [filter, setFilter] = useState('Monthly');
  const [monthlyData, setMonthlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [fees, expenses] = await Promise.all([getAllFees(), getAllExpenses()]);
      processData(fees, expenses);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekKey = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    // Set to nearest previous Sunday
    d.setDate(d.getDate() - d.getDay());
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const processData = (fees, expenses) => {
    const mData = {};
    const wData = {};

    // Helper to get key from year and month index
    const getMonthKey = (year, monthIndex) => `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

    // Process Fees
    fees.forEach(fee => {
        const amount = Number(fee.paid || 0);
        
        // Monthly
        if (fee.month && fee.year) {
            const monthIndex = MONTHS_MAP[fee.month];
            if (monthIndex !== undefined) {
                const key = getMonthKey(fee.year, monthIndex);
                if (!mData[key]) mData[key] = { earnings: 0, expenses: 0, year: Number(fee.year), month: monthIndex };
                mData[key].earnings += amount;
            }
        }

        // Weekly - use createdAt if available
        if (fee.createdAt) {
            const date = fee.createdAt.toDate ? fee.createdAt.toDate() : new Date(fee.createdAt.seconds * 1000);
            const weekKey = getWeekKey(date);
            if (!wData[weekKey]) wData[weekKey] = { earnings: 0, expenses: 0, date: weekKey };
            wData[weekKey].earnings += amount;
        }
    });

    // Process Expenses
    expenses.forEach(expense => {
      if (expense.date) {
        const date = new Date(expense.date);
        const year = date.getFullYear();
        const monthIndex = date.getMonth();
        const amount = Number(expense.amount || 0);

        // Monthly
        const mKey = getMonthKey(year, monthIndex);
        if (!mData[mKey]) mData[mKey] = { earnings: 0, expenses: 0, year, month: monthIndex };
        mData[mKey].expenses += amount;

        // Weekly
        const wKey = getWeekKey(date);
        if (!wData[wKey]) wData[wKey] = { earnings: 0, expenses: 0, date: wKey };
        wData[wKey].expenses += amount;
      }
    });

    // Convert Monthly to array and sort
    const sortedMonthly = Object.entries(mData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, val]) => ({
        name: SHORT_MONTHS[val.month],
        earnings: val.earnings,
        expenses: val.expenses,
        fullDate: key 
      }));

    // Convert Weekly to array and sort
    const sortedWeekly = Object.entries(wData)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, val]) => {
          const [y, m, d] = key.split('-');
          return {
            name: `${d} ${SHORT_MONTHS[parseInt(m)-1]}`,
            earnings: val.earnings,
            expenses: val.expenses,
            fullDate: key
          };
      });
    
    setMonthlyData(sortedMonthly);
    setWeeklyData(sortedWeekly);
  };

  const getFilteredData = () => {
    if (filter === 'Monthly') {
       // Return last 12 months
       return monthlyData.slice(-12);
    } else if (filter === 'Weekly') {
       // Return last 8 weeks
       return weeklyData.slice(-8);
    }
    return [];
  };

  const chartData = getFilteredData();

  if (loading) {
      return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[350px] flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[350px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">Earnings</h3>
        <select 
            className="bg-slate-50 border-none text-sm font-medium text-slate-600 rounded-lg py-1 px-3"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
        >
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
        </select>
      </div>
      
      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span className="text-sm text-slate-500">Earnings</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-400"></span>
            <span className="text-sm text-slate-500">Expenses</span>
        </div>
      </div>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="75%">
            <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
            <defs>
                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fb923c" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#fb923c" stopOpacity={0}/>
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
            <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Area type="monotone" dataKey="earnings" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
            <Area type="monotone" dataKey="expenses" stroke="#fb923c" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" />
            </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-[75%] text-slate-400">
            No data available
        </div>
      )}
    </div>
  );
}
