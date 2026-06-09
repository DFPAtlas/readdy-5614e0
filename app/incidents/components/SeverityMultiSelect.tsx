import { useState } from 'react';

export default function SeverityMultiSelect({
  value,
  onChange,
}: {
  value: string[];
  onChange: (val: string[]) => void;
}) {
  const options = ['low', 'medium', 'high', 'critical'];

  const toggle = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const colors: Record<string, string> = {
    low: 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10',
    medium: 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10',
    high: 'border-orange-500/30 text-orange-400 hover:bg-orange-500/10',
    critical: 'border-red-500/30 text-red-400 hover:bg-red-500/10',
  };

  const activeColors: Record<string, string> = {
    low: 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400',
    medium: 'bg-amber-500/15 border-amber-500/50 text-amber-400',
    high: 'bg-orange-500/15 border-orange-500/50 text-orange-400',
    critical: 'bg-red-500/15 border-red-500/50 text-red-400',
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
              active ? activeColors[opt] : colors[opt]
            }`}
          >
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </button>
        );
      })}
    </div>
  );
}