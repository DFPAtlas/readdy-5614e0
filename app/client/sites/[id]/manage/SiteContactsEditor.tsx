'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ContactRow {
  id?: string;
  contact_type: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  notes: string;
  isNew: boolean;
}

const CONTACT_TYPES = [
  { value: 'emergency', label: 'Emergency Contact', icon: 'ri-phone-line' },
  { value: 'client', label: 'Client Contact', icon: 'ri-user-line' },
  { value: 'building_manager', label: 'Building Manager', icon: 'ri-building-line' },
  { value: 'facilities', label: 'Facilities Contact', icon: 'ri-tools-line' },
  { value: 'out_of_hours', label: 'Out of Hours', icon: 'ri-moon-line' },
  { value: 'other', label: 'Other', icon: 'ri-contacts-line' },
];

interface SiteContactsEditorProps {
  siteId: string;
  auth: any;
  onSaved: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function SiteContactsEditor({ siteId, auth, onSaved, showToast }: SiteContactsEditorProps) {
  const [saving, setSaving] = useState(false);
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.site || !auth.companyId) return;
    setLoading(true);
    supabase
      .from('site_contacts')
      .select('id, contact_type, contact_name, contact_phone, contact_email, notes')
      .eq('site_id', siteId)
      .order('contact_type')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setContacts(data.map((c: any) => ({
            id: c.id,
            contact_type: c.contact_type,
            contact_name: c.contact_name || '',
            contact_phone: c.contact_phone || '',
            contact_email: c.contact_email || '',
            notes: c.notes || '',
            isNew: false,
          })));
        }
        setLoading(false);
      });
  }, [auth.site, auth.companyId, siteId]);

  const updateRow = (idx: number, field: string, value: any) => {
    setContacts((prev) => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const addRow = () => {
    setContacts((prev) => [...prev, { contact_type: 'emergency', contact_name: '', contact_phone: '', contact_email: '', notes: '', isNew: true }]);
  };

  const removeRow = (idx: number) => {
    setContacts((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    const valid = contacts.filter((c) => c.contact_name.trim());
    setSaving(true);
    const companyId = auth.companyId;
    const clientId = auth.clientId;

    const existingIds = valid.filter((c) => c.id && !c.isNew).map((c) => c.id!);
    if (existingIds.length > 0) {
      await supabase.from('site_contacts').delete().eq('site_id', siteId).not('id', 'in', `(${existingIds.join(',')})`);
    } else {
      await supabase.from('site_contacts').delete().eq('site_id', siteId);
    }

    const upserts = valid.map((c) => ({
      id: c.id && !c.isNew ? c.id : undefined,
      site_id: siteId,
      company_id: companyId,
      client_id: clientId,
      contact_type: c.contact_type,
      contact_name: c.contact_name.trim(),
      contact_phone: c.contact_phone || null,
      contact_email: c.contact_email || null,
      notes: c.notes || null,
      created_by: auth.clientUserId,
    }));

    const { error } = await supabase.from('site_contacts').upsert(upserts, { onConflict: 'id' });

    setSaving(false);
    if (error) { showToast(error.message, 'error'); return; }
    onSaved();
  };

  const selectClass = 'w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer';
  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors';

  if (loading) {
    return <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-white">Site Contacts</h3>
          <p className="text-xs text-gray-400">Emergency and key contacts for this site</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={addRow} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-medium rounded-lg cursor-pointer whitespace-nowrap transition-colors flex items-center gap-1">
            <div className="w-3 h-3 flex items-center justify-center"><i className="ri-add-line"></i></div>
            Add Contact
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            <div className="w-3.5 h-3.5 flex items-center justify-center">
              <i className={saving ? 'ri-loader-4-line animate-spin' : 'ri-check-line'}></i>
            </div>
            {saving ? 'Saving...' : 'Save Contacts'}
          </button>
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-10 bg-white/[0.02] rounded-xl border border-white/5">
          <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-full mx-auto mb-3">
            <i className="ri-contacts-line text-gray-500 text-xl"></i>
          </div>
          <p className="text-sm text-gray-400 mb-4">No contacts added yet</p>
          <button onClick={addRow} className="px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg cursor-pointer whitespace-nowrap">Add First Contact</button>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((c, idx) => (
            <div key={idx} className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="relative w-40">
                  <select className={selectClass} value={c.contact_type} onChange={(e) => updateRow(idx, 'contact_type', e.target.value)}>
                    {CONTACT_TYPES.map((ct) => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                    <i className="ri-arrow-down-s-line text-gray-500 text-xs"></i>
                  </div>
                </div>
                <button onClick={() => removeRow(idx)} className="w-6 h-6 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 rounded text-red-400 cursor-pointer transition-colors">
                  <i className="ri-close-line text-xs"></i>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500 block mb-1">Name *</label>
                  <input type="text" className={inputClass} value={c.contact_name} onChange={(e) => updateRow(idx, 'contact_name', e.target.value)} placeholder="Full name" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 block mb-1">Phone</label>
                  <input type="text" className={inputClass} value={c.contact_phone} onChange={(e) => updateRow(idx, 'contact_phone', e.target.value)} placeholder="Phone number" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 block mb-1">Email</label>
                  <input type="email" className={inputClass} value={c.contact_email} onChange={(e) => updateRow(idx, 'contact_email', e.target.value)} placeholder="email@example.com" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 block mb-1">Notes</label>
                  <input type="text" className={inputClass} value={c.notes} onChange={(e) => updateRow(idx, 'notes', e.target.value)} placeholder="Additional notes" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}