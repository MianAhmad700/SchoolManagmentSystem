import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  CalendarCheck, 
  Receipt, 
  ClipboardList, 
  Bell,
  Briefcase,
  BookOpen,
  FileText,
  PenTool
} from 'lucide-react';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Students', href: '/students', icon: Users },
  { name: 'Teachers', href: '/teachers', icon: GraduationCap },
  { name: 'Staff', href: '/staff', icon: Briefcase },
  { name: 'Classes', href: '/classes', icon: BookOpen },
  { name: 'Attendance', href: '/attendance', icon: CalendarCheck },
  { name: 'Finance', href: '/finance', icon: Receipt },
  { name: 'Results', href: '/results', icon: ClipboardList },
  { name: 'Notice', href: '/notices', icon: Bell }, // Renamed from Notices
  { name: 'Daily Diary', href: '/diary', icon: FileText },
  { name: 'Subjects', href: '/subjects', icon: PenTool },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      <div className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white min-h-screen border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center px-8 h-20 shrink-0">
          <div className="flex items-center gap-2">
             <GraduationCap className="h-8 w-8 text-blue-600" />
             <span className="text-xl font-bold text-slate-800 tracking-tight">School Management</span>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col py-6 overflow-y-auto px-4">
          <nav className="flex-1 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => onClose && onClose()} 
                  className={clsx(
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600',
                    'group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200'
                  )}
                >
                  <item.icon
                    className={clsx(
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600',
                      'mr-3 flex-shrink-0 h-5 w-5 transition-colors'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-6 shrink-0">
          <div className="bg-slate-50 rounded-xl p-4">
             <p className="text-xs text-slate-500 font-medium">Admin Panel</p>
             <p className="text-[10px] text-slate-400 mt-1">© 2026 All Rights Reserved</p>
          </div>
        </div>
      </div>
    </>
  );
}
