import { useState } from 'react';
import { ChevronDown, ChevronUp, Terminal } from 'lucide-react';

const FeedbackAccordion = ({ section, feedback }) => {
  const [isOpen, setIsOpen] = useState(false);

  const isString = typeof feedback === 'string';
  const displayFeedback = isString ? feedback : 'No feedback available.';

  return (
    <div className="border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden mb-3 bg-white dark:bg-slate-900 shadow-sm transition-colors break-inside-avoid print:border-slate-300 print:bg-white print:shadow-none">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-slate-50/80 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500 print-preserve print:bg-slate-50 print:pointer-events-none"
      >
        <div className="flex items-center space-x-3">
          <Terminal className="w-4 h-4 text-slate-400 dark:text-slate-500 print:text-slate-700" />
          <span className="font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm print:text-slate-950">SEC_{section}</span>
        </div>
        <span className="print:hidden">
          {isOpen ? <ChevronUp className="w-5 h-5 text-slate-500 dark:text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-500 dark:text-slate-400" />}
        </span>
      </button>
      
      <div className={`p-6 border-t border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/60 print:border-slate-300 print:bg-white ${isOpen ? 'block' : 'hidden print:block'}`}>
        <div className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap leading-relaxed font-sans print:text-slate-900">
          {displayFeedback}
        </div>
      </div>
    </div>
  );
};

export default FeedbackAccordion;
