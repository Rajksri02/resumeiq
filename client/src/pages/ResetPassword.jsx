import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      const msg = 'Passwords do not match';
      setError(msg);
      toast.error(msg, { id: 'password-mismatch' });
      return;
    }

    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await axios.post(`/auth/reset-password/${token}`, { password });

      if (response.status === 200) {
        const msg = 'Password reset successful. Redirecting to login...';
        setMessage(msg);
        toast.success('Password reset successful!', { id: 'reset-password-success' });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      const msg = !err.response 
        ? 'Could not connect to the server. Please try again later.' 
        : (err.response.data?.message || 'Something went wrong');
      setError(msg);
      toast.error(msg, { id: 'reset-password-error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <h2 className="text-center text-3xl font-bold tracking-tight text-white">Reset Password</h2>
        <p className="mt-2 text-center text-sm text-slate-400">Enter your new password below.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-800 py-10 px-8 border border-slate-700 shadow-xl sm:px-10 rounded-2xl">
          {message && <div className="mb-4 bg-emerald-500/10 border-l-4 border-emerald-500 text-emerald-400 px-4 py-3 font-bold text-sm rounded-r-md">{message}</div>}
          {error && <div className="mb-4 bg-red-500/10 border-l-4 border-red-500 text-red-400 px-4 py-3 font-bold text-sm rounded-r-md">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">New Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength="6"
                  className="appearance-none block w-full px-4 py-3 border border-slate-600 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm transition-colors bg-slate-900 text-white rounded-xl"
                  placeholder="New password (min 6 chars)"
                />
              </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold uppercase tracking-wider text-slate-400 mb-2 font-mono">Confirm New Password</label>
              <div className="mt-1">
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength="6"
                  className="appearance-none block w-full px-4 py-3 border border-slate-600 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent sm:text-sm transition-colors bg-slate-900 text-white rounded-xl"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 transition-colors rounded-xl font-mono tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.2)] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? '[ RESETTING... ]' : '[ RESET PASSWORD ]'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
