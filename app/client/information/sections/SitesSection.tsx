'use client';

import { useState } from 'react';
import { type ClientSite } from '@/lib/useClientInfo';

interface Props {
  sites: ClientSite[];
  canEdit: boolean;
  saving: boolean;
  onCreate: (data: Omit<ClientSite, 'id' | 'client_id' | 'created_by' | 'created_at' | 'updated_at'>) => Promise<{ data: ClientSite | null; error: any }>;
  onUpdate: (siteId: string, data: Partial<ClientSite>) => Promise<{ error: any }>;
  onDelete: (siteId: string) => Promise<{ error: any }>;
}

const RISK_OPTIONS: Array<ClientSite['risk_level']> = ['Low', 'Medium', 'High'];

export default function SitesSection({ sites, canEdit, saving, onCreate, onUpdate, onDelete }: Props) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<ClientSite>>({ risk_level: 'Medium' });
  const [toast, setToast] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const riskBadge = (level: string | null) => {
    const map: Record<string, string> = {
      Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      High: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return map[level || 'Medium'] || map['Medium'];
  };

  const handleSave = async () => {
    if (!form.site_name?.trim()) { setToast('Site name is required'); setTimeout(() => setToast(null), 3000); return; }
    if (editingId) {
      const { error } = await onUpdate(editingId, form);
      setToast(error ? 'Failed to update site' : 'Site updated');
      if (!error) { setEditingId(null); setForm({ risk_level: 'Medium' }); }
    } else {
      const { data, error } = await onCreate(form as any);
      setToast(error ? 'Failed to create site' : 'Site created');
      if (!error && data) { setAdding(false); setForm({ risk_level: 'Medium' }); }
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id: string) => {
    const { error } = await onDelete(id);
    setToast(error ? 'Failed to delete' : 'Site deleted');
    setConfirmDelete(null);
    setTimeout(() => setToast(null), 3000);
  };

  const startEdit = (site: ClientSite) => {
    setEditingId(site.id);
    setForm({
      site_name: site.site_name,
      site_address: site.site_address || '',
      site_contact_person: site.site_contact_person || '',
      site_phone: site.site_phone || '',
      client_contact_for_site: site.client_contact_for_site || '',
      opening_hours: site.opening_hours || '',
      security_cover_hours: site.security_cover_hours || '',
      site_notes: site.site_notes || '',
      risk_level: site.risk_level || 'Medium',
    });
    setAdding(true);
  };

  return (
    <div className="space-y-5">
      {toast && (
        <div className={`px-4 py-2.5 rounded-lg text-sm font-medium ${toast.includes('Failed') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Sites ({sites.length})</h3>
        {canEdit && !adding && (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-medium hover:bg-blue-600/30 transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-add-line text-xs"></i></div>
            Add Site
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {adding && (
        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-5 space-y-4">
          <h4 className="text-sm font-medium text-white">{editingId ? 'Edit Site' : 'New Site'}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Site Name *</label>
              <input
                type="text"
                value={form.site_name || ''}
                onChange={(e) => setForm({ ...form, site_name: e.target.value })}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Risk Level</label>
              <div className="flex items-center gap-2">
                {RISK_OPTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setForm({ ...form, risk_level: r })}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                      form.risk_level === r ? riskBadge(r) + ' ring-1 ring-white/20' : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Site Address</label>
              <input
                type="text"
                value={form.site_address || ''}
                onChange={(e) => setForm({ ...form, site_address: e.target.value })}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Site Contact Person</label>
              <input
                type="text"
                value={form.site_contact_person || ''}
                onChange={(e) => setForm({ ...form, site_contact_person: e.target.value })}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Site Phone</label>
              <input
                type="tel"
                value={form.site_phone || ''}
                onChange={(e) => setForm({ ...form, site_phone: e.target.value })}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Client Contact for Site</label>
              <input
                type="text"
                value={form.client_contact_for_site || ''}
                onChange={(e) => setForm({ ...form, client_contact_for_site: e.target.value })}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Opening Hours</label>
              <input
                type="text"
                value={form.opening_hours || ''}
                onChange={(e) => setForm({ ...form, opening_hours: e.target.value })}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                placeholder="e.g. Mon–Fri 09:00–17:00"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Security Cover Hours</label>
              <input
                type="text"
                value={form.security_cover_hours || ''}
                onChange={(e) => setForm({ ...form, security_cover_hours: e.target.value })}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                placeholder="e.g. 24/7"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-400 mb-1.5">Site Notes</label>
              <textarea
                value={form.site_notes || ''}
                onChange={(e) => setForm({ ...form, site_notes: e.target.value })}
                rows={3}
                maxLength={500}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 resize-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              {saving ? 'Saving...' : editingId ? 'Update Site' : 'Create Site'}
            </button>
            <button
              onClick={() => { setAdding(false); setEditingId(null); setForm({ risk_level: 'Medium' }); }}
              className="px-4 py-2 bg-gray-800/60 hover:bg-gray-800 text-gray-300 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sites Grid */}
      {sites.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-gray-800 rounded-full">
            <i className="ri-map-pin-line text-gray-500 text-xl"></i>
          </div>
          <p className="text-sm text-gray-500">No sites added yet.</p>
          {canEdit && <p className="text-xs text-gray-600 mt-1">Click "Add Site" to get started.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sites.map((site) => (
            <div key={site.id} className="bg-gray-800/40 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white">{site.site_name}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${riskBadge(site.risk_level)}`}>
                    {site.risk_level || 'Medium'}
                  </span>
                </div>
                {canEdit && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(site)}
                      className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <i className="ri-edit-line text-xs"></i>
                    </button>
                    <button
                      onClick={() => setConfirmDelete(site.id)}
                      className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <i className="ri-delete-bin-line text-xs"></i>
                    </button>
                  </div>
                )}
              </div>

              {site.site_address && <p className="text-xs text-gray-400 mb-2">{site.site_address}</p>}

              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                {site.site_contact_person && (
                  <div className="bg-gray-800/60 rounded-lg px-2.5 py-1.5">
                    <span className="text-gray-500">Contact</span>
                    <p className="text-gray-300 mt-0.5">{site.site_contact_person}</p>
                  </div>
                )}
                {site.site_phone && (
                  <div className="bg-gray-800/60 rounded-lg px-2.5 py-1.5">
                    <span className="text-gray-500">Phone</span>
                    <p className="text-gray-300 mt-0.5">{site.site_phone}</p>
                  </div>
                )}
                {site.opening_hours && (
                  <div className="bg-gray-800/60 rounded-lg px-2.5 py-1.5">
                    <span className="text-gray-500">Opening Hours</span>
                    <p className="text-gray-300 mt-0.5">{site.opening_hours}</p>
                  </div>
                )}
                {site.security_cover_hours && (
                  <div className="bg-gray-800/60 rounded-lg px-2.5 py-1.5">
                    <span className="text-gray-500">Security Cover</span>
                    <p className="text-gray-300 mt-0.5">{site.security_cover_hours}</p>
                  </div>
                )}
              </div>

              {site.site_notes && (
                <p className="text-xs text-gray-500 border-t border-gray-800 pt-2 mt-2">{site.site_notes}</p>
              )}

              {confirmDelete === site.id && (
                <div className="mt-3 bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                  <p className="text-xs text-red-300 mb-2">Delete this site and all linked data?</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(site.id)}
                      disabled={saving}
                      className="px-3 py-1.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium hover:bg-red-600/30 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="px-3 py-1.5 bg-gray-800/60 text-gray-300 rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}