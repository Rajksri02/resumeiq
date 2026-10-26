import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import ThemeToggle from '../components/ThemeToggle';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.post('/auth/forgot-password', { email });

      if (response.status === 200) {
        const msg = 'If that email exists, a reset link has been sent.';
        setMessage(msg);
        toast.success(msg, { id: 'forgot-password-success' });
      }
    } catch (err) {
      const msg = !err.response 
        ? 'Could not connect to the server. Please try again later.' 
        : (err.response.data?.message || 'Something went wrong');
      setError(msg);
      toast.error(msg, { id: 'forgot-password-error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-700 dark:text-slate-300 relative transition-colors duration-200">
      {/* Top Floating Theme Toggle */}
      <div className="absolute top-6 right-6">
        <ThemeToggle showLabel={true} />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Forgot Password</h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">Enter your email to receive a password reset link.</p>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-800 py-10 px-8 border border-slate-200 dark:border-slate-700 shadow-xl sm:px-10 rounded-2xl transition-all">
          {message && <div className="mb-4 bg-emerald-50 dark:bg-emerald-500/10 border-l-4 border-emerald-500 text-emerald-700 dark:text-emerald-400 px-4 py-3 font-bold text-sm rounded-r-md">{message}</div>}
          {error && <div className="mb-4 bg-rose-50 dark:bg-red-500/10 border-l-4 border-rose-500 text-rose-700 dark:text-red-400 px-4 py-3 font-bold text-sm rounded-r-md">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-2 font-mono">Email Address</label>
              <div className="mt-1">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="appearance-none block w-full px-4 py-3 border border-slate-300 dark:border-slate-600 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm transition-colors bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 rounded-xl"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-800 transition-colors rounded-xl font-mono tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.25)] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? '[ SENDING... ]' : '[ SEND RESET LINK ]'}
              </button>
            </div>
          </form>
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
            <Link to="/login" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-wider focus-visible:outline-none focus-visible:underline">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
