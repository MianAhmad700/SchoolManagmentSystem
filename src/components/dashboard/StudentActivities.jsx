import { Crown, Medal, Trophy, MoreHorizontal } from 'lucide-react';

const activities = [
    {
        id: 1,
        title: "Best in Show at Statewide Art Contest",
        description: "Alden Kim created a stunning, mixed-media landscape piece.",
        time: "May 5, 1:30 PM",
        icon: Crown,
        color: "bg-blue-600 text-white"
    },
    {
        id: 2,
        title: "Gold Medal in National Math Olympiad",
        description: "Ethan Wong solved complex problems with outstanding skills.",
        time: "April 10, 10:00 AM",
        icon: Medal,
        color: "bg-[#FCD980] text-slate-900"
    },
    {
        id: 3,
        title: "First Place in Regional Science Fair",
        description: "Sophia Martinez innovated a new water purification system.",
        time: "March 15, 2:00 PM",
        icon: Trophy,
        color: "bg-blue-600 text-white"
    }
];

export default function StudentActivities() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800">Student Activities</h3>
        <button className="text-slate-400 hover:text-slate-600">
            <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      
      <div className="space-y-4">
        {activities.map(activity => (
            <div key={activity.id} className="flex gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${activity.color} shadow-sm`}>
                    <activity.icon className="w-5 h-5" />
                </div>
                <div>
                    <div className="flex justify-between items-start">
                         <h4 className="font-bold text-slate-800 text-sm">{activity.title}</h4>
                         <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{activity.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{activity.description}</p>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}