'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useACS } from '@/lib/useACS';
import { useAuth } from '@/lib/auth';

const PRIORITIES = ['low', 'medium', 'high', 'critical'];
const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-blue-500/10 text-blue-400',
  medium: 'bg-amber-500/10 text-amber-400',
  high: 'bg-orange-500/10 text-orange-400',
  critical: 'bg-red-500/10 text-red-400',
};

export default function ACSActionsPage() {
  const { actions, criteria, evidence, refresh } = useACS();
  const { currentUser } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [form, setForm] = useState({
    title: '',
    issue: '',
    owner: '',
    due_date: '',
    priority: 'medium',
    status: 'open',
    criterion_id: '',
    evidence_id: '',
    completion_notes: '',
  });

  const filtered = actions.filter((a) => {
    if (statusFilter && a.status !== statusFilter) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const overdue = actions.filter((a) => a.status === 'open' && a.due_date && new Date(a.due_date) < new Date()).length;
  const openCount = actions.filter((a) => a.status === 'open' || a.status === 'in_progress').length;
  const resolvedCount = actions.filter((a) => a.status === 'resolved' || a.status === 'closed').length;

  async function saveAction() {
    if (!currentUser?.company_id) return;
    if (editing) {
      await supabase.from('acs_corrective_actions').update({
        title: form.title,
        issue: form.issue,
        owner: form.owner || null,
        due_date: form.due_date || null,
        priority: form.priority,
        status: form.status,
        criterion_id: form.criterion_id || null,
        evidence_id: form.evidence_id || null,
        completion_notes: form.completion_notes || null,
        completed_at: form.status === 'resolved' || form.status === 'closed' ? new Date().toISOString() : null,
      }).eq('id', editing);
    } else {
      await supabase.from('acs_corrective_actions').insert({
        company_id: currentUser.company_id,
        title: form.title,
        issue: form.issue,
        owner: form.owner || null,
        due_date: form.due_date || null,
        priority: form.priority,
        status: form.status,
        criterion_id: form.criterion_id || null,
        evidence_id: form.evidence_id || null,
      });
    }
    refresh();
    setShowAdd(false);
    setEditing(null);
    setForm({ title: '', issue: '', owner: '', due_date: '', priority: 'medium', status: 'open', criterion_id: '', evidence_id: '', completion_notes: '' });
  }

  function startEdit(a: typeof actions[0]) {
    setEditing(a.id);
    setForm({
      title: a.title,
      issue: a.issue,
      owner: a.owner || '',
      due_date: a.due_date || '',
      priority: a.priority,
      status: a.status,
      criterion_id: a.criterion_id || '',
      evidence_id: a.evidence_id || '',
      completion_notes: a.completion_notes || '',
    });
    setShowAdd(true);
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <div className="text-sm text-gray-400 mb-1">Open Actions</div>
          <div className="text-3xl font-bold text-white">{openCount}</div>
        </div>
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <div className="text-sm text-gray-400 mb-1">Overdue</div>
          <div className={`text-3xl font-bold ${overdue > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{overdue}</div>
        </div>
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <div className="text-sm text-gray-400 mb-1">Resolved</div>
          <div className="text-3xl font-bold text-emerald-400">{resolvedCount}</div>
        </div>
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
          <div className="text-sm text-gray-400 mb-1">Total</div>
          <div className="text-3xl font-bold text-white">{actions.length}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search actions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 w-56"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white pr-8 focus:outline-none focus:border-amber-500/50"
          >
            <option value="">All</option>
            {STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
        </div>
        <button
          onClick={() => { setShowAdd(true); setEditing(null); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
          Add Action
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-gray-400 font-medium px-4 py-3">Action</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Issue</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Owner</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Due</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Priority</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No corrective actions yet.</td></tr>
            ) : (
              filtered.map((a) => {
                const isOverdue = a.status === 'open' && a.due_date && new Date(a.due_date) < new Date();
                return (
                  <tr key={a.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{a.title}</p>
                      {a.criterion_id && (
                        <p className="text-xs text-gray-500">
                          {criteria.find((c) => c.id === a.criterion_id)?.criterion_code || ''}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-300 max-w-xs line-clamp-2">{a.issue}</td>
                    <td className="px-4 py-3 text-gray-300">{a.owner || '-'}</td>
                    <td className="px-4 py-3">
                      {a.due_date ? (
                        <span className={`text-xs ${isOverdue ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
                          {new Date(a.due_date).toLocaleDateString('en-GB')}
                          {isOverdue && ' (overdue)'}
                        </span>
                      ) : <span className="text-xs text-gray-500">-</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${PRIORITY_COLORS[a.priority]}`}>{a.priority}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        a.status === 'open' ? 'bg-red-500/10 text-red-400' :
                        a.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                        a.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-gray-500/10 text-gray-400'
                      }`}>{a.status}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => startEdit(a)} className="text-blue-400 hover:text-blue-300 text-xs cursor-pointer">Edit</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-base font-semibold text-white">{editing ? 'Edit Action' : 'Add Corrective Action'}</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <div className="w-5 h-5 flex items-center justify-center"><i className="ri-close-line"></i></div>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Action Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Issue / Reason</label>
                <textarea value={form.issue} onChange={(e) => setForm({ ...form, issue: e.target.value })} rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Owner</label>
                  <input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Due Date</label>
                  <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white pr-8 focus:outline-none focus:border-amber-500/50">
                    {PRIORITIES.map((p) => (<option key={p} value={p}>{p}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white pr-8 focus:outline-none focus:border-amber-500/50">
                    {STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Linked Criterion (optional)</label>
                <select value={form.criterion_id} onChange={(e) => setForm({ ...form, criterion_id: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white pr-8 focus:outline-none focus:border-amber-500/50">
                  <option value="">None</option>
                  {criteria.map((c) => (
                    <option key={c.id} value={c.id}>{c.criterion_code} - {c.criterion_title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Linked Evidence (optional)</label>
                <select value={form.evidence_id} onChange={(e) => setForm({ ...form, evidence_id: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white pr-8 focus:outline-none focus:border-amber-500/50">
                  <option value="">None</option>
                  {evidence.map((e) => (
                    <option key={e.id} value={e.id}>{e.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Completion Notes</label>
                <textarea value={form.completion_notes} onChange={(e) => setForm({ ...form, completion_notes: e.target.value })} rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white cursor-pointer">Cancel</button>
              <button onClick={saveAction} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg cursor-pointer whitespace-nowrap">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}