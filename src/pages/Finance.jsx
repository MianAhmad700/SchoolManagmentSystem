import { useState, useEffect } from 'react';
import { Printer } from 'lucide-react';
import FeeCollection from '../components/finance/FeeCollection';
import ExpenseTracker from '../components/finance/ExpenseTracker';
import FinanceSummary from '../components/finance/FinanceSummary';
import { getFees, getExpenses } from '../services/finance';
import { generateFeeReceipt } from '../utils/pdfGenerator';
import { formatCurrency, cn } from '../lib/utils';

export default function Finance() {
  const [fees, setFees] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [feesData, expensesData] = await Promise.all([
        getFees(),
        getExpenses()
      ]);
      setFees(feesData);
      setExpenses(expensesData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalCollected = fees.reduce((acc, curr) => acc + (curr.paid || 0), 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const pendingFees = fees.reduce((acc, curr) => acc + (curr.due || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Finance Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage fees, expenses and financial reports</p>
        </div>
      </div>

      <FinanceSummary 
        totalCollected={totalCollected} 
        totalExpenses={totalExpenses} 
        pendingFees={pendingFees} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <FeeCollection onSuccess={fetchData} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="px-6 py-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800">Recent Transactions</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
             </div>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-blue-500">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Receipt No</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Student</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Month</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {fees.slice(0, 5).map((fee) => (
                      <tr key={fee.id} className="hover:bg-blue-50 even:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">{fee.receiptNo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{fee.studentName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{fee.month}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{formatCurrency(fee.paid)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn(
                            "px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full",
                            fee.status === 'paid' ? "bg-green-100 text-green-800" : 
                            fee.status === 'partial' ? "bg-yellow-100 text-yellow-800" : 
                            "bg-red-100 text-red-800"
                          )}>
                            {fee.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                                onClick={() => generateFeeReceipt(fee)}
                                className="text-blue-600 hover:text-blue-900 transition-colors p-2 hover:bg-blue-50 rounded-full"
                                title="Print Receipt"
                            >
                                <Printer className="h-4 w-4" />
                            </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
          
          <div className="h-auto lg:h-[500px]">
            <ExpenseTracker expenses={expenses} onUpdate={fetchData} />
          </div>
        </div>
      </div>
    </div>
  );
}
