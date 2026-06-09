'use client';

import { useState } from 'react';

const SelectButton = ({
  value,
  options,
  onChange,
  icon,
  label,
  activeLabel,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  icon: string;
  label: string;
  activeLabel?: string;
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const display = selected ? selected.label : label;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
      >
        <div className="w-4 h-4 flex items-center justify-center text-gray-500">
          <i className={`${icon} text-sm`}></i>
        </div>
        <span className={value === 'all' ? 'text-gray-400' : 'text-white'}>{display}</span>
        <div className="w-4 h-4 flex items-center justify-center text-gray-500">
          <i className={`ri-arrow-down-s-line text-sm ${open ? 'rotate-180' : ''} transition-transform`}></i>
        </div>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-48 bg-[#0f172a] border border-white/10 rounded-lg shadow-lg z-50 overflow-hidden">
            {options.map((o) => (
              <button
                key={o.value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer ${
                  value === o.value ? 'bg-blue-500/10 text-blue-400' : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function AssignmentFilters({
  clients,
  sites,
  guards,
  filters,
  onChange,
  onClear,
}: {
  clients: { id: string; name: string }[];
  sites: { id: string; site_name: string }[];
  guards: { id: string; guard_name: string }[];
  filters: any;
  onChange: (f: any) => void;
  onClear: () => void;
}) {
  const [showMore, setShowMore] = useState(false);
  const activeCount = Object.values(filters || {}).filter((v) => v && v !== 'all').length;

  const update = (key: string, value: string) => onChange({ ...(filters || {}), [key]: value });

  const clientOptions = [{ value: 'all', label: 'All Clients' }, ...clients.map((c) => ({ value: c.id, label: c.name }))];
  const siteOptions = [{ value: 'all', label: 'All Sites' }, ...sites.map((s) => ({ value: s.id, label: s.site_name }))];
  const guardOptions = [{ value: 'all', label: 'All Guards' }, ...guards.map((g) => ({ value: g.id, label: g.guard_name }))];
  const licenceOptions = [
    { value: 'all', label: 'All Licence' },
    { value: 'valid', label: 'Valid' },
    { value: 'expiring', label: 'Expiring' },
    { value: 'expired', label: 'Expired' },
  ];
  const trainingOptions = [
    { value: 'all', label: 'All Training' },
    { value: 'complete', label: 'Complete' },
    { value: 'missing', label: 'Missing' },
    { value: 'induction_complete', label: 'Induction Complete' },
    { value: 'induction_pending', label: 'Induction Pending' },
  ];
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'approved', label: 'Approved' },
    { value: 'available', label: 'Available' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'expired_docs', label: 'Expired Docs' },
    { value: 'not_trained', label: 'Not Trained' },
  ];

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative">
        <div className="w-4 h-4 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          <i className="ri-search-line text-sm"></i>
        </div>
        <input
          type="text"
          placeholder="Search guard or site..."
          value={filters?.search || ''}
          onChange={(e) => update('search', e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-48"
        />
      </div>

      <SelectButton
        value={filters?.site || 'all'}
        options={siteOptions}
        onChange={(v) => update('site', v)}
        icon="ri-building-line"
        label="All Sites"
      />

      <SelectButton
        value={filters?.guard || 'all'}
        options={guardOptions}
        onChange={(v) => update('guard', v)}
        icon="ri-shield-user-line"
        label="All Guards"
      />

      <SelectButton
        value={filters?.client || 'all'}
        options={clientOptions}
        onChange={(v) => update('client', v)}
        icon="ri-briefcase-line"
        label="All Clients"
      />

      <button
        onClick={() => setShowMore(!showMore)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg cursor-pointer whitespace-nowrap"
      >
        <div className="w-4 h-4 flex items-center justify-center">
          <i className="ri-filter-3-line text-sm"></i>
        </div>
        More Filters
        {activeCount > 0 && (
          <span className="bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">{activeCount}</span>
        )}
      </button>

      {activeCount > 0 && (
        <button
          onClick={onClear}
          className="text-sm text-gray-500 hover:text-white transition-colors cursor-pointer"
        >
          Clear all
        </button>
      )}

      {showMore && (
        <div className="w-full flex flex-wrap gap-3 mt-1">
          <SelectButton
            value={filters?.licence || 'all'}
            options={licenceOptions}
            onChange={(v) => update('licence', v)}
            icon="ri-file-list-line"
            label="All Licence"
          />

          <SelectButton
            value={filters?.training || 'all'}
            options={trainingOptions}
            onChange={(v) => update('training', v)}
            icon="ri-graduation-cap-line"
            label="All Training"
          />

          <SelectButton
            value={filters?.status || 'all'}
            options={statusOptions}
            onChange={(v) => update('status', v)}
            icon="ri-toggle-line"
            label="All Status"
          />
        </div>
      )}
    </div>
  );
}