const SkillBadge = ({ skill, type }) => {
  const isMatch = type === 'match';
  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 text-xs font-bold uppercase tracking-wider font-sans border transition-colors
        ${isMatch 
          ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20' 
          : 'bg-brand-pearl text-brand-ink/70 border-gray-200'
        }
      `}
    >
      {skill}
    </span>
  );
};

export default SkillBadge;
