import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Plus, Trash2, Printer } from 'lucide-react';
import { addExpense, deleteExpense } from '../../services/finance';
import { generateExpenseReceipt } from '../../utils/pdfGenerator';
import { formatCurrency } from '../../lib/utils';

const CATEGORIES = ["Salary", "Utilities", "Maintenance", "Stationery", "Events", "Other"];

export default function ExpenseTracker({ expenses, onUpdate }) {
  const { register, handleSubmit, reset } = useForm();
  const [adding, setAdding] = useState(false);

  const onSubmit = async (data) => {
    setAdding(true);
    try {
      await addExpense({
        ...data,
        amount: Number(data.amount)
      });
      toast.success("Expense added");
      reset();
      onUpdate();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add expense");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this expense?")) {
        try {
            await deleteExpense(id);
            toast.success("Expense deleted");
            onUpdate();
        } catch (error) {
            toast.error("Failed to delete");
        }
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="px-6 py-6 border-b border-slate-100 flex justify-between items-center">
        <h3 className="text-lg font-bold text-slate-800">Expenses</h3>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Last 50 records</span>
      </div>

      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
                <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                <input 
                    {...register("description", { required: true })}
                    className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="e.g. Electricity Bill"
                />
            </div>
            <div className="w-full md:w-32">
                 <label className="block text-xs font-medium text-slate-500 mb-1">Amount</label>
                 <input 
                    type="number"
                    {...register("amount", { required: true })}
                    className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="0.00"
                />
            </div>
             <div className="w-full md:w-32">
                 <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                 <select 
                    {...register("category", { required: true })}
                    className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
             <div className="w-full md:w-40">
                 <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                 <input 
                    type="date"
                    {...register("date", { required: true })}
                    className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
            </div>
            <button 
                type="submit"
                disabled={adding}
                className="w-full md:w-auto px-4 py-2 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm shadow-red-200"
            >
                <Plus className="h-5 w-5" />
            </button>
        </form>
      </div>

      <div className="flex-1 overflow-auto min-h-0">
        <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-blue-500 sticky top-0 z-10">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-white uppercase tracking-wider">Action</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
                {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-blue-50 even:bg-blue-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {expense.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                            {expense.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                {expense.category}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                            {formatCurrency(expense.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                                <button 
                                    onClick={() => generateExpenseReceipt(expense)}
                                    className="text-blue-600 hover:text-blue-900 transition-colors p-2 hover:bg-blue-50 rounded-full"
                                    title="Print Receipt"
                                >
                                    <Printer className="h-4 w-4" />
                                </button>
                                <button 
                                    onClick={() => handleDelete(expense.id)}
                                    className="text-red-600 hover:text-red-900 transition-colors p-2 hover:bg-red-50 rounded-full"
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}
