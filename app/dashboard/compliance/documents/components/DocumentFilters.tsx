interface DocumentFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  entityFilter: string;
  onEntityChange: (v: 'all' | 'guard' | 'site' | 'client' | 'company') => void;
  typeFilter: string;
  onTypeChange: (v: string) => void;
  statusFilter: string;
  onStatusChange: (v: 'all' | 'expired' | 'expiring_7d' | 'expiring_30d' | 'active' | 'missing' | 'awaiting_review') => void;
}

const entityOptions: { label: string; value: 'all' | 'guard' | 'site' | 'client' | 'company' }[] = [
  { label: 'All Entities', value: 'all' },
  { label: 'Guard', value: 'guard' },
  { label: 'Site', value: 'site' },
  { label: 'Client', value: 'client' },
  { label: 'Company', value: 'company' },
];

const typeOptions = [
  { label: 'All Types', value: 'all' },
  { label: 'SIA Licence', value: 'sia_licence' },
  { label: 'Right to Work', value: 'right_to_work' },
  { label: 'First Aid', value: 'first_aid' },
  { label: 'Training Certificate', value: 'training_certificate' },
  { label: 'Insurance', value: 'insurance' },
  { label: 'Site Assignment', value: 'site_assignment' },
  { label: 'ACS Evidence', value: 'acs_evidence' },
  { label: 'Risk Assessment', value: 'risk_assessment' },
  { label: 'Assignment Instructions', value: 'assignment_instructions' },
  { label: 'Health & Safety', value: 'health_safety' },
];

const statusOptions: { label: string; value: 'all' | 'expired' | 'expiring_7d' | 'expiring_30d' | 'active' | 'missing' | 'awaiting_review' }[] = [
  { label: 'All Status', value: 'all' },
  { label: 'Expired', value: 'expired' },
  { label: 'Expiring 7 Days', value: 'expiring_7d' },
  { label: 'Expiring 30 Days', value: 'expiring_30d' },
  { label: 'Active', value: 'active' },
  { label: 'Missing', value: 'missing' },
  { label: 'Awaiting Review', value: 'awaiting_review' },
];

export default function DocumentFilters(props: DocumentFiltersProps) {
  const {
    search,
    onSearchChange,
    entityFilter,
    onEntityChange,
    typeFilter,
    onTypeChange,
    statusFilter,
    onStatusChange,
  } = props;

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4 space-y-3">
      <div className="relative">
        <div className="w-5 h-5 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          <i className="ri-search-line text-sm"></i>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search documents, guards, sites..."
          className="w-full bg-gray-800/60 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1">
          {entityOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onEntityChange(opt.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                entityFilter === opt.value ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onStatusChange(opt.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === opt.value ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {typeOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onTypeChange(opt.value)}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-all cursor-pointer whitespace-nowrap ${
              typeFilter === opt.value ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' : 'text-gray-500 hover:text-gray-300 border border-transparent'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}