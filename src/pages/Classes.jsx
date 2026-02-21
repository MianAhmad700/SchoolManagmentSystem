import { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'react-toastify';
import Lottie from 'lottie-react';
import { getAllClasses, addClass, deleteClass } from '../services/classes';
import teacherAnimation from '../assets/animations/Teacher.json';

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newClass, setNewClass] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const data = await getAllClasses();
      setClasses(data);
    } catch (error) {
      toast.error("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newClass.trim()) return;

    setAdding(true);
    try {
      await addClass(newClass.trim());
      toast.success("Class added successfully");
      setNewClass('');
      fetchClasses();
    } catch (error) {
      toast.error(error.message || "Failed to add class");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id, isDefault) => {
    if (isDefault) {
      toast.warning("Cannot delete default classes");
      return;
    }
    
    if (window.confirm("Are you sure you want to delete this class?")) {
      try {
        await deleteClass(id);
        toast.success("Class deleted successfully");
        fetchClasses();
      } catch (error) {
        toast.error("Failed to delete class");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Class Management</h1>
          <p className="text-sm text-slate-500 mt-1">Add and manage school classes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Add Class Form */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <Plus className="h-5 w-5 mr-2 text-blue-600" />
              Add New Class
            </h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Class Name</label>
                <input
                  type="text"
                  value={newClass}
                  onChange={(e) => setNewClass(e.target.value)}
                  placeholder="e.g. 11, O-Level"
                  className="block w-full rounded-xl border-slate-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
                />
              </div>
              <button
                type="submit"
                disabled={adding || !newClass.trim()}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {adding ? 'Adding...' : 'Add Class'}
              </button>
            </form>
          </div>

          {/* Teacher Animation */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mt-6 flex items-center justify-center">
            <Lottie animationData={teacherAnimation} loop={true} className="w-full h-auto max-h-64" />
          </div>
        </div>

        {/* Class List */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                Available Classes
              </h3>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="p-4">
                {classes.length === 0 ? (
                  <p className="p-6 text-center text-slate-500">No classes found.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classes.map((cls) => (
                      <div key={cls.id} className="p-4 flex items-center justify-between bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${cls.isDefault ? 'bg-white text-slate-600 border border-slate-200' : 'bg-blue-100 text-blue-600 border border-blue-200'}`}>
                            {cls.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{cls.label}</p>
                            {cls.isDefault && <span className="text-xs text-slate-500">Default</span>}
                          </div>
                        </div>
                        
                        {!cls.isDefault && (
                          <button
                            onClick={() => handleDelete(cls.id, cls.isDefault)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete Class"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
