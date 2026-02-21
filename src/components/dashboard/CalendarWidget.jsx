import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns';

export default function CalendarWidget() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const startDay = getDay(startOfMonth(currentDate));
  const emptyDays = Array(startDay).fill(null);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800">{format(currentDate, 'MMMM yyyy')}</h3>
        <div className="flex gap-2">
            <button onClick={prevMonth} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={nextMonth} className="p-1 hover:bg-slate-100 rounded-full text-slate-400">
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-xs font-medium text-slate-400 py-1">
                {day}
            </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}
        {days.map(day => (
            <button 
                key={day.toISOString()} 
                className={`
                    h-8 w-8 rounded-full text-sm flex items-center justify-center transition-colors
                    ${isSameDay(day, new Date()) 
                        ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-200' 
                        : 'text-slate-700 hover:bg-slate-100'}
                `}
            >
                {format(day, 'd')}
            </button>
        ))}
      </div>
    </div>
  );
}