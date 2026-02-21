import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import { useState, useEffect } from 'react';
import { getAllTeachers } from '../../services/teachers';

const COLORS = ['#FCD980', '#2F80ED']; // Yellow (Girls), Blue (Boys)

export default function TeacherStatsChart() {
  const [data, setData] = useState([
    { name: 'Girls', value: 0 },
    { name: 'Boys', value: 0 },
  ]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const teachers = await getAllTeachers();  
        
        // Count Male and Female
        const boys = teachers.filter(t => t.gender === 'Male').length;
        const girls = teachers.filter(t => t.gender === 'Female').length;
        
        // If gender is not present, we might have 0 and 0. 
        // We should just show what we have.
        
        setData([
          { name: 'Girls', value: girls },
          { name: 'Boys', value: boys },
        ]);
        setTotal(boys + girls);

      } catch (error) {
        console.error("Error fetching teacher stats:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[350px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">Teachers</h3>
      </div>

      <div className="relative h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={0}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                stroke="none"
            >
                {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
                <Label 
                    value="Total" 
                    position="center" 
                    dy={-10} 
                    className="fill-slate-400 text-xs font-medium"
                />
                <Label 
                    value={total} 
                    position="center" 
                    dy={15} 
                    className="fill-slate-800 text-3xl font-bold"
                />
            </Pie>
            </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-center gap-8 mt-4">
        {data.map((entry, index) => (
            <div key={index} className="text-center">
                <div className="flex items-center gap-2 justify-center mb-1">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></span>
                    <span className="text-slate-400 text-sm">{entry.name}</span>
                </div>
                <p className="text-xl font-bold text-slate-800">{entry.value}</p>
            </div>
        ))}
      </div>
    </div>
  );
}
