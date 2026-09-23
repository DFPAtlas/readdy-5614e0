'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const ALL_MODULES = [
  { key: 'rota', label: 'Rota & Shifts', icon: 'ri-calendar-todo-line' },
  { key: 'patrols', label: 'Patrol Monitoring', icon: 'ri-route-line' },
  { key: 'incidents', label: 'Incidents', icon: 'ri-alarm-warning-line' },
  { key: 'dob', label: 'Daily OB', icon: 'ri-book-open-line' },
  { key: 'reports', label: 'Reports', icon: 'ri-file-list-3-line' },
  { key: 'welfare', label: 'Guard Welfare', icon: 'ri-heart-pulse-line' },
  { key: 'documents', label: 'Documents', icon: 'ri-folder-line' },
  { key: 'cctv', label: 'CCTV Logs', icon: 'ri-camera-line' },
  { key: 'visitors', label: 'Visitor Logs', icon: 'ri-door-open-line' },
  { key: 'compliance', label: 'Compliance Score', icon: 'ri-shield-check-line' },
];

interface DashboardModulesEditorProps {
  siteId: string;
  auth: any;
  onSaved: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export default function DashboardModulesEditor({ siteId, auth, onSaved, showToast }: DashboardModulesEditorProps) {
  const [saving, setSaving] = useState(false);
  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  const [configId, setConfigId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.site || !auth.companyId) return;
    setLoading(true);
    supabase
      .from('site_dashboard_configs')
      .select('id, enabled_modules')
      .eq('site_id', siteId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setConfigId(data.id);
          const modules = Array.isArray(data.enabled_modules)
            ? data.enabled_modules.filter((m): m is string => typeof m === 'string')
            : [];
          setEnabledModules(modules);
        }
        setLoading(false);
      });
  }, [auth.site, auth.companyId, siteId]);

  const toggleModule = (key: string) => {
    setEnabledModules((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const companyId = auth.companyId;
    const clientId = auth.clientId;

    if (configId) {
      const { error } = await supabase
        .from('site_dashboard_configs')
        .update({ enabled_modules: enabledModules, updated_at: new Date().toISOString() })
        .eq('id', configId);

      setSaving(false);
      if (error) { showToast(error.message, 'error'); return; }
    } else {
      const { error } = await supabase
        .from('site_dashboard_configs')
        .insert({
          site_id: siteId,
          company_id: companyId,
          client_id: clientId,
          enabled_modules: enabledModules,
          setup_status: 'configured',
          created_by: auth.clientUserId,
        });

      setSaving(false);
      if (error) { showToast(error.message, 'error'); return; }

      const { data } = await supabase
        .from('site_dashboard_configs')
        .select('id')
        .eq('site_id', siteId)
        .maybeSingle();
      if (data) setConfigId(data.id);
    }

    onSaved();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-white">Dashboard Modules</h3>
          <p className="text-xs text-gray-400">Toggle which widgets appear on this site&apos;s dashboard</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50 transition-colors flex items-center gap-1.5"
        >
          <div className="w-3.5 h-3.5 flex items-center justify-center">
            <i className={saving ? 'ri-loader-4-line animate-spin' : 'ri-check-line'}></i>
          </div>
          {saving ? 'Saving...' : 'Save Modules'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {ALL_MODULES.map((mod) => {
          const isEnabled = enabledModules.includes(mod.key);
          return (
            <button
              key={mod.key}
              onClick={() => toggleModule(mod.key)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-all ${
                isEnabled
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                  : 'bg-white/[0.02] border-white/10 text-gray-500 hover:border-white/20'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isEnabled ? 'bg-blue-500/20' : 'bg-white/5'}`}>
                <i className={`${mod.icon} text-lg`}></i>
              </div>
              <span className="text-xs font-medium whitespace-nowrap">{mod.label}</span>
              <span className={`text-[10px] ${isEnabled ? 'text-blue-400/70' : 'text-gray-600'}`}>
                {isEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 flex items-center justify-center bg-blue-500/10 rounded">
            <i className="ri-information-line text-blue-400 text-xs"></i>
          </div>
          <span className="text-xs font-medium text-gray-300">{enabledModules.length} of {ALL_MODULES.length} modules enabled</span>
        </div>
        <p className="text-[11px] text-gray-500">Enabled modules will appear on the site dashboard for client users. Disabled modules are hidden but data continues to be collected.</p>
      </div>
    </div>
  );
}