import { useState, useEffect } from 'react';

const ScoreGauge = ({ score }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const target = score || 0;
    if (target === 0) return;
    
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setDisplayScore(target);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [score]);

  const isFinished = displayScore === score;
  
  let colorClass = 'text-slate-500';
  let borderClass = 'border-slate-700';
  let bgClass = 'bg-slate-900';
  
  if (isFinished) {
    if (score >= 75) {
      colorClass = 'text-emerald-400';
      borderClass = 'border-emerald-500/50';
      bgClass = 'bg-emerald-500/10';
    } else if (score >= 50) {
      colorClass = 'text-amber-400';
      borderClass = 'border-amber-500/50';
      bgClass = 'bg-amber-500/10';
    } else {
      colorClass = 'text-red-400';
      borderClass = 'border-red-500/50';
      bgClass = 'bg-red-500/10';
    }
  }

  return (
    <div className={`relative w-full border-2 ${borderClass} ${bgClass} flex flex-col p-6 transition-colors duration-500 rounded-xl overflow-hidden`}>
      {/* Barcode-like visual at the top */}
      <div className="flex space-x-1 mb-6 opacity-30">
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`h-2 ${i % 3 === 0 ? 'w-2' : 'w-1'} ${colorClass.replace('text-', 'bg-')}`}></div>
        ))}
      </div>
      
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400 mb-1">
            VERIFIED_SCORE
          </span>
          <div className="flex items-baseline space-x-2">
            <span className={`text-6xl sm:text-7xl font-mono font-bold leading-none ${colorClass} transition-colors duration-500`}>
              {displayScore}
            </span>
            <span className="text-lg font-mono font-bold text-slate-500">
              / 100
            </span>
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[10px] font-mono text-slate-500 tracking-widest mb-1">AUDIT_STATUS</span>
          <span className={`text-sm font-mono font-bold tracking-wider px-2 py-1 border ${borderClass} ${colorClass} bg-slate-950/50 rounded`}>
            {isFinished ? (score >= 75 ? 'PASSED' : score >= 50 ? 'REVIEW' : 'FAILED') : 'CALCULATING'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScoreGauge;
