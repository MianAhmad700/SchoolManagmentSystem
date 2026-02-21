import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Save, Search } from 'lucide-react';
import { getStudentsByClass } from '../../services/students';
import { saveSubjectResults, getSubjectResults, getExams } from '../../services/results';
import { getAllClasses } from '../../services/classes';
import { getSubjectsByClass } from '../../services/subjects';

const DEFAULT_SUBJECTS = ["Math", "English", "Urdu", "Science", "Physics", "Chemistry", "Biology", "Computer", "Islamiyat", "Pak Studies"];

export default function ResultEntry() {
  const { register, handleSubmit, watch, setValue } = useForm();
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [marks, setMarks] = useState({});
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);

  const selectedClass = watch("classId");
  const selectedExam = watch("examName");
  const selectedSubject = watch("subject");

  useEffect(() => {
    loadExams();
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadSubjects(selectedClass);
    } else {
      setSubjects(DEFAULT_SUBJECTS);
    }
  }, [selectedClass]);

  const loadSubjects = async (classId) => {
    try {
      const list = await getSubjectsByClass(classId);
      if (list.length > 0) {
        setSubjects(list.map(s => s.subjectName));
      } else {
        setSubjects(DEFAULT_SUBJECTS);
      }
    } catch {
      setSubjects(DEFAULT_SUBJECTS);
    }
  };

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
    try {
        const data = await getExams();
        setExams(data);
    } catch (error) {
        console.error("Failed to load exams", error);
        toast.error(`Failed to load exams: ${error.message}`);
    }
  };

  useEffect(() => {
    if (selectedClass && selectedExam && selectedSubject) {
      loadData();
    }
  }, [selectedClass, selectedExam, selectedSubject]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load Students
      const studentsData = await getStudentsByClass(selectedClass);
      studentsData.sort((a, b) => a.name.localeCompare(b.name));
      setStudents(studentsData);

      // 2. Load existing results
      const existing = await getSubjectResults(selectedExam, selectedClass, selectedSubject);
      
      const initialMarks = {};
      if (existing && existing.records) {
        // Populate existing marks
        Object.keys(existing.records).forEach(sid => {
            initialMarks[sid] = existing.records[sid];
        });
        setValue("maxMarks", existing.maxMarks);
      } else {
        // Initialize empty
        studentsData.forEach(s => {
            initialMarks[s.id] = '';
        });
      }
      setMarks(initialMarks);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (studentId, val) => {
    setMarks(prev => ({
        ...prev,
        [studentId]: val
    }));
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
        await saveSubjectResults(
            data.examName,
            data.classId,
            data.subject,
            Number(data.maxMarks),
            marks
        );
        toast.success("Results saved successfully");
    } catch (error) {
        console.error(error);
        toast.error("Failed to save results");
    } finally {
        setSaving(false);
    }
  };

  // Filter exams based on selected class (if a class is selected)
  const availableExams = selectedClass 
    ? exams.filter(e => e.classes && e.classes.includes(selectedClass))
    : exams;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 bg-white border-b border-slate-200">
        <h3 className="text-lg font-bold text-slate-800">Enter Exam Results</h3>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
                <label className="block text-sm font-semibold text-slate-700">Class</label>
                <select
                    {...register("classId", { required: true })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm rounded-lg transition-all"
                >
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.name}>{c.label}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-700">Exam Name</label>
                <select
                    {...register("examName", { required: true })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm rounded-lg transition-all disabled:opacity-50 disabled:bg-slate-100"
                    disabled={!selectedClass}
                >
                    <option value="">Select Exam</option>
                    {availableExams.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
                </select>
                {!selectedClass && <p className="text-xs text-slate-500 mt-1">Select class first</p>}
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-700">Subject</label>
                <select
                    {...register("subject", { required: true })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm rounded-lg transition-all"
                >
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-semibold text-slate-700">Max Marks</label>
                <input
                    type="number"
                    {...register("maxMarks", { required: true })}
                    className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all"
                    placeholder="e.g. 100"
                />
            </div>
        </div>

        {selectedClass && selectedExam && selectedSubject && (
            <div className="mt-8">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                        <p className="mt-2 text-slate-500">Loading student list...</p>
                    </div>
                ) : students.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                        No students found in this class.
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-lg border border-slate-200">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-blue-600">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Roll No</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Student Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Obtained Marks</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {students.map(student => (
                                    <tr key={student.id} className="hover:bg-slate-50 transition-colors even:bg-slate-50/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">{student.rollNo}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{student.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input 
                                                type="number"
                                                value={marks[student.id] || ''}
                                                onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                                className="block w-32 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all"
                                                placeholder="Marks"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        )}

        <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
                type="submit"
                disabled={saving || !selectedClass || students.length === 0}
                className="inline-flex items-center px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
                {saving ? 'Saving...' : (
                    <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Results
                    </>
                )}
            </button>
        </div>
      </form>
    </div>
  );
}
