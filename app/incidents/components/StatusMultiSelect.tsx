import { useState } from 'react';

export default function StatusMultiSelect({
  value,
  onChange,
}: {
  value: string[];
  onChange: (val: string[]) => void;
}) {
  const options = ['open', 'reviewing', 'closed'];

  const toggle = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const colors: Record<string, string> = {
    open: 'border-red-500/30 text-red-400 hover:bg-red-500/10',
    reviewing: 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10',
    closed: 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10',
  };

  const activeColors: Record<string, string> = {
    open: 'bg-red-500/15 border-red-500/50 text-red-400',
    reviewing: 'bg-amber-500/15 border-amber-500/50 text-amber-400',
    closed: 'bg-emerald-500/15 border-emerald-500/50 text-emerald-400',
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