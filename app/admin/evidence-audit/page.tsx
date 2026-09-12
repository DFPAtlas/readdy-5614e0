'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface AccessLog {
  id: string;
  company_id: string;
  site_id: string | null;
  client_id: string | null;
  user_id: string;
  user_role: string;
  evidence_file_id: string | null;
  incident_id: string | null;
  document_id: string | null;
  action: string;
  source_route: string | null;
  metadata: any;
  created_at: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  view: { label: 'Viewed', color: 'bg-blue-500/10 text-blue-400' },
  download: { label: 'Downloaded', color: 'bg-purple-500/10 text-purple-400' },
  preview: { label: 'Previewed', color: 'bg-cyan-500/10 text-cyan-400' },
  export: { label: 'Exported', color: 'bg-emerald-500/10 text-emerald-400' },
  upload: { label: 'Uploaded', color: 'bg-amber-500/10 text-amber-400' },
  delete: { label: 'Deleted', color: 'bg-red-500/10 text-red-400' },
  share: { label: 'Shared', color: 'bg-indigo-500/10 text-indigo-400' },
  signed_url_created: { label: 'Signed URL', color: 'bg-teal-500/10 text-teal-400' },
  access_denied: { label: 'Access Denied', color: 'bg-red-500/10 text-red-400' },
};

export default function AdminEvidenceAuditPage() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Map<string, string>>(new Map());
  const [companyFilter, setCompanyFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 50;

  const fetchLogs = async () => {
    setLoading(true);
    let query = supabase
      .from('evidence_access_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (companyFilter) query = query.eq('company_id', companyFilter);
    if (actionFilter) query = query.eq('action', actionFilter);
    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo) query = query.lte('created_at', dateTo + 'T23:59:59Z');

    const { data } = await query;
    setLogs((data || []) as AccessLog[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [companyFilter, actionFilter, dateFrom, dateTo, page]);

  useEffect(() => {
    supabase.from('companies').select('id, name').then(({ data }) => {
      const map = new Map<string, string>();
      (data || []).forEach((c: any) => map.set(c.id, c.name));
      setCompanies(map);
    });
  }, []);

  const actions = ['view', 'download', 'preview', 'export', 'upload', 'delete', 'share', 'signed_url_created', 'access_denied'];

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Evidence Access Audit</h1>
        <p className="text-sm text-gray-500 mt-0.5">Platform-wide evidence access monitoring across all companies</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative">
          <select
            value={companyFilter}
            onChange={(e) => { setCompanyFilter(e.target.value); setPage(0); }}
            className="bg-gray-800/60 border border-gray-700 rounded-lg pl-3 pr-8 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
          >
            <option value="">All companies</option>
            {[...companies.entries()].map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
          <div className="w-4 h-4 flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
            <i className="ri-arrow-down-s-line text-xs"></i>
          </div>
        </div>
        <div className="relative">
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
            className="bg-gray-800/60 border border-gray-700 rounded-lg pl-3 pr-8 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
          >
            <option value="">All actions</option>
            {actions.map((a) => (
              <option key={a} value={a}>{ACTION_LABELS[a]?.label || a}</option>
            ))}
          </select>
          <div className="w-4 h-4 flex items-center justify-center absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
            <i className="ri-arrow-down-s-line text-xs"></i>
          </div>
        </div>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
          className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
          className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
        />
        <button
          onClick={() => { setCompanyFilter(''); setActionFilter(''); setDateFrom(''); setDateTo(''); setPage(0); }}
          className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer whitespace-nowrap"
        >
          Clear all
        </button>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-800/50 flex items-center justify-center mx-auto mb-3">
              <div className="w-6 h-6 flex items-center justify-center text-gray-500">
                <i className="ri-shield-check-line text-xl"></i>
              </div>
            </div>
            <p className="text-sm text-gray-400">No evidence access logs found</p>
            <p className="text-xs text-gray-600 mt-1">Access events across all companies will appear here</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-left">
                    <th className="px-4 py-3 text-xs text-gray-500 font-medium">Time</th>
                    <th className="px-4 py-3 text-xs text-gray-500 font-medium">Company</th>
                    <th className="px-4 py-3 text-xs text-gray-500 font-medium">User</th>
                    <th className="px-4 py-3 text-xs text-gray-500 font-medium">Role</th>
                    <th className="px-4 py-3 text-xs text-gray-500 font-medium">Action</th>
                    <th className="px-4 py-3 text-xs text-gray-500 font-medium">Target</th>
                    <th className="px-4 py-3 text-xs text-gray-500 font-medium">Route</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-300 whitespace-nowrap max-w-[140px] truncate">
                        {companies.get(log.company_id) || log.company_id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-xs text-white whitespace-nowrap">
                        {log.user_id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-400">
                          {(log.user_role || '').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${ACTION_LABELS[log.action]?.color || 'bg-gray-500/10 text-gray-400'}`}>
                          {ACTION_LABELS[log.action]?.label || log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 max-w-[160px] truncate">
                        {log.evidence_file_id ? `File: ${log.evidence_file_id.slice(0, 8)}` : ''}
                        {log.incident_id ? `Inc: ${log.incident_id.slice(0, 8)}` : ''}
                        {log.document_id ? `Doc: ${log.document_id.slice(0, 8)}` : ''}
                        {!log.evidence_file_id && !log.incident_id && !log.document_id ? 'Page' : ''}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-[140px] truncate">
                        {log.source_route || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="text-xs text-indigo-400 hover:text-indigo-300 disabled:text-gray-600 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
              >
                Previous
              </button>
              <span className="text-xs text-gray-500">Page {page + 1}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={logs.length < pageSize}
                className="text-xs text-indigo-400 hover:text-indigo-300 disabled:text-gray-600 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}