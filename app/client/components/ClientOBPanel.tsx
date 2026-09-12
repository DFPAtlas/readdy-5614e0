'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { OB_ENTRY_TYPE_LABELS } from '@/lib/useOccurrenceBook';

interface ClientOBEntryProp {
  id: string;
  site_id: string;
  entry_type: string;
  entry: string;
  title: string | null;
  occurred_at: string;
  site_name: string;
  guard_name: string;
}

interface ClientOBSite {
  id: string;
  site_name: string;
}

function formatDate(iso: string) {
  return format(new Date(iso), 'd MMM yyyy HH:mm');
}

export default function ClientOBPanel({
  entries,
  sites,
  loading,
}: {
  entries: ClientOBEntryProp[];
  sites: ClientOBSite[];
  loading?: boolean;
}) {
  const [selectedSite, setSelectedSite] = useState('');

  const filtered = selectedSite ? entries.filter((e) => e.site_id === selectedSite) : entries;
  const typeLabel = (t: string) => OB_ENTRY_TYPE_LABELS[t] || t;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="w-12 h-12 mx-auto flex items-center justify-center text-gray-600 mb-3">
          <i className="ri-book-open-line text-2xl"></i>
        </div>
        <p className="text-sm text-gray-500">No client-visible entries yet.</p>
        <p className="text-xs text-gray-600 mt-1">Entries marked as &quot;Client Visible&quot; by your security team will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sites.length > 1 && (
        <div className="flex items-center gap-2 mb-3">
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer pr-8"
          >
            <option value="">All Sites</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>{s.site_name}</option>
            ))}
          </select>
        </div>
      )}

      {filtered.map((entry) => (
        <div key={entry.id} className="bg-[#0f172a]/70 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-400">{typeLabel(entry.entry_type)}</span>
              <span className="text-xs text-gray-500">&middot;</span>
              <span className="text-xs text-gray-500">{entry.site_name}</span>
            </div>
            <span className="text-xs text-gray-500">{formatDate(entry.occurred_at)}</span>
          </div>
          {entry.title && (
            <h4 className="text-sm font-semibold text-white mb-1">{entry.title}</h4>
          )}
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap line-clamp-4">{entry.entry}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 text-[10px] font-bold">
              {entry.guard_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <span className="text-xs text-gray-400">{entry.guard_name}</span>
          </div>
        </div>
      ))}

      {filtered.length >= 50 && (
        <p className="text-xs text-gray-500 text-center">Showing latest 50 entries</p>
      )}
    </div>
  );
}