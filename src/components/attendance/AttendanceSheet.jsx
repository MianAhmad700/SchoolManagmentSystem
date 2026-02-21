import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Save, Calendar as CalendarIcon, Check, X, Clock, AlertCircle, Users, ArrowUpRight } from 'lucide-react';
import { getStudentsByClass } from '../../services/students';
import { markClassAttendance, getClassAttendance } from '../../services/attendance';
import clsx from 'clsx';
import { cn } from '../../lib/utils';

const ATTENDANCE_STATUSES = [
  { 
    id: 'present', 
    label: 'Present', 
    icon: Check, 
    color: 'text-green-600', 
    cardClass: 'bg-[#27AE60] text-white',
    iconClass: 'text-white'
  },
  { 
    id: 'absent', 
    label: 'Absent', 
    icon: X, 
    color: 'text-red-600', 
    cardClass: 'bg-[#EB5757] text-white',
    iconClass: 'text-white'
  },
  { 
    id: 'leave', 
    label: 'Leave', 
    icon: AlertCircle, 
    color: 'text-yellow-600', 
    cardClass: 'bg-[#FCD980] text-slate-900',
    iconClass: 'text-slate-900'
  },
  { 
    id: 'late', 
    label: 'Late', 
    icon: Clock, 
    color: 'text-blue-600', 
    cardClass: 'bg-[#2F80ED] text-white',
    iconClass: 'text-white'
  },
];

export default function AttendanceSheet({ selectedClass, selectedDate }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState({}); // Map of studentId -> status
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      loadData();
    }
  }, [selectedClass, selectedDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch students for the class
      const studentsData = await getStudentsByClass(selectedClass);
      
      // Sort students by name
      studentsData.sort((a, b) => a.name.localeCompare(b.name));
      setStudents(studentsData);

      // 2. Fetch existing attendance for this date/class
      const existingRecord = await getClassAttendance(selectedDate, selectedClass);
      
      if (existingRecord && existingRecord.records) {
        setAttendance(existingRecord.records);
      } else {
        // Initialize all as present by default? Or empty?
        // Let's initialize empty to force manual marking, or 'present' for convenience.
        // User preference: usually 'present' is default.
        const initialAttendance = {};
        studentsData.forEach(s => {
          initialAttendance[s.id] = 'present';
        });
        setAttendance(initialAttendance);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await markClassAttendance(selectedDate, selectedClass, attendance);
      toast.success("Attendance saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const markAll = (status) => {
    const newAttendance = {};
    students.forEach(s => {
      newAttendance[s.id] = status;
    });
    setAttendance(newAttendance);
  };

  if (!selectedClass || !selectedDate) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100">
        <CalendarIcon className="mx-auto h-12 w-12 text-slate-300" />
        <h3 className="mt-2 text-sm font-medium text-slate-900">No Class Selected</h3>
        <p className="mt-1 text-sm text-slate-500">Please select a class and date to mark attendance.</p>
      </div>
    );
  }

  // Calculate summary
  const summary = {
    present: Object.values(attendance).filter(s => s === 'present').length,
    absent: Object.values(attendance).filter(s => s === 'absent').length,
    leave: Object.values(attendance).filter(s => s === 'leave').length,
    late: Object.values(attendance).filter(s => s === 'late').length,
    total: students.length
  };

  return (
    <div className="flex flex-col lg:flex-row lg:h-full gap-6">
      {/* Left: Table Section (Grow) */}
      <div className="flex-1 flex flex-col h-[500px] lg:h-auto lg:min-h-0">
          
        {/* Action Bar */}
        <div className="flex flex-wrap gap-2 items-center shrink-0 mb-4">
            <span className="text-sm font-medium text-slate-700 mr-2">Mark All As:</span>
            {ATTENDANCE_STATUSES.map(status => (
            <button
                key={status.id}
                onClick={() => markAll(status.id)}
                className={clsx(
                "px-4 py-1.5 text-xs font-medium rounded-xl border transition-all",
                "bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm hover:shadow"
                )}
            >
                {status.label}
            </button>
            ))}
        </div>

        {/* Student List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col flex-1 min-h-0 overflow-hidden relative">
            <div className="flex-1 overflow-auto relative">
                <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-blue-500 sticky top-0 z-10">
                    <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Student
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                        Roll No
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                        Status
                    </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                    {loading ? (
                        <tr>
                            <td colSpan="3" className="px-6 py-24 text-center">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                                <p className="mt-2 text-slate-500">Loading student list...</p>
                            </td>
                        </tr>
                    ) : students.length === 0 ? (
                        <tr>
                            <td colSpan="3" className="px-6 py-24 text-center">
                                <Users className="mx-auto h-12 w-12 text-slate-300" />
                                <h3 className="mt-2 text-sm font-medium text-slate-900">No Students Found</h3>
                                <p className="mt-1 text-sm text-slate-500">There are no students in this class.</p>
                            </td>
                        </tr>
                    ) : (
                        students.map((student) => (
                        <tr key={student.id} className="transition-colors even:bg-blue-50 hover:bg-slate-50/80">
                            <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                    {student.photoUrl ? (
                                        <img className="h-10 w-10 rounded-full object-cover" src={student.photoUrl} alt="" />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                        {student.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="ml-4">
                                    <div className="text-sm font-medium text-slate-900">{student.name}</div>
                                    <div className="text-xs text-slate-500">{student.fatherName}</div>
                                </div>
                            </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                {student.rollNo || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex justify-center gap-3">
                                    {ATTENDANCE_STATUSES.map(status => (
                                        <button
                                            key={status.id}
                                            onClick={() => handleStatusChange(student.id, status.id)}
                                            className={cn(
                                                "p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500",
                                                attendance[student.id] === status.id
                                                    ? `bg-${status.color.split('-')[1]}-100 ${status.color} ring-2 ring-${status.color.split('-')[1]}-400 scale-110`
                                                    : "bg-slate-100 text-slate-300 hover:bg-slate-200"
                                            )}
                                            title={status.label}
                                        >
                                            <status.icon className="h-5 w-5" />
                                        </button>
                                    ))}
                                </div>
                            </td>
                        </tr>
                        ))
                    )}
                </tbody>
                </table>
            </div>
            {!loading && students.length > 0 && (
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Attendance
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* Right: Summary Section (Fixed width) */}
      <div className="w-full lg:w-80 shrink-0 px-6 py-6 lg:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 sticky top-6">
            {ATTENDANCE_STATUSES.map(status => (
            <div key={status.id} className={cn("rounded-2xl p-4 relative overflow-hidden transition-all hover:shadow-lg flex flex-col justify-between h-32", status.cardClass)}>
                <div className="flex justify-between items-start">
                    <h3 className="text-3xl font-bold tracking-tight">{summary[status.id]}</h3>
                    <div className={cn("p-1.5 rounded-full border border-current opacity-60", status.iconClass)}>
                        <ArrowUpRight className="w-4 h-4" />
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-auto">
                    <p className="font-medium text-sm opacity-90">{status.label}</p>
                </div>
                
                {/* Decorative Icon Watermark */}
                <status.icon className="absolute -bottom-3 -right-3 w-16 h-16 opacity-10 rotate-12" />
            </div>
            ))}
          </div>
      </div>
    </div>
  );
}
