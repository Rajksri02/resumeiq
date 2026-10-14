import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, ArrowLeft, Home } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-slate-300">
      <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6">
          <AlertTriangle className="h-8 w-8 text-amber-400" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/30 mb-4">
          STATUS 404 // NOT_FOUND
        </span>

        <h1 className="text-2xl font-bold text-white tracking-tight mb-3">
          Page Not Found
        </h1>

        <p className="text-sm text-slate-400 leading-relaxed mb-8">
          The route you requested could not be resolved in the system ledger. It may have been moved or does not exist.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center px-5 py-2.5 border border-slate-700 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>

          <button
            type="button"
            onClick={() => navigate(user ? '/dashboard' : '/login')}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 transition-colors font-mono tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <Home className="w-4 h-4 mr-2" />
            {user ? '[ DASHBOARD ]' : '[ LOGIN ]'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
