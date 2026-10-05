const SkillBadge = ({ skill, type }) => {
  const isMatch = type === 'match';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider border rounded-md transition-colors
        ${isMatch 
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
          : 'bg-slate-900 text-slate-400 border-slate-700'
        }
      `}
    >
      {isMatch ? '> ' : '- '}{skill}
    </span>
  );
};

export default SkillBadge;
