import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import { useState, useEffect } from 'react';
import { getAllStudents } from '../../services/students';

const COLORS = ['#FCD980', '#2F80ED']; // Yellow (Girls), Blue (Boys)

const CLASSES = [
    "PG", "Nursery", "Prep", 
    "1", "2", "3", "4", "5", 
    "6", "7", "8", "9", "10"
];

export default function StudentGenderChart() {
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [data, setData] = useState([
    { name: 'Girls', value: 0 },
    { name: 'Boys', value: 0 },
  ]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const students = await getAllStudents(); // Fetch all students
        
        // Filter by class if selected
        const filteredStudents = selectedClass === "All Classes" 
          ? students 
          : students.filter(s => s.classId === selectedClass);

        const boys = filteredStudents.filter(s => s.gender === 'Male').length;
        const girls = filteredStudents.filter(s => s.gender === 'Female').length;
        
        setData([
          { name: 'Girls', value: girls },
          { name: 'Boys', value: boys },
        ]);
        setTotal(boys + girls);

      } catch (error) {
        console.error("Error fetching student stats:", error);
      }
    };

    fetchData();
  }, [selectedClass]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[350px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800">Students</h3>
        <select 
            className="bg-slate-50 border-none text-sm font-medium text-slate-600 rounded-lg py-1 px-3"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
        >
            <option value="All Classes">All Classes</option>
            {CLASSES.map(cls => (
                <option key={cls} value={cls}>Class {cls}</option>
            ))}
        </select>
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