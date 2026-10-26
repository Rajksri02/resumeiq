import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Check, AlertTriangle, ArrowLeft, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ScoreGauge from '../components/ScoreGauge';
import SkillBadge from '../components/SkillBadge';
import FeedbackAccordion from '../components/FeedbackAccordion';
import RewriteSuggestions from '../components/RewriteSuggestions';
import ThemeToggle from '../components/ThemeToggle';

const Analysis = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/resume/${id}`);
      setAnalysis(res.data);
    } catch (err) {
      console.error(err);
      const isNetwork = !err.response;
      const msg = isNetwork 
        ? 'Network error: Unable to connect to server. Please check your connection.'
        : (err.response?.data?.message || 'ERROR: AUDIT_NOT_FOUND_OR_UNAUTHORIZED');
      setError(msg);
      if (err.response?.status !== 401) {
        toast.error(msg, { id: 'analysis-load-error' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`/resume/${id}`);
      toast.success('Audit discarded successfully');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      const msg = !err.response 
        ? 'Network error: Could not reach server to delete audit' 
        : (err.response?.data?.message || 'Failed to delete audit');
      setError(msg);
      toast.error(msg, { id: 'analysis-delete-error' });
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="animate-spin h-10 w-10 border-4 border-slate-300 dark:border-slate-800 border-t-emerald-500 rounded-full"></div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans text-slate-700 dark:text-slate-300 transition-colors">
        <div className="bg-white dark:bg-slate-900 p-12 border border-rose-200 dark:border-red-500/50 max-w-md w-full text-center rounded-2xl shadow-xl">
          <AlertTriangle className="h-10 w-10 text-rose-500 mx-auto mb-6" />
          <h2 className="text-xl font-mono font-bold mb-3 tracking-wider text-rose-600 dark:text-red-400">AUDIT_UNAVAILABLE</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 font-mono text-sm">{error || 'This analysis could not be retrieved.'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={fetchAnalysis}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 font-bold font-mono tracking-wider transition-colors inline-flex items-center justify-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 shadow-sm"
            >
              [ RETRY ]
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300 px-5 py-2.5 font-bold transition-colors inline-flex items-center justify-center tracking-wide rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              RETURN TO DASHBOARD
            </button>
          </div>
        </div>
      </div>
    );
  }

  const result = analysis.analysis || {};
  const hasSkillsData = result.matchedSkills?.length > 0 || result.missingSkills?.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-700 dark:text-slate-300 pb-16 transition-colors duration-200">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                title="Back to dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="pl-4 border-l border-slate-200 dark:border-slate-700">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-[180px] sm:max-w-md md:max-w-lg lg:max-w-xl">
                  {analysis.fileName}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono font-bold uppercase tracking-wider mt-0.5">
                  AUDITED: {new Date(analysis.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: '2-digit', day: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <ThemeToggle showLabel={true} />
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center px-3.5 py-1.5 text-sm font-bold text-rose-600 dark:text-red-400 hover:bg-rose-50 dark:hover:bg-red-500/10 border border-rose-200 dark:border-red-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 rounded-xl"
              >
                <Trash2 className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline uppercase tracking-wider text-xs">Discard</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Rail: Hero Score */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md p-6 border border-slate-200 dark:border-slate-700 rounded-2xl transition-all">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Audit Result</span>
              </h2>
              <ScoreGauge score={result.atsScore} />
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-6 leading-relaxed border-t border-slate-200 dark:border-slate-700 pt-4">
                This structural score determines your likelihood of passing standard Applicant Tracking Systems. Scores ≥ 75 indicate strong formatting and keyword density.
              </p>
            </div>

            {hasSkillsData && (
              <div className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 p-6 rounded-2xl transition-all">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5 pb-3 border-b border-slate-200 dark:border-slate-700">Keyword Extraction</h2>
                
                {result.matchedSkills?.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-3 flex items-center">
                      <Check className="w-3 h-3 mr-1 stroke-[3]" /> VERIFIED_TOKENS
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedSkills.map((skill, i) => (
                        <SkillBadge key={`match-${i}`} skill={skill} type="match" />
                      ))}
                    </div>
                  </div>
                )}
                
                {result.missingSkills?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-mono font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-3 flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1 stroke-[2.5]" /> MISSING_TOKENS
                    </h3>
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

          {/* Right Rail: Detailed Breakdown */}
          <div className="lg:col-span-8 space-y-8">
            
            <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 p-8 rounded-2xl border-t-4 border-t-emerald-500 transition-all">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Executive Summary</h2>
              <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                {result.overallSummary}
              </p>
            </div>
            
            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-slate-800 shadow-sm border border-emerald-300 dark:border-emerald-500/30 p-6 rounded-2xl transition-all">
                <div className="flex items-center mb-6 pb-3 border-b border-emerald-100 dark:border-emerald-500/10">
                  <h2 className="text-lg font-bold text-emerald-700 dark:text-emerald-400">Structural Strengths</h2>
                </div>
                <ul className="space-y-4">
                  {result.strengths?.map((strength, i) => (
                    <li key={i} className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5 bg-emerald-50 dark:bg-emerald-500/10 p-1 mr-3 rounded-md">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-800 shadow-sm border border-amber-300 dark:border-amber-500/30 p-6 rounded-2xl transition-all">
                <div className="flex items-center mb-6 pb-3 border-b border-amber-100 dark:border-amber-500/10">
                  <h2 className="text-lg font-bold text-amber-700 dark:text-amber-400">Critical Issues</h2>
                </div>
                <ul className="space-y-4">
                  {result.weaknesses?.map((weakness, i) => (
                    <li key={i} className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5 bg-amber-50 dark:bg-amber-500/10 p-1 mr-3 rounded-md">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[3]" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actionable Suggestions */}
            <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 p-8 rounded-2xl transition-all">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">Remediation Plan</h2>
              <div className="pl-2">
                <ol className="space-y-5">
                  {result.suggestions?.map((suggestion, i) => (
                    <li key={i} className="flex items-start font-sans">
                      <span className="flex-shrink-0 text-sm font-mono font-black text-slate-400 dark:text-slate-500 w-8 pt-0.5">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">{suggestion}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Section Feedback */}
            <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 p-8 rounded-2xl transition-all">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">Section Audit</h2>
              <div className="space-y-3">
                {result.sectionFeedback && Object.entries(result.sectionFeedback).map(([section, feedback]) => (
                  <FeedbackAccordion key={section} section={section} feedback={feedback} />
                ))}
              </div>
            </div>

            {/* Rewrite Suggestions */}
            <RewriteSuggestions
              resumeId={id}
              initialData={{
                rewrites: analysis.rewrites,
                metricPrompts: analysis.metricPrompts,
                rewritesNote: analysis.rewritesNote,
                note: analysis.note || analysis.rewritesNote,
                rewritesGeneratedAt: analysis.rewritesGeneratedAt
              }}
              onUpdate={(updatedData) => {
                setAnalysis(prev => ({
                  ...prev,
                  ...updatedData
                }));
              }}
            />

          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full p-8 shadow-2xl border border-slate-200 dark:border-slate-700 rounded-2xl transition-all">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-rose-600 dark:text-red-500 mb-2">Discard Audit?</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                This will permanently delete the analysis for <span className="font-bold text-slate-900 dark:text-slate-200">"{analysis.fileName}"</span>. This action cannot be reversed.
              </p>
            </div>
            <div className="flex justify-end space-x-4 border-t border-slate-200 dark:border-slate-800 pt-6 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-6 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 bg-transparent border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors uppercase tracking-wider rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-6 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors uppercase tracking-wider flex items-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 shadow-md"
              >
                {isDeleting ? 'Deleting...' : 'Discard'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;
