'use client';

import type { OpsCompany, OpsSite } from '@/lib/useOperationsCommand';

interface FilterBarProps {
  companies: OpsCompany[];
  sites: OpsSite[];
  selectedCompanyId: string | null;
  selectedSiteId: string | null;
  onCompanyChange: (id: string | null) => void;
  onSiteChange: (id: string | null) => void;
}

export default function FilterBar({
  companies,
  sites,
  selectedCompanyId,
  selectedSiteId,
  onCompanyChange,
  onSiteChange,
}: FilterBarProps) {
  const filteredSites = selectedCompanyId
    ? sites.filter((s) => s.company_id === selectedCompanyId)
    : sites;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
      <span className="text-xs text-gray-500 font-medium shrink-0">Filter by</span>

      <div className="relative">
        <select
          value={selectedCompanyId || ''}
          onChange={(e) => onCompanyChange(e.target.value || null)}
          className="appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer min-w-[180px]"
        >
          <option value="" className="bg-[#0c1222] text-white">All Companies</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id} className="bg-[#0c1222] text-white">
              {c.name}
            </option>
          ))}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4 flex items-center justify-center text-gray-500">
          <i className="ri-arrow-down-s-line text-xs"></i>
        </div>
      </div>

      <div className="relative">
        <select
          value={selectedSiteId || ''}
          onChange={(e) => onSiteChange(e.target.value || null)}
          className="appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer min-w-[180px]"
        >
          <option value="" className="bg-[#0c1222] text-white">All Sites</option>
          {filteredSites.map((s) => (
            <option key={s.id} value={s.id} className="bg-[#0c1222] text-white">
              {s.site_name} {!selectedCompanyId ? `(${s.company_name})` : ''}
            </option>
          ))}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4 flex items-center justify-center text-gray-500">
          <i className="ri-arrow-down-s-line text-xs"></i>
        </div>
      </div>

      {(selectedCompanyId || selectedSiteId) && (
        <button
          onClick={() => {
            onCompanyChange(null);
            onSiteChange(null);
          }}
          className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer whitespace-nowrap"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}