import { useState, useEffect } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import TeacherTable from '../components/teachers/TeacherTable';
import TeacherForm from '../components/teachers/TeacherForm';
import { getAllTeachers, deleteTeacher } from '../services/teachers';
import { toast } from 'react-toastify';
import Lottie from 'lottie-react';
import teacherAnimation from '../assets/animations/Teacher.json';
import TeacherStatsChart from '../components/dashboard/TeacherStatsChart';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const data = await getAllTeachers({
        searchTerm: debouncedSearch || ''
      });

      setTeachers(data);
    } catch (error) {
      console.error(error);
      if (error.code === 'permission-denied') {
        toast.error("Permission denied: Check Firestore Rules");
      } else {
        toast.error("Failed to fetch teachers");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [debouncedSearch]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      try {
        await deleteTeacher(id);
        toast.success("Teacher deleted successfully");
        fetchTeachers();
      } catch (error) {
        toast.error("Failed to delete teacher");
      }
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    fetchTeachers();
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Header & Filters */}
      <div className="flex flex-col gap-4  text-slate-900 p-6 rounded-2xl  shadow-sm shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Teacher Management</h1>
            <p className="text-sm text-slate-600 mt-1">Manage staff, assignments and profiles</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                className="block w-full pl-9 pr-3 py-2 border border-blue-100 rounded-xl text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-400"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Add Button */}
            <button
                onClick={() => {
                  setEditingTeacher(null);
                  setShowForm(true);
                }}
                className="flex-1 sm:flex-none inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Teacher
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col xl:flex-row gap-6 flex-1 min-h-0">
        {/* Left Side: Table & Pagination */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {loading ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex-1 flex flex-col justify-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-2"></div>
              <p className="text-slate-500">Loading teachers...</p>
            </div>
          ) : (
            <>
              <TeacherTable 
                teachers={teachers} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
                className="flex-1"
                loading={loading}
              />
            </>
          )}
        </div>

        {/* Right Side: Animation */}
        <div className="w-full xl:w-96 flex-shrink-0 flex flex-col gap-6">
           <TeacherStatsChart />
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
             <Lottie animationData={teacherAnimation} loop={true} className="w-48 h-48" />
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
            <div className="fixed inset-0 bg-slate-200/50 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={() => setShowForm(false)}></div>
            
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full max-w-4xl">
              <TeacherForm 
                teacher={editingTeacher} 
                onSuccess={handleFormSuccess} 
                onClose={() => setShowForm(false)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
