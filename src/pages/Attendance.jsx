import { useState } from 'react';
import AttendanceSheet from '../components/attendance/AttendanceSheet';

const CLASSES = ["PG", "Nursery", "Prep", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

export default function Attendance() {
  const [selectedClass, setSelectedClass] = useState('9'); // Default to Class 9
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div className="flex flex-col lg:h-full gap-6">
      {/* Header & Filters */}
      <div className="flex flex-col gap-4 text-slate-900 p-6 rounded-2xl shadow-sm shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Attendance Management</h1>
            <p className="text-sm text-slate-600 mt-1">Mark and view daily class attendance</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* Class Select */}
              <select
                id="class-select"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="block w-full sm:w-40 pl-3 pr-10 py-2 text-sm border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm border"
              >
                {CLASSES.map(cls => (
                  <option key={cls} value={cls}>Class {cls}</option>
                ))}
              </select>
            </div>

            {/* Date Select */}
            <div className="flex flex-col gap-1">
               <label htmlFor="date-select" className="sr-only">Select Date</label>
               <input
                id="date-select"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="block w-full sm:w-40 pl-3 pr-3 py-2 text-sm border-slate-200 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm border"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0">
        <AttendanceSheet selectedClass={selectedClass} selectedDate={selectedDate} />
      </div>
    </div>
  );
}
