'use client';

import { useState, useRef, useEffect } from 'react';

export interface FilterOption {
  value: string;
  label: string;
  dot?: string;
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  options: FilterOption[];
  icon: string;
  label: (current: FilterOption) => string;
}

export default function FilterDropdown({ value, onChange, options, icon, label }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const current = options.find((o) => o.value === value) || options[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-700 bg-gray-800/60 text-gray-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
      >
        <div className="w-4 h-4 flex items-center justify-center"><i className={icon}></i></div>
        {current.dot && <span className={`w-2 h-2 rounded-full ${current.dot}`}></span>}
        {label(current)}
        <div className="w-4 h-4 flex items-center justify-center">
          <i className={open ? 'ri-arrow-up-s-line text-gray-500' : 'ri-arrow-down-s-line text-gray-500'}></i>
        </div>
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-56 rounded-lg border border-gray-700 bg-[#111827] shadow-xl overflow-hidden">
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-colors cursor-pointer whitespace-nowrap ${
                o.value === value ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800/60 hover:text-white'
              }`}
            >
              {o.dot && <span className={`w-2 h-2 rounded-full ${o.dot}`}></span>}
              {o.label}
              {o.value === value && (
                <span className="ml-auto text-blue-400"><i className="ri-check-line text-sm"></i></span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}