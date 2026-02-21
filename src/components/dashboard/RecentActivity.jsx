import { format } from 'date-fns';
import { UserPlus, CreditCard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getAllStudents } from '../../services/students';
import { getAllFees } from '../../services/finance';

export default function RecentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
        const [students, fees] = await Promise.all([
            getAllStudents(),
            getAllFees()
        ]);

        const studentActivities = students.map(s => ({
            id: `student-${s.id}`,
            title: "New Student Joined",
            description: `${s.name} joined Class ${s.classId}`,
            time: s.createdAt ? new Date(s.createdAt) : new Date(),
            icon: UserPlus,
            color: "bg-[#FCD980] text-slate-900",
            type: 'student'
        }));

        const feeActivities = fees.map(f => ({
            id: `fee-${f.id}`,
            title: "Fee Payment Received",
            description: `Received ${f.amount || f.paid} from ${f.studentName || 'Student'}`,
            time: f.createdAt && f.createdAt.toDate ? f.createdAt.toDate() : (f.createdAt ? new Date(f.createdAt) : new Date()),
            icon: CreditCard,
            color: "bg-[#2F80ED] text-white",
            type: 'fee'
        }));

        const allActivities = [...studentActivities, ...feeActivities]
            .sort((a, b) => b.time - a.time)
            .slice(0, 5);

        setActivities(allActivities);
    } catch (error) {
        console.error("Error fetching activities:", error);
    } finally {
        setLoading(false);
    }
  };

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
        <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
        <button className="text-blue-600 text-sm font-semibold hover:underline">View All</button>
      </div>
      
      <div className="space-y-6">
        {activities.length > 0 ? (
            activities.map((activity) => (
                <div key={activity.id} className="flex gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${activity.color} shadow-sm`}>
                        <activity.icon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800 leading-snug">
                            {activity.title}, <span className="font-normal text-slate-500">{activity.description}</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            {format(activity.time, 'MMM d, h:mm a')}
                        </p>
                    </div>
                </div>
            ))
        ) : (
            <div className="text-center text-slate-400 py-10">
                No recent activity
            </div>
        )}
      </div>
    </div>
  );
}
