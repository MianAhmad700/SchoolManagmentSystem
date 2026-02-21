import { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  UserCheck,
  Trophy
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import StatsCard from '../components/dashboard/StatsCard';
import RevenueChart from '../components/dashboard/RevenueChart'; // Now Area Chart
import AttendanceChart from '../components/dashboard/AttendanceChart'; // Now Bar Chart
import StudentGenderChart from '../components/dashboard/StudentGenderChart'; // New Donut Chart
import CalendarWidget from '../components/dashboard/CalendarWidget';
import UpcomingEvents from '../components/dashboard/UpcomingEvents';
import NoticeBoard from '../components/dashboard/NoticeBoard';
import { formatCurrency } from '../lib/utils';

export default function Dashboard() {
  const [stats, setStats] = useState([
    {
      title: "Students",
      value: "...",
      icon: Users,
      color: "yellow"
    },
    {
      title: "Teachers",
      value: "...",
      icon: GraduationCap,
      color: "yellow"
    },
    {
      title: "Staffs",
      value: "...",
      icon: UserCheck,
      color: "blue"
    }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // 1. Students Count
      const studentsSnap = await getDocs(collection(db, 'students'));
      const studentCount = studentsSnap.size;

      // 2. Teachers Count
      const teachersSnap = await getDocs(collection(db, 'teachers'));
      const teacherCount = teachersSnap.size;

      // 3. Staff Count
      const staffSnap = await getDocs(collection(db, 'staff'));
      const staffCount = staffSnap.size;

      setStats([
        {
          title: "Students",
          value: studentCount.toString(),
          icon: Users,
          color: "yellow"
        },
        {
          title: "Teachers",
          value: teacherCount.toString(),
          icon: GraduationCap,
          color: "yellow"
        },
        {
          title: "Staffs",
          value: staffCount.toString(),
          icon: UserCheck,
          color: "blue"
        }
      ]);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-screen">
      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Charts Row 1: Students (Donut) & Earnings (Area) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StudentGenderChart />
          <RevenueChart />
        </div>

        {/* Charts Row 2: Attendance (Bar) & Notice Board */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AttendanceChart />
          <NoticeBoard />
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
        <CalendarWidget />
        <UpcomingEvents />
      </div>
    </div>
  );
}
