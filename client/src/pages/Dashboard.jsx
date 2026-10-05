import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, FileText, ChevronRight, BarChart2 } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('/resume/history');
        setHistory(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Error fetching history:', err);
        setError('ERROR: FAILED_TO_LOAD_AUDIT_HISTORY');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-red-400 bg-red-500/10 border-red-500/30';
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300">
      {/* Navigation */}
      <nav className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-slate-800 p-1.5 rounded">
                <BarChart2 className="w-5 h-5 text-emerald-400" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">ResumeIQ</h1>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-sm font-medium text-slate-400 hidden sm:block">
                {user?.name || user?.email?.split('@')[0]}
              </span>
              <button
                onClick={logout}
                className="text-sm font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-wider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded px-2 py-1"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 pb-6 border-b border-slate-800">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Audit History</h2>
            <p className="mt-2 text-sm text-slate-400">Review past structural analyses and track score improvements.</p>
          </div>
          <div className="mt-6 sm:mt-0">
            <button
              onClick={() => navigate('/upload')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition-colors rounded-xl font-mono tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              [ NEW_AUDIT ]
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-4 mb-8 rounded-xl font-mono">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-400 font-bold">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-slate-800 border border-slate-700 p-6 rounded-xl animate-pulse">
                <div className="flex items-start justify-between mb-6">
                  <div className="space-y-3 w-3/4">
                    <div className="h-5 bg-slate-700 w-full rounded"></div>
                    <div className="h-3 bg-slate-700/50 w-1/2 rounded"></div>
                  </div>
                  <div className="w-10 h-10 bg-slate-700 rounded-lg"></div>
                </div>
                <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
                  <div className="h-8 w-16 bg-slate-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 py-20 px-4 text-center rounded-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center bg-slate-900 rounded-2xl mb-6 border border-slate-700">
              <FileText className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-mono font-bold text-slate-300 mb-3 tracking-wider">NO_RECORDS_FOUND</h3>
            <p className="text-sm text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">
              Submit your first resume document to receive an objective ATS score and structural feedback report.
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="inline-flex items-center px-6 py-3 text-sm font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 transition-colors rounded-xl font-mono tracking-wider"
            >
              [ INITIATE_FIRST_AUDIT ]
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item) => (
              <Link 
                key={item._id} 
                to={`/analysis/${item._id}`}
                className="group block bg-slate-800 border border-slate-700 hover:border-slate-500 transition-all flex flex-col h-full rounded-2xl overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 pr-4">
                      <h3 className="text-lg font-bold text-white truncate" title={item.fileName}>
                        {item.fileName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-2 font-mono tracking-widest">
                        {new Date(item.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', month: '2-digit', day: '2-digit' 
                        }).toUpperCase()}
                      </p>
                    </div>
                    <div className="p-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-500 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between bg-slate-900/50">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-slate-500 font-mono tracking-widest">SCORE:</span>
                    <span className={`px-2 py-0.5 rounded border text-sm font-mono font-bold ${getScoreColor(item.analysis?.atsScore)}`}>
                      {item.analysis?.atsScore || '--'}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold tracking-widest text-slate-500 group-hover:text-white transition-colors flex items-center">
                    VIEW_REPORT <ChevronRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
