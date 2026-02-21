import { Image, MoreHorizontal, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getNotices } from '../../services/notices';

export default function NoticeBoard() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('Latest');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
        const fetchedNotices = await getNotices();
        // Add random views if not present or handle it
        const processed = fetchedNotices.map(n => ({
            ...n,
            views: n.views || Math.floor(Math.random() * 500) + 100, // Dummy views if not in DB
            color: "bg-[#FCD980] text-slate-900", // Default styling
            formattedDate: new Date(n.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }));
        setNotices(processed);
    } catch (error) {
        console.error("Failed to load notices", error);
    } finally {
        setLoading(false);
    }
  };

  const sortedNotices = [...notices].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'Latest' ? dateB - dateA : dateA - dateB;
  });

  if (loading) {
      return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800">Notice Board</h3>
        <select 
            className="bg-slate-50 border-none text-xs font-medium text-slate-600 rounded-lg py-1 px-2"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
        >
            <option value="Latest">Latest</option>
            <option value="Oldest">Oldest</option>
        </select>
      </div>
      
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {sortedNotices.length > 0 ? (
            sortedNotices.map(notice => (
                <div key={notice.id} className="group">
                    <div className="flex gap-4 mb-2">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${notice.color} shadow-sm`}>
                            <Image className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm truncate">{notice.title}</h4>
                                    <p className="text-[10px] text-slate-400">by {notice.author || 'Admin'}</p>
                                </div>
                                <span className="text-[10px] text-slate-400 whitespace-nowrap">{notice.formattedDate}</span>
                            </div>
                        </div>
                    </div>
                    {notice.description && (
                        <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg leading-relaxed mb-2">
                            {notice.description}
                        </p>
                    )}
                    <div className="flex items-center justify-end gap-4 text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{notice.views}</span>
                        </div>
                        <MoreHorizontal className="w-3 h-3 cursor-pointer" />
                    </div>
                </div>
            ))
        ) : (
            <div className="text-center text-slate-400 py-10">
                No notices available
            </div>
        )}
      </div>
    </div>
  );
}