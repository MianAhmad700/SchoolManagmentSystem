import { MoreHorizontal } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getNotices } from '../../services/notices';

export default function UpcomingEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
        const notices = await getNotices();
        // Use notices as events for now
        const processedEvents = notices.slice(0, 3).map(n => {
            const dateObj = new Date(n.date);
            return {
                id: n.id,
                title: n.title,
                grade: "All Grades", // Default since notices don't have grade
                date: dateObj.getDate(),
                month: dateObj.toLocaleDateString('en-US', { month: 'long' }),
                time: "All Day" // Default
            };
        });
        setEvents(processedEvents);
    } catch (error) {
        console.error("Error fetching events:", error);
    } finally {
        setLoading(false);
    }
  };

  if (loading) {
      return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center h-[300px]">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800">Upcoming Events</h3>
        <button className="text-slate-400 hover:text-slate-600">
            <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      
      <div className="space-y-4">
        {events.length > 0 ? (
            events.map(event => (
                <div key={event.id} className="bg-slate-50 p-4 rounded-xl flex items-start gap-4">
                    <div className="flex-shrink-0 bg-[#FCD980] w-12 h-12 rounded-xl flex flex-col items-center justify-center text-slate-900 shadow-sm">
                        <span className="text-xs font-semibold">{event.month}</span>
                        <span className="text-lg font-bold leading-none">{event.date}</span>
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                             <p className="text-xs text-slate-400 mb-1">{event.time}</p>
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm mb-1 leading-tight">{event.title}</h4>
                        <p className="text-xs text-blue-600 font-medium">{event.grade}</p>
                    </div>
                </div>
            ))
        ) : (
            <div className="text-center text-slate-400 py-4">
                No upcoming events
            </div>
        )}
      </div>
    </div>
  );
}