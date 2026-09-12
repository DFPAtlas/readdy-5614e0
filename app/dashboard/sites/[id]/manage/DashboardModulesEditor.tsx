'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface DashboardModulesEditorProps {
  siteId: string;
  companyId: string | null;
  onSaved: () => void;
}

interface ModuleToggle {
  key: string;
  label: string;
  description: string;
  icon: string;
  enabled: boolean;
}

const allModules: { key: string; label: string; description: string; icon: string }[] = [
  { key: 'rota', label: 'Rota', description: 'Shift schedule and staffing overview', icon: 'ri-calendar-event-line' },
  { key: 'patrols', label: 'Patrols', description: 'Patrol checkpoint status and scan logs', icon: 'ri-route-line' },
  { key: 'incidents', label: 'Incidents', description: 'Active alerts and incident reports', icon: 'ri-error-warning-line' },
  { key: 'dob', label: 'Daily OB', description: 'Daily occurrence book entries', icon: 'ri-book-open-line' },
  { key: 'reports', label: 'Reports', description: 'Generated site reports and summaries', icon: 'ri-file-chart-line' },
  { key: 'welfare', label: 'Welfare', description: 'Guard wellbeing and check-call status', icon: 'ri-heart-pulse-line' },
  { key: 'documents', label: 'Documents', description: 'Site documents and compliance files', icon: 'ri-folder-shield-line' },
  { key: 'cctv_logs', label: 'CCTV Logs', description: 'CCTV activity and maintenance logs', icon: 'ri-camera-line' },
  { key: 'visitor_logs', label: 'Visitor Logs', description: 'Visitor sign-in and tracking', icon: 'ri-user-voice-line' },
  { key: 'compliance', label: 'Compliance Score', description: 'ACS and site compliance metrics', icon: 'ri-shield-check-line' },
];

export default function DashboardModulesEditor({ siteId, companyId, onSaved }: DashboardModulesEditorProps) {
  const [modules, setModules] = useState<ModuleToggle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    supabase
      .from('site_dashboard_configs')
      .select('enabled_modules')
      .eq('site_id', siteId)
      .maybeSingle()
      .then(({ data }) => {
        const enabled: string[] = data?.enabled_modules && Array.isArray(data.enabled_modules) ? data.enabled_modules : [];
        setModules(allModules.map((m) => ({ ...m, enabled: enabled.includes(m.key) })));
        setLoading(false);
      });
  }, [siteId]);

  const toggleModule = (key: string) => {
    setModules(modules.map((m) => m.key === key ? { ...m, enabled: !m.enabled } : m));
  };

  const handleSave = async () => {
    if (!companyId) return;
    setSaving(true);
    const enabledModules = modules.filter((m) => m.enabled).map((m) => m.key);

    const { data: existing } = await supabase
      .from('site_dashboard_configs')
      .select('id')
      .eq('site_id', siteId)
      .maybeSingle();

    let error;
    if (existing) {
      const res = await supabase
        .from('site_dashboard_configs')
        .update({ enabled_modules: enabledModules })
        .eq('site_id', siteId)
        .eq('company_id', companyId);
      error = res.error;
    } else {
      const res = await supabase
        .from('site_dashboard_configs')
        .insert({ site_id: siteId, company_id: companyId, client_id: null, enabled_modules: enabledModules });
      error = res.error;
    }

    setSaving(false);
    if (error) {
      setToast({ message: 'Failed: ' + error.message, type: 'error' });
    } else {
      setToast({ message: `${enabledModules.length} modules enabled`, type: 'success' });
      onSaved();
    }
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return <div className="grid grid-cols-2 gap-3 animate-pulse">{[...Array(8)].map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-xl" />)}</div>;
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.message}
        </div>
      )}
      <div>
        <h3 className="text-base font-semibold text-white mb-1">Dashboard Modules</h3>
        <p className="text-xs text-gray-400">Toggle which widgets appear on this site's dashboard</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {modules.map((mod) => (
          <button
            key={mod.key}
            onClick={() => toggleModule(mod.key)}
            className={`flex items-start gap-3 p-4 rounded-xl border transition-all text-left cursor-pointer ${
              mod.enabled
                ? 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/15'
                : 'bg-white/[0.02] border-white/10 hover:bg-white/5 opacity-70'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              mod.enabled ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-500'
            }`}>
              <i className={mod.icon}></i>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${mod.enabled ? 'text-white' : 'text-gray-400'}`}>{mod.label}</span>
                <div className={`w-8 h-4.5 rounded-full transition-colors relative ${mod.enabled ? 'bg-blue-500' : 'bg-white/10'}`}>
                  <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform ${mod.enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{mod.description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 disabled:opacity-50"
        >
          {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          Save Module Settings
        </button>
      </div>
    </div>
  );
}