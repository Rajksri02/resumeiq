import { useState } from 'react';
import { ChevronDown, ChevronUp, Terminal } from 'lucide-react';

const FeedbackAccordion = ({ section, feedback }) => {
  const [isOpen, setIsOpen] = useState(false);

  const isString = typeof feedback === 'string';
  const displayFeedback = isString ? feedback : 'No feedback available.';

  return (
    <div className="border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden mb-3 bg-white dark:bg-slate-900 shadow-sm transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-slate-50/80 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500"
      >
        <div className="flex items-center space-x-3">
          <Terminal className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span className="font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm">SEC_{section}</span>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-500 dark:text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-500 dark:text-slate-400" />}
      </button>
      
      {isOpen && (
        <div className="p-6 border-t border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/60">
          <div className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap leading-relaxed font-sans">
            {displayFeedback}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackAccordion;
