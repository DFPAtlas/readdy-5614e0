import { useMemo } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Incident } from '@/lib/useIncidents';
import SeverityBadge from './SeverityBadge';
import IncidentStatusBadge from './IncidentStatusBadge';
import { SEVERITY_COLORS } from '@/lib/useIncidents';

interface Props {
  incidents: Incident[];
  loading: boolean;
  sortKey: string;
  sortDir: 'asc' | 'desc';
  onSort: (key: string) => void;
  onView: (incident: Incident) => void;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  total: number;
  search: string;
}

const headers = [
  { key: 'severity', label: 'Severity' },
  { key: 'incident_type', label: 'Type' },
  { key: 'site_name', label: 'Site' },
  { key: 'guard_name', label: 'Reported By' },
  { key: 'occurred_at', label: 'Date/Time' },
  { key: 'status', label: 'Status' },
];

export default function IncidentsTable({
  incidents,
  loading,
  sortKey,
  sortDir,
  onSort,
  onView,
  page,
  totalPages,
  onPageChange,
  total,
  search,
}: Props) {
  const paged = incidents;

  if (loading && incidents.length === 0) {
    return (
      <div className="bg-[#111827]/60 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800">
          <div className="h-4 bg-gray-800/60 rounded w-32 animate-pulse"></div>
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-4 py-4 border-b border-gray-800/50 flex gap-4 animate-pulse">
            <div className="h-6 bg-gray-800/60 rounded w-20"></div>
            <div className="h-6 bg-gray-800/60 rounded w-28"></div>
            <div className="h-6 bg-gray-800/60 rounded w-36"></div>
            <div className="h-6 bg-gray-800/60 rounded w-24"></div>
            <div className="h-6 bg-gray-800/60 rounded w-20"></div>
            <div className="h-6 bg-gray-800/60 rounded w-16"></div>
            <div className="flex-1"></div>
          </div>
        ))}
      </div>
    );
  }

  if (paged.length === 0) {
    return (
      <div className="text-center py-16 bg-[#111827]/60 border border-gray-800 rounded-xl">
        <div className="w-12 h-12 mx-auto flex items-center justify-center text-gray-600 mb-3">
          <i className="ri-alarm-warning-line text-2xl"></i>
        </div>
        <p className="text-gray-400 text-sm">
          {search.trim() ? 'No incidents match your filters.' : 'No incidents yet. Log one to get started.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#111827]/60 border border-gray-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              {headers.map((h) => (
                <th
                  key={h.key}
                  onClick={() => onSort(h.key)}
                  className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    {h.label}
                    {sortKey === h.key && (
                      <div className="w-3.5 h-3.5 flex items-center justify-center text-blue-400">
                        {sortDir === 'asc' ? (
                          <i className="ri-arrow-up-s-line"></i>
                        ) : (
                          <i className="ri-arrow-down-s-line"></i>
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                Description
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paged.map((incident) => {
              const sev = (incident.severity || 'low').toLowerCase();
              const dotColor = SEVERITY_COLORS[sev]?.dot || 'bg-emerald-500';
              const desc = incident.description || '';
              const truncated = desc.length > 60 ? desc.slice(0, 60) + '...' : desc;

              return (
                <tr
                  key={incident.id}
                  onClick={() => onView(incident)}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <SeverityBadge severity={incident.severity} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-white font-medium">
                    {incident.incident_type || '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                    {incident.site_name || '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                    {incident.guard_name || '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-300 tabular-nums">
                    {incident.occurred_at
                      ? format(new Date(incident.occurred_at), 'd MMM, HH:mm')
                      : '—'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <IncidentStatusBadge status={incident.status} />
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <div className="text-gray-300 truncate" title={desc}>
                      {truncated || '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/incidents/${incident.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                    >
                      <i className="ri-eye-line"></i>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-800 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {total} incident{total !== 1 ? 's' : ''} · Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <i className="ri-arrow-left-s-line"></i>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  p === page ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <i className="ri-arrow-right-s-line"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}