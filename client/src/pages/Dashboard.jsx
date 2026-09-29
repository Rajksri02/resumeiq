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
        // Direct assignment, res.data is the array
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
    if (score >= 75) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 50) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-7 h-7 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Resume<span className="text-blue-600">IQ</span></h1>
            </div>
            <div className="flex items-center space-x-5">
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                Hi, {user?.name || user?.email?.split('@')[0]}
              </span>
              <button
                onClick={logout}
                className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Analyses</h2>
            <p className="mt-1.5 text-sm text-gray-500">View past resume reviews and track your improvements.</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => navigate('/upload')}
              className="inline-flex items-center px-4 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Analysis
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                <div className="flex items-center space-x-4 mb-5">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2.5">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                  <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                  <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="text-center bg-white rounded-2xl shadow-sm border border-gray-100 py-16 px-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 mb-4">
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No analyses yet</h3>
            <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
              Upload your first resume to get actionable feedback, an ATS score, and tailored suggestions to land your dream job.
            </p>
            <button
              onClick={() => navigate('/upload')}
              className="inline-flex items-center px-5 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors"
            >
              Upload your first resume
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item) => (
              <Link 
                key={item._id} 
                to={`/analysis/${item._id}`}
                className="block group"
              >
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200 h-full flex flex-col">
                  <div className="flex items-start justify-between flex-1">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600 flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="min-w-0 truncate">
                        <h3 className="text-sm font-bold text-gray-900 truncate" title={item.fileName}>
                          {item.fileName}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(item.createdAt).toLocaleDateString(undefined, { 
                            year: 'numeric', month: 'short', day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Score</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getScoreColor(item.analysis?.atsScore)}`}>
                        {item.analysis?.atsScore}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
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
