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
  
  let colorClass = 'text-slate-400 dark:text-slate-500';
  let borderClass = 'border-slate-200 dark:border-slate-700';
  let bgClass = 'bg-slate-100/70 dark:bg-slate-900';
  let barColor = 'bg-slate-400 dark:bg-slate-600';
  
  if (isFinished) {
    if (score >= 75) {
      colorClass = 'text-emerald-600 dark:text-emerald-400';
      borderClass = 'border-emerald-300 dark:border-emerald-500/50';
      bgClass = 'bg-emerald-50/70 dark:bg-emerald-500/10';
      barColor = 'bg-emerald-500';
    } else if (score >= 50) {
      colorClass = 'text-amber-600 dark:text-amber-400';
      borderClass = 'border-amber-300 dark:border-amber-500/50';
      bgClass = 'bg-amber-50/70 dark:bg-amber-500/10';
      barColor = 'bg-amber-500';
    } else {
      colorClass = 'text-rose-600 dark:text-red-400';
      borderClass = 'border-rose-300 dark:border-red-500/50';
      bgClass = 'bg-rose-50/70 dark:bg-red-500/10';
      barColor = 'bg-rose-500';
    }
  }

  return (
    <div className={`relative w-full border-2 ${borderClass} ${bgClass} flex flex-col p-6 transition-all duration-300 rounded-2xl overflow-hidden shadow-sm`}>
      {/* Barcode-like visual at the top */}
      <div className="flex space-x-1 mb-6 opacity-40">
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`h-2 ${i % 3 === 0 ? 'w-2' : 'w-1'} ${barColor} rounded-xs`}></div>
        ))}
      </div>
      
      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">
            VERIFIED_SCORE
          </span>
          <div className="flex items-baseline space-x-2">
            <span className={`text-6xl sm:text-7xl font-mono font-bold leading-none ${colorClass} transition-colors duration-500`}>
              {displayScore}
            </span>
            <span className="text-lg font-mono font-bold text-slate-400 dark:text-slate-500">
              / 100
            </span>
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 tracking-widest mb-1">AUDIT_STATUS</span>
          <span className={`text-sm font-mono font-bold tracking-wider px-2.5 py-1 border ${borderClass} ${colorClass} bg-white/90 dark:bg-slate-950/60 rounded-lg shadow-xs`}>
            {isFinished ? (score >= 75 ? 'PASSED' : score >= 50 ? 'REVIEW' : 'FAILED') : 'CALCULATING'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScoreGauge;
