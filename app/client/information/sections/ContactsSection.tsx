'use client';

import { useState } from 'react';
import { type ClientContact, type ClientSite } from '@/lib/useClientInfo';

interface Props {
  contacts: ClientContact[];
  sites: ClientSite[];
  canEdit: boolean;
  saving: boolean;
  onCreate: (data: Omit<ClientContact, 'id' | 'client_id' | 'created_by' | 'created_at' | 'updated_at'>) => Promise<{ data: ClientContact | null; error: any }>;
  onUpdate: (contactId: string, data: Partial<ClientContact>) => Promise<{ error: any }>;
  onDelete: (contactId: string) => Promise<{ error: any }>;
}

const CONTACT_TYPES: Array<ClientContact['contact_type']> = ['Operations', 'Finance', 'Emergency', 'Site Contact', 'Contract Manager'];

const TYPE_COLORS: Record<string, string> = {
  'Operations': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Finance': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'Emergency': 'bg-red-500/10 text-red-400 border-red-500/20',
  'Site Contact': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Contract Manager': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
};

interface ContactForm {
  name: string;
  job_title: string;
  email: string;
  phone: string;
  mobile: string;
  contact_type: ClientContact['contact_type'];
  site_id: string | null;
}

const EMPTY_CONTACT_FORM: ContactForm = {
  name: '',
  job_title: '',
  email: '',
  phone: '',
  mobile: '',
  contact_type: 'Operations',
  site_id: null,
};

function normalizeContactType(value: string): ClientContact['contact_type'] {
  if (
    value === 'Operations' ||
    value === 'Finance' ||
    value === 'Emergency' ||
    value === 'Site Contact' ||
    value === 'Contract Manager'
  ) {
    return value;
  }
  return null;
}

export default function ContactsSection({ contacts, sites, canEdit, saving, onCreate, onUpdate, onDelete }: Props) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ContactForm>(EMPTY_CONTACT_FORM);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = contacts.filter((c) => {
    const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = !filterType || c.contact_type === filterType;
    return matchesSearch && matchesType;
  });

  const handleSave = async () => {
    if (!form.name?.trim()) { setToast('Name is required'); setTimeout(() => setToast(null), 3000); return; }
    if (editingId) {
      const { error } = await onUpdate(editingId, form);
      setToast(error ? 'Failed to update' : 'Contact updated');
      if (!error) { setEditingId(null); setForm(EMPTY_CONTACT_FORM); setAdding(false); }
    } else {
      const { data, error } = await onCreate(form);
      setToast(error ? 'Failed to create' : 'Contact added');
      if (!error && data) { setAdding(false); setForm(EMPTY_CONTACT_FORM); }
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id: string) => {
    const { error } = await onDelete(id);
    setToast(error ? 'Failed to delete' : 'Contact removed');
    setConfirmDelete(null);
    setTimeout(() => setToast(null), 3000);
  };

  const startEdit = (c: ClientContact) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      job_title: c.job_title || '',
      email: c.email || '',
      phone: c.phone || '',
      mobile: c.mobile || '',
      contact_type: c.contact_type || 'Operations',
      site_id: c.site_id || null,
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

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-sm font-semibold text-white">Contacts ({contacts.length})</h3>
        {canEdit && !adding && (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-medium hover:bg-blue-600/30 transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-add-line text-xs"></i></div>
            Add Contact
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {adding && (
        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-5 space-y-4">
          <h4 className="text-sm font-medium text-white">{editingId ? 'Edit Contact' : 'New Contact'}</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Name *</label>
              <input
                type="text"
                value={form.name || ''}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Job Title</label>
              <input
                type="text"
                value={form.job_title || ''}
                onChange={(e) => setForm({ ...form, job_title: e.target.value })}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Contact Type</label>
              <select
                value={form.contact_type || 'Operations'}
                onChange={(e) => setForm({ ...form, contact_type: normalizeContactType(e.target.value) })}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none pr-8"
              >
                {CONTACT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Phone</label>
              <input
                type="tel"
                value={form.phone || ''}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Mobile</label>
              <input
                type="tel"
                value={form.mobile || ''}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Linked Site</label>
              <select
                value={form.site_id || ''}
                onChange={(e) => setForm({ ...form, site_id: e.target.value || null })}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none pr-8"
              >
                <option value="">None</option>
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>{s.site_name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              {saving ? 'Saving...' : editingId ? 'Update Contact' : 'Add Contact'}
            </button>
            <button
              onClick={() => { setAdding(false); setEditingId(null); setForm(EMPTY_CONTACT_FORM); }}
              className="px-4 py-2 bg-gray-800/60 hover:bg-gray-800 text-gray-300 text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-gray-500">
            <i className="ri-search-line text-xs"></i>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="w-full bg-gray-800/40 border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-700"
          />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterType('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${!filterType ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            All
          </button>
          {CONTACT_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(filterType === t ? '' : t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${filterType === t ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Contacts Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-gray-800 rounded-full">
            <i className="ri-contacts-book-line text-gray-500 text-xl"></i>
          </div>
          <p className="text-sm text-gray-500">No contacts added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const siteName = sites.find((s) => s.id === c.site_id)?.site_name;
            return (
              <div key={c.id} className="bg-gray-800/40 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 flex items-center justify-center bg-blue-500/10 rounded-full text-blue-400 text-xs font-semibold">
                      {c.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">{c.name}</h4>
                      {c.job_title && <p className="text-xs text-gray-500">{c.job_title}</p>}
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${TYPE_COLORS[c.contact_type || 'Operations']}`}>
                    {c.contact_type}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {c.email && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-mail-line text-[10px]"></i></div>
                      {c.email}
                    </div>
                  )}
                  {c.phone && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-phone-line text-[10px]"></i></div>
                      {c.phone}
                    </div>
                  )}
                  {c.mobile && (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-smartphone-line text-[10px]"></i></div>
                      {c.mobile}
                    </div>
                  )}
                  {siteName && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-map-pin-line text-[10px]"></i></div>
                      {siteName}
                    </div>
                  )}
                </div>

                {canEdit && (
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-800">
                    <button
                      onClick={() => startEdit(c)}
                      className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <i className="ri-edit-line text-xs"></i>
                    </button>
                    <button
                      onClick={() => setConfirmDelete(c.id)}
                      className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <i className="ri-delete-bin-line text-xs"></i>
                    </button>
                  </div>
                )}

                {confirmDelete === c.id && (
                  <div className="mt-3 bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                    <p className="text-xs text-red-300 mb-2">Delete this contact?</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(c.id)}
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
            );
          })}
        </div>
      )}
    </div>
  );
}