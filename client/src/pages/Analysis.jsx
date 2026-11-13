import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Check, AlertTriangle, ArrowLeft, Trash2, RefreshCw, X, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import ScoreGauge from '../components/ScoreGauge';
import SkillBadge from '../components/SkillBadge';
import FeedbackAccordion from '../components/FeedbackAccordion';
import RewriteSuggestions from '../components/RewriteSuggestions';
import ThemeToggle from '../components/ThemeToggle';
import useDocumentTitle from '../hooks/useDocumentTitle';

const reanalyzeTerminalSteps = [
  "> INITIATING_REAUDIT...",
  "> LOADING_STORED_TOKENS... [OK]",
  "> CROSS_REFERENCING_TARGET_ROLE... [OK]"
];

const Analysis = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  useDocumentTitle(analysis?.fileName ? `${analysis.fileName} - Audit Report` : 'Audit Report');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Header job description expansion state
  const [showFullJobDesc, setShowFullJobDesc] = useState(false);

  // Re-analyze state
  const [showReanalyzeModal, setShowReanalyzeModal] = useState(false);
  const [reanalyzeJobDescription, setReanalyzeJobDescription] = useState('');
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [reanalyzeError, setReanalyzeError] = useState(null);
  const [terminalLines, setTerminalLines] = useState([]);
  const [deepAnalysisStarted, setDeepAnalysisStarted] = useState(false);
  const [terminalError, setTerminalError] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef(null);

  // Track elapsed seconds while waiting for re-analysis completion
  useEffect(() => {
    if (!isReanalyzing || terminalError) return;

    startTimeRef.current = Date.now();
    setElapsedSeconds(0);

    const timer = setInterval(() => {
      if (startTimeRef.current) {
        setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isReanalyzing, terminalError]);

  // Sequentially display terminal steps then deep analysis
  useEffect(() => {
    if (!isReanalyzing || terminalError) return;

    let currentStep = 0;
    setTerminalLines([reanalyzeTerminalSteps[0]]);
    setDeepAnalysisStarted(false);

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < reanalyzeTerminalSteps.length) {
        setTerminalLines((prev) => [...prev, reanalyzeTerminalSteps[currentStep]]);
      } else {
        setDeepAnalysisStarted(true);
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [isReanalyzing, terminalError]);

  const handleReanalyzeSubmit = async (e) => {
    if (e) e.preventDefault();
    if (isReanalyzing) return;
    if (!reanalyzeJobDescription.trim()) {
      setReanalyzeError('Please provide a job description.');
      return;
    }

    if (reanalyzeJobDescription.length > 10000) {
      setReanalyzeError('> ERROR: [400] JOB DESCRIPTION EXCEEDS MAXIMUM ALLOWED LENGTH OF 10,000 CHARACTERS');
      toast.error('Job description exceeds 10,000 characters', { id: 'reanalyze-error' });
      return;
    }

    setIsReanalyzing(true);
    setReanalyzeError(null);
    setTerminalError(null);
    setTerminalLines([]);
    setDeepAnalysisStarted(false);
    setElapsedSeconds(0);
    startTimeRef.current = Date.now();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 65000);

    try {
      const res = await axios.post(`/resume/${id}/reanalyze`, {
        jobDescription: reanalyzeJobDescription.trim()
      }, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      toast.success('Resume analyzed for new role!');
      setShowReanalyzeModal(false);
      setReanalyzeJobDescription('');
      setIsReanalyzing(false);
      navigate(`/analysis/${res.data._id}`);
    } catch (err) {
      clearTimeout(timeoutId);
      console.error(err);

      let errorMsg = '> ERROR: REAUDIT_FAILED - UNKNOWN_ERROR';
      let toastMsg = 'Re-analysis failed. Please try again.';

      if (axios.isCancel(err) || err.name === 'CanceledError') {
        errorMsg = '> ERROR: TIMEOUT_EXCEEDED (65000ms)';
        toastMsg = 'Audit request timed out after 65s. The AI service may be busy.';
      } else if (err.response?.status === 409) {
        errorMsg = '> ERROR: [409] RE-ANALYSIS ALREADY IN PROGRESS';
        toastMsg = err.response.data.message || 'Re-analysis is already in progress. Please wait.';
      } else if (!err.response) {
        errorMsg = '> ERROR: NETWORK_FAILURE - SERVER_UNREACHABLE';
        toastMsg = 'Could not reach server. Please check your network connection.';
      } else if (err.response?.data?.message) {
        errorMsg = `> ERROR: [${err.response.status}] ${err.response.data.message.toUpperCase()}`;
        toastMsg = err.response.data.message;
      }

      if (err.response?.status !== 401) {
        toast.error(toastMsg, { id: 'reanalyze-error' });
      }

      setTerminalError(errorMsg);
      setTimeout(() => {
        setIsReanalyzing(false);
        setReanalyzeError(errorMsg.replace('> ERROR: ', ''));
      }, 4000);
    }
  };

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
    setShowReanalyzeModal(false);
    setIsReanalyzing(false);
    setShowFullJobDesc(false);
    setReanalyzeError(null);
    setTerminalError(null);
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
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-3 min-h-[44px] w-full sm:w-auto font-bold font-mono tracking-wider transition-colors inline-flex items-center justify-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 shadow-sm"
            >
              [ RETRY ]
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300 px-5 py-3 min-h-[44px] w-full sm:w-auto font-bold transition-colors inline-flex items-center justify-center tracking-wide rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
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
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors print:static print:border-b-2 print:border-slate-300 print:bg-white print:py-4 print:mb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 print:p-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 print:hidden"
                title="Back to dashboard"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="pl-3 sm:pl-4 border-l border-slate-200 dark:border-slate-700 min-w-0 print:border-l-0 print:pl-0">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate max-w-[130px] xs:max-w-[180px] sm:max-w-md md:max-w-lg lg:max-w-xl print:max-w-none print:text-2xl print:text-slate-950">
                  {analysis.fileName}
                </h1>
                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono font-bold uppercase tracking-wider print:text-slate-600">
                    AUDITED: {new Date(analysis.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: '2-digit', day: '2-digit'
                    })}
                  </p>
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${
                    analysis.jobDescription?.trim()
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 print:bg-emerald-50 print:text-emerald-800 print:border-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 print:bg-slate-100 print:text-slate-700 print:border-slate-300'
                  }`}>
                    {analysis.jobDescription?.trim() ? 'Targeted' : 'General analysis'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center justify-center px-3 sm:px-3.5 py-2 min-h-[44px] text-xs sm:text-sm font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 font-mono tracking-wider"
                title="Save as PDF / Print report"
                aria-label="Save as PDF"
              >
                <Printer className="w-4 h-4 sm:mr-2 shrink-0" />
                <span className="hidden md:inline">Save as PDF</span>
                <span className="md:hidden">PDF</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setReanalyzeError(null);
                  setShowReanalyzeModal(true);
                }}
                className="inline-flex items-center justify-center px-3 sm:px-3.5 py-2 min-h-[44px] text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 font-mono tracking-wider"
                title="Analyze for a different job"
              >
                <RefreshCw className="w-4 h-4 sm:mr-2 shrink-0" />
                <span className="hidden md:inline">Analyze for a different job</span>
                <span className="md:hidden">New Job</span>
              </button>
              <ThemeToggle showLabel={true} />
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center justify-center px-3 sm:px-3.5 py-2 min-h-[44px] text-sm font-bold text-rose-600 dark:text-red-400 hover:bg-rose-50 dark:hover:bg-red-500/10 border border-rose-200 dark:border-red-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 rounded-xl"
                aria-label="Discard audit"
              >
                <Trash2 className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline uppercase tracking-wider text-xs">Discard</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 print:p-0 print:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block print:space-y-6">
          
          {/* Left Rail: Hero Score */}
          <div className="lg:col-span-4 space-y-8 print:space-y-4 print:mb-6">
            <div className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md p-6 border border-slate-200 dark:border-slate-700 rounded-2xl transition-all break-inside-avoid print:border-slate-300 print:bg-white print:shadow-none print:p-5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 border-b border-slate-200 dark:border-slate-700 pb-4 flex items-center space-x-2 print:border-slate-200 print:mb-4 print:pb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="print:text-slate-950">Audit Result</span>
              </h2>
              <ScoreGauge score={result.atsScore} />
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-6 leading-relaxed border-t border-slate-200 dark:border-slate-700 pt-4 print:border-slate-200 print:mt-4 print:pt-3 print:text-slate-700">
                An AI estimate of how well your resume may parse and match a job. It is not a result from a real applicant tracking system.
              </p>
              
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 print:border-slate-200 print:mt-4 print:pt-3">
                {analysis.jobDescription?.trim() ? (
                  <div className="text-xs font-mono text-slate-600 dark:text-slate-300">
                    <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider print:text-slate-700">TARGET: </span>
                    <span className={showFullJobDesc ? "block max-h-48 overflow-y-auto whitespace-pre-line bg-slate-50 dark:bg-slate-950/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 mt-2 text-slate-700 dark:text-slate-300 print:hidden" : "print:hidden"}>
                      {showFullJobDesc
                        ? analysis.jobDescription.trim()
                        : (analysis.jobDescription.trim().replace(/\s+/g, ' ').length > 80
                            ? `${analysis.jobDescription.trim().replace(/\s+/g, ' ').slice(0, 80)}...`
                            : analysis.jobDescription.trim())}
                    </span>
                    <span className="hidden print:block whitespace-pre-line text-slate-800 mt-1 font-sans text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      {analysis.jobDescription.trim()}
                    </span>
                    {analysis.jobDescription.trim().length > 80 && (
                      <button
                        type="button"
                        onClick={() => setShowFullJobDesc(!showFullJobDesc)}
                        className="ml-1.5 text-emerald-600 dark:text-emerald-400 hover:underline font-bold inline-flex items-center print:hidden"
                      >
                        {showFullJobDesc ? 'show less' : 'show full'}
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400 print:text-slate-600">
                    General analysis
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-2.5 print:hidden">
                <button
                  type="button"
                  onClick={() => {
                    setReanalyzeError(null);
                    setShowReanalyzeModal(true);
                  }}
                  className="w-full inline-flex items-center justify-center px-4 py-3 min-h-[44px] text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 font-mono tracking-wider"
                >
                  <RefreshCw className="w-4 h-4 mr-2 shrink-0" />
                  <span>Analyze for a different job</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full inline-flex items-center justify-center px-4 py-3 min-h-[44px] text-sm font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 font-mono tracking-wider"
                >
                  <Printer className="w-4 h-4 mr-2 shrink-0" />
                  <span>Save as PDF</span>
                </button>
              </div>
            </div>

            {hasSkillsData && (
              <div className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 p-6 rounded-2xl transition-all break-inside-avoid print:border-slate-300 print:bg-white print:shadow-none print:p-5">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5 pb-3 border-b border-slate-200 dark:border-slate-700 print:border-slate-200 print:mb-3 print:pb-2 print:text-slate-950">Keyword Extraction</h2>
                
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
          <div className="lg:col-span-8 space-y-8 print:space-y-6">
            
            <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 p-5 sm:p-8 rounded-2xl border-t-4 border-t-emerald-500 transition-all break-inside-avoid print:border-slate-300 print:bg-white print:shadow-none print:p-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 print:text-slate-950">Executive Summary</h2>
              <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed font-sans print:text-slate-900">
                {result.overallSummary}
              </p>
            </div>
            
            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2 print:gap-4 print:break-inside-avoid">
              <div className="bg-white dark:bg-slate-800 shadow-sm border border-emerald-300 dark:border-emerald-500/30 p-5 sm:p-6 rounded-2xl transition-all break-inside-avoid print:border-emerald-400 print:bg-white print:shadow-none print:p-5">
                <div className="flex items-center mb-6 pb-3 border-b border-emerald-100 dark:border-emerald-500/10 print:border-emerald-200 print:mb-4 print:pb-2">
                  <h2 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 print:text-emerald-800">Structural Strengths</h2>
                </div>
                <ul className="space-y-4 print:space-y-2.5">
                  {result.strengths?.map((strength, i) => (
                    <li key={i} className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5 bg-emerald-50 dark:bg-emerald-500/10 p-1 mr-3 rounded-md print:bg-emerald-50">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3] print:text-emerald-700" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed print:text-slate-900">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-800 shadow-sm border border-amber-300 dark:border-amber-500/30 p-5 sm:p-6 rounded-2xl transition-all break-inside-avoid print:border-amber-300 print:bg-white print:shadow-none print:p-5">
                <div className="flex items-center mb-6 pb-3 border-b border-amber-100 dark:border-amber-500/10 print:border-amber-200 print:mb-4 print:pb-2">
                  <h2 className="text-lg font-bold text-amber-700 dark:text-amber-400 print:text-amber-800">Critical Issues</h2>
                </div>
                <ul className="space-y-4 print:space-y-2.5">
                  {result.weaknesses?.map((weakness, i) => (
                    <li key={i} className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5 bg-amber-50 dark:bg-amber-500/10 p-1 mr-3 rounded-md print:bg-amber-50">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 stroke-[3] print:text-amber-700" />
                      </div>
                      <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed print:text-slate-900">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actionable Suggestions */}
            <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 p-5 sm:p-8 rounded-2xl transition-all break-inside-avoid print:border-slate-300 print:bg-white print:shadow-none print:p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 pb-4 border-b border-slate-200 dark:border-slate-700 print:border-slate-200 print:mb-4 print:pb-2 print:text-slate-950">Remediation Plan</h2>
              <div className="pl-2">
                <ol className="space-y-5 print:space-y-3">
                  {result.suggestions?.map((suggestion, i) => (
                    <li key={i} className="flex items-start font-sans">
                      <span className="flex-shrink-0 text-sm font-mono font-black text-slate-400 dark:text-slate-500 w-8 pt-0.5 print:text-slate-600">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 text-base leading-relaxed print:text-slate-900">{suggestion}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Section Feedback */}
            <div className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 p-5 sm:p-8 rounded-2xl transition-all break-inside-avoid print:border-slate-300 print:bg-white print:shadow-none print:p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 pb-4 border-b border-slate-200 dark:border-slate-700 print:border-slate-200 print:mb-4 print:pb-2 print:text-slate-950">Section Audit</h2>
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
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-700 rounded-2xl transition-all">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-rose-600 dark:text-red-500 mb-2">Discard Audit?</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                This will permanently delete the analysis for <span className="font-bold text-slate-900 dark:text-slate-200">"{analysis.fileName}"</span>. This action cannot be reversed.
              </p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-slate-200 dark:border-slate-800 pt-6 mt-6">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-6 py-3 min-h-[44px] w-full sm:w-auto inline-flex items-center justify-center text-sm font-bold text-slate-700 dark:text-slate-300 bg-transparent border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors uppercase tracking-wider rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-6 py-3 min-h-[44px] w-full sm:w-auto inline-flex items-center justify-center text-sm font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors uppercase tracking-wider rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 shadow-md"
              >
                {isDeleting ? 'Deleting...' : 'Discard'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Re-analyze Modal & Terminal Loading State */}
      {showReanalyzeModal && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:hidden">
          {isReanalyzing ? (
            /* Terminal-style loading state */
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden rounded-2xl animate-in fade-in">
              {/* Terminal Header */}
              <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                <span className="ml-2 text-xs font-mono text-slate-400 tracking-wider">reanalyze_process.exe</span>
              </div>
              {/* Terminal Body */}
              <div className="p-6 sm:p-8 font-mono text-sm sm:text-base space-y-3 min-h-[260px]">
                {terminalLines.map((line, i) => (
                  <div key={i} className="text-emerald-400">
                    {line}
                  </div>
                ))}
                {deepAnalysisStarted && (
                  <div className="text-emerald-400 flex items-center">
                    <span>{`> RUNNING_DEEP_ANALYSIS... ${elapsedSeconds}s (this can take up to a minute)`}</span>
                    {!terminalError && (
                      <span className="animate-pulse w-2.5 h-4 bg-emerald-400 inline-block ml-2"></span>
                    )}
                  </div>
                )}
                {terminalError && (
                  <div className="text-amber-500 mt-4 font-bold border-l-2 border-amber-500 pl-3">
                    {terminalError}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Job description input dialog */
            <div className="bg-white dark:bg-slate-900 max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-700 rounded-2xl transition-all">
              <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Analyze for a different job
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Re-evaluate <span className="font-semibold text-slate-800 dark:text-slate-200">"{analysis.fileName}"</span> against a new job description without re-uploading your resume.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowReanalyzeModal(false);
                    setReanalyzeError(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 ml-2"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleReanalyzeSubmit} className="space-y-4">
                {reanalyzeError && (
                  <div className="p-3 text-xs font-mono text-rose-600 dark:text-red-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl">
                    {reanalyzeError}
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="reanalyzeJobDescription" className="block text-sm font-bold text-slate-900 dark:text-white">
                      Target Job Description <span className="text-rose-500">*</span>
                    </label>
                    <span className={`text-xs font-mono ${reanalyzeJobDescription.length > 10000 ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                      {reanalyzeJobDescription.length.toLocaleString()} / 10,000
                    </span>
                  </div>
                  <textarea
                    id="reanalyzeJobDescription"
                    value={reanalyzeJobDescription}
                    onChange={(e) => {
                      setReanalyzeJobDescription(e.target.value);
                      if (reanalyzeError) setReanalyzeError(null);
                    }}
                    rows={7}
                    placeholder="Paste the new job description, key requirements, or role summary here..."
                    className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs sm:text-sm leading-relaxed resize-y"
                    autoFocus
                  />
                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    A new audit report will be generated and saved to your history. Your original analysis will remain unchanged.
                  </p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReanalyzeModal(false);
                      setReanalyzeError(null);
                    }}
                    className="px-5 py-2.5 min-h-[44px] w-full sm:w-auto inline-flex items-center justify-center text-sm font-bold text-slate-700 dark:text-slate-300 bg-transparent border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isReanalyzing || !reanalyzeJobDescription.trim() || reanalyzeJobDescription.length > 10000}
                    className="px-6 py-2.5 min-h-[44px] w-full sm:w-auto inline-flex items-center justify-center text-sm font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-xl shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 uppercase tracking-wider"
                  >
                    {isReanalyzing ? 'Analyzing...' : 'Analyze'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analysis;
