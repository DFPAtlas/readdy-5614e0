'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminData } from '@/lib/useAdmin';

function AddClientModal({ onClose, onAdd }: { onClose: () => void; onAdd: (data: any) => Promise<any> }) {
  const [form, setForm] = useState({ name: '', contact_person: '', contact_email: '', contact_phone: '' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    const { error } = await onAdd(form);
    setSaving(false);
    if (error) { setErr(error); } else { onClose(); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111827] border border-gray-800 rounded-xl w-full max-w-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-white font-semibold">Add Client</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          {err && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">{err}</div>}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Company Name *</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500" placeholder="e.g. Acme Ltd" required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Contact Person</label>
            <input type="text" value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })} className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500" placeholder="e.g. John Smith" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Email</label>
            <input type="email" value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500" placeholder="e.g. john@acme.com" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Phone</label>
            <input type="tel" value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone: e.target.value })} className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500" placeholder="e.g. +44 161 123 4567" />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50">{saving ? 'Creating...' : 'Create Client'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditClientModal({ client, onClose, onSave }: { client: any; onClose: () => void; onSave: (id: string, data: any) => Promise<any> }) {
  const [form, setForm] = useState({ name: client.name || '', contact_person: client.contact_person || '', contact_email: client.contact_email || '', contact_phone: client.contact_phone || '', status: client.status || 'active' });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await onSave(client.id, form);
    setSaving(false);
    if (error) { setErr(error); } else { onClose(); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111827] border border-gray-800 rounded-xl w-full max-w-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-white font-semibold">Edit Client</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-4">
          {err && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">{err}</div>}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Company Name *</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Contact Person</label>
            <input type="text" value={form.contact_person} onChange={e => setForm({ ...form, contact_person: e.target.value })} className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Email</label>
            <input type="email" value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Phone</label>
            <input type="tel" value={form.contact_phone} onChange={e => setForm({ ...form, contact_phone: e.target.value })} className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Status</label>
            <div className="relative">
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:border-emerald-500 appearance-none">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
              <div className="w-4 h-4 flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                <i className="ri-arrow-down-s-line"></i>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ClientDetailModal({ client, sites, guards, onClose }: { client: any; sites: any[]; guards: any[]; onClose: () => void }) {
  const [tab, setTab] = useState<'overview' | 'sites' | 'guards'>('overview');
  const clientSites = sites.filter(s => s.client_id === client.id);
  const guardIds = new Set<string>();
  clientSites.forEach(s => {
    const siteGuards = guards.filter(g => g.site_ids?.includes(s.id));
    siteGuards.forEach(g => guardIds.add(g.id));
  });
  const clientGuards = guards.filter(g => guardIds.has(g.id));

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    inactive: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
    suspended: 'bg-red-500/15 text-red-400 border-red-500/20',
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111827] border border-gray-800 rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/15 flex items-center justify-center">
              <div className="w-5 h-5 flex items-center justify-center text-emerald-400"><i className="ri-briefcase-line"></i></div>
            </div>
            <div>
              <h3 className="text-white font-semibold">{client.name}</h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[client.status || 'active']}`}>{client.status || 'active'}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <div className="border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center px-5">
            {(['overview', 'sites', 'guards'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${tab === t ? 'text-emerald-400 border-emerald-500' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>
                {t === 'overview' ? 'Overview' : t === 'sites' ? `Sites (${clientSites.length})` : `Guards (${clientGuards.length})`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#0a0e1a] border border-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{clientSites.length}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Sites</div>
                </div>
                <div className="bg-[#0a0e1a] border border-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{clientGuards.length}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Guards</div>
                </div>
                <div className="bg-[#0a0e1a] border border-gray-800 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{client.user_count || 0}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Portal Users</div>
                </div>
              </div>
              <div className="bg-[#0a0e1a] border border-gray-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Contact Person</span><span className="text-sm text-white">{client.contact_person || '—'}</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Email</span><span className="text-sm text-white">{client.contact_email || '—'}</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Phone</span><span className="text-sm text-white">{client.contact_phone || '—'}</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Created</span><span className="text-sm text-white">{new Date(client.created_at).toLocaleDateString('en-GB')}</span></div>
              </div>
            </div>
          )}

          {tab === 'sites' && (
            <div className="space-y-2">
              {clientSites.length === 0 && <div className="text-center py-8 text-sm text-gray-500">No sites assigned</div>}
              {clientSites.map(s => (
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

          {tab === 'guards' && (
            <div className="space-y-2">
              {clientGuards.length === 0 && <div className="text-center py-8 text-sm text-gray-500">No guards assigned</div>}
              {clientGuards.map(g => (
                <div key={g.id} className="flex items-center justify-between p-3 bg-[#0a0e1a] border border-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-600/15 flex items-center justify-center text-amber-400 text-xs font-semibold">{(g.first_name?.[0] || '') + (g.last_name?.[0] || '')}</div>
                    <div><p className="text-sm font-medium text-white">{g.first_name} {g.last_name}</p><p className="text-xs text-gray-500">{g.site_names?.join(', ') || 'No sites'}</p></div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${g.status === 'active' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' : 'bg-gray-500/15 text-gray-400 border-gray-500/20'}`}>{g.status || 'active'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminClientsPage() {
  const { clients, sites, guards, loading, error, createClient, updateClient, deleteClient } = useAdminData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [viewingClient, setViewingClient] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = clients.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || (c.contact_person || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleDelete = async (id: string) => {
    const c = clients.find((x: any) => x.id === id);
    const hasSites = c && sites.filter(s => s.client_id === id).length > 0;
    if (hasSites && !window.confirm('This client has assigned sites. Deleting will unassign all sites. Continue?')) return;
    if (!hasSites && !window.confirm('Delete this client? This cannot be undone.')) return;
    setDeletingId(id);
    const { error: err } = await deleteClient(id);
    setDeletingId(null);
    if (err) alert(err);
  };

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    inactive: 'bg-gray-500/15 text-gray-400 border-gray-500/20',
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
              <span className="text-sm text-white">Clients</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Client Management</h1>
            <p className="text-sm text-gray-400 mt-0.5">Clients manage their own guards via their portal</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
            Add Client
          </button>
        </div>

        {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-sm text-red-400"><div className="w-5 h-5 flex items-center justify-center"><i className="ri-error-warning-line"></i></div>{error}</div>}

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1 max-w-md">
            <div className="w-5 h-5 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><i className="ri-search-line text-sm"></i></div>
            <input type="text" placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-gray-800/60 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500" />
          </div>
          <div className="relative">
            <div className="relative">
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 pr-8 text-sm text-white focus:outline-none focus:border-emerald-500 appearance-none">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
              <div className="w-4 h-4 flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"><i className="ri-arrow-down-s-line"></i></div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative flex h-8 w-8">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-8 w-8 bg-emerald-500"></span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-10 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center"><div className="w-6 h-6 flex items-center justify-center text-gray-500"><i className="ri-briefcase-line text-xl"></i></div></div>
            <h3 className="text-white font-semibold mb-1">No clients found</h3>
            <p className="text-sm text-gray-400">{search || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'Clients will appear here once created.'}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(client => (
              <div key={client.id} className="bg-[#111827] border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-600/15 flex items-center justify-center flex-shrink-0">
                    <div className="w-5 h-5 flex items-center justify-center text-emerald-400"><i className="ri-briefcase-line"></i></div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[client.status || 'active']}`}>{client.status || 'active'}</span>
                </div>
                <h3 className="text-white font-semibold mb-1">{client.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{client.contact_person || '—'}</p>
                <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><div className="w-3 h-3 flex items-center justify-center"><i className="ri-building-line text-[10px]"></i></div>{client.site_count || 0} sites</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-3 flex items-center justify-center"><i className="ri-shield-user-line text-[10px]"></i></div>{client.guard_count || 0} guards</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-3 flex items-center justify-center"><i className="ri-user-line text-[10px]"></i></div>{client.user_count || 0} users</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setViewingClient(client)} className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-800/60 text-gray-300 text-xs font-medium rounded-lg hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap">
                    <div className="w-3 h-3 flex items-center justify-center"><i className="ri-eye-line text-[10px]"></i></div>
                    View
                  </button>
                  <button onClick={() => setEditingClient(client)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-emerald-400 rounded-lg hover:bg-emerald-600/10 transition-colors cursor-pointer">
                    <i className="ri-edit-line"></i>
                  </button>
                  <button onClick={() => handleDelete(client.id)} disabled={deletingId === client.id} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-400 rounded-lg hover:bg-red-600/10 transition-colors cursor-pointer disabled:opacity-50">
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && <AddClientModal onClose={() => setShowAdd(false)} onAdd={createClient} />}
      {editingClient && <EditClientModal client={editingClient} onClose={() => setEditingClient(null)} onSave={updateClient} />}
      {viewingClient && <ClientDetailModal client={viewingClient} sites={sites} guards={guards} onClose={() => setViewingClient(null)} />}
    </div>
  );
}