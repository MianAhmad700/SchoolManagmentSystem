import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Menu, Search, Mic, Bell, User, ChevronDown } from 'lucide-react';

export default function Navbar({ onMenuClick }) {
  const { logout, currentUser } = useAuth();
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2024-2025');
  const years = ['2023-2024', '2024-2025', '2025-2026' ,'2026-2027'];

  return (
    <div className="bg-white h-20 flex items-center justify-between px-4 md:px-8 border-b border-slate-100">
      {/* Left: Page Title Placeholder (Or Breadcrumbs) - For now just hidden on mobile/desktop as Sidebar handles nav */}
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="text-slate-500 hover:text-slate-700 md:hidden mr-4 p-2"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 hidden md:block">Dashboard</h2>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-2xl px-8">
        <div className="relative">

        </div>
      </div>

      {/* Right: Profile & Actions */}
      <div className="flex items-center gap-6">
        <div className="relative">
         
          
          {isYearOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => {
                    setSelectedYear(year);
                    setIsYearOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors ${
                    selectedYear === year ? 'text-blue-600 font-medium' : 'text-slate-600'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">Admin User</p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
          <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 border-2 border-white shadow-sm">
             <User className="h-6 w-6" />
          </div>
          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
