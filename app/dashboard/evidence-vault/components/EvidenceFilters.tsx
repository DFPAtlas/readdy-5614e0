'use client';

import { useState } from 'react';

interface Props {
  sites: { id: string; site_name: string }[];
  guards: { id: string; first_name: string; last_name: string }[];
  clients: { id: string; name: string }[];
  onChange: (filters: any) => void;
}

export default function EvidenceFilters({ sites, guards, clients, onChange }: Props) {
  const [search, setSearch] = useState('');
  const [siteId, setSiteId] = useState('');
  const [guardId, setGuardId] = useState('');
  const [clientId, setClientId] = useState('');
  const [fileType, setFileType] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');
  const [linkedTo, setLinkedTo] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showMore, setShowMore] = useState(false);

  const apply = () => {
    onChange({
      search: search || undefined,
      site_id: siteId || undefined,
      guard_id: guardId || undefined,
      client_id: clientId || undefined,
      file_type: fileType || undefined,
      review_status: reviewStatus || undefined,
      linked_to: linkedTo || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    });
  };

  const clear = () => {
    setSearch('');
    setSiteId('');
    setGuardId('');
    setClientId('');
    setFileType('');
    setReviewStatus('');
    setLinkedTo('');
    setDateFrom('');
    setDateTo('');
    onChange({});
  };

  const activeCount = [search, siteId, guardId, clientId, fileType, reviewStatus, linkedTo, dateFrom, dateTo].filter(Boolean).length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <div className="w-4 h-4 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <i className="ri-search-line text-sm"></i>
          </div>
          <input
            type="text"
            placeholder="Search evidence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && apply()}
            className="w-full bg-gray-800/60 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={siteId}
          onChange={(e) => setSiteId(e.target.value)}
          className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">All Sites</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>{s.site_name}</option>
          ))}
        </select>

        <select
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
          className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">All Types</option>
          <option value="image">Image</option>
          <option value="video">Video</option>
          <option value="pdf">PDF</option>
          <option value="audio">Audio</option>
          <option value="document">Document</option>
        </select>

        <select
          value={reviewStatus}
          onChange={(e) => setReviewStatus(e.target.value)}
          className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">All Status</option>
          <option value="unreviewed">Unreviewed</option>
          <option value="reviewed">Reviewed</option>
          <option value="flagged">Flagged</option>
          <option value="archived">Archived</option>
        </select>

        <button
          onClick={() => setShowMore(!showMore)}
          className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300 hover:text-white transition-colors whitespace-nowrap"
        >
          More Filters
          {activeCount > 0 && <span className="ml-1.5 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5">{activeCount}</span>}
        </button>

        <button
          onClick={apply}
          className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap"
        >
          Apply
        </button>

        {activeCount > 0 && (
          <button
            onClick={clear}
            className="text-gray-400 hover:text-white text-sm px-2 transition-colors whitespace-nowrap"
          >
            Clear
          </button>
        )}
      </div>

      {showMore && (
        <div className="flex flex-wrap gap-2">
          <select
            value={guardId}
            onChange={(e) => setGuardId(e.target.value)}
            className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Guards</option>
            {guards.map((g) => (
              <option key={g.id} value={g.id}>{g.first_name} {g.last_name}</option>
            ))}
          </select>

          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={linkedTo}
            onChange={(e) => setLinkedTo(e.target.value)}
            className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Links</option>
            <option value="incident">Incident</option>
            <option value="patrol">Patrol</option>
            <option value="ob">OB Entry</option>
            <option value="report">Report</option>
            <option value="maintenance">Maintenance</option>
            <option value="welfare">Welfare</option>
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      )}
    </div>
  );
}