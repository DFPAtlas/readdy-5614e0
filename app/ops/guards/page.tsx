'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface Guard {
  id: string;
  user_id: string | null;
  sia_licence: string | null;
  sia_expiry: string | null;
  hourly_rate: number | null;
  skills: string[] | null;
  availability: Record<string, any> | null;
  created_at: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export default function OpsGuards() {
  const { companyId } = useAuth();
  const [guards, setGuards] = useState<Guard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGuard, setSelectedGuard] = useState<Guard | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [toast, setToast] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ sia_licence: '', sia_expiry: '', hourly_rate: '', skills: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    loadGuards();
  }, [companyId]);

  const loadGuards = async () => {
    if (!companyId) return;
    setLoading(true);
    const { data: guardsData } = await supabase.from('guards').select('*').eq('company_id', companyId).order('created_at', { ascending: false });

    if (guardsData && guardsData.length > 0) {
      const userIds = guardsData.map((g: any) => g.user_id).filter(Boolean);
      let usersMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: usersData } = await supabase.from('users').select('id, first_name, last_name, email').in('id', userIds);
        (usersData || []).forEach((u: any) => { usersMap[u.id] = u; });
      }
      const enriched = guardsData.map((g: any) => ({
        ...g,
        first_name: usersMap[g.user_id]?.first_name,
        last_name: usersMap[g.user_id]?.last_name,
        email: usersMap[g.user_id]?.email,
      }));
      setGuards(enriched);
    } else {
      setGuards([]);
    }
    setLoading(false);
  };

  const filteredGuards = guards.filter(g =>
    (g.first_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (g.last_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (g.sia_licence || '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setForm({ sia_licence: '', sia_expiry: '', hourly_rate: '', skills: '' });
    setShowAdd(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    setSaving(true);
    const { error } = await supabase.from('guards').insert({
      company_id: companyId,
      sia_licence: form.sia_licence || null,
      sia_expiry: form.sia_expiry || null,
      hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : null,
      skills: form.skills ? form.skills.split(',').map(s => s.trim()) : [],
    });
    setSaving(false);
    setShowAdd(false);
    if (!error) {
      setToast('Guard added successfully');
      loadGuards();
    }
    setTimeout(() => setToast(''), 3000);
  };

  const openDrawer = (guard: Guard) => {
    setSelectedGuard(guard);
    setShowDrawer(true);
  };

  const daysUntil = (dateStr: string | null) => {
    if (!dateStr) return null;
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const expiryBadge = (days: number | null) => {
    if (days === null) return 'bg-gray-500/10 text-gray-400';
    if (days < 0) return 'bg-red-500/10 text-red-400';
    if (days < 30) return 'bg-amber-500/10 text-amber-400';
    return 'bg-emerald-500/10 text-emerald-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Guards</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your security personnel</p>
        </div>
        <button onClick={openAdd}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
          Add Guard
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <div className="w-5 h-5 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <i className="ri-search-line text-sm"></i>
          </div>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search guards..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-2.5 rounded-lg">{toast}</div>
      )}

      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            Loading guards...
          </div>
        ) : filteredGuards.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center text-gray-600">
              <i className="ri-shield-user-line text-2xl"></i>
            </div>
            <p className="text-sm text-gray-500">{search ? 'No guards match your search.' : 'No guards yet. Add your first guard to get started.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">Guard</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">SIA Licence</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">Licence Expiry</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">Rate</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase px-5 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredGuards.map((guard) => {
                  const days = daysUntil(guard.sia_expiry);
                  return (
                    <tr key={guard.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-blue-400 text-sm font-semibold">
                            {(guard.first_name?.[0] || 'G')}{(guard.last_name?.[0] || '')}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-white">{guard.first_name || 'Guard'} {guard.last_name || ''}</span>
                            <p className="text-xs text-gray-500">{guard.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-300 font-mono">{guard.sia_licence || '—'}</td>
                      <td className="px-5 py-3.5">
                        {guard.sia_expiry ? (
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${expiryBadge(days)}`}>
                            {days !== null && days < 0 ? 'Expired' : `${days} days`}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-400">{guard.hourly_rate ? `£${guard.hourly_rate}/hr` : '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-emerald-500/10 text-emerald-400">Active</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button onClick={() => openDrawer(guard)}
                          className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer whitespace-nowrap">
                          View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Guard Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-xl w-full max-w-lg">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Add Guard</h2>
              <button onClick={() => setShowAdd(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line"></i></div>
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">SIA Licence Number</label>
                <input value={form.sia_licence} onChange={e => setForm({ ...form, sia_licence: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" placeholder="e.g. 12345678" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Licence Expiry Date</label>
                <input type="date" value={form.sia_expiry} onChange={e => setForm({ ...form, sia_expiry: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Hourly Rate</label>
                <input type="number" step="0.01" value={form.hourly_rate} onChange={e => setForm({ ...form, hourly_rate: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" placeholder="e.g. 15.50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Skills (comma separated)</label>
                <input value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" placeholder="e.g. CCTV, First Aid, Door Supervisor" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">Cancel</button>
                <button type="submit" disabled={saving}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap">
                  {saving ? 'Saving...' : 'Add Guard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Drawer */}
      {showDrawer && selectedGuard && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowDrawer(false)}></div>
          <div className="relative w-full max-w-md bg-[#0f172a] border-l border-white/10 h-full overflow-y-auto">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Guard Profile</h2>
              <button onClick={() => setShowDrawer(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line"></i></div>
              </button>
            </div>
            <div className="p-5 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 text-xl font-semibold">
                  {(selectedGuard.first_name?.[0] || 'G')}{(selectedGuard.last_name?.[0] || '')}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedGuard.first_name || 'Guard'} {selectedGuard.last_name || ''}</h3>
                  <p className="text-sm text-gray-400">{selectedGuard.email || 'No email on file'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wide">Details</h4>
                <div className="bg-white/5 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">SIA Licence</span>
                    <span className="text-sm text-white font-mono">{selectedGuard.sia_licence || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Expiry</span>
                    <span className="text-sm text-white">{selectedGuard.sia_expiry || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Hourly Rate</span>
                    <span className="text-sm text-white">{selectedGuard.hourly_rate ? `£${selectedGuard.hourly_rate}/hr` : '—'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wide">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {(selectedGuard.skills || []).length > 0 ? (selectedGuard.skills || []).map((skill, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 bg-blue-500/10 text-blue-400 rounded-full">{skill}</span>
                  )) : (
                    <span className="text-sm text-gray-500">No skills recorded</span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wide">Availability</h4>
                <div className="bg-white/5 rounded-lg p-4">
                  {selectedGuard.availability ? (
                    <pre className="text-xs text-gray-400 overflow-x-auto">{JSON.stringify(selectedGuard.availability, null, 2)}</pre>
                  ) : (
                    <p className="text-sm text-gray-500">No availability set yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}