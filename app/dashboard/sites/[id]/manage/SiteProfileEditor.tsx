'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface SiteProfileEditorProps {
  siteId: string;
  companyId: string | null;
  userId: string;
  onSaved: () => void;
}

const riskLevels = ['low', 'medium', 'high', 'critical'];
const siteTypes = ['commercial', 'industrial', 'residential', 'retail', 'construction', 'event', 'government', 'education', 'healthcare', 'other'];
const siteStatuses = ['active', 'inactive', 'pending', 'suspended'];

export default function SiteProfileEditor({ siteId, companyId, userId, onSaved }: SiteProfileEditorProps) {
  const [form, setForm] = useState({
    site_name: '',
    address: '',
    postcode: '',
    site_type: '',
    risk_level: 'medium',
    status: 'active',
    primary_contact_name: '',
    primary_contact_phone: '',
    primary_contact_email: '',
    check_call_interval: '60',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    supabase
      .from('sites')
      .select('site_name, address, postcode, site_type, risk_level, status, primary_contact_name, primary_contact_phone, primary_contact_email, check_call_interval')
      .eq('id', siteId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm({
            site_name: data.site_name || '',
            address: data.address || '',
            postcode: data.postcode || '',
            site_type: data.site_type || '',
            risk_level: data.risk_level || 'medium',
            status: data.status || 'active',
            primary_contact_name: data.primary_contact_name || '',
            primary_contact_phone: data.primary_contact_phone || '',
            primary_contact_email: data.primary_contact_email || '',
            check_call_interval: String(data.check_call_interval || 60),
          });
        }
        setLoading(false);
      });
  }, [siteId]);

  const handleSave = async () => {
    if (!companyId) return;
    setSaving(true);
    const { error } = await supabase
      .from('sites')
      .update({
        site_name: form.site_name,
        address: form.address,
        postcode: form.postcode,
        site_type: form.site_type,
        risk_level: form.risk_level,
        status: form.status,
        primary_contact_name: form.primary_contact_name,
        primary_contact_phone: form.primary_contact_phone,
        primary_contact_email: form.primary_contact_email,
        check_call_interval: parseInt(form.check_call_interval) || 60,
        updated_by: userId,
      })
      .eq('id', siteId)
      .eq('company_id', companyId);

    setSaving(false);
    if (error) {
      setToast({ message: 'Failed to save: ' + error.message, type: 'error' });
    } else {
      setToast({ message: 'Site profile updated', type: 'success' });
      onSaved();
    }
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-white/5 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div>
        <h3 className="text-base font-semibold text-white mb-1">Site Profile</h3>
        <p className="text-xs text-gray-400">Update core site information and risk settings</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Site Name *</label>
          <input
            type="text"
            value={form.site_name}
            onChange={(e) => setForm({ ...form, site_name: e.target.value })}
            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g. County Hall"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Postcode</label>
          <input
            type="text"
            value={form.postcode}
            onChange={(e) => setForm({ ...form, postcode: e.target.value })}
            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="e.g. SW1A 1AA"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Address</label>
        <input
          type="text"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Full site address"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Risk Level</label>
          <div className="flex gap-1">
            {riskLevels.map((level) => (
              <button
                key={level}
                onClick={() => setForm({ ...form, risk_level: level })}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  form.risk_level === level
                    ? level === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      level === 'high' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                      level === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Site Type</label>
          <div className="relative">
            <select
              value={form.site_type}
              onChange={(e) => setForm({ ...form, site_type: e.target.value })}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer pr-8"
            >
              <option value="" className="bg-[#0b0f19] text-gray-400">Select type...</option>
              {siteTypes.map((t) => (
                <option key={t} value={t} className="bg-[#0b0f19] text-white">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none text-gray-400">
              <i className="ri-arrow-down-s-line"></i>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Status</label>
          <div className="relative">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer pr-8"
            >
              {siteStatuses.map((s) => (
                <option key={s} value={s} className="bg-[#0b0f19] text-white">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none text-gray-400">
              <i className="ri-arrow-down-s-line"></i>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-4">
        <h4 className="text-sm font-medium text-white mb-3">Primary Contact</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Name</label>
            <input
              type="text"
              value={form.primary_contact_name}
              onChange={(e) => setForm({ ...form, primary_contact_name: e.target.value })}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Contact name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone</label>
            <input
              type="text"
              value={form.primary_contact_phone}
              onChange={(e) => setForm({ ...form, primary_contact_phone: e.target.value })}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="+44..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              value={form.primary_contact_email}
              onChange={(e) => setForm({ ...form, primary_contact_email: e.target.value })}
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="email@example.com"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Check Call Interval (minutes)</label>
        <input
          type="number"
          value={form.check_call_interval}
          onChange={(e) => setForm({ ...form, check_call_interval: e.target.value })}
          min="5"
          max="240"
          className="w-48 px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 disabled:opacity-50"
        >
          {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          Save Profile
        </button>
      </div>
    </div>
  );
}