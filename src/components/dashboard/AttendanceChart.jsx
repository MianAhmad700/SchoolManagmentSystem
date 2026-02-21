import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { getAttendanceRange } from '../../services/attendance';

export default function AttendanceChart() {
  const [filter, setFilter] = useState('Weekly');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
        const today = new Date();
        let startDate = new Date();
        
        if (filter === 'Weekly') {
            // Last 7 days
            startDate.setDate(today.getDate() - 6);
        } else {
            // Last 30 days
            startDate.setDate(today.getDate() - 29);
        }
        
        const startStr = startDate.toISOString().split('T')[0];
        const endStr = today.toISOString().split('T')[0];
        
        const records = await getAttendanceRange(startStr, endStr);
        
        // Fill in missing days
        const chartData = [];
        for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const record = records.find(r => r.date === dateStr);
            
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue
            const dayNum = d.getDate();
            
            chartData.push({
                name: filter === 'Weekly' ? dayName : `${dayNum} ${d.toLocaleDateString('en-US', { month: 'short' })}`,
                present: record ? record.present + record.late : 0, // Counting late as present for simplified view
                absent: record ? record.absent : 0,
                leave: record ? record.leave : 0
            });
        }
        
        setData(chartData);
    } catch (error) {
        console.error("Error fetching attendance chart data:", error);
    } finally {
        setLoading(false);
    }
  };

  if (loading) {
      return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[350px] flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[350px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">Attendance</h3>
        <select 
            className="bg-slate-50 border-none text-sm font-medium text-slate-600 rounded-lg py-1 px-3"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
        >
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
        </select>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FCD980]"></span>
            <span className="text-sm text-slate-500">Present</span>
        </div>
        <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#2F80ED]"></span>
            <span className="text-sm text-slate-500">Absent</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="75%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          barGap={8}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="present" fill="#FCD980" radius={[10, 10, 10, 10]} barSize={12} />
          <Bar dataKey="absent" fill="#2F80ED" radius={[10, 10, 10, 10]} barSize={12} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
