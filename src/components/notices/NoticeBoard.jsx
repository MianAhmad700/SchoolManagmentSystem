import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Trash2, Bell, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { addNotice, getNotices, deleteNotice } from '../../services/notices';
import { cn } from '../../lib/utils';

export default function NoticeBoard() {
  const [notices, setNotices] = useState([]);
  const { register, handleSubmit, reset } = useForm();
  const [loading, setLoading] = useState(false);

  const fetchNotices = async () => {
    try {
      const data = await getNotices();
      setNotices(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await addNotice({
        ...data,
        active: true
      });
      toast.success("Notice published");
      reset();
      fetchNotices();
    } catch (error) {
      toast.error("Failed to publish notice");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this notice?")) {
      try {
        await deleteNotice(id);
        toast.success("Notice deleted");
        fetchNotices();
      } catch (error) {
        toast.error("Failed to delete notice");
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Create Notice */}
      <div className="bg-white rounded-lg shadow p-6 h-fit">
        <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center">
          <Bell className="h-5 w-5 mr-2 text-blue-600" />
          Create Notice
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Title</label>
            <input
              {...register("title", { required: true })}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              placeholder="e.g. Summer Vacation Announcement"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Content</label>
            <textarea
              {...register("content", { required: true })}
              rows={4}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              placeholder="Write the details here..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Date</label>
              <input
                type="date"
                {...register("date", { required: true })}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Type</label>
              <select
                {...register("type")}
                className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              >
                <option value="General">General</option>
                <option value="Holiday">Holiday</option>
                <option value="Exam">Exam</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Publish Notice
          </button>
        </form>
      </div>

      {/* Notice List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4">Recent Notices</h3>
        <div className="space-y-4 max-h-[600px] overflow-y-auto">
          {notices.length === 0 ? (
            <p className="text-center text-slate-500">No notices found</p>
          ) : (
            notices.map((notice) => (
              <div 
                key={notice.id} 
                className={cn(
                  "border-l-4 p-4 rounded bg-slate-50 relative group",
                  notice.type === 'Emergency' ? "border-red-500" :
                  notice.type === 'Holiday' ? "border-green-500" :
                  notice.type === 'Exam' ? "border-yellow-500" :
                  "border-blue-500"
                )}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-800">{notice.title}</h4>
                    <p className="text-xs text-slate-500 flex items-center mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(notice.date).toLocaleDateString()}
                      <span className="mx-2">•</span>
                      <span className="uppercase text-xs font-semibold">{notice.type}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(notice.id)}
                    className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">{notice.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
