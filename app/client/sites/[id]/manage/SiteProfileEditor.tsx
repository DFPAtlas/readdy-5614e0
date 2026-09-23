'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type SitesUpdate = Database['public']['Tables']['sites']['Update'];

interface SiteProfileEditorProps {
  siteId: string;
  auth: any;
  onSaved: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

interface SiteProfileForm {
  site_name: string;
  address: string;
  postcode: string;
  site_type: string;
  risk_level: string;
  site_status: string;
  primary_contact_name: string;
  primary_contact_phone: string;
  primary_contact_email: string;
  site_contact_name: string;
  site_contact_phone: string;
  site_contact_email: string;
  emergency_contact: string;
  patrol_enabled: boolean;
  patrol_interval: number;
}

export default function SiteProfileEditor({ siteId, auth, onSaved, showToast }: SiteProfileEditorProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SiteProfileForm>({
    site_name: '',
    address: '',
    postcode: '',
    site_type: '',
    risk_level: '',
    site_status: 'active',
    primary_contact_name: '',
    primary_contact_phone: '',
    primary_contact_email: '',
    site_contact_name: '',
    site_contact_phone: '',
    site_contact_email: '',
    emergency_contact: '',
    patrol_enabled: false,
    patrol_interval: 60,
  });

  useEffect(() => {
    if (!auth.site) return;
    setForm({
      site_name: auth.site.site_name || '',
      address: auth.site.address || '',
      postcode: auth.site.postcode || '',
      site_type: auth.site.site_type || '',
      risk_level: auth.site.risk_level || '',
      site_status: auth.site.status || 'active',
      primary_contact_name: auth.site.primary_contact_name || '',
      primary_contact_phone: auth.site.primary_contact_phone || '',
      primary_contact_email: auth.site.primary_contact_email || '',
      site_contact_name: auth.site.site_contact_name || '',
      site_contact_phone: auth.site.site_contact_phone || '',
      site_contact_email: auth.site.site_contact_email || '',
      emergency_contact: auth.site.emergency_contact || '',
      patrol_enabled: auth.site.patrol_enabled || false,
      patrol_interval: auth.site.patrol_interval || 60,
    });
  }, [auth.site]);

  const handleChange = <K extends keyof SiteProfileForm>(field: K, value: SiteProfileForm[K]) => {
    setForm((prev) => {
      const next: SiteProfileForm = { ...prev };
      next[field] = value;
      return next;
    });
  };

  const validate = () => {
    if (!form.site_name.trim()) { showToast('Site name is required', 'error'); return false; }
    if (!form.address.trim()) { showToast('Address is required', 'error'); return false; }
    if (form.primary_contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.primary_contact_email)) {
      showToast('Invalid primary contact email', 'error'); return false;
    }
    if (form.site_contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.site_contact_email)) {
      showToast('Invalid site contact email', 'error'); return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload: SitesUpdate = {
      site_name: form.site_name.trim(),
      address: form.address.trim(),
      postcode: form.postcode || null,
      site_type: form.site_type || null,
      risk_level: form.risk_level || null,
      status: form.site_status,
      primary_contact_name: form.primary_contact_name || null,
      primary_contact_phone: form.primary_contact_phone || null,
      primary_contact_email: form.primary_contact_email || null,
      site_contact_name: form.site_contact_name || null,
      site_contact_phone: form.site_contact_phone || null,
      site_contact_email: form.site_contact_email || null,
      emergency_contact: form.emergency_contact || null,
      patrol_enabled: form.patrol_enabled,
      patrol_interval: form.patrol_interval,
    };

    const { error } = await supabase
      .from('sites')
      .update(payload)
      .eq('id', siteId);

    setSaving(false);
    if (error) { showToast(error.message, 'error'); return; }
    onSaved();
  };

  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors';
  const labelClass = 'text-xs font-medium text-gray-400 mb-1.5 block';
  const gridClass = 'grid grid-cols-1 sm:grid-cols-2 gap-4';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-white">Site Profile</h3>
          <p className="text-xs text-gray-400">Basic information about this site</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50 transition-colors flex items-center gap-1.5"
        >
          <div className="w-3.5 h-3.5 flex items-center justify-center">
            <i className={saving ? 'ri-loader-4-line animate-spin' : 'ri-check-line'}></i>
          </div>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      <div className={gridClass}>
        <div>
          <label className={labelClass}>Site Name *</label>
          <input type="text" className={inputClass} value={form.site_name} onChange={(e) => handleChange('site_name', e.target.value)} placeholder="e.g. County Hall" />
        </div>
        <div>
          <label className={labelClass}>Site Type</label>
          <input type="text" className={inputClass} value={form.site_type} onChange={(e) => handleChange('site_type', e.target.value)} placeholder="e.g. Office, Retail, Residential" />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Address *</label>
          <input type="text" className={inputClass} value={form.address} onChange={(e) => handleChange('address', e.target.value)} placeholder="Full address including postcode" />
        </div>
        <div>
          <label className={labelClass}>Postcode</label>
          <input type="text" className={inputClass} value={form.postcode} onChange={(e) => handleChange('postcode', e.target.value)} placeholder="e.g. SW1A 1AA" />
        </div>
        <div>
          <label className={labelClass}>Risk Level</label>
          <div className="flex gap-2">
            {['low', 'medium', 'high', 'critical'].map((level) => (
              <button
                key={level}
                onClick={() => handleChange('risk_level', level)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer whitespace-nowrap transition-colors ${
                  form.risk_level === level
                    ? level === 'critical' ? 'bg-red-500/20 border-red-500/30 text-red-400'
                    : level === 'high' ? 'bg-orange-500/20 border-orange-500/30 text-orange-400'
                    : level === 'medium' ? 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                    : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelClass}>Site Status</label>
          <div className="flex gap-2">
            {['active', 'inactive', 'suspended', 'pending_setup'].map((s) => (
              <button
                key={s}
                onClick={() => handleChange('site_status', s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer whitespace-nowrap transition-colors ${
                  form.site_status === s
                    ? s === 'active' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                    : s === 'inactive' ? 'bg-gray-500/20 border-gray-500/30 text-gray-400'
                    : s === 'suspended' ? 'bg-red-500/20 border-red-500/30 text-red-400'
                    : 'bg-amber-500/20 border-amber-500/30 text-amber-400'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                }`}
              >
                {s === 'pending_setup' ? 'Pending Setup' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelClass}>Emergency Contact Phone</label>
          <input type="text" className={inputClass} value={form.emergency_contact} onChange={(e) => handleChange('emergency_contact', e.target.value)} placeholder="e.g. +44 20 7946 0958" />
        </div>
      </div>

      <div className="border-t border-white/10 pt-5">
        <h4 className="text-xs font-semibold text-gray-300 mb-3 uppercase tracking-wider">Primary Contact</h4>
        <div className={gridClass}>
          <div>
            <label className={labelClass}>Name</label>
            <input type="text" className={inputClass} value={form.primary_contact_name} onChange={(e) => handleChange('primary_contact_name', e.target.value)} placeholder="Full name" />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input type="text" className={inputClass} value={form.primary_contact_phone} onChange={(e) => handleChange('primary_contact_phone', e.target.value)} placeholder="Phone number" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Email</label>
            <input type="email" className={inputClass} value={form.primary_contact_email} onChange={(e) => handleChange('primary_contact_email', e.target.value)} placeholder="email@example.com" />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-5">
        <h4 className="text-xs font-semibold text-gray-300 mb-3 uppercase tracking-wider">On-Site Contact</h4>
        <div className={gridClass}>
          <div>
            <label className={labelClass}>Name</label>
            <input type="text" className={inputClass} value={form.site_contact_name} onChange={(e) => handleChange('site_contact_name', e.target.value)} placeholder="Full name" />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input type="text" className={inputClass} value={form.site_contact_phone} onChange={(e) => handleChange('site_contact_phone', e.target.value)} placeholder="Phone number" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Email</label>
            <input type="email" className={inputClass} value={form.site_contact_email} onChange={(e) => handleChange('site_contact_email', e.target.value)} placeholder="email@example.com" />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-5">
        <h4 className="text-xs font-semibold text-gray-300 mb-3 uppercase tracking-wider">Patrol Defaults</h4>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.patrol_enabled}
              onChange={(e) => handleChange('patrol_enabled', e.target.checked)}
              className="w-4 h-4 rounded accent-blue-500"
            />
            <span className="text-sm text-gray-300">Patrols enabled</span>
          </label>
          {form.patrol_enabled && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Interval:</span>
              <input
                type="number"
                min={15}
                max={480}
                step={15}
                className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:border-blue-500/50"
                value={form.patrol_interval}
                onChange={(e) => handleChange('patrol_interval', parseInt(e.target.value) || 60)}
              />
              <span className="text-xs text-gray-500">mins</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
