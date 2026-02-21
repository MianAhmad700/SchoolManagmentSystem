import { MoreHorizontal } from 'lucide-react';

const messages = [
    {
        id: 1,
        name: "Alex Campbell",
        message: "Just wanted to check in on how a...",
        time: "2:26 PM",
        avatar: "bg-[#FCD980] text-slate-900"
    },
    {
        id: 2,
        name: "Mrs. Patel",
        message: "Someone left a blue jacket in the...",
        time: "10:32 AM",
        avatar: "bg-[#FCD980] text-slate-900"
    },
    {
        id: 3,
        name: "Coach Daniels",
        message: "Practice canceled today due to...",
        time: "7:10 AM",
        avatar: "bg-[#FCD980] text-slate-900"
    },
    {
        id: 4,
        name: "Jamie Lax",
        message: "Study session reminder for tomor...",
        time: "Yesterday, 8:29 PM",
        avatar: "bg-[#FCD980] text-slate-900"
    }
];

export default function Messages() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800">Messages</h3>
        <button className="text-slate-400 hover:text-slate-600">
            <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
      
      <div className="space-y-6">
        {messages.map(msg => (
            <div key={msg.id} className="flex gap-4 items-center">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${msg.avatar} font-bold text-sm shadow-sm`}>
                    {msg.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                         <h4 className="font-bold text-slate-800 text-sm truncate">{msg.name}</h4>
                         <span className="text-[10px] text-slate-400 whitespace-nowrap">{msg.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{msg.message}</p>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}