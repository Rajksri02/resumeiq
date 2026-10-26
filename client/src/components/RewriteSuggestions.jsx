import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RotateCcw, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  ArrowLeft,
  Hash
} from 'lucide-react';
import toast from 'react-hot-toast';

const copyToClipboard = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  let success = false;
  try {
    success = document.execCommand('copy');
  } catch {
    success = false;
  }
  document.body.removeChild(textArea);
  return success;
};

// Highlights bracketed placeholders like [N], [X]%, [N] seconds in monospace emerald pills
const renderPromptWithHighlights = (promptText) => {
  if (!promptText) return null;
  const parts = promptText.split(/(\[[^\]]+\])/g);
  return parts.map((part, index) => {
    if (part.startsWith('[') && part.endsWith(']')) {
      return (
        <span
          key={index}
          className="font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded text-xs font-bold mx-0.5 tracking-wide inline-block shadow-sm"
        >
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

const terminalSteps = [
  "> INITIALIZING_REWRITE_PIPELINE...",
  "> AUDITING_BULLETS_AGAINST_DEFECT_CHECKLIST... [OK]",
  "> ISOLATING_UNQUANTIFIED_SYSTEMS... [OK]"
];

const RewriteSuggestions = ({ resumeId, initialData, onUpdate }) => {
  const [rewrites, setRewrites] = useState(initialData?.rewrites || []);
  const [metricPrompts, setMetricPrompts] = useState(initialData?.metricPrompts || []);
  const [note, setNote] = useState(initialData?.note || initialData?.rewritesNote || '');
  const [generatedAt, setGeneratedAt] = useState(initialData?.rewritesGeneratedAt || null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorState, setErrorState] = useState(null); // { type, message }
  const [showConfirmRegenerate, setShowConfirmRegenerate] = useState(false);
  
  // Copy state
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  // Terminal state
  const [terminalLines, setTerminalLines] = useState([]);
  const [deepAnalysisStarted, setDeepAnalysisStarted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTimeRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Sync if initialData changes
  useEffect(() => {
    if (initialData) {
      if (initialData.rewrites) setRewrites(initialData.rewrites);
      if (initialData.metricPrompts) setMetricPrompts(initialData.metricPrompts);
      if (initialData.note || initialData.rewritesNote) {
        setNote(initialData.note || initialData.rewritesNote);
      }
      if (initialData.rewritesGeneratedAt) {
        setGeneratedAt(initialData.rewritesGeneratedAt);
      }
    }
  }, [initialData]);

  // Terminal elapsed seconds timer
  useEffect(() => {
    if (!isGenerating) return;

    startTimeRef.current = Date.now();
    setElapsedSeconds(0);

    const timer = setInterval(() => {
      if (startTimeRef.current) {
        setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isGenerating]);

  // Terminal step progression
  useEffect(() => {
    if (!isGenerating) return;

    let currentStep = 0;
    setTerminalLines([terminalSteps[0]]);
    setDeepAnalysisStarted(false);

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < terminalSteps.length) {
        setTerminalLines(prev => [...prev, terminalSteps[currentStep]]);
      } else {
        setDeepAnalysisStarted(true);
        clearInterval(interval);
      }
    }, 700);

    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async (isRegenerate = false) => {
    setIsGenerating(true);
    setErrorState(null);
    setShowConfirmRegenerate(false);
    setTerminalLines([]);
    setDeepAnalysisStarted(false);
    setElapsedSeconds(0);
    startTimeRef.current = Date.now();

    // 65s client-side timeout controller
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 65000);

    try {
      const url = `/resume/${resumeId}/rewrites${isRegenerate ? '?regenerate=true' : ''}`;
      const res = await axios.post(url, {}, { signal: controller.signal });
      clearTimeout(timeoutId);

      const data = res.data;
      const nextRewrites = data.rewrites || [];
      const nextMetricPrompts = data.metricPrompts || [];
      const nextNote = data.note || data.rewritesNote || '';
      const nextGeneratedAt = data.rewritesGeneratedAt || new Date().toISOString();

      setRewrites(nextRewrites);
      setMetricPrompts(nextMetricPrompts);
      setNote(nextNote);
      setGeneratedAt(nextGeneratedAt);

      if (onUpdate) {
        onUpdate({
          rewrites: nextRewrites,
          metricPrompts: nextMetricPrompts,
          rewritesNote: nextNote,
          note: nextNote,
          rewritesGeneratedAt: nextGeneratedAt
        });
      }

      toast.success(isRegenerate ? 'Rewrites regenerated' : 'Rewrite suggestions generated');
    } catch (err) {
      clearTimeout(timeoutId);
      console.error('Rewrites generation error:', err);

      if (axios.isCancel(err) || err.name === 'CanceledError' || err.name === 'AbortError') {
        setErrorState({
          type: 'TIMEOUT',
          message: 'The AI service is slow right now, try again'
        });
        toast.error('Rewrite request timed out after 65s.', { id: 'rewrites-timeout' });
        return;
      }

      if (!err.response) {
        setErrorState({
          type: 'NETWORK_FAILURE',
          message: 'Unable to reach the server. Please check your network connection and try again.'
        });
        toast.error('Network failure: server unreachable', { id: 'rewrites-network-error' });
        return;
      }

      const status = err.response.status;
      const code = err.response.data?.code;
      const message = err.response.data?.message;

      if (code === 'RATE_LIMITED' || status === 429 && code !== 'AI_BUSY') {
        setErrorState({
          type: 'RATE_LIMITED',
          message: "You've hit the rewrite limit, try again in a few minutes."
        });
        toast.error("You've hit the rewrite limit, try again in a few minutes.", { id: 'rewrites-rate-limited' });
      } else if (code === 'AI_BUSY' || code === 'TIMEOUT' || status === 504 || (status === 503 && code === 'AI_BUSY')) {
        setErrorState({
          type: 'AI_BUSY',
          message: 'The AI service is slow right now, try again'
        });
        toast.error('The AI service is busy or slow right now.', { id: 'rewrites-ai-busy' });
      } else if (code === 'IN_PROGRESS' || status === 409) {
        // Show generating state and inform user
        setErrorState(null);
        toast('Generation already in progress, waiting for results...', { id: 'rewrites-in-progress' });
      } else if (code === 'NOT_FOUND' || status === 404) {
        setErrorState({
          type: 'NOT_FOUND',
          message: 'This resume was not found or has been removed.'
        });
      } else if (code === 'VALIDATION_FAILED' || status === 422) {
        setErrorState({
          type: 'VALIDATION_FAILED',
          message: message || 'Could not generate verifiable rewrite suggestions from your resume. Please try again.'
        });
      } else {
        setErrorState({
          type: 'SERVER_ERROR',
          message: message || 'Error generating rewrite suggestions. Please try again.'
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopySingle = async (text, index) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedIndex(index);
      setLiveAnnouncement(`Copied rewrite ${index + 1} to clipboard`);
      setTimeout(() => setCopiedIndex(null), 2000);
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleCopyAll = async () => {
    if (!rewrites.length) return;
    const allText = rewrites.map(r => `[${r.section || 'REWRITE'}] ${r.improved}`).join('\n\n');
    const success = await copyToClipboard(allText);
    if (success) {
      setCopiedAll(true);
      setLiveAnnouncement('Copied all rewrite suggestions to clipboard');
      toast.success('All rewrites copied to clipboard');
      setTimeout(() => setCopiedAll(false), 2500);
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  // Determine current active view state
  const isGenerated = Boolean(generatedAt);
  const hasRewrites = rewrites && rewrites.length > 0;
  const hasMetricPrompts = metricPrompts && metricPrompts.length > 0;
  const isEmptyWithNote = isGenerated && !hasRewrites && Boolean(note);

  return (
    <section 
      aria-labelledby="rewrites-heading"
      className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 p-6 sm:p-8 rounded-2xl relative overflow-hidden transition-all"
    >
      {/* Screen Reader Live Announcement */}
      <div aria-live="polite" className="sr-only">
        {liveAnnouncement}
      </div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-700/80 gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              ATS_OPTIMIZATION_MODULE
            </span>
          </div>
          <h2 id="rewrites-heading" className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Rewrite Suggestions
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-sans">
            Suggested edits built only from your resume's own text. Check each one before using it.
          </p>
        </div>

        {/* Global Action Buttons */}
        {isGenerated && !isGenerating && (
          <div className="flex items-center space-x-3 self-start sm:self-center">
            {hasRewrites && (
              <button
                type="button"
                onClick={handleCopyAll}
                className="flex items-center space-x-2 px-3.5 py-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                title="Copy all improved bullets"
              >
                {copiedAll ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                    <span className="text-emerald-600 dark:text-emerald-400">COPIED_ALL</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>COPY ALL</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowConfirmRegenerate(true)}
              className="flex items-center space-x-2 px-3.5 py-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              title="Regenerate suggestions"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>REGENERATE</span>
            </button>
          </div>
        )}
      </div>

      {/* STATE 2: GENERATING (TERMINAL STYLE READOUT) */}
      {isGenerating && (
        <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-xl overflow-hidden my-4">
          <div className="bg-slate-800/90 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-slate-600"></div>
              <div className="w-3 h-3 rounded-full bg-slate-600"></div>
              <div className="w-3 h-3 rounded-full bg-slate-600"></div>
              <span className="ml-2 text-xs font-mono text-slate-400 tracking-wider">rewrite_engine.exe</span>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              ACTIVE
            </span>
          </div>

          <div className="p-6 sm:p-8 font-mono text-sm space-y-3 min-h-[220px]">
            {terminalLines.map((line, i) => (
              <div key={i} className="text-emerald-400">
                {line}
              </div>
            ))}
            {deepAnalysisStarted && (
              <div className="text-emerald-400 flex items-center pt-1">
                <span>{`> RUNNING_DEEP_ANALYSIS... ${elapsedSeconds}s (this can take up to a minute)`}</span>
                <span className="animate-pulse w-2 h-4 bg-emerald-400 inline-block ml-2"></span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STATE 5: ERROR HANDLING DISPLAY */}
      {errorState && !isGenerating && (
        <div className="bg-amber-50 dark:bg-slate-900/90 border border-amber-300 dark:border-amber-500/30 p-6 rounded-2xl mb-8">
          <div className="flex items-start space-x-4">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-mono tracking-wide flex items-center space-x-2">
                <span>ERROR_STATUS:</span>
                <span className="text-amber-600 dark:text-amber-400">{errorState.type}</span>
              </h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm mt-1.5 leading-relaxed font-sans">
                {errorState.message}
              </p>

              {/* Action Buttons based on error type */}
              <div className="mt-5 flex flex-wrap gap-3">
                {errorState.type === 'NOT_FOUND' ? (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-mono font-bold rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>RETURN TO DASHBOARD</span>
                  </Link>
                ) : errorState.type === 'RATE_LIMITED' ? (
                  <span className="text-xs font-mono text-slate-500 py-2">
                    Quota resets in 10 minutes. Please check back shortly.
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleGenerate(isGenerated)}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold rounded-xl transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>RETRY REQUEST</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATE 1: NOT GENERATED */}
      {!isGenerated && !isGenerating && !errorState && (
        <div className="bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 p-8 rounded-2xl text-center my-4">
          <div className="inline-flex p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            AI Bullet Point Refinements
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed mb-6 font-sans">
            Our audit engine reviews your resume bullets against executive ATS standards, eliminating passive openers, 
            wordy filler, and buried results. Every rewrite preserves 100% of your real technologies and never invents metrics.
          </p>
          <button
            type="button"
            onClick={() => handleGenerate(false)}
            className="inline-flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3 font-mono font-bold text-sm tracking-wider uppercase rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-slate-900"
          >
            <Sparkles className="w-4 h-4" />
            <span>GENERATE REWRITES</span>
          </button>
        </div>
      )}

      {/* STATE 4: EMPTY WITH NOTE ("Your bullets already read well") */}
      {isEmptyWithNote && !isGenerating && (
        <div className="bg-white dark:bg-slate-900/80 border border-emerald-300 dark:border-emerald-500/30 p-6 sm:p-7 rounded-2xl mb-8 shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  VERIFIED_AUDIT
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-sans">
                Your bullets already read well
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 leading-relaxed font-sans">
                The audit checklist did not detect any passive phrasing, internal redundancy, or subjective filler in your bullet points.
              </p>

              {/* AI NOTE Labelled Card */}
              {note && (
                <div className="mt-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
                  <div className="flex items-center space-x-2 mb-1.5">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700">
                      AI NOTE
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Expert Assessment</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 italic font-sans leading-relaxed">
                    "{note}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STATE 3: RESULTS (ONE CARD PER REWRITE) */}
      {hasRewrites && !isGenerating && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 px-1">
            <span>SHOWING {rewrites.length} TARGETED REWRITE{rewrites.length > 1 ? 'S' : ''}</span>
            <span className="text-emerald-600 dark:text-emerald-400">CHECKED_AGAINST_YOUR_TEXT</span>
          </div>

          <div className="space-y-6">
            {rewrites.map((item, idx) => (
              <div 
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-600"
              >
                {/* Card Top: Section Tag & Copy Button */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                      {item.section || 'SECTION'}
                    </span>
                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500 font-semibold">
                      #{idx + 1}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopySingle(item.improved, idx)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-mono font-bold rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    title="Copy improved bullet to clipboard"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                        <span className="text-emerald-600 dark:text-emerald-400">COPIED</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        <span>COPY</span>
                      </>
                    )}
                  </button>
                </div>

                {/* BEFORE & AFTER BLOCKS */}
                <div className="space-y-4">
                  {/* BEFORE Block */}
                  <div className="bg-amber-50/60 dark:bg-slate-950/70 border border-amber-200 dark:border-slate-800/90 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest bg-amber-100 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-500/20">
                        [BEFORE]
                      </span>
                      <span className="text-xs text-slate-500 font-mono">Original Resume Bullet</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                      {item.original}
                    </p>
                  </div>

                  {/* AFTER Block */}
                  <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-500/30 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest bg-emerald-100 dark:bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-500/30">
                        [AFTER]
                      </span>
                      <span className="text-xs text-emerald-700/80 dark:text-emerald-400/80 font-mono">Improved Technical Bullet</span>
                    </div>
                    <p className="text-sm text-slate-900 dark:text-white font-sans font-medium leading-relaxed">
                      {item.improved}
                    </p>
                  </div>
                </div>

                {/* Single-line Structural Reason */}
                {item.reason && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-start space-x-2">
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 flex-shrink-0 font-bold uppercase tracking-wider">
                      REASON:
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                      {item.reason.trim().endsWith('.') ? item.reason.trim() : `${item.reason.trim()}.`}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* METRIC PROMPTS BLOCK (Shown whether or not rewrites exist, if metricPrompts exist) */}
      {isGenerated && hasMetricPrompts && !isGenerating && (
        <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-700/80">
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-1">
              <Hash className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-wide font-sans uppercase">
                ADD REAL NUMBERS
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-sans">
              Only add figures you can verify. Examples show the format, not suggested values.
            </p>
          </div>

          <div className="space-y-4">
            {metricPrompts.map((mp, i) => (
              <div 
                key={i}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/70 p-5 rounded-2xl space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    {mp.section || 'PROJECTS'}
                  </span>
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500 font-semibold">
                    PROMPT #{i + 1}
                  </span>
                </div>

                {/* Original Bullet Context */}
                <div className="text-xs text-slate-600 dark:text-slate-400 font-sans bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80">
                  <span className="font-mono text-slate-500 font-bold mr-2 uppercase">[CONTEXT]</span>
                  {mp.original}
                </div>

                {/* Prompt with Monospace Bracket Highlights */}
                <div className="text-sm text-slate-800 dark:text-slate-200 font-sans leading-relaxed pl-2 border-l-2 border-emerald-500">
                  {renderPromptWithHighlights(mp.prompt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footnote */}
      <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-700/60 text-xs text-slate-500 leading-relaxed font-sans">
        <p>
          * Suggestions are AI-generated based on structural patterns. Review and check every line for technical accuracy before using it on your resume. Scores and recommendations are estimates and do not guarantee a higher score in any real ATS.
        </p>
      </div>

      {/* REGENERATE CONFIRMATION MODAL */}
      {showConfirmRegenerate && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <div className="bg-white dark:bg-slate-900 max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-700 rounded-2xl transition-all">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 id="confirm-modal-title" className="text-lg font-bold text-slate-900 dark:text-white font-sans">
                Regenerate Rewrite Suggestions?
              </h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 font-sans">
              Regenerating will replace your currently saved suggestions and consume one request from your rate limit 
              (5 requests per 10 minutes).
            </p>
            <div className="flex justify-end space-x-3 border-t border-slate-200 dark:border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setShowConfirmRegenerate(false)}
                className="px-4 py-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => handleGenerate(true)}
                className="px-4 py-2 text-xs font-mono font-bold text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl transition-all shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                CONFIRM &amp; REGENERATE
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default RewriteSuggestions;
