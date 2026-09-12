'use client';

import { useState, useRef, useEffect } from 'react';

const levels: { value: string; label: string; dot: string }[] = [
  { value: 'all', label: 'All Risk Levels', dot: 'bg-gray-400' },
  { value: 'low', label: 'Low', dot: 'bg-emerald-500' },
  { value: 'medium', label: 'Medium', dot: 'bg-amber-500' },
  { value: 'high', label: 'High', dot: 'bg-orange-500' },
  { value: 'critical', label: 'Critical', dot: 'bg-red-500' },
];

export default function RiskFilterDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const current = levels.find((l) => l.value === value) || levels[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-700 bg-gray-800/60 text-gray-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
      >
        <div className="w-4 h-4 flex items-center justify-center"><i className="ri-filter-line"></i></div>
        <span className={`w-2 h-2 rounded-full ${current.dot}`}></span>
        {current.label}
        <div className="w-4 h-4 flex items-center justify-center"><i className={open ? 'ri-arrow-up-s-line text-gray-500' : 'ri-arrow-down-s-line text-gray-500'}></i></div>
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-52 rounded-lg border border-gray-700 bg-[#111827] shadow-xl overflow-hidden">
          {levels.map((l) => (
            <button
              key={l.value}
              onClick={() => { onChange(l.value); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors cursor-pointer whitespace-nowrap ${
                l.value === value ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800/60 hover:text-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${l.dot}`}></span>
              {l.label}
              {l.value === value && (
                <span className="ml-auto text-blue-400"><i className="ri-check-line text-sm"></i></span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}