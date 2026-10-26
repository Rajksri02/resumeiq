const SkillBadge = ({ skill, type }) => {
  const isMatch = type === 'match';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider border rounded-lg transition-colors
        ${isMatch 
          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30' 
          : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700'
        }
      `}
    >
      {isMatch ? '> ' : '- '}{skill}
    </span>
  );
};

export default SkillBadge;
