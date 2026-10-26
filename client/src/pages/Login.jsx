import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const msg = !err.response 
        ? 'Network error: Unable to connect to server. Please check your connection.'
        : (err.response?.data?.message || 'Failed to login');
      setError(msg);
      toast.error(msg, { id: 'login-error' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-700 dark:text-slate-300 relative transition-colors duration-200">
      {/* Top Floating Theme Toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle showLabel={true} />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 mb-6 rounded-2xl shadow-sm">
          <BarChart2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">ResumeIQ</h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Sign in to access your audit ledger
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-800 py-10 px-8 border border-slate-200 dark:border-slate-700 shadow-xl sm:px-10 rounded-2xl transition-all">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-rose-50 dark:bg-red-500/10 border-l-4 border-rose-500 text-rose-700 dark:text-red-400 px-4 py-3 font-bold text-sm rounded-r-md">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-2 font-mono">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm transition-colors bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 rounded-xl"
                  placeholder="admin@resumeiq.app"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-2 font-mono">Password</label>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-4 pr-12 py-3 border border-slate-300 dark:border-slate-600 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm transition-colors bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 rounded-xl"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 pl-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-r-xl transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-800 transition-colors rounded-xl font-mono tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.25)]"
              >
                [ AUTHENTICATE ]
              </button>
            </div>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-between text-center">
            <Link to="/forgot-password" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-wider focus-visible:outline-none focus-visible:underline">
              Forgot Password?
            </Link>
            <Link to="/register" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-wider focus-visible:outline-none focus-visible:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
