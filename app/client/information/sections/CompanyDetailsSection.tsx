'use client';

import { useState, useEffect } from 'react';
import { type ClientProfile } from '@/lib/useClientInfo';

interface Props {
  profile: ClientProfile | null;
  canEdit: boolean;
  saving: boolean;
  onSave: (data: Partial<ClientProfile>) => Promise<{ error: any }>;
}



export default function CompanyDetailsSection({ profile, canEdit, saving, onSave }: Props) {
  const [form, setForm] = useState<Partial<ClientProfile>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setForm({
        company_name: profile.company_name,
        trading_name: profile.trading_name || '',
        company_registration_number: profile.company_registration_number || '',
        vat_number: profile.vat_number || '',
        main_office_address: profile.main_office_address || '',
        main_contact_name: profile.main_contact_name || '',
        contact_email: profile.contact_email || '',
        contact_phone: profile.contact_phone || '',
        emergency_contact_number: profile.emergency_contact_number || '',
      });
    } else {
      setForm({ company_name: '' });
    }
  }, [profile]);

  const handleSubmit = async () => {
    if (!form.company_name?.trim()) {
      setToast('Company name is required');
      return;
    }
    let logoUrl = profile?.logo_url;
    if (logoFile) {
      const { supabase } = await import('@/lib/supabase');
      const cid = profile?.client_id || '';
      const path = `${cid}/logo_${Date.now()}_${logoFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { error: upError } = await supabase.storage.from('client-documents').upload(path, logoFile, { upsert: true });
      if (!upError) {
        const { data } = await supabase.storage.from('client-documents').createSignedUrl(path, 86400 * 30);
        logoUrl = data?.signedUrl || path;
      }
    }
    const { error } = await onSave({ ...form, logo_url: logoUrl });
    setToast(error ? 'Failed to save' : 'Saved successfully');
    if (!error) setLogoFile(null);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`px-4 py-2.5 rounded-lg text-sm font-medium ${toast.includes('Failed') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Company Details</h3>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Company Name *</label>
            <input
              type="text"
              value={form.company_name || ''}
              onChange={(e) => setForm({ ...form, company_name: e.target.value })}
              disabled={!canEdit}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
              placeholder="e.g. ABC Security Ltd"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Trading Name</label>
            <input
              type="text"
              value={form.trading_name || ''}
              onChange={(e) => setForm({ ...form, trading_name: e.target.value })}
              disabled={!canEdit}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
              placeholder="e.g. ABC Guard Services"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Company Registration Number</label>
            <input
              type="text"
              value={form.company_registration_number || ''}
              onChange={(e) => setForm({ ...form, company_registration_number: e.target.value })}
              disabled={!canEdit}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">VAT Number</label>
            <input
              type="text"
              value={form.vat_number || ''}
              onChange={(e) => setForm({ ...form, vat_number: e.target.value })}
              disabled={!canEdit}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Main Office Address</label>
            <textarea
              value={form.main_office_address || ''}
              onChange={(e) => setForm({ ...form, main_office_address: e.target.value })}
              disabled={!canEdit}
              rows={3}
              maxLength={500}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 disabled:opacity-50 resize-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Contact Information</h3>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Main Contact Name</label>
            <input
              type="text"
              value={form.main_contact_name || ''}
              onChange={(e) => setForm({ ...form, main_contact_name: e.target.value })}
              disabled={!canEdit}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Contact Email</label>
            <input
              type="email"
              value={form.contact_email || ''}
              onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
              disabled={!canEdit}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Contact Phone</label>
            <input
              type="tel"
              value={form.contact_phone || ''}
              onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
              disabled={!canEdit}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Emergency Contact Number</label>
            <input
              type="tel"
              value={form.emergency_contact_number || ''}
              onChange={(e) => setForm({ ...form, emergency_contact_number: e.target.value })}
              disabled={!canEdit}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Company Logo</label>
            {profile?.logo_url && !logoFile && (
              <div className="mb-2">
                <img src={profile.logo_url} alt="Company logo" className="h-16 w-auto rounded-lg border border-gray-700" />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setLogoFile(f); }}
              disabled={!canEdit}
              className="block w-full text-xs text-gray-400 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600 disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {canEdit && (
        <div className="flex items-center justify-end pt-4 border-t border-white/10">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-save-line text-sm"></i></div>
            Save Company Details
          </button>
        </div>
      )}
    </div>
  );
}