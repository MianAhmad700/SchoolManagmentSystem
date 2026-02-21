import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Plus, Trash2 } from "lucide-react";
import { getAllClasses } from "../services/classes";
import { addSubject, getAllSubjects, getSubjectsByClass, deleteSubject } from "../services/subjects";

export default function Subjects() {
  const { register, handleSubmit, reset } = useForm();
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filterClass, setFilterClass] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClasses();
    loadSubjects();
  }, []);

  useEffect(() => {
    if (filterClass) {
      loadSubjectsByClass(filterClass);
    } else {
      loadSubjects();
    }
  }, [filterClass]);

  const loadClasses = async () => {
    try {
      const data = await getAllClasses();
      setClasses(data);
    } catch (error) {
      console.error("Failed to load classes", error);
      toast.error("Failed to load classes");
    }
  };

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const data = await getAllSubjects();
      setSubjects(data);
    } catch (error) {
      console.error("Failed to load subjects", error);
      toast.error(`Failed to load subjects: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const loadSubjectsByClass = async (classId) => {
    try {
      setLoading(true);
      const data = await getSubjectsByClass(classId);
      setSubjects(data);
    } catch (error) {
      console.error("Failed to load subjects", error);
      toast.error(`Failed to load subjects: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values) => {
    if (!values.subjectName || !values.classId) {
      toast.warn("Enter subject name and select a class");
      return;
    }
    try {
      setLoading(true);
      await addSubject({
        subjectName: values.subjectName.trim(),
        classId: values.classId
      });
      toast.success("Subject added");
      reset({ subjectName: "", classId: "" });
      if (filterClass) {
        loadSubjectsByClass(filterClass);
      } else {
        loadSubjects();
      }
    } catch (error) {
      console.error("Add subject error", error);
      toast.error(error.message || "Failed to add subject");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSubject(id);
      toast.success("Subject deleted");
      if (filterClass) {
        loadSubjectsByClass(filterClass);
      } else {
        loadSubjects();
      }
    } catch (error) {
      console.error("Delete subject error", error);
      toast.error("Failed to delete subject");
    }
  };

  const classLabel = (cid) => {
    const found = classes.find(c => c.name === cid || c.value === cid);
    return found ? found.label : cid;
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Subjects Management</h1>
          <p className="text-sm text-slate-600 mt-1">Add and associate subjects with classes</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={filterClass}
              onChange={e => setFilterClass(e.target.value)}
              className="block w-56 pl-3 pr-10 py-2 border border-blue-100 rounded-xl text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="">All Classes</option>
              {classes.map(c => (
                <option key={c.id} value={c.name || c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Add Subject</h3>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700">Subject Name</label>
                <input
                  type="text"
                  {...register("subjectName")}
                  placeholder="e.g., Mathematics"
                  className="mt-1 block w-full px-3 py-2 text-base bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm rounded-lg transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700">Class</label>
                <select
                  {...register("classId")}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm rounded-lg transition-all"
                >
                  <option value="">Select Class</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.name || c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Subjects List</h3>
            </div>
            <div className="p-6">
              {loading ? (
                <p className="text-slate-500">Loading...</p>
              ) : subjects.length === 0 ? (
                <p className="text-slate-500">No subjects found.</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-blue-600">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Class</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {subjects.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50 transition-colors even:bg-slate-50/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{s.subjectName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{classLabel(s.classId)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => handleDelete(s.id)}
                              className="inline-flex items-center px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
