'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface FilterState {
  clientId: string;
  siteId: string;
  from: string;
  to: string;
  shiftType: string;
  guardId: string;
}

export const defaultFilters: FilterState = {
  clientId: '',
  siteId: '',
  from: '',
  to: '',
  shiftType: '',
  guardId: '',
};

interface SLAFiltersProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  sites: { id: string; site_name: string }[];
  guards: { id: string; first_name: string; last_name: string }[];
}

export default function SLAFilters({ filters, onChange, sites, guards }: SLAFiltersProps) {
  const [expanded, setExpanded] = useState(false);

  const update = (key: keyof FilterState, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const clearAll = () => {
    onChange({ ...defaultFilters });
  };

  const activeCount = Object.values(filters).filter((v) => v !== '').length;

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <div className="w-4 h-4 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <i className="ri-calendar-line text-sm"></i>
          </div>
          <input
            type="date"
            value={filters.from}
            onChange={(e) => update('from', e.target.value)}
            className="w-full bg-gray-800/60 border border-gray-700 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <div className="w-4 h-4 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <i className="ri-calendar-check-line text-sm"></i>
          </div>
          <input
            type="date"
            value={filters.to}
            onChange={(e) => update('to', e.target.value)}
            className="w-full bg-gray-800/60 border border-gray-700 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <div className="w-4 h-4 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <i className="ri-building-line text-sm"></i>
          </div>
          <select
            value={filters.siteId}
            onChange={(e) => update('siteId', e.target.value)}
            className="w-full bg-gray-800/60 border border-gray-700 rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
          >
            <option value="">All Sites</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.site_name}
              </option>
            ))}
          </select>
          <div className="w-4 h-4 flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
            <i className="ri-arrow-down-s-line text-sm"></i>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            {expanded ? (
              <i className="ri-arrow-up-s-line text-sm"></i>
            ) : (
              <i className="ri-arrow-down-s-line text-sm"></i>
            )}
          </div>
          More filters
          {activeCount > 0 && (
            <span className="bg-blue-600/30 text-blue-400 text-xs px-1.5 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </button>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-400 hover:text-red-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-close-circle-line text-sm"></i>
            </div>
            Clear
          </button>
        )}
      </div>

      {expanded && (
        <div className="flex items-center gap-3 flex-wrap mt-3 pt-3 border-t border-white/10">
          <div className="relative flex-1 min-w-[200px]">
            <div className="w-4 h-4 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <i className="ri-shield-user-line text-sm"></i>
            </div>
            <select
              value={filters.guardId}
              onChange={(e) => update('guardId', e.target.value)}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="">All Guards</option>
              {guards.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.first_name} {g.last_name}
                </option>
              ))}
            </select>
            <div className="w-4 h-4 flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              <i className="ri-arrow-down-s-line text-sm"></i>
            </div>
          </div>
          <div className="relative flex-1 min-w-[200px]">
            <div className="w-4 h-4 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <i className="ri-time-line text-sm"></i>
            </div>
            <select
              value={filters.shiftType}
              onChange={(e) => update('shiftType', e.target.value)}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg pl-10 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
            >
              <option value="">All Shift Types</option>
              <option value="day">Day</option>
              <option value="night">Night</option>
              <option value="weekend">Weekend</option>
              <option value="overtime">Overtime</option>
            </select>
            <div className="w-4 h-4 flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              <i className="ri-arrow-down-s-line text-sm"></i>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}