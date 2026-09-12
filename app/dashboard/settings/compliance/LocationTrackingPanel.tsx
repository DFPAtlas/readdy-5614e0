'use client';

import { useEffect, useState } from 'react';
import { useCompliance } from '@/lib/useCompliance';

const BASIS = ['Legitimate interests', 'Consent', 'Contract', 'Legal obligation', 'Vital interests'];
const DPIA = ['not_started', 'in_progress', 'completed', 'approved'];

export default function LocationTrackingPanel() {
  const { locationConfig, saveLocationConfig } = useCompliance();
  const [form, setForm] = useState({
    purpose: '',
    lawful_basis: 'Legitimate interests',
    tracked_subjects: 'Security operatives during assigned shifts',
    tracking_start: 'At clock-in',
    tracking_stop: 'At clock-out',
    background_tracking_enabled: false,
    precision_required: 'Approximate location sufficient for geofence checks',
    retention_days: 90,
    viewer_roles: 'Operations managers and controllers',
    emergency_rules: 'Precise location may be used during an active SOS event',
    worker_notice_version: '',
    dpia_status: 'not_started',
    contact_name: '',
    is_active: false,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (locationConfig) {
      setForm({
        purpose: locationConfig.purpose || '',
        lawful_basis: locationConfig.lawful_basis || 'Legitimate interests',
        tracked_subjects: locationConfig.tracked_subjects || '',
        tracking_start: locationConfig.tracking_start || '',
        tracking_stop: locationConfig.tracking_stop || '',
        background_tracking_enabled: locationConfig.background_tracking_enabled,
        precision_required: locationConfig.precision_required || '',
        retention_days: locationConfig.retention_days ?? 90,
        viewer_roles: locationConfig.viewer_roles || '',
        emergency_rules: locationConfig.emergency_rules || '',
        worker_notice_version: locationConfig.worker_notice_version || '',
        dpia_status: locationConfig.dpia_status || 'not_started',
        contact_name: locationConfig.contact_name || '',
        is_active: locationConfig.is_active,
      });
    }
  }, [locationConfig]);

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    const { error } = await saveLocationConfig({ ...form });
    setSaving(false);
    setMsg(error ? 'Could not save. Check permissions.' : 'Location tracking configuration saved.');
  };

  return (
    <div className="space-y-5">
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <p className="text-sm text-gray-300 leading-relaxed">
          Location tracking is lawful and fair only when purpose, basis, notice and DPIA status are configured.
          Hidden monitoring is never used. Tracking must stop at check-out.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Purpose of tracking">
          <input value={form.purpose} onChange={(e) => set('purpose', e.target.value)} className={inputCls} placeholder="Why are guards tracked?" />
        </Field>
        <Field label="Lawful basis">
          <select value={form.lawful_basis} onChange={(e) => set('lawful_basis', e.target.value)} className={`${inputCls} pr-8`}>
            {BASIS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>
        <Field label="Who is tracked">
          <input value={form.tracked_subjects} onChange={(e) => set('tracked_subjects', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Contact for questions or objections">
          <input value={form.contact_name} onChange={(e) => set('contact_name', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Tracking starts">
          <input value={form.tracking_start} onChange={(e) => set('tracking_start', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Tracking stops">
          <input value={form.tracking_stop} onChange={(e) => set('tracking_stop', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Precision required">
          <input value={form.precision_required} onChange={(e) => set('precision_required', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Retention (days)">
          <input type="number" value={form.retention_days} onChange={(e) => set('retention_days', Number(e.target.value))} className={inputCls} />
        </Field>
        <Field label="Who can view location">
          <input value={form.viewer_roles} onChange={(e) => set('viewer_roles', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Emergency-use rules">
          <input value={form.emergency_rules} onChange={(e) => set('emergency_rules', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Worker notice version">
          <input value={form.worker_notice_version} onChange={(e) => set('worker_notice_version', e.target.value)} className={inputCls} placeholder="e.g. v1.0" />
        </Field>
        <Field label="DPIA status">
          <select value={form.dpia_status} onChange={(e) => set('dpia_status', e.target.value)} className={`${inputCls} pr-8`}>
            {DPIA.map((d) => <option key={d} value={d}>{d.replace(/_/g, ' ')}</option>)}
          </select>
        </Field>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2.5 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={form.background_tracking_enabled}
            onChange={(e) => set('background_tracking_enabled', e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 bg-[#0f1629] accent-indigo-500"
          />
          Background tracking enabled
        </label>
        {form.background_tracking_enabled && (
          <p className="text-xs text-amber-400/80">Background tracking requires a clear justification and completed DPIA.</p>
        )}
        <label className="flex items-center gap-2.5 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => set('is_active', e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 bg-[#0f1629] accent-indigo-500"
          />
          Tracking configuration active
        </label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          Save configuration
        </button>
        {msg && <span className="text-xs text-gray-400">{msg}</span>}
      </div>
    </div>
  );
}

const inputCls = 'w-full bg-[#0f1629] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}