import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { GraduationCap, Mail, Lock, ArrowRight, Loader2, BookOpen, PenTool, Calculator, Microscope, Globe, Palette } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(email, password);
      navigate('/');
      toast.success('Logged in successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to log in: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Educational Floating Icons Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        {/* Abstract Blobs */}
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-400/10 blur-3xl"></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-slate-300/20 blur-3xl"></div>
        <div className="absolute -bottom-[10%] -right-[5%] w-[35%] h-[35%] rounded-full bg-blue-500/10 blur-3xl"></div>

        {/* Floating Icons */}
        <div className="absolute top-[15%] left-[10%] animate-float-slow opacity-20 text-blue-600">
            <BookOpen className="w-12 h-12" />
        </div>
        <div className="absolute top-[25%] right-[15%] animate-float-medium opacity-20 text-slate-500">
            <Calculator className="w-10 h-10" />
        </div>
        <div className="absolute bottom-[20%] left-[15%] animate-float-fast opacity-20 text-blue-500">
            <Microscope className="w-14 h-14" />
        </div>
        <div className="absolute bottom-[30%] right-[10%] animate-float-slow opacity-15 text-slate-600">
            <PenTool className="w-10 h-10" />
        </div>
        <div className="absolute top-[40%] left-[5%] animate-float-medium opacity-15 text-blue-400">
            <Globe className="w-8 h-8" />
        </div>
        <div className="absolute bottom-[10%] left-[40%] animate-float-fast opacity-15 text-slate-400">
            <Palette className="w-12 h-12" />
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-float-slow {
          animation: float 8s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-8 relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-2xl shadow-lg flex items-center justify-center transform rotate-3 hover:rotate-6 transition-transform duration-300">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-slate-800 tracking-tight">
            Welcome
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
             Sign in to Riphah Public School Portal
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative group">
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative group">
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center text-sm">
             <div className="flex items-center">
               <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
               <label htmlFor="remember-me" className="ml-2 block text-slate-600">Remember me</label>
             </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform hover:-translate-y-0.5 transition-all duration-200"
          >
            {loading ? (
                <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Signing in...
                </>
            ) : (
                <>
                    Sign in
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
             <p className="text-xs text-slate-400">
                &copy; {new Date().getFullYear()} SMSP. All rights reserved.
             </p>
        </div>
      </div>
    </div>
  );
}
