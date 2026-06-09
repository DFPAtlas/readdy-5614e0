'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminData } from '@/lib/useAdmin';

function AddGuardModal({ onClose, onAdd }: { onClose: () => void; onAdd: (data: any) => Promise<any> }) {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', sia_licence: '', hourly_rate: 12 });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim()) return;
    setSaving(true);
    const { error } = await onAdd(form);
    setSaving(false);
    if (error) { setErr(error); } else { onClose(); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111827] border border-gray-800 rounded-xl w-full max-w-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-white font-semibold">Add Guard</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          {err && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">{err}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">First Name *</label>
              <input type="text" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500" placeholder="e.g. John" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Last Name *</label>
              <input type="text" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500" placeholder="e.g. Smith" required />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500" placeholder="e.g. john.smith@email.com" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Phone</label>
            <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500" placeholder="e.g. +44 7700 900123" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">SIA Licence Number</label>
            <input type="text" value={form.sia_licence} onChange={e => setForm({ ...form, sia_licence: e.target.value })} className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500" placeholder="e.g. 12345678" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Hourly Rate (£)</label>
            <input type="number" value={form.hourly_rate} onChange={e => setForm({ ...form, hourly_rate: parseFloat(e.target.value) || 0 })} className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500" min={0} step={0.5} />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50">{saving ? 'Creating...' : 'Create Guard'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditGuardModal({ guard, onClose, onSave }: { guard: any; onClose: () => void; onSave: (id: string, data: any) => Promise<any> }) {
  const [form, setForm] = useState({
    first_name: guard.first_name || '',
    last_name: guard.last_name || '',
    email: guard.email || '',
    phone: guard.phone || '',
    sia_licence: guard.sia_licence || '',
    hourly_rate: guard.hourly_rate || 12,
    status: guard.status || 'active',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await onSave(guard.id, form);
    setSaving(false);
    if (error) { setErr(error); } else { onClose(); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111827] border border-gray-800 rounded-xl w-full max-w-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-white font-semibold">Edit Guard</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          {err && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">{err}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">First Name *</label>
              <input type="text" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Last Name *</label>
              <input type="text" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" required />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Phone</label>
            <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">SIA Licence</label>
            <input type="text" value={form.sia_licence} onChange={e => setForm({ ...form, sia_licence: e.target.value })} className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Hourly Rate (£)</label>
              <input type="number" value={form.hourly_rate} onChange={e => setForm({ ...form, hourly_rate: parseFloat(e.target.value) || 0 })} className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" min={0} step={0.5} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Status</label>
              <div className="relative">
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:border-amber-500 appearance-none">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                  <option value="suspended">Suspended</option>
                </select>
                <div className="w-4 h-4 flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  <i className="ri-arrow-down-s-line"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GuardDetailModal({ guard, sites, onClose }: { guard: any; sites: any[]; onClose: () => void }) {
  const assignedSites = sites.filter(s => guard.site_ids?.includes(s.id));
  const [tab, setTab] = useState<'overview' | 'sites'>('overview');

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    inactive: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
    on_leave: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    suspended: 'bg-red-500/15 text-red-400 border-red-500/20',
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111827] border border-gray-800 rounded-xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-600/15 flex items-center justify-center text-amber-400 text-sm font-semibold">{(guard.first_name?.[0] || '') + (guard.last_name?.[0] || '')}</div>
            <div>
              <h3 className="text-white font-semibold">{guard.first_name} {guard.last_name}</h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[guard.status || 'active']}`}>{guard.status || 'active'}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <div className="border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center px-5">
            {(['overview', 'sites'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${tab === t ? 'text-amber-400 border-amber-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>
                {t === 'overview' ? 'Overview' : `Sites (${assignedSites.length})`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-[#0a0e1a] border border-gray-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between"><span className="text-sm text-gray-500">SIA Licence</span><span className="text-sm text-white">{guard.sia_licence || '—'}</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Phone</span><span className="text-sm text-white">{guard.phone || '—'}</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Email</span><span className="text-sm text-white">{guard.email || '—'}</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Hourly Rate</span><span className="text-sm text-white">£{guard.hourly_rate || 0}/hr</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-gray-500">SIA Expiry</span><span className="text-sm text-white">{guard.sia_expiry ? new Date(guard.sia_expiry).toLocaleDateString('en-GB') : '—'}</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Created</span><span className="text-sm text-white">{new Date(guard.created_at).toLocaleDateString('en-GB')}</span></div>
              </div>
            </div>
          )}

          {tab === 'sites' && (
            <div className="space-y-2">
              {assignedSites.length === 0 && <div className="text-center py-8 text-sm text-gray-500">Not assigned to any sites</div>}
              {assignedSites.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-[#0a0e1a] border border-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/15 flex items-center justify-center"><div className="w-4 h-4 flex items-center justify-center text-blue-400"><i className="ri-building-line text-xs"></i></div></div>
                    <div><p className="text-sm font-medium text-white">{s.site_name}</p><p className="text-xs text-gray-500">{s.address || 'No address'}</p></div>
                  </div>
                  <Link href={`/dashboard/sites/${s.id}`} className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer">View</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminGuardsPage() {
  const { guards, sites, clients, loading, error, createGuard, updateGuard, deleteGuard } = useAdminData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editingGuard, setEditingGuard] = useState<any>(null);
  const [viewingGuard, setViewingGuard] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = guards.filter(g => {
    const fullName = `${g.first_name || ''} ${g.last_name || ''}`.toLowerCase();
    const matchSearch = !search || fullName.includes(search.toLowerCase()) || (g.email || '').toLowerCase().includes(search.toLowerCase()) || (g.sia_licence || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || g.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this guard? This cannot be undone.')) return;
    setDeletingId(id);
    const { error: err } = await deleteGuard(id);
    setDeletingId(null);
    if (err) alert(err);
  };

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    inactive: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
    on_leave: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    suspended: 'bg-red-500/15 text-red-400 border-red-500/20',
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/dashboard/admin" className="text-sm text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">Admin</Link>
              <span className="text-gray-600">/</span>
              <span className="text-sm text-white">Guards</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Guard Management</h1>
            <p className="text-sm text-gray-400 mt-0.5">All guards in the system. Clients manage guards at their own sites via their portal.</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors cursor-pointer whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
            Add Guard
          </button>
        </div>

        {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-sm text-red-400"><div className="w-5 h-5 flex items-center justify-center"><i className="ri-error-warning-line"></i></div>{error}</div>}

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-md">
            <div className="w-5 h-5 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><i className="ri-search-line text-sm"></i></div>
            <input type="text" placeholder="Search guards..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-gray-800/60 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500" />
          </div>
          <div className="relative">
            <div className="relative">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:border-amber-500 appearance-none">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
                <option value="suspended">Suspended</option>
              </select>
              <div className="w-4 h-4 flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"><i className="ri-arrow-down-s-line"></i></div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative flex h-8 w-8">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-8 w-8 bg-amber-500"></span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-10 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center"><div className="w-6 h-6 flex items-center justify-center text-gray-500"><i className="ri-shield-user-line text-xl"></i></div></div>
            <h3 className="text-white font-semibold mb-1">No guards found</h3>
            <p className="text-sm text-gray-400">{search || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'Guards will appear here once added.'}</p>
          </div>
        ) : (
          <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guard</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SIA Licence</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sites</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filtered.map(guard => (
                    <tr key={guard.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-600/15 flex items-center justify-center text-amber-400 text-xs font-semibold">{(guard.first_name?.[0] || '') + (guard.last_name?.[0] || '')}</div>
                          <div>
                            <p className="text-sm font-medium text-white">{guard.first_name} {guard.last_name}</p>
                            <p className="text-xs text-gray-500">{guard.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-gray-300">{guard.phone || '—'}</p>
                          <p className="text-xs text-gray-500">{guard.email || '—'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">{guard.sia_licence || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {guard.site_names && guard.site_names.length > 0 ? (
                            guard.site_names.map((name: string, i: number) => (
                              <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/15 text-blue-400 border border-blue-500/20">{name}</span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">Unassigned</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">£{guard.hourly_rate || 0}/hr</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[guard.status || 'active']}`}>{guard.status || 'active'}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setViewingGuard(guard)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-blue-400 rounded-lg hover:bg-blue-600/10 transition-colors cursor-pointer">
                            <i className="ri-eye-line"></i>
                          </button>
                          <button onClick={() => setEditingGuard(guard)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-amber-400 rounded-lg hover:bg-amber-600/10 transition-colors cursor-pointer">
                            <i className="ri-edit-line"></i>
                          </button>
                          <button onClick={() => handleDelete(guard.id)} disabled={deletingId === guard.id} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-600/10 transition-colors cursor-pointer disabled:opacity-50">
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showAdd && <AddGuardModal onClose={() => setShowAdd(false)} onAdd={createGuard} />}
      {editingGuard && <EditGuardModal guard={editingGuard} onClose={() => setEditingGuard(null)} onSave={updateGuard} />}
      {viewingGuard && <GuardDetailModal guard={viewingGuard} sites={sites} onClose={() => setViewingGuard(null)} />}
    </div>
  );
}