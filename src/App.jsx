import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/layout/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Staff from './pages/Staff';
import Classes from './pages/Classes';
import Attendance from './pages/Attendance';
import Finance from './pages/Finance';
import Results from './pages/Results';
import Notices from './pages/Notices';
import DailyDiary from './pages/DailyDiary';
import Subjects from './pages/Subjects';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="teachers" element={<Teachers />} />
            <Route path="staff" element={<Staff />} />
            <Route path="classes" element={<Classes />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="finance" element={<Finance />} />
            <Route path="results" element={<Results />} />
            <Route path="notices" element={<Notices />} />
            <Route path="diary" element={<DailyDiary />} />
            <Route path="subjects" element={<Subjects />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}

export default App;
