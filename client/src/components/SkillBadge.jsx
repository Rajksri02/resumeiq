const SkillBadge = ({ skill, type }) => {
  const isMatch = type === 'match';
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
        ${isMatch 
          ? 'bg-green-100 text-green-800 border border-green-200' 
          : 'bg-red-100 text-red-800 border border-red-200'
        }
      `}
    >
      {skill}
    </span>
  );
};

export default SkillBadge;
