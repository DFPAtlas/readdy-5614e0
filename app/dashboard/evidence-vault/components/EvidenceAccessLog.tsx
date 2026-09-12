'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

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

interface UserInfo {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  role: string;
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

export default function EvidenceAccessLog() {
  const { companyId, profile } = useAuth();
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Map<string, UserInfo>>(new Map());
  const [actionFilter, setActionFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 50;

  const fetchLogs = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    let query = supabase
      .from('evidence_access_logs')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (actionFilter) query = query.eq('action', actionFilter);
    if (userFilter) query = query.eq('user_id', userFilter);
    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo) query = query.lte('created_at', dateTo + 'T23:59:59Z');

    const { data, error } = await query;
    if (!error && data) {
      setLogs(data as AccessLog[]);
      const userIds = [...new Set(data.map((l: any) => l.user_id).filter(Boolean))];
      if (userIds.length > 0) {
        const { data: userData } = await supabase
          .from('users')
          .select('id, first_name, last_name, email, role')
          .in('id', userIds);
        const map = new Map(users);
        (userData || []).forEach((u: any) => map.set(u.id, u));
        setUsers(map);
      }
    }
    setLoading(false);
  }, [companyId, actionFilter, userFilter, dateFrom, dateTo, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (!companyId) return;
    const channel = supabase
      .channel('evidence-access-log-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'evidence_access_logs', filter: `company_id=eq.${companyId}` }, () => fetchLogs())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [companyId, fetchLogs]);

  const actions = ['view', 'download', 'preview', 'export', 'upload', 'delete', 'share', 'signed_url_created', 'access_denied'];

  const getUserName = (userId: string) => {
    const u = users.get(userId);
    if (!u) return userId.slice(0, 8);
    return `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || userId.slice(0, 8);
  };

  const roleBadge: Record<string, string> = {
    super_admin: 'bg-purple-500/10 text-purple-400',
    company_admin: 'bg-blue-500/10 text-blue-400',
    operations_manager: 'bg-cyan-500/10 text-cyan-400',
    guard: 'bg-emerald-500/10 text-emerald-400',
    client: 'bg-amber-500/10 text-amber-400',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Evidence Access Log</h2>
          <p className="text-xs text-gray-500 mt-0.5">Track who accessed evidence files and when</p>
        </div>
        <button
          onClick={() => { setActionFilter(''); setUserFilter(''); setDateFrom(''); setDateTo(''); setPage(0); }}
          className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer whitespace-nowrap"
        >
          Clear filters
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
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
          placeholder="From"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
          className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
          placeholder="To"
        />
      </div>

      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
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
            <p className="text-sm text-gray-400">No access logs yet</p>
            <p className="text-xs text-gray-600 mt-1">Evidence access events will appear here</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="px-4 py-3 text-xs text-gray-500 font-medium">Time</th>
                    <th className="px-4 py-3 text-xs text-gray-500 font-medium">User</th>
                    <th className="px-4 py-3 text-xs text-gray-500 font-medium">Role</th>
                    <th className="px-4 py-3 text-xs text-gray-500 font-medium">Action</th>
                    <th className="px-4 py-3 text-xs text-gray-500 font-medium">Target</th>
                    <th className="px-4 py-3 text-xs text-gray-500 font-medium">Route</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-xs text-white whitespace-nowrap">
                        {getUserName(log.user_id)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${roleBadge[log.user_role] || 'bg-gray-500/10 text-gray-400'}`}>
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
                        {log.incident_id ? `Incident: ${log.incident_id.slice(0, 8)}` : ''}
                        {log.document_id ? `Doc: ${log.document_id.slice(0, 8)}` : ''}
                        {!log.evidence_file_id && !log.incident_id && !log.document_id ? 'Page' : ''}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-[120px] truncate">
                        {log.source_route || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
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