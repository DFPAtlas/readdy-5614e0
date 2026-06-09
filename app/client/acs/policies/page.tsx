'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useACS } from '@/lib/useACS';
import { useAuth } from '@/lib/auth';

const POLICY_TYPES = ['Health & Safety', 'Equal Opportunities', 'Disciplinary', 'Grievance', 'Data Protection', 'Whistleblowing', 'Environmental', 'Anti-Bribery', 'Other'];
const STATUSES = ['draft', 'review', 'approved', 'archived'];

export default function ACSPoliciesPage() {
  const { policies, policyAcks, refresh } = useACS();
  const { currentUser } = useAuth();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [acknowledging, setAcknowledging] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    policy_type: POLICY_TYPES[0],
    version: '1.0',
    content: '',
    owner: '',
    review_date: '',
    status: 'draft',
  });

  const filtered = policies.filter((p) => {
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const ackCount = (policyId: string) => policyAcks.filter((a) => a.policy_id === policyId && a.acknowledged_at).length;

  async function savePolicy() {
    if (!currentUser?.company_id) return;
    if (editing) {
      await supabase.from('acs_policies').update({
        title: form.title,
        policy_type: form.policy_type,
        version: form.version,
        content: form.content || null,
        owner: form.owner || null,
        review_date: form.review_date || null,
        status: form.status,
      }).eq('id', editing);
    } else {
      await supabase.from('acs_policies').insert({
        company_id: currentUser.company_id,
        title: form.title,
        policy_type: form.policy_type,
        version: form.version,
        content: form.content || null,
        owner: form.owner || null,
        review_date: form.review_date || null,
        status: form.status,
      });
    }
    refresh();
    setShowAdd(false);
    setEditing(null);
    setForm({ title: '', policy_type: POLICY_TYPES[0], version: '1.0', content: '', owner: '', review_date: '', status: 'draft' });
  }

  function startEdit(p: typeof policies[0]) {
    setEditing(p.id);
    setForm({
      title: p.title,
      policy_type: p.policy_type || POLICY_TYPES[0],
      version: p.version || '1.0',
      content: p.content || '',
      owner: p.owner || '',
      review_date: p.review_date || '',
      status: p.status,
    });
    setShowAdd(true);
  }

  async function acknowledgePolicy(policyId: string) {
    if (!currentUser?.id) return;
    await supabase.from('acs_policy_acknowledgements').upsert({
      policy_id: policyId,
      user_id: currentUser.id,
      acknowledged_at: new Date().toISOString(),
    }, { onConflict: 'policy_id,user_id' });
    refresh();
    setAcknowledging(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <input
          type="text"
          placeholder="Search policies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 w-56"
        />
        <button
          onClick={() => { setShowAdd(true); setEditing(null); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
          Add Policy
        </button>
      </div>

      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-gray-400 font-medium px-4 py-3">Title</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Type</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Version</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Owner</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Review Date</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3">Acks</th>
              <th className="text-left text-gray-400 font-medium px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No policies yet.</td></tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{p.title}</p>
                    {p.content && <p className="text-xs text-gray-500 line-clamp-1">{p.content.slice(0, 80)}...</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-300">{p.policy_type}</td>
                  <td className="px-4 py-3 text-gray-300">{p.version}</td>
                  <td className="px-4 py-3 text-gray-300">{p.owner || '-'}</td>
                  <td className="px-4 py-3 text-gray-300">
                    {p.review_date ? new Date(p.review_date).toLocaleDateString('en-GB') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                      p.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                      p.status === 'review' ? 'bg-amber-500/10 text-amber-400' :
                      p.status === 'draft' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-gray-500/10 text-gray-400'
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-300">{ackCount(p.id)} acks</span>
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    <button onClick={() => startEdit(p)} className="text-blue-400 hover:text-blue-300 text-xs cursor-pointer">Edit</button>
                    <button onClick={() => setAcknowledging(p.id)} className="text-emerald-400 hover:text-emerald-300 text-xs cursor-pointer">Ack</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-base font-semibold text-white">{editing ? 'Edit Policy' : 'Add Policy'}</h3>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <div className="w-5 h-5 flex items-center justify-center"><i className="ri-close-line"></i></div>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Type</label>
                  <select value={form.policy_type} onChange={(e) => setForm({ ...form, policy_type: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white pr-8 focus:outline-none focus:border-amber-500/50">
                    {POLICY_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Version</label>
                  <input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Content / Summary</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Owner</label>
                  <input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Review Date</label>
                  <input type="date" value={form.review_date} onChange={(e) => setForm({ ...form, review_date: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white pr-8 focus:outline-none focus:border-amber-500/50">
                  {STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white cursor-pointer">Cancel</button>
              <button onClick={savePolicy} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg cursor-pointer whitespace-nowrap">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Acknowledge Modal */}
      {acknowledging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-xl w-full max-w-md p-6">
            <h3 className="text-base font-semibold text-white mb-3">Acknowledge Policy</h3>
            <p className="text-sm text-gray-400 mb-5">
              I confirm that I have read and understood the policy <strong className="text-white">{policies.find((p) => p.id === acknowledging)?.title}</strong>.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setAcknowledging(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white cursor-pointer">Cancel</button>
              <button onClick={() => acknowledgePolicy(acknowledging)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg cursor-pointer whitespace-nowrap">
                I Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}