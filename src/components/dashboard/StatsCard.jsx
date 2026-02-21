import { cn } from '../../lib/utils';
import { ArrowUpRight } from 'lucide-react';

export default function StatsCard({ title, value, icon: Icon, color = "yellow" }) {
  const colorStyles = {
    yellow: "bg-[#FCD980] text-slate-900", // Yellowish Orange
    blue: "bg-[#2F80ED] text-white", // Bright Blue
    green: "bg-[#27AE60] text-white", // Green
    red: "bg-[#EB5757] text-white", // Red
    white: "bg-white text-slate-900 border border-slate-100"
  };

  const iconColorStyles = {
    yellow: "text-slate-900",
    blue: "text-white",
    green: "text-white",
    red: "text-white",
    white: "text-blue-600"
  };

  return (
    <div className={cn("rounded-2xl p-6 relative overflow-hidden transition-all hover:shadow-lg", colorStyles[color])}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-4xl font-bold tracking-tight">{value}</h3>
        <div className={cn("p-2 rounded-full border border-current opacity-60", iconColorStyles[color])}>
          <ArrowUpRight className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-center gap-2">
         <p className="font-medium text-lg opacity-90">{title}</p>
      </div>
      
      {/* Decorative Icon Watermark */}
      <Icon className="absolute -bottom-4 -right-4 w-24 h-24 opacity-10 rotate-12" />
    </div>
  );
}
