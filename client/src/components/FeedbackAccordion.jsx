import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FeedbackAccordion = ({ section, feedback }) => {
  const [isOpen, setIsOpen] = useState(false);

  // feedback is just a string now, so we can split it into points if it has bullet points, or just render it
  const isString = typeof feedback === 'string';
  const displayFeedback = isString ? feedback : 'No feedback available.';

  return (
    <div className="border border-gray-200 mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-brand-pearl hover:bg-gray-200 transition-colors focus:outline-none"
      >
        <div className="flex items-center space-x-3">
          <span className="font-display font-bold text-brand-ink uppercase tracking-wider text-sm">{section}</span>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>
      
      {isOpen && (
        <div className="p-6 bg-brand-white border-t border-gray-200">
          <div className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed font-sans">
            {displayFeedback}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackAccordion;
