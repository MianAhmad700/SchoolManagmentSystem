import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Save, Plus, Printer, Download } from "lucide-react";
import { getAllClasses } from "../services/classes";
import { getSubjectsByClass, addSubject as addSubjectRecord } from "../services/subjects";
import { addDiaryEntry, getDiaryEntriesByClassAndDate } from "../services/diary";
import { generateClassDiaryPdf, generateBulkDiaryPdf } from "../utils/pdfGenerator";

const DEFAULT_SUBJECTS = ["Math", "English", "Urdu", "Science", "Computer", "Islamiyat", "Pak Studies"];

export default function DailyDiary() {
  const { register, handleSubmit, reset } = useForm();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0, 10));
  const [subjects, setSubjects] = useState(DEFAULT_SUBJECTS);
  const [newSubject, setNewSubject] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [selectedBulkClasses, setSelectedBulkClasses] = useState([]);

  useEffect(() => {
    getAllClasses().then(setClasses).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedClass && dateStr) {
      fetchEntries(selectedClass, dateStr);
      fetchSubjects(selectedClass);
    } else {
      setEntries([]);
      setSubjects(DEFAULT_SUBJECTS);
    }
  }, [selectedClass, dateStr]);

  const fetchSubjects = async (cls) => {
    try {
      const list = await getSubjectsByClass(cls);
      if (list.length > 0) {
        setSubjects(list.map(s => s.subjectName));
      }
    } catch (error) {
      // keep defaults on error
    }
  };

  const fetchEntries = async (cls, date) => {
    try {
      setLoading(true);
      const data = await getDiaryEntriesByClassAndDate(cls, date);
      setEntries(data);
    } catch (error) {
      console.error("Diary load error:", error);
      toast.error(`Failed to load diary entries: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values) => {
    if (!selectedClass) {
      toast.warn("Please select a class");
      return;
    }
    if (!values.subject) {
      toast.warn("Please select a subject");
      return;
    }
    if (!values.text) {
      toast.warn("Please enter diary details");
      return;
    }
    try {
      setLoading(true);
      await addDiaryEntry({
        classId: selectedClass,
        subject: values.subject,
        text: values.text,
        date: dateStr
      });
      toast.success("Diary saved");
      reset({ subject: "", text: "" });
      fetchEntries(selectedClass, dateStr);
    } catch (error) {
      console.error("Diary save error:", error);
      toast.error(`Failed to save diary: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async () => {
    const s = newSubject.trim();
    if (!s) return;
    try {
      await addSubjectRecord({ subjectName: s, classId: selectedClass });
      toast.success("Subject added");
      fetchSubjects(selectedClass);
    } catch (error) {
      toast.error(error.message || "Failed to add subject");
      return;
    }
    setNewSubject("");
  };

  const classLabel = (() => {
    const found = classes.find(c => c.name === selectedClass || c.value === selectedClass);
    return found ? found.label : selectedClass;
  })();

  const handlePdf = async () => {
    if (!selectedClass || !dateStr) {
      toast.warn("Select class and date");
      return;
    }
    try {
      const data = await getDiaryEntriesByClassAndDate(selectedClass, dateStr);
      if (data.length === 0) {
        toast.info("No diary entries to export");
        return;
      }
      generateClassDiaryPdf({
        classLabel: classLabel || selectedClass,
        dateStr,
        entries: data
      });
    } catch (error) {
      console.error("Diary PDF error:", error);
      toast.error(`Failed to generate PDF: ${error.message || 'Unknown error'}`);
    }
  };

  const handleBulkPdf = async () => {
    if (!selectedBulkClasses.length || !dateStr) {
      toast.warn("Select at least one class and a date");
      return;
    }
    setBulkLoading(true);
    try {
      const items = [];
      for (const cid of selectedBulkClasses) {
        const c = classes.find(x => x.name === cid || x.value === cid);
        const label = c ? c.label : cid;
        let list = [];
        try {
          list = await getDiaryEntriesByClassAndDate(cid, dateStr);
        } catch {
          list = [];
        }
        items.push({ classLabel: label, entries: list });
      }
      generateBulkDiaryPdf({
        dateStr,
        items
      });
      toast.success("Bulk diary PDF generated");
    } catch {
      toast.error("Failed to generate bulk diary PDF");
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Daily Diary</h1>
          <p className="text-sm text-slate-500 mt-1">Manage class-wise daily diary entries</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePdf}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Filters</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700">Class</label>
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm rounded-lg transition-all"
                >
                  <option value="">Select Class</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.name || c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700">Date</label>
                <input
                  type="date"
                  value={dateStr}
                  onChange={e => setDateStr(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-3 py-2 text-base bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm rounded-lg transition-all"
                />
              </div>
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 mb-2">Bulk Print</h4>
                <div className="max-h-44 overflow-y-auto pr-1 space-y-2">
                  {classes.map(c => {
                    const cid = c.name || c.value;
                    const checked = selectedBulkClasses.includes(cid);
                    return (
                      <label key={c.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const val = e.target.checked;
                            if (val) {
                              setSelectedBulkClasses(prev => [...new Set([...prev, cid])]);
                            } else {
                              setSelectedBulkClasses(prev => prev.filter(x => x !== cid));
                            }
                          }}
                        />
                        <span>{c.label}</span>
                      </label>
                    );
                  })}
                </div>
                <button
                  onClick={handleBulkPdf}
                  disabled={bulkLoading || selectedBulkClasses.length === 0}
                  className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 disabled:opacity-50 transition-colors"
                >
                  {bulkLoading ? (
                    <>
                      <span className="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Printing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Print All Classes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Add Diary Entry</h3>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Subject</label>
                  <select
                    {...register("subject")}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm rounded-lg transition-all"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700">Add Subject</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSubject}
                      onChange={e => setNewSubject(e.target.value)}
                      placeholder="e.g., Arts"
                      className="flex-1 mt-1 block w-full pl-3 pr-3 py-2 text-base bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm rounded-lg transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleAddSubject}
                      className="mt-1 inline-flex items-center px-3 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700">Diary Details</label>
                <textarea
                  {...register("text")}
                  rows={5}
                  placeholder="Write the diary for selected subject..."
                  className="mt-1 block w-full px-3 py-2 text-base bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm rounded-lg transition-all"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Diary
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Diary Entries</h3>
              <button
                onClick={handlePdf}
                className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-colors"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </button>
            </div>
            <div className="p-6">
              {loading ? (
                <p className="text-slate-500">Loading...</p>
              ) : entries.length === 0 ? (
                <p className="text-slate-500">No entries for selected class and date.</p>
              ) : (
                <div className="space-y-4">
                  {entries.map(e => (
                    <div key={e.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-slate-700">{e.subject}</span>
                        <span className="text-xs text-slate-500">{e.date}</span>
                      </div>
                      <p className="mt-2 text-slate-800 text-sm whitespace-pre-line">{e.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
