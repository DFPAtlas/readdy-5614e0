'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminData } from '@/lib/useAdmin';

function AddSiteModal({ onClose, onAdd, clients }: { onClose: () => void; onAdd: (data: any) => Promise<any>; clients: { id: string; name: string }[] }) {
  const [form, setForm] = useState({ site_name: '', address: '', client_id: '', risk_level: 'low', check_call_interval: 30 });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.site_name.trim()) return;
    setSaving(true);
    const { error } = await onAdd(form);
    setSaving(false);
    if (error) { setErr(error); } else { onClose(); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111827] border border-gray-800 rounded-xl w-full max-w-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-white font-semibold">Add Site</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          {err && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">{err}</div>
          )}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Site Name *</label>
            <input
              type="text"
              value={form.site_name}
              onChange={e => setForm({ ...form, site_name: e.target.value })}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="e.g. City Centre Mall"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Address</label>
            <input
              type="text"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              placeholder="e.g. 123 High Street, Manchester"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Client</label>
            <div className="relative">
              <select
                value={form.client_id}
                onChange={e => setForm({ ...form, client_id: e.target.value })}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none"
              >
                <option value="">No Client (Unassigned)</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="w-4 h-4 flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                <i className="ri-arrow-down-s-line"></i>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Risk Level</label>
              <div className="relative">
                <select
                  value={form.risk_level}
                  onChange={e => setForm({ ...form, risk_level: e.target.value })}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <div className="w-4 h-4 flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  <i className="ri-arrow-down-s-line"></i>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Check Call (mins)</label>
              <input
                type="number"
                value={form.check_call_interval}
                onChange={e => setForm({ ...form, check_call_interval: parseInt(e.target.value) || 30 })}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                min={5}
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Site'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditSiteModal({ site, onClose, onSave, clients }: { site: any; onClose: () => void; onSave: (id: string, data: any) => Promise<any>; clients: { id: string; name: string }[] }) {
  const [form, setForm] = useState({
    site_name: site.site_name || '',
    address: site.address || '',
    client_id: site.client_id || '',
    risk_level: site.risk_level || 'low',
    check_call_interval: site.check_call_interval || 30,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await onSave(site.id, form);
    setSaving(false);
    if (error) { setErr(error); } else { onClose(); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111827] border border-gray-800 rounded-xl w-full max-w-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-white font-semibold">Edit Site</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          {err && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">{err}</div>}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Site Name *</label>
            <input type="text" value={form.site_name} onChange={e => setForm({ ...form, site_name: e.target.value })} className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Address</label>
            <input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Client</label>
            <div className="relative">
              <select value={form.client_id} onChange={e => setForm({ ...form, client_id: e.target.value })} className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none">
                <option value="">No Client (Unassigned)</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="w-4 h-4 flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                <i className="ri-arrow-down-s-line"></i>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Risk Level</label>
              <div className="relative">
                <select value={form.risk_level} onChange={e => setForm({ ...form, risk_level: e.target.value })} className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <div className="w-4 h-4 flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                  <i className="ri-arrow-down-s-line"></i>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Check Call (mins)</label>
              <input type="number" value={form.check_call_interval} onChange={e => setForm({ ...form, check_call_interval: parseInt(e.target.value) || 30 })} className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" min={5} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminSitesPage() {
  const { sites, clients, loading, error, createSite, updateSite, deleteSite, refresh } = useAdminData();
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editingSite, setEditingSite] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = sites.filter(s => {
    const matchSearch = !search || s.site_name.toLowerCase().includes(search.toLowerCase()) || (s.address || '').toLowerCase().includes(search.toLowerCase());
    const matchClient = clientFilter === 'all' || s.client_id === clientFilter || (clientFilter === 'none' && !s.client_id);
    return matchSearch && matchClient;
  });

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this site? This cannot be undone.')) return;
    setDeletingId(id);
    const { error: err } = await deleteSite(id);
    setDeletingId(null);
    if (err) alert(err);
  };

  const riskColors: Record<string, string> = {
    low: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    medium: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    high: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
    critical: 'bg-red-500/15 text-red-400 border-red-500/20',
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/dashboard/admin" className="text-sm text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">Admin</Link>
              <span className="text-gray-600">/</span>
              <span className="text-sm text-white">Sites</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Site Management</h1>
            <p className="text-sm text-gray-400 mt-0.5">{sites.length} sites across {clients.length} clients</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-add-line"></i>
            </div>
            Add Site
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-sm text-red-400">
            <div className="w-5 h-5 flex items-center justify-center"><i className="ri-error-warning-line"></i></div>
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-md">
            <div className="w-5 h-5 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <i className="ri-search-line text-sm"></i>
            </div>
            <input
              type="text"
              placeholder="Search sites..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="relative">
            <div className="relative">
              <select
                value={clientFilter}
                onChange={e => setClientFilter(e.target.value)}
                className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none"
              >
                <option value="all">All Clients</option>
                <option value="none">Unassigned</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="w-4 h-4 flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                <i className="ri-arrow-down-s-line"></i>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative flex h-8 w-8">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-8 w-8 bg-blue-500"></span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-10 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
              <div className="w-6 h-6 flex items-center justify-center text-gray-500"><i className="ri-building-line text-xl"></i></div>
            </div>
            <h3 className="text-white font-semibold mb-1">No sites found</h3>
            <p className="text-sm text-gray-400">{search || clientFilter !== 'all' ? 'Try adjusting your filters.' : 'Sites will appear here once created.'}</p>
          </div>
        ) : (
          <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guards</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Call</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filtered.map(site => (
                    <tr key={site.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-600/15 flex items-center justify-center flex-shrink-0">
                            <div className="w-4 h-4 flex items-center justify-center text-blue-400"><i className="ri-building-line text-xs"></i></div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{site.site_name}</p>
                            <p className="text-xs text-gray-500">{site.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {site.client_name ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                            <div className="w-3 h-3 flex items-center justify-center"><i className="ri-briefcase-line text-[10px]"></i></div>
                            {site.client_name}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/15 text-gray-400 border border-gray-500/20">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400 max-w-xs truncate">{site.address || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${riskColors[site.risk_level || 'low']}`}>
                          {(site.risk_level || 'low').charAt(0).toUpperCase() + (site.risk_level || 'low').slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{site.guard_count || 0}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{site.check_call_interval || 30}m</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/dashboard/sites/${site.id}`} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-blue-400 rounded-lg hover:bg-blue-600/10 transition-colors cursor-pointer">
                            <i className="ri-eye-line"></i>
                          </Link>
                          <button onClick={() => setEditingSite(site)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-blue-400 rounded-lg hover:bg-blue-600/10 transition-colors cursor-pointer">
                            <i className="ri-edit-line"></i>
                          </button>
                          <button onClick={() => handleDelete(site.id)} disabled={deletingId === site.id} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-600/10 transition-colors cursor-pointer disabled:opacity-50">
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

      {showAdd && <AddSiteModal onClose={() => setShowAdd(false)} onAdd={createSite} clients={clients.map(c => ({ id: c.id, name: c.name }))} />}
      {editingSite && <EditSiteModal site={editingSite} onClose={() => setEditingSite(null)} onSave={updateSite} clients={clients.map(c => ({ id: c.id, name: c.name }))} />}
    </div>
  );
}