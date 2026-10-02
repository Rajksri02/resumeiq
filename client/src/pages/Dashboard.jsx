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
        setError('Failed to load past analyses.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-brand-emerald';
    if (score >= 50) return 'text-brand-coral';
    return 'text-brand-crimson';
  };

  return (
    <div className="min-h-screen bg-brand-pearl font-sans text-brand-ink">
      {/* Navigation */}
      <nav className="bg-brand-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-brand-ink p-1.5">
                <BarChart2 className="w-5 h-5 text-brand-white" />
              </div>
              <h1 className="text-xl font-display font-bold tracking-tight">ResumeIQ</h1>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-sm font-medium text-gray-600 hidden sm:block">
                {user?.name || user?.email?.split('@')[0]}
              </span>
              <button
                onClick={logout}
                className="text-sm font-bold text-gray-500 hover:text-brand-ink transition-colors uppercase tracking-wider"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 pb-6 border-b border-gray-200">
          <div>
            <h2 className="text-3xl font-display font-bold text-brand-ink tracking-tight">Audit History</h2>
            <p className="mt-2 text-sm text-gray-500">Review past structural analyses and track score improvements.</p>
          </div>
          <div className="mt-6 sm:mt-0">
            <button
              onClick={() => navigate('/upload')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold text-brand-white bg-brand-ink hover:bg-black focus:outline-none transition-colors shadow-audit"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Analysis
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-brand-coral/10 border-l-4 border-brand-coral p-4 mb-8">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-brand-coral font-bold">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-brand-white border border-gray-200 p-6 animate-pulse">
                <div className="flex items-start justify-between mb-6">
                  <div className="space-y-3 w-3/4">
                    <div className="h-5 bg-gray-200 w-full"></div>
                    <div className="h-3 bg-gray-100 w-1/2"></div>
                  </div>
                  <div className="w-10 h-10 bg-gray-100"></div>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <div className="h-8 w-16 bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="bg-brand-white border border-gray-200 py-20 px-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center bg-brand-pearl mb-6">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-display font-bold text-brand-ink mb-3">No audits performed</h3>
            <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
              Submit your first resume document to receive an objective ATS score and structural feedback report.
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold text-brand-white bg-brand-ink hover:bg-black focus:outline-none transition-colors"
            >
              Start First Audit
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item) => (
              <Link 
                key={item._id} 
                to={`/analysis/${item._id}`}
                className="group block bg-brand-white border border-gray-200 hover:border-brand-ink transition-colors flex flex-col h-full shadow-audit"
              >
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 pr-4">
                      <h3 className="text-lg font-display font-bold text-brand-ink truncate" title={item.fileName}>
                        {item.fileName}
                      </h3>
                      <p className="text-xs text-gray-500 mt-2 font-medium tracking-wide">
                        {new Date(item.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', month: 'short', day: 'numeric' 
                        }).toUpperCase()}
                      </p>
                    </div>
                    <div className="p-2 bg-brand-pearl text-gray-400 group-hover:text-brand-ink transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-brand-pearl/30">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Score</span>
                    <span className={`text-xl font-display font-black ${getScoreColor(item.analysis?.atsScore)}`}>
                      {item.analysis?.atsScore || '--'}
                    </span>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-brand-ink transition-colors flex items-center">
                    View Report <ChevronRight className="w-4 h-4 ml-1" />
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
