import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Upload, Download, Calendar, Trash2, ArrowUp } from 'lucide-react';
import StudentTable from '../components/students/StudentTable';
import StudentForm from '../components/students/StudentForm';
import BulkUpload from '../components/students/BulkUpload';
import StudentGenderChart from '../components/dashboard/StudentGenderChart';
import { getAllStudents, deleteStudent, deleteStudents, promoteStudents } from '../services/students';
import { getAllClasses } from '../services/classes';
import { toast } from 'react-toastify';
import Lottie from 'lottie-react';
import studentAnimation from '../assets/animations/Student.json';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [classes, setClasses] = useState([]);
  
  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const data = await getAllClasses();
        setClasses(data);
      } catch (error) {
        console.error("Failed to load classes", error);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await getAllStudents({
        filterClass: filterClass || null,
        filterYear: filterYear || null,
        searchTerm: debouncedSearch || ''
      });
      
      setStudents(data);
    } catch (error) {
      console.error(error);
      if (error.code === 'permission-denied') {
        toast.error("Permission denied: Check Firestore Rules");
      } else {
        toast.error("Failed to fetch students");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [debouncedSearch, filterClass, filterYear]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await deleteStudent(id);
        toast.success("Student deleted successfully");
        fetchStudents();
      } catch (error) {
        toast.error("Failed to delete student");
      }
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    fetchStudents();
  };

  const handleSelectionChange = (ids) => {
    setSelectedIds(ids);
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} students?`)) {
      try {
        await deleteStudents(selectedIds);
        toast.success(`${selectedIds.length} students deleted successfully`);
        setSelectedIds([]);
        fetchStudents();
      } catch (error) {
        toast.error("Failed to delete students");
      }
    }
  };

  const handleBulkPromote = async () => {
    if (window.confirm(`Are you sure you want to promote ${selectedIds.length} students to the next class?`)) {
      try {
        await promoteStudents(selectedIds);
        toast.success(`${selectedIds.length} students promoted successfully`);
        setSelectedIds([]);
        fetchStudents();
      } catch (error) {
        toast.error("Failed to promote students");
      }
    }
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Header & Filters */}
      <div className="flex flex-col gap-4 text-slate-900 p-6 rounded-2xl  shadow-sm shrink-0">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Student Management</h1>
            <p className="text-sm text-slate-600 mt-1">Manage admissions, student profiles and records</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
              <div className="flex gap-2 w-full lg:w-auto mt-2 lg:mt-0 mr-2 animate-in fade-in slide-in-from-right-5 duration-300">
                 <button
                    onClick={handleBulkPromote}
                    className="flex-1 lg:flex-none inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                  >
                    <ArrowUp className="h-4 w-4 mr-2" />
                    Promote ({selectedIds.length})
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="flex-1 lg:flex-none inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete ({selectedIds.length})
                  </button>
              </div>
            )}

            {/* Search */}
            <div className="relative flex-grow lg:flex-grow-0 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                className="block w-full pl-9 pr-3 py-2 border border-blue-100 rounded-xl text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-slate-400"
                placeholder="Search by Student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Year Filter */}
            <div className="relative flex-grow lg:flex-grow-0 lg:w-32">
              <select
                className="block w-full pl-3 pr-8 py-2 border-none rounded-xl text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer appearance-none"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
              >
                <option value="">All Years</option>
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <Calendar className="h-3 w-3" />
              </div>
            </div>

            {/* Class Filter */}
            <div className="relative flex-grow lg:flex-grow-0 lg:w-40">
              <select
                className="block w-full pl-3 pr-8 py-2 border-none rounded-xl text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer appearance-none"
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.name}>
                    {cls.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <Filter className="h-3 w-3" />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 w-full lg:w-auto mt-2 lg:mt-0">
              <button
                onClick={() => setShowBulkUpload(true)}
                className="flex-1 lg:flex-none inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </button>
              <button
                onClick={() => {
                  setEditingStudent(null);
                  setShowForm(true);
                }}
                className="flex-1 lg:flex-none inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col xl:flex-row gap-6 flex-1 min-h-0">
        {/* Left Side: Table & Pagination */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
            <>
              <StudentTable 
                students={students} 
                loading={loading}
                onEdit={handleEdit} 
                onDelete={handleDelete}
                onView={(student) => console.log("View", student)} 
                selectedIds={selectedIds}
                onSelectionChange={handleSelectionChange}
                className="flex-1"
              />
            </>
        </div>

        {/* Right Side: Animation */}
        <div className="w-full xl:w-96 flex-shrink-0 flex flex-col gap-6">
          <StudentGenderChart />
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
             <Lottie animationData={studentAnimation} loop={true} className="w-48 h-48" />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-200/50 backdrop-blur-sm flex items-center justify-center p-4">
          <StudentForm 
            student={editingStudent} 
            onSuccess={handleFormSuccess} 
            onClose={() => setShowForm(false)} 
          />
        </div>
      )}

      {showBulkUpload && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
             <BulkUpload 
                onSuccess={handleFormSuccess} 
                onClose={() => setShowBulkUpload(false)} 
             />
          </div>
        </div>
      )}
    </div>
  );
}
