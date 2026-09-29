import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FeedbackAccordion = ({ section, feedback }) => {
  const [isOpen, setIsOpen] = useState(false);

  // feedback is an object with score and comments
  const score = feedback?.score || 0;
  const comments = feedback?.comments || [];

  return (
    <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none"
      >
        <div className="flex items-center space-x-3">
          <span className="font-semibold text-gray-800 capitalize">{section}</span>
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
            score >= 8 ? 'bg-green-100 text-green-800' :
            score >= 5 ? 'bg-amber-100 text-amber-800' :
            'bg-red-100 text-red-800'
          }`}>
            {score}/10
          </span>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>
      
      {isOpen && (
        <div className="p-4 bg-white border-t border-gray-200">
          <ul className="space-y-3">
            {comments.map((comment, i) => (
              <li key={i} className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2"></div>
                </div>
                <span className="ml-3 text-gray-600 text-sm">{comment}</span>
              </li>
            ))}
            {comments.length === 0 && (
              <p className="text-gray-500 italic text-sm">No specific feedback for this section.</p>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FeedbackAccordion;
