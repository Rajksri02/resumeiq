import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FeedbackAccordion = ({ section, feedback }) => {
  const [isOpen, setIsOpen] = useState(false);

  // feedback is just a string now, so we can split it into points if it has bullet points, or just render it
  const isString = typeof feedback === 'string';
  const displayFeedback = isString ? feedback : 'No feedback available.';

  return (
    <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none"
      >
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-gray-800 capitalize">{section}</span>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>
      
      {isOpen && (
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="text-gray-600 text-sm whitespace-pre-wrap">
            {displayFeedback}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackAccordion;
