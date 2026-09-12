'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export default function NewSitePage() {
  const router = useRouter();
  const { companyId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState({
    site_name: '',
    address: '',
    postcode: '',
    client_name: '',
    risk_level: 'medium',
    site_type: 'static',
    check_call_interval: 60,
    site_contact_name: '',
    site_contact_phone: '',
    site_contact_email: '',
    emergency_contact: '',
    patrol_enabled: false,
    patrol_interval: 60,
    assignment_instructions: '',
  });

  const handleChange = (field: string, value: string | boolean | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) {
      setToast({ message: 'Not authenticated', type: 'error' });
      return;
    }
    if (!form.site_name.trim()) {
      setToast({ message: 'Site name is required', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from('sites').insert({
      company_id: companyId,
      site_name: form.site_name.trim(),
      address: form.address.trim() || null,
      postcode: form.postcode.trim() || null,
      client_name: form.client_name.trim() || null,
      risk_level: form.risk_level,
      site_type: form.site_type,
      check_call_interval: form.check_call_interval,
      site_contact_name: form.site_contact_name.trim() || null,
      site_contact_phone: form.site_contact_phone.trim() || null,
      site_contact_email: form.site_contact_email.trim() || null,
      emergency_contact: form.emergency_contact.trim() || null,
      patrol_enabled: form.patrol_enabled,
      patrol_interval: form.patrol_interval,
      assignment_instructions: form.assignment_instructions.trim() || null,
    });

    setIsSubmitting(false);

    if (error) {
      setToast({ message: error.message || 'Failed to create site', type: 'error' });
    } else {
      setToast({ message: 'Site created successfully', type: 'success' });
      setTimeout(() => {
        router.push('/dashboard/sites');
      }, 1000);
    }
  };

  const riskLevels = ['low', 'medium', 'high', 'critical'] as const;
  const siteTypes = ['static', 'construction', 'retail', 'office', 'warehouse', 'event', 'residential', 'other'];

  return (
    <div>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Add New Site</h1>
            <p className="text-gray-400">Register a new security site to your account</p>
          </div>
          <Link
            href="/dashboard/sites"
            className="inline-flex items-center px-4 py-2.5 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap text-sm"
          >
            <div className="w-4 h-4 flex items-center justify-center mr-2"><i className="ri-arrow-left-line"></i></div>
            Back to Sites
          </Link>
        </div>

        {toast && (
          <div className={`px-4 py-3 rounded-lg text-sm flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
            'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            <div className="w-4 h-4 flex items-center justify-center">
              <i className={toast.type === 'success' ? 'ri-check-line' : 'ri-error-warning-line'}></i>
            </div>
            {toast.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-5">Site Information</h2>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Site Name *</label>
                <input
                  type="text"
                  required
                  value={form.site_name}
                  onChange={(e) => handleChange('site_name', e.target.value)}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. City Centre Mall"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Site Type</label>
                <button
                  type="button"
                  onClick={() => {
                    const idx = siteTypes.indexOf(form.site_type);
                    handleChange('site_type', siteTypes[(idx + 1) % siteTypes.length]);
                  }}
                  className="w-full flex items-center justify-between bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white cursor-pointer"
                >
                  <span>{form.site_type.charAt(0).toUpperCase() + form.site_type.slice(1)}</span>
                  <div className="w-4 h-4 flex items-center justify-center text-gray-500"><i className="ri-arrow-down-s-line"></i></div>
                </button>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="Full address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Postcode</label>
                <input
                  type="text"
                  value={form.postcode}
                  onChange={(e) => handleChange('postcode', e.target.value)}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="Postcode"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Risk Level</label>
                <button
                  type="button"
                  onClick={() => {
                    const idx = riskLevels.indexOf(form.risk_level as typeof riskLevels[number]);
                    handleChange('risk_level', riskLevels[(idx + 1) % 4]);
                  }}
                  className={`w-full flex items-center justify-between border rounded-lg px-4 py-2.5 text-sm font-medium cursor-pointer ${
                    form.risk_level === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                    form.risk_level === 'high' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                    form.risk_level === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                    'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }`}>
                    <span>{form.risk_level.charAt(0).toUpperCase() + form.risk_level.slice(1)}</span>
                    <div className="w-4 h-4 flex items-center justify-center text-gray-500"><i className="ri-arrow-down-s-line"></i></div>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-5">Client & Contact Information</h2>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Client Name</label>
                <input
                  type="text"
                  value={form.client_name}
                  onChange={(e) => handleChange('client_name', e.target.value)}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. ABC Properties Ltd"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Site Contact Name</label>
                <input
                  type="text"
                  value={form.site_contact_name}
                  onChange={(e) => handleChange('site_contact_name', e.target.value)}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="Primary contact person"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Site Contact Phone</label>
                <input
                  type="text"
                  value={form.site_contact_phone}
                  onChange={(e) => handleChange('site_contact_phone', e.target.value)}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="+44 123 456 7890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Site Contact Email</label>
                <input
                  type="email"
                  value={form.site_contact_email}
                  onChange={(e) => handleChange('site_contact_email', e.target.value)}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="contact@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Emergency Contact</label>
                <input
                  type="text"
                  value={form.emergency_contact}
                  onChange={(e) => handleChange('emergency_contact', e.target.value)}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  placeholder="Emergency phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Check-in Interval (min)</label>
                <input
                  type="number"
                  value={form.check_call_interval}
                  onChange={(e) => handleChange('check_call_interval', parseInt(e.target.value) || 60)}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-5">Patrol Settings</h2>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleChange('patrol_enabled', !form.patrol_enabled)}
                  className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative ${
                    form.patrol_enabled ? 'bg-blue-600' : 'bg-gray-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    form.patrol_enabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}></div>
                </button>
                <label className="text-sm font-medium text-gray-300">Enable Patrols</label>
              </div>
              {form.patrol_enabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Patrol Interval (min)</label>
                  <input
                    type="number"
                    value={form.patrol_interval}
                    onChange={(e) => handleChange('patrol_interval', parseInt(e.target.value) || 60)}
                    className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-5">Assignment Instructions</h2>
            <div>
              <textarea
                rows={4}
                maxLength={500}
                value={form.assignment_instructions}
                onChange={(e) => handleChange('assignment_instructions', e.target.value)}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Any special instructions or notes for guards assigned to this site (max 500 characters)"
              />
              <p className="text-xs text-gray-500 mt-1">{form.assignment_instructions.length}/500 characters</p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link
              href="/dashboard/sites"
              className="px-5 py-2.5 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap text-sm"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap text-sm font-medium"
            >
              {isSubmitting ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Creating...
                </>
              ) : (
                <>
                  <div className="w-4 h-4 flex items-center justify-center mr-2"><i className="ri-add-line"></i></div>
                  Create Site
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}