import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Search, Save, Download } from 'lucide-react';
import { getStudentsByClass } from '../../services/students';
import { addFeeRecord } from '../../services/finance';
import { generateFeeReceipt } from '../../utils/pdfGenerator';

const CLASSES = ["PG", "Nursery", "Prep", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function FeeCollection({ onSuccess }) {
  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      year: new Date().getFullYear(),
      paid: 0,
      total: 0
    }
  });
  
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selectedStudentId = watch('studentId');
  const paidAmount = watch('paid');
  const totalAmount = watch('total');

  // Load students when class changes
  useEffect(() => {
    if (selectedClass) {
      loadStudents();
    } else {
      setStudents([]);
    }
  }, [selectedClass]);

  // Update total amount when student changes
  useEffect(() => {
    if (selectedStudentId && students.length > 0) {
      const student = students.find(s => s.id === selectedStudentId);
      if (student && student.monthlyFee) {
        setValue('total', student.monthlyFee);
      } else {
        setValue('total', 0);
      }
    }
  }, [selectedStudentId, students, setValue]);

  const loadStudents = async () => {
    setLoadingStudents(true);
    try {
      const data = await getStudentsByClass(selectedClass);
      setStudents(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load students");
    } finally {
      setLoadingStudents(false);
    }
  };

  const calculateStatus = () => {
    const paid = Number(paidAmount) || 0;
    const total = Number(totalAmount) || 0;
    
    if (total === 0) return 'N/A';
    if (paid >= total) return 'Paid in Full';
    if (paid > 0) return 'Partially Paid';
    return 'Unpaid';
  };

  const calculateDue = () => {
    const paid = Number(paidAmount) || 0;
    const total = Number(totalAmount) || 0;
    return Math.max(0, total - paid);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const student = students.find(s => s.id === data.studentId);
      const paid = Number(data.paid);
      const total = Number(data.total);
      
      const status = paid >= total ? 'paid' : paid > 0 ? 'partial' : 'unpaid';
      
      const feeData = {
        ...data,
        studentName: student ? student.name : 'Unknown',
        fatherName: student ? student.fatherName : '',
        rollNo: student ? student.rollNo : '',
        classId: selectedClass,
        paid,
        due: Math.max(0, total - paid),
        status
      };

      await addFeeRecord(feeData);
      toast.success("Fee collected successfully");
      
      // Generate Receipt
      try {
        generateFeeReceipt(feeData);
        toast.info("Receipt downloaded");
      } catch (err) {
        console.error("Receipt generation failed", err);
        toast.warning("Fee saved but receipt generation failed");
      }

      reset({
        year: new Date().getFullYear(),
        paid: 0,
        total: 0
      });
      // Don't reset class/students to allow quick subsequent entries
      // setSelectedClass(''); 
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save fee record");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-slate-800">Collect Fees</h3>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex-1 flex flex-col">
        <div className="space-y-2">
            {/* Class Selection */}
            <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
            <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
                <option value="">Select Class</option>
                {CLASSES.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
            </div>

            {/* Student Selection */}
            <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Student</label>
            <div className="relative">
                <select
                    {...register("studentId", { required: true })}
                    className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none disabled:opacity-50"
                    disabled={!selectedClass || loadingStudents}
                >
                <option value="">Select Student</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNo})</option>)}
                </select>
                {loadingStudents && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                )}
            </div>
            </div>

            {/* Month & Year */}
            <div className="grid grid-cols-2 gap-2">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Month</label>
                <select
                {...register("month", { required: true })}
                className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
                <input
                type="number"
                {...register("year", { required: true })}
                className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
            </div>
            </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100">
            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Payable Amount (PKR)</label>
                <input
                    type="number"
                    {...register("total")}
                    readOnly
                    className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-500 focus:outline-none"
                />
            </div>

            <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Payment Amount (PKR)</label>
                <input
                    type="number"
                    {...register("paid", { required: true })}
                    className="block w-full px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <div>
                    <p className="text-xs text-slate-500 uppercase font-bold">Status</p>
                    <p className={`text-lg font-bold ${
                        calculateStatus() === 'Paid in Full' ? 'text-green-600' :
                        calculateStatus() === 'Partially Paid' ? 'text-yellow-600' :
                        calculateStatus() === 'Unpaid' ? 'text-red-600' : 'text-slate-400'
                    }`}>
                        {calculateStatus()}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase font-bold">Balance / Due</p>
                    <p className="text-lg font-bold text-slate-800">PKR {calculateDue()}</p>
                </div>
            </div>
        </div>

        <button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
        >
            {submitting ? (
                <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Processing...
                </>
            ) : (
                <>
                <Save className="h-4 w-4 mr-2" />
                Collect Fee
                </>
            )}
        </button>
      </form>
    </div>
  );
}
