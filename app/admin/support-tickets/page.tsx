'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useSupportTickets, useSupportTicketDetail, SUPPORT_STATUSES, SUPPORT_PRIORITIES, categoryLabel } from '@/lib/useTenantSupport';

const OPEN_STATUSES = ['new', 'triaged', 'in_progress', 'awaiting_customer', 'awaiting_internal', 'reopened'];

export default function SupportTicketsWorkspace() {
  const { tickets, loading } = useSupportTickets('platform');
  const [selected, setSelected] = useState<string | null>(null);
  const [assignees, setAssignees] = useState<any[]>([]);
  const [filter, setFilter] = useState('open');
  const [note, setNote] = useState('');
  const [reply, setReply] = useState('');

  useEffect(() => {
    supabase.from('users').select('id,first_name,last_name').eq('role', 'super_admin').order('first_name').then(({ data }) => setAssignees(data || []));
  }, []);

  const detail = useSupportTicketDetail(selected, 'platform');

  const analytics = useMemo(() => {
    const open = tickets.filter((t) => OPEN_STATUSES.includes(t.status)).length;
    const resolved = tickets.filter((t) => ['resolved', 'closed'].includes(t.status)).length;
    const breached = tickets.filter((t) => t.sla_first_response_breached || t.sla_resolution_breached).length;
    const rated = tickets.filter((t) => t.satisfaction_rating != null);
    const avgRating = rated.length ? (rated.reduce((s, t) => s + t.satisfaction_rating, 0) / rated.length).toFixed(1) : '—';
    const catCounts: Record<string, number> = {};
    tickets.forEach((t) => { catCounts[t.category] = (catCounts[t.category] || 0) + 1; });
    const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];
    return { open, resolved, breached, avgRating, topCategory };
  }, [tickets]);

  const filtered = filter === 'open' ? tickets.filter((t) => OPEN_STATUSES.includes(t.status)) : filter === 'resolved' ? tickets.filter((t) => ['resolved', 'closed'].includes(t.status)) : tickets;

  const addNote = async () => { if (!note.trim()) return; await detail.addMessage(note, true); setNote(''); };
  const sendReply = async () => { if (!reply.trim()) return; await detail.addMessage(reply, false); setReply(''); };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Support Workspace</h1>
          <p className="text-sm text-gray-500 mt-0.5">All tenant support tickets across the platform.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Open', value: analytics.open, icon: 'ri-inbox-line', color: 'text-blue-400' },
          { label: 'Resolved / Closed', value: analytics.resolved, icon: 'ri-check-double-line', color: 'text-emerald-400' },
          { label: 'SLA breached', value: analytics.breached, icon: 'ri-alarm-warning-line', color: 'text-red-400' },
          { label: 'Avg satisfaction', value: analytics.avgRating, icon: 'ri-star-line', color: 'text-amber-400' },
          { label: 'Top category', value: analytics.topCategory ? categoryLabel(analytics.topCategory[0]) : '—', icon: 'ri-pie-chart-line', color: 'text-gray-400' },
        ].map((s) => (
          <div key={s.label} className="bg-[#111827] border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <div className="w-4 h-4 flex items-center justify-center"><i className={`${s.icon} ${s.color}`}></i></div>
              {s.label}
            </div>
            <div className="text-xl font-bold text-white truncate">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4">
        {['open', 'resolved', 'all'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${filter === f ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'}`}>
            {f === 'open' ? 'Open' : f === 'resolved' ? 'Resolved / Closed' : 'All'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden max-h-[70vh] overflow-y-auto">
          <div className="divide-y divide-gray-800">
            {filtered.length === 0 && !loading && <div className="px-5 py-10 text-center text-sm text-gray-500">No tickets.</div>}
            {filtered.map((t) => (
              <button key={t.id} onClick={() => setSelected(t.id)} className={`w-full text-left px-4 py-3 hover:bg-white/[0.02] transition-colors cursor-pointer ${selected === t.id ? 'bg-white/[0.03]' : ''}`}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500 font-mono">{t.id.slice(0, 8).toUpperCase()}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${SUPPORT_STATUSES[t.status]?.color || ''}`}>{SUPPORT_STATUSES[t.status]?.label || t.status}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${SUPPORT_PRIORITIES[t.priority]?.color || ''}`}>{SUPPORT_PRIORITIES[t.priority]?.label || t.priority}</span>
                </div>
                <p className="text-sm text-white mt-1 truncate">{t.subject}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t.company?.name || 'No tenant'} · {categoryLabel(t.category)}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 max-h-[70vh] overflow-y-auto">
          {!detail.ticket && <p className="text-sm text-gray-500 text-center py-10">Select a ticket to view the full workspace.</p>}

          {detail.ticket && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${SUPPORT_STATUSES[detail.ticket.status]?.color || ''}`}>{SUPPORT_STATUSES[detail.ticket.status]?.label || detail.ticket.status}</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${SUPPORT_PRIORITIES[detail.ticket.priority]?.color || ''}`}>{SUPPORT_PRIORITIES[detail.ticket.priority]?.label || detail.ticket.priority}</span>
                </div>
                <h2 className="text-lg font-semibold text-white">{detail.ticket.subject}</h2>
                <p className="text-sm text-gray-400 mt-1 whitespace-pre-wrap">{detail.ticket.description}</p>
                <p className="text-xs text-gray-500 mt-2">Tenant: {detail.ticket.company?.name || 'Unknown'} · {categoryLabel(detail.ticket.category)}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <select value={detail.ticket.assigned_to || ''} onChange={(e) => detail.assign(e.target.value || null)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 pr-8">
                  <option value="">Unassigned</option>
                  {assignees.map((a) => <option key={a.id} value={a.id}>{a.first_name} {a.last_name}</option>)}
                </select>
                <select value={detail.ticket.status} onChange={(e) => detail.updateStatus(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 pr-8">
                  {Object.keys(SUPPORT_STATUSES).map((s) => <option key={s} value={s}>{SUPPORT_STATUSES[s].label}</option>)}
                </select>
              </div>

              <div className="space-y-3 border-t border-gray-800 pt-4">
                {[...detail.messages, ...detail.internalNotes].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((m) => (
                  <div key={m.id} className={`rounded-lg p-3 ${m.is_internal ? 'bg-amber-500/5 border border-amber-500/20' : 'bg-white/5'}`}>
                    <div className="flex items-center gap-2">
                      {m.is_internal && <span className="text-[10px] font-medium text-amber-400">Internal</span>}
                      <span className="text-xs font-medium text-white">{`${m.sender?.first_name || ''} ${m.sender?.last_name || ''}`.trim() || 'Unknown'}</span>
                      <span className="text-xs text-gray-500">{new Date(m.created_at).toLocaleString('en-GB')}</span>
                    </div>
                    <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap">{m.message}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-800 pt-4 space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Internal note (not visible to customer)</label>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 resize-none" />
                  <button onClick={addNote} className="mt-2 px-3 py-1.5 bg-amber-600/15 text-amber-400 text-xs rounded-lg hover:bg-amber-600/25 cursor-pointer whitespace-nowrap">Add Internal Note</button>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Reply to customer</label>
                  <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none" />
                  <button onClick={sendReply} className="mt-2 px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-500 cursor-pointer whitespace-nowrap">Send Reply</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}