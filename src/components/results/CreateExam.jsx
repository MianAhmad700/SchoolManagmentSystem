import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Plus, Trash2, Loader2, Save } from 'lucide-react';
import { createExam, getExams, deleteExam } from '../../services/results';
import { getAllClasses } from '../../services/classes';

export default function CreateExam() {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    loadExams();
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const classesData = await getAllClasses();
      setClasses(classesData);
    } catch (error) {
      console.error("Failed to load classes", error);
      toast.error("Failed to load classes");
    }
  };

  const loadExams = async () => {
    setLoading(true);
    try {
      const data = await getExams();
      setExams(data);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to load exams: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      // If "All Classes" is selected (implied if logic changes, but currently strictly specific classes)
      // The user wants to "create a new exam for specific classes"
      
      await createExam({
        name: data.examName,
        classes: data.classes, // Array of class strings
        createdAt: new Date().toISOString()
      });
      
      toast.success("Exam created successfully");
      reset();
      loadExams();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create exam");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exam? This might affect existing results.")) return;
    
    try {
      await deleteExam(id);
      toast.success("Exam deleted successfully");
      loadExams();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete exam");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-white border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">Create New Exam</h3>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700">Exam Name</label>
            <input
              type="text"
              {...register("examName", { required: true })}
              className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="e.g. First Term 2024"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Select Classes</label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {classes.map(cls => (
                <label key={cls.id} className="inline-flex items-center space-x-2 cursor-pointer p-3 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all">
                  <input
                    type="checkbox"
                    value={cls.name}
                    {...register("classes", { required: true })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                  />
                  <span className="text-sm font-medium text-slate-700">{cls.label}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">Select the classes for which this exam is applicable.</p>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Creating...
                  </>
              ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Exam
                  </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-white border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">Existing Exams</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-blue-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Exam Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Applicable Classes</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr>
                    <td colSpan="3" className="px-6 py-12 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                      <p className="mt-2 text-slate-500">Loading exams...</p>
                    </td>
                </tr>
              ) : exams.length === 0 ? (
                <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-sm text-slate-500">No exams created yet.</td>
                </tr>
              ) : (
                exams.map(exam => (
                  <tr key={exam.id} className="hover:bg-slate-50 transition-colors even:bg-slate-50/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{exam.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      <div className="flex flex-wrap gap-1">
                        {exam.classes && exam.classes.sort().map(c => (
                            <span key={c} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {c}
                            </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(exam.id)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
}
