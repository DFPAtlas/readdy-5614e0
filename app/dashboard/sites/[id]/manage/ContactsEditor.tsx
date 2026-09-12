'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ContactsEditorProps {
  siteId: string;
  companyId: string | null;
  userId: string;
  onSaved: () => void;
}

interface SiteContact {
  id: string;
  contact_type: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  notes: string;
  is_primary: boolean;
}

const contactTypes = ['emergency', 'client', 'building_manager', 'facilities', 'out_of_hours', 'keyholder', 'alarm_responder', 'other'];

export default function ContactsEditor({ siteId, companyId, userId, onSaved }: ContactsEditorProps) {
  const [contacts, setContacts] = useState<SiteContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newContact, setNewContact] = useState({ contact_type: 'emergency', contact_name: '', contact_phone: '', contact_email: '', notes: '', is_primary: false });

  useEffect(() => {
    supabase
      .from('site_contacts')
      .select('id, contact_type, contact_name, contact_phone, contact_email, notes, is_primary')
      .eq('site_id', siteId)
      .order('is_primary', { ascending: false })
      .then(({ data }) => {
        setContacts((data || []).map((c: any) => ({
          id: c.id,
          contact_type: c.contact_type || '',
          contact_name: c.contact_name || '',
          contact_phone: c.contact_phone || '',
          contact_email: c.contact_email || '',
          notes: c.notes || '',
          is_primary: c.is_primary || false,
        })));
        setLoading(false);
      });
  }, [siteId]);

  const updateContact = async (c: SiteContact) => {
    if (!companyId) return;
    const { error } = await supabase
      .from('site_contacts')
      .update({
        contact_type: c.contact_type,
        contact_name: c.contact_name,
        contact_phone: c.contact_phone,
        contact_email: c.contact_email,
        notes: c.notes,
        is_primary: c.is_primary,
      })
      .eq('id', c.id)
      .eq('company_id', companyId);

    if (error) setToast({ message: 'Failed: ' + error.message, type: 'error' });
    else { setToast({ message: 'Contact updated', type: 'success' }); onSaved(); }
    setTimeout(() => setToast(null), 3000);
  };

  const addContact = async () => {
    if (!companyId || !newContact.contact_name.trim()) return;
    const { data, error } = await supabase
      .from('site_contacts')
      .insert({
        site_id: siteId,
        company_id: companyId,
        client_id: null,
        contact_type: newContact.contact_type,
        contact_name: newContact.contact_name.trim(),
        contact_phone: newContact.contact_phone.trim(),
        contact_email: newContact.contact_email.trim(),
        notes: newContact.notes.trim(),
        is_primary: newContact.is_primary,
        created_by: userId,
      })
      .select('id, contact_type, contact_name, contact_phone, contact_email, notes, is_primary')
      .single();

    if (error) setToast({ message: 'Failed: ' + error.message, type: 'error' });
    else if (data) {
      setContacts([...contacts, data as SiteContact]);
      setNewContact({ contact_type: 'emergency', contact_name: '', contact_phone: '', contact_email: '', notes: '', is_primary: false });
      setShowAdd(false);
      setToast({ message: 'Contact added', type: 'success' });
      onSaved();
    }
    setTimeout(() => setToast(null), 3000);
  };

  const deleteContact = async (id: string) => {
    if (!companyId) return;
    const { error } = await supabase.from('site_contacts').delete().eq('id', id).eq('company_id', companyId);
    if (error) setToast({ message: 'Failed to delete', type: 'error' });
    else { setContacts(contacts.filter((c) => c.id !== id)); setToast({ message: 'Contact removed', type: 'success' }); onSaved(); }
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return <div className="space-y-3 animate-pulse">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-white/5 rounded-lg" />)}</div>;
  }

  const typeColors: Record<string, string> = {
    emergency: 'text-red-400 bg-red-500/10 border-red-500/20',
    client: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    building_manager: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    facilities: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    out_of_hours: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    keyholder: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    alarm_responder: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    other: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.message}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white mb-1">Site Contacts</h3>
          <p className="text-xs text-gray-400">{contacts.length} contacts</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
          Add Contact
        </button>
      </div>

      {showAdd && (
        <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-4">
          <h4 className="text-sm font-medium text-blue-400">New Contact</h4>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Type</label>
              <div className="relative">
                <select value={newContact.contact_type} onChange={(e) => setNewContact({ ...newContact, contact_type: e.target.value })} className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white appearance-none cursor-pointer pr-6">
                  {contactTypes.map((t) => <option key={t} value={t} className="bg-[#0b0f19] capitalize">{t.replace(/_/g, ' ')}</option>)}
                </select>
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 flex items-center justify-center pointer-events-none text-gray-500"><i className="ri-arrow-down-s-line text-xs"></i></div>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name *</label>
              <input type="text" value={newContact.contact_name} onChange={(e) => setNewContact({ ...newContact, contact_name: e.target.value })} className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Full name" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Phone</label>
              <input type="text" value={newContact.contact_phone} onChange={(e) => setNewContact({ ...newContact, contact_phone: e.target.value })} className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="+44..." />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Email</label>
              <input type="email" value={newContact.contact_email} onChange={(e) => setNewContact({ ...newContact, contact_email: e.target.value })} className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Notes</label>
              <input type="text" value={newContact.notes} onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })} className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Additional info" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={newContact.is_primary} onChange={(e) => setNewContact({ ...newContact, is_primary: e.target.checked })} className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500" />
            <span className="text-xs text-gray-400">Primary contact</span>
          </label>
          <div className="flex gap-2">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white cursor-pointer whitespace-nowrap">Cancel</button>
            <button onClick={addContact} disabled={!newContact.contact_name.trim()} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50">Add</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {contacts.length === 0 && !showAdd && (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
              <i className="ri-contacts-line text-gray-500 text-lg"></i>
            </div>
            <p className="text-sm text-gray-400 mb-1">No contacts yet</p>
            <p className="text-xs text-gray-500">Add emergency and site contacts</p>
          </div>
        )}
        {contacts.map((c) => {
          const tc = typeColors[c.contact_type] || typeColors.other;
          return (
            <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/[0.02]">
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium whitespace-nowrap border ${tc}`}>
                {c.contact_type.replace(/_/g, ' ')}
              </span>
              <div className="flex-1 grid grid-cols-4 gap-2">
                <input type="text" value={c.contact_name} onChange={(e) => setContacts(contacts.map((ct) => ct.id === c.id ? { ...ct, contact_name: e.target.value } : ct))} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Name" />
                <input type="text" value={c.contact_phone} onChange={(e) => setContacts(contacts.map((ct) => ct.id === c.id ? { ...ct, contact_phone: e.target.value } : ct))} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Phone" />
                <input type="email" value={c.contact_email} onChange={(e) => setContacts(contacts.map((ct) => ct.id === c.id ? { ...ct, contact_email: e.target.value } : ct))} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Email" />
                <input type="text" value={c.notes} onChange={(e) => setContacts(contacts.map((ct) => ct.id === c.id ? { ...ct, notes: e.target.value } : ct))} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Notes" />
              </div>
              <label className="flex items-center gap-1 cursor-pointer whitespace-nowrap">
                <input type="checkbox" checked={c.is_primary} onChange={(e) => setContacts(contacts.map((ct) => ct.id === c.id ? { ...ct, is_primary: e.target.checked } : ct))} className="w-3 h-3 rounded border-white/20 bg-white/5 text-blue-500" />
                <span className="text-[10px] text-gray-500">Primary</span>
              </label>
              <button onClick={() => updateContact(c)} className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs rounded cursor-pointer whitespace-nowrap border border-blue-500/20">Save</button>
              <button onClick={() => deleteContact(c.id)} className="w-6 h-6 rounded hover:bg-red-500/10 flex items-center justify-center cursor-pointer text-gray-500 hover:text-red-400">
                <i className="ri-close-line text-sm"></i>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}