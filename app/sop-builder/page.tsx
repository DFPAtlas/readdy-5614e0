'use client';

import { useState, useMemo } from 'react';
import { useBuiltSOPs, BuiltSOP, getSOPTypeLabel } from '@/lib/useBuiltSOPs';
import Link from 'next/link';

const STATUS_OPTIONS = ['all', 'draft', 'in_review', 'approved', 'published', 'archived'];
const TYPE_OPTIONS = [
  'all', 'site_opening', 'site_lock_up', 'patrol_procedure', 'fire_evacuation',
  'alarm_activation', 'cctv_monitoring', 'visitor_management', 'key_holding',
  'lone_worker', 'incident_reporting', 'assignment_instructions', 'emergency_response',
];

function statusBadge(status: string) {
  const map: Record<string, string> = {
    draft: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    in_review: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    published: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    archived: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  const cls = map[status] || map.draft;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider font-semibold whitespace-nowrap ${cls}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export default function SOPBuilderListPage() {
  const { sops, loading, error, refetch } = useBuiltSOPs();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortKey, setSortKey] = useState('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    let result = [...sops];
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.sop_reference || '').toLowerCase().includes(q) ||
          (s.client_name || '').toLowerCase().includes(q) ||
          (s.site_name || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((s) => s.status === statusFilter);
    }
    if (typeFilter !== 'all') {
      result = result.filter((s) => s.sop_type === typeFilter);
    }
    result.sort((a, b) => {
      let aVal: any = (a as any)[sortKey] || '';
      let bVal: any = (b as any)[sortKey] || '';
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [sops, search, statusFilter, typeFilter, sortKey, sortDir]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">SOP Builder</h1>
          <p className="text-gray-400 text-sm mt-1">Create, manage, and publish Standard Operating Procedures</p>
        </div>
        <Link
          href="/sop-builder/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
          Create New SOP
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <div className="w-5 h-5 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <i className="ri-search-line text-sm"></i>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SOPs by title, reference, client, or site..."
            className="w-full bg-gray-800/60 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={() => setStatusFilter((r) => STATUS_OPTIONS[(STATUS_OPTIONS.indexOf(r) + 1) % STATUS_OPTIONS.length])}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-700 bg-gray-800/60 text-gray-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-filter-line"></i></div>
          {statusFilter === 'all' ? 'All Statuses' : statusFilter.replace(/_/g, ' ')}
        </button>

        <button
          onClick={() => setTypeFilter((r) => TYPE_OPTIONS[(TYPE_OPTIONS.indexOf(r) + 1) % TYPE_OPTIONS.length])}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-700 bg-gray-800/60 text-gray-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-stack-line"></i></div>
          {typeFilter === 'all' ? 'All Types' : getSOPTypeLabel(typeFilter)}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-error-warning-line"></i></div>
          {error}
        </div>
      )}

      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-loader-4-line animate-spin text-blue-500 text-xl"></i>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-xl bg-gray-800/50">
              <div className="w-6 h-6 flex items-center justify-center">
                <i className="ri-file-list-3-line text-gray-500 text-xl"></i>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-300 mb-1">
              {search ? 'No SOPs match your search' : 'No SOPs created yet'}
            </h3>
            <p className="text-sm text-gray-500">
              {search ? 'Try adjusting your search or filters' : 'Create your first SOP using the wizard.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/40">
                <tr>
                  <th
                    onClick={() => handleSort('title')}
                    className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                  >
                    Title {sortKey === 'title' && (sortDir === 'asc' ? <i className="ri-arrow-up-line ml-1"></i> : <i className="ri-arrow-down-line ml-1"></i>)}
                  </th>
                  <th
                    onClick={() => handleSort('sop_type')}
                    className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                  >
                    Type {sortKey === 'sop_type' && (sortDir === 'asc' ? <i className="ri-arrow-up-line ml-1"></i> : <i className="ri-arrow-down-line ml-1"></i>)}
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th
                    onClick={() => handleSort('version_number')}
                    className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                  >
                    Version {sortKey === 'version_number' && (sortDir === 'asc' ? <i className="ri-arrow-up-line ml-1"></i> : <i className="ri-arrow-down-line ml-1"></i>)}
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Site / Client</th>
                  <th
                    onClick={() => handleSort('created_at')}
                    className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                  >
                    Created {sortKey === 'created_at' && (sortDir === 'asc' ? <i className="ri-arrow-up-line ml-1"></i> : <i className="ri-arrow-down-line ml-1"></i>)}
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filtered.map((sop) => (
                  <tr key={sop.id} className="hover:bg-gray-800/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-file-text-line text-blue-400 text-sm"></i>
                          </div>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">{sop.title}</p>
                          {sop.sop_reference && (
                            <p className="text-xs text-gray-500">{sop.sop_reference}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-300 whitespace-nowrap">
                      {getSOPTypeLabel(sop.sop_type)}
                    </td>
                    <td className="px-5 py-3.5">{statusBadge(sop.status)}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-300">
                      v{sop.version_number}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-300">
                      <div className="flex flex-col">
                        <span>{sop.site_name || <span className="text-gray-500 italic">Company-wide</span>}</span>
                        {sop.client_name && <span className="text-xs text-gray-500">{sop.client_name}</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-400 whitespace-nowrap">
                      {new Date(sop.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {sop.status !== 'archived' && (
                        <Link
                          href={`/sop-builder/${sop.id}`}
                          className="w-8 h-8 inline-flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                          title="View"
                        >
                          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-eye-line text-xs"></i></div>
                        </Link>
                      )}
                      {sop.status === 'draft' && (
                        <Link
                          href={`/sop-builder/${sop.id}`}
                          className="w-8 h-8 inline-flex items-center justify-center text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Improve with AI"
                        >
                          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-sparkling-line text-xs"></i></div>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}