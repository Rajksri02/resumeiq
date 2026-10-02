import { useState, useEffect } from 'react';

const ScoreGauge = ({ score }) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    // Animate score from 0 to target
    let start = 0;
    const duration = 1500; // 1.5 seconds
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

  // Determine color only when animation finishes or gets close to finish
  const isFinished = displayScore === score;
  
  let colorClass = 'text-brand-ink';
  let borderClass = 'border-brand-ink';
  let bgClass = 'bg-brand-pearl';
  
  if (isFinished) {
    if (score >= 75) {
      colorClass = 'text-brand-emerald';
      borderClass = 'border-brand-emerald';
      bgClass = 'bg-brand-emerald/10';
    } else if (score >= 50) {
      colorClass = 'text-brand-coral';
      borderClass = 'border-brand-coral';
      bgClass = 'bg-brand-coral/10';
    } else {
      colorClass = 'text-brand-crimson';
      borderClass = 'border-brand-crimson';
      bgClass = 'bg-brand-crimson/10';
    }
  }

  return (
    <div className={`relative w-full aspect-square border-4 ${borderClass} flex flex-col items-center justify-center transition-colors duration-500 overflow-hidden`}>
      {/* Subtle structural background grid */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{
          backgroundImage: 'linear-gradient(to right, #0B0F19 1px, transparent 1px), linear-gradient(to bottom, #0B0F19 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      ></div>
      
      {/* Animated background color */}
      <div className={`absolute inset-0 ${bgClass} transition-colors duration-1000`}></div>
      
      <div className="relative z-10 flex flex-col items-center">
        <span className="text-sm font-bold uppercase tracking-[0.2em] text-brand-ink/70 mb-2">
          ATS Score
        </span>
        <span className={`text-8xl sm:text-9xl font-display font-black leading-none tracking-tighter ${colorClass} transition-colors duration-500`}>
          {displayScore}
        </span>
        <span className="text-xs font-bold uppercase tracking-wider text-brand-ink/50 mt-4 border-t-2 border-brand-ink/10 pt-2 w-16 text-center">
          / 100
        </span>
      </div>
    </div>
  );
};

export default ScoreGauge;
