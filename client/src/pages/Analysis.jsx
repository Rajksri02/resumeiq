import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Check, AlertTriangle, ArrowLeft, Trash2 } from 'lucide-react';
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
        setAnalysis(res.data);
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
      <div className="min-h-screen flex items-center justify-center bg-brand-pearl font-sans">
        <div className="animate-spin h-10 w-10 border-4 border-brand-ink/20 border-t-brand-ink"></div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-pearl p-4 font-sans text-brand-ink">
        <div className="bg-brand-white p-12 border border-brand-coral max-w-md w-full text-center">
          <AlertTriangle className="h-10 w-10 text-brand-coral mx-auto mb-6" />
          <h2 className="text-2xl font-display font-bold mb-3 tracking-tight">Audit Not Found</h2>
          <p className="text-gray-600 mb-8">{error || 'This analysis could not be retrieved.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-brand-ink text-brand-white px-6 py-3 font-bold hover:bg-black transition-colors inline-flex items-center tracking-wide"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            RETURN TO DASHBOARD
          </button>
        </div>
      </div>
    );
  }

  const result = analysis.analysis || {};
  const hasSkillsData = result.matchedSkills?.length > 0 || result.missingSkills?.length > 0;

  return (
    <div className="min-h-screen bg-brand-pearl font-sans text-brand-ink pb-16">
      {/* Header */}
      <div className="bg-brand-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 text-gray-400 hover:text-brand-ink hover:bg-brand-pearl transition-colors focus:outline-none"
                title="Back to dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="pl-4 border-l border-gray-200">
                <h1 className="text-lg font-bold truncate max-w-[200px] sm:max-w-md md:max-w-lg lg:max-w-xl">
                  {analysis.fileName}
                </h1>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                  Audited {new Date(analysis.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center px-4 py-2 text-sm font-bold text-brand-crimson hover:bg-brand-crimson/10 transition-colors focus:outline-none"
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
            <div className="bg-brand-white shadow-audit p-6 border border-gray-200">
              <h2 className="text-xl font-display font-bold mb-6 border-b border-gray-100 pb-4">Audit Result</h2>
              <ScoreGauge score={result.atsScore} />
              <p className="text-sm text-gray-500 mt-6 leading-relaxed border-t border-gray-100 pt-4">
                This structural score determines your likelihood of passing standard Applicant Tracking Systems. Scores ≥ 75 indicate strong formatting and keyword density.
              </p>
            </div>

            {hasSkillsData && (
              <div className="bg-brand-white shadow-audit border border-gray-200 p-6">
                <h2 className="text-lg font-display font-bold mb-5 pb-3 border-b border-gray-100">Keyword Extraction</h2>
                
                {result.matchedSkills?.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Verified Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedSkills.map((skill, i) => (
                        <SkillBadge key={`match-${i}`} skill={skill} type="match" />
                      ))}
                    </div>
                  </div>
                )}
                
                {result.missingSkills?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Missing Keywords</h3>
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
            
            <div className="bg-brand-white shadow-audit border border-gray-200 p-8 border-t-4 border-t-brand-ink">
              <h2 className="text-2xl font-display font-bold mb-4">Executive Summary</h2>
              <p className="text-lg text-gray-700 leading-relaxed font-sans">
                {result.overallSummary}
              </p>
            </div>
            
            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-brand-white shadow-audit border border-brand-emerald/30 p-6">
                <div className="flex items-center mb-6 pb-3 border-b border-brand-emerald/10">
                  <h2 className="text-lg font-display font-bold text-brand-emerald">Structural Strengths</h2>
                </div>
                <ul className="space-y-4">
                  {result.strengths?.map((strength, i) => (
                    <li key={i} className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5 bg-brand-emerald/10 p-1 mr-3">
                        <Check className="w-3.5 h-3.5 text-brand-emerald stroke-[3]" />
                      </div>
                      <span className="text-gray-700 text-sm leading-relaxed">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-brand-white shadow-audit border border-brand-coral/30 p-6">
                <div className="flex items-center mb-6 pb-3 border-b border-brand-coral/10">
                  <h2 className="text-lg font-display font-bold text-brand-coral">Critical Issues</h2>
                </div>
                <ul className="space-y-4">
                  {result.weaknesses?.map((weakness, i) => (
                    <li key={i} className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5 bg-brand-coral/10 p-1 mr-3">
                        <AlertTriangle className="w-3.5 h-3.5 text-brand-coral stroke-[3]" />
                      </div>
                      <span className="text-gray-700 text-sm leading-relaxed">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actionable Suggestions */}
            <div className="bg-brand-white shadow-audit border border-gray-200 p-8">
              <h2 className="text-xl font-display font-bold mb-6 pb-4 border-b border-gray-100">Remediation Plan</h2>
              <div className="pl-2">
                <ol className="space-y-5">
                  {result.suggestions?.map((suggestion, i) => (
                    <li key={i} className="flex items-start font-sans">
                      <span className="flex-shrink-0 text-sm font-display font-black text-gray-300 w-8 pt-0.5">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-gray-800 text-base leading-relaxed">{suggestion}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Section Feedback */}
            <div className="bg-brand-white shadow-audit border border-gray-200 p-8">
              <h2 className="text-xl font-display font-bold mb-6 pb-4 border-b border-gray-100">Section Audit</h2>
              <div className="space-y-3">
                {result.sectionFeedback && Object.entries(result.sectionFeedback).map(([section, feedback]) => (
                  <FeedbackAccordion key={section} section={section} feedback={feedback} />
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-brand-ink/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-brand-white max-w-md w-full p-8 shadow-2xl border border-gray-200">
            <div className="mb-6">
              <h3 className="text-2xl font-display font-bold text-brand-crimson mb-2">Discard Audit?</h3>
              <p className="text-gray-600 leading-relaxed">
                This will permanently delete the analysis for <span className="font-bold text-brand-ink">"{analysis.fileName}"</span>. This action cannot be reversed.
              </p>
            </div>
            <div className="flex justify-end space-x-4 border-t border-gray-100 pt-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-6 py-3 text-sm font-bold text-brand-ink bg-transparent border border-gray-300 hover:bg-gray-50 transition-colors uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-6 py-3 text-sm font-bold text-brand-white bg-brand-crimson hover:bg-[#7a2021] transition-colors uppercase tracking-wider flex items-center"
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
