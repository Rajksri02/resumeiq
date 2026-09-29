import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, AlertTriangle, ArrowLeft, Trash2 } from 'lucide-react';
import ScoreGauge from '../components/ScoreGauge';
import SkillBadge from '../components/SkillBadge';
import FeedbackAccordion from '../components/FeedbackAccordion';

const Analysis = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const res = await axios.get(`/resume/${id}`);
        setAnalysis(res.data.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load analysis. It may have been deleted or you do not have permission.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`/resume/${id}`);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to delete analysis.');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-md w-full text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error || 'Analysis not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-medium transition-colors inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const result = analysis.analysisResult;
  const hasSkillsData = result.matchedSkills?.length > 0 || result.missingSkills?.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                title="Back to dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 truncate max-w-[200px] sm:max-w-md md:max-w-lg lg:max-w-xl">
                  {analysis.filename}
                </h1>
                <p className="text-sm text-gray-500 font-medium">
                  Analyzed on {new Date(analysis.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center px-3.5 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
              >
                <Trash2 className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Score and Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col items-center">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Overall ATS Score</h2>
              <ScoreGauge score={result.atsScore} />
              <p className="text-sm text-gray-500 mt-6 text-center max-w-xs">
                Scores above 75 generally pass standard Applicant Tracking Systems.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-100/50 p-6">
              <h2 className="text-lg font-bold text-blue-900 mb-3">Executive Summary</h2>
              <p className="text-blue-800/90 leading-relaxed text-sm">
                {result.overallSummary}
              </p>
            </div>
            
            {hasSkillsData && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-5">Skill Match</h2>
                
                {result.matchedSkills?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Matched Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedSkills.map((skill, i) => (
                        <SkillBadge key={`match-${i}`} skill={skill} type="match" />
                      ))}
                    </div>
                  </div>
                )}
                
                {result.missingSkills?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Missing (Consider Adding)</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.missingSkills.map((skill, i) => (
                        <SkillBadge key={`miss-${i}`} skill={skill} type="missing" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-2.5 mb-5">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <h2 className="text-lg font-bold text-gray-900">Strengths</h2>
                </div>
                <ul className="space-y-3.5">
                  {result.strengths?.map((strength, i) => (
                    <li key={i} className="flex items-start">
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-green-500 mt-2 mr-3"></span>
                      <span className="text-gray-700 text-sm leading-relaxed">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-2.5 mb-5">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-bold text-gray-900">Areas to Improve</h2>
                </div>
                <ul className="space-y-3.5">
                  {result.weaknesses?.map((weakness, i) => (
                    <li key={i} className="flex items-start">
                      <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 mr-3"></span>
                      <span className="text-gray-700 text-sm leading-relaxed">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actionable Suggestions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Action Plan</h2>
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                <ol className="space-y-4 list-decimal list-inside">
                  {result.suggestions?.map((suggestion, i) => (
                    <li key={i} className="text-gray-900 font-medium pl-1">
                      <span className="text-gray-700 ml-1.5 font-normal text-sm leading-relaxed">{suggestion}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Section Feedback */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Section-by-Section Feedback</h2>
              {result.sectionFeedback && Object.entries(result.sectionFeedback).map(([section, feedback]) => (
                <FeedbackAccordion key={section} section={section} feedback={feedback} />
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl overflow-hidden transform transition-all">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Analysis</h3>
              <p className="text-sm text-gray-500 mb-6 px-2">
                Are you sure you want to delete the analysis for <span className="font-medium text-gray-700">"{analysis.filename}"</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-center space-x-3 sm:space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors w-full sm:w-auto"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;
