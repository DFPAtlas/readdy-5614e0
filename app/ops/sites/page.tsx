'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface Site {
  id: string;
  site_name: string;
  client_name: string | null;
  address: string | null;
  risk_level: string | null;
  check_call_interval: number | null;
  created_at: string;
}

export default function OpsSites() {
  const { companyId } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [form, setForm] = useState({ site_name: '', client_name: '', address: '', risk_level: 'medium', check_call_interval: 60 });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!companyId) return;
    loadSites();

    const channel = supabase
      .channel('sites-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sites', filter: `company_id=eq.${companyId}` }, () => {
        loadSites();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [companyId]);

  const loadSites = async () => {
    if (!companyId) return;
    setLoading(true);
    const { data } = await supabase.from('sites').select('*').eq('company_id', companyId).order('created_at', { ascending: false });
    setSites(data || []);
    setLoading(false);
  };

  const filteredSites = sites.filter(s =>
    s.site_name.toLowerCase().includes(search.toLowerCase()) ||
    (s.client_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.address || '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingSite(null);
    setForm({ site_name: '', client_name: '', address: '', risk_level: 'medium', check_call_interval: 60 });
    setShowModal(true);
  };

  const openEdit = (site: Site) => {
    setEditingSite(site);
    setForm({
      site_name: site.site_name,
      client_name: site.client_name || '',
      address: site.address || '',
      risk_level: site.risk_level || 'medium',
      check_call_interval: site.check_call_interval || 60,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setSaving(true);

    const payload = {
      company_id: companyId,
      site_name: form.site_name,
      client_name: form.client_name || null,
      address: form.address || null,
      risk_level: form.risk_level,
      check_call_interval: form.check_call_interval,
    };

    if (editingSite) {
      const { error } = await supabase.from('sites').update(payload).eq('id', editingSite.id);
      if (!error) setToast('Site updated successfully');
    } else {
      const { error } = await supabase.from('sites').insert(payload);
      if (!error) setToast('Site created successfully');
    }

    setSaving(false);
    setShowModal(false);
    loadSites();
    setTimeout(() => setToast(''), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this site?')) return;
    await supabase.from('sites').delete().eq('id', id);
    setToast('Site deleted');
    loadSites();
    setTimeout(() => setToast(''), 3000);
  };

  const riskBadge = (level: string | null) => {
    const map: Record<string, string> = {
      high: 'bg-red-500/10 text-red-400',
      medium: 'bg-amber-500/10 text-amber-400',
      low: 'bg-emerald-500/10 text-emerald-400',
    };
    return map[level || 'low'] || map.low;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Sites</h1>
          <p className="text-gray-400 text-sm mt-1">Manage all your security sites</p>
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
          Add Site
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <div className="w-5 h-5 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <i className="ri-search-line text-sm"></i>
          </div>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search sites..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2.5 rounded-lg">
          {toast}
        </div>
      )}

      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            Loading sites...
          </div>
        ) : filteredSites.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center text-gray-600">
              <i className="ri-building-line text-2xl"></i>
            </div>
            <p className="text-sm text-gray-500">{search ? 'No sites match your search.' : 'No sites yet. Add your first site to get started.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">Site Name</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">Client</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">Address</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">Risk Level</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">Check-in Interval</th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSites.map((site) => (
                  <tr key={site.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-building-line text-blue-400 text-sm"></i>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-white">{site.site_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-300">{site.client_name || '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-400">{site.address || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${riskBadge(site.risk_level)}`}>
                        {site.risk_level || 'low'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-400">{site.check_call_interval || 60} min</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(site)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer" title="Edit">
                          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-edit-line"></i></div>
                        </button>
                        <a
                          href={`/dashboard/sites/${site.id}/notices`}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer" title="Notice Board"
                        >
                          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-article-line"></i></div>
                        </a>
                        <button onClick={() => handleDelete(site.id)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer" title="Delete">
                          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-delete-bin-line"></i></div>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{editingSite ? 'Edit Site' : 'Add Site'}</h2>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line"></i></div>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Site Name *</label>
                <input value={form.site_name} onChange={e => setForm({ ...form, site_name: e.target.value })} required
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" placeholder="e.g. City Centre Mall" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Client Name</label>
                <input value={form.client_name} onChange={e => setForm({ ...form, client_name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" placeholder="e.g. ABC Properties Ltd" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Address</label>
                <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" placeholder="Full address" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Risk Level</label>
                  <button type="button" onClick={() => {
                    const levels = ['low', 'medium', 'high'];
                    const idx = levels.indexOf(form.risk_level);
                    setForm({ ...form, risk_level: levels[(idx + 1) % 3] });
                  }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                      form.risk_level === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                      form.risk_level === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                      'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}>
                    {form.risk_level.charAt(0).toUpperCase() + form.risk_level.slice(1)}
                    <div className="w-4 h-4 flex items-center justify-center float-right"><i className="ri-arrow-down-s-line text-gray-500"></i></div>
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Check-in Interval (min)</label>
                  <input type="number" value={form.check_call_interval} onChange={e => setForm({ ...form, check_call_interval: parseInt(e.target.value) || 60 })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">Cancel</button>
                <button type="submit" disabled={saving}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap">
                  {saving ? 'Saving...' : (editingSite ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}