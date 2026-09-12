'use client';

interface SiteFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  riskFilter: string;
  setRiskFilter: (risk: string) => void;
  totalSites: number;
}

export default function SiteFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  riskFilter,
  setRiskFilter,
  totalSites,
}: SiteFiltersProps) {
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'archived', label: 'Archived' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const riskOptions = [
    { value: 'all', label: 'All Risks' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  return (
    <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-4 space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <div className="w-5 h-5 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <i className="ri-search-line text-sm"></i>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, address, or client..."
            className="w-full bg-gray-800/60 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter(statusOptions[(statusOptions.findIndex((o) => o.value === statusFilter) + 1) % statusOptions.length].value)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-700 bg-gray-800/60 text-gray-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-filter-line"></i></div>
            {statusOptions.find((o) => o.value === statusFilter)?.label || 'All Statuses'}
          </button>

          <button
            onClick={() => setRiskFilter(riskOptions[(riskOptions.findIndex((o) => o.value === riskFilter) + 1) % riskOptions.length].value)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-700 bg-gray-800/60 text-gray-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-shield-flash-line"></i></div>
            {riskOptions.find((o) => o.value === riskFilter)?.label || 'All Risks'}
          </button>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-800/40">
            <span className="text-xs text-gray-400">Showing</span>
            <span className="text-xs font-medium text-white">{totalSites} sites</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-gray-500">Active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-gray-500"></div>
          <span className="text-gray-500">Archived</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          <span className="text-gray-500">High Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-gray-500">Critical</span>
        </div>
      </div>
    </div>
  );
}