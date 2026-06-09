interface Props {
  skills: string[] | null;
  showAll?: boolean;
}

export default function SkillsChips({ skills, showAll }: Props) {
  if (!skills || skills.length === 0) return <span className="text-xs text-gray-500">—</span>;

  const visible = showAll ? skills : skills.slice(0, 2);
  const remaining = skills.length - visible.length;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {visible.map((skill) => (
        <span
          key={skill}
          className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-700/50 text-gray-300 border border-gray-700"
          title={skills.join(', ')}
        >
          {skill}
        </span>
      ))}
      {!showAll && remaining > 0 && (
        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-700/30 text-gray-400 border border-gray-700">
          +{remaining}
        </span>
      )}
    </div>
  );
}