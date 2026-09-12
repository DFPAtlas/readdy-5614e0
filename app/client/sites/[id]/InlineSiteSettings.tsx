'use client';

import { useState, useCallback } from 'react';
import type { AuthorizedClientSiteResult } from '@/lib/useAuthorizedClientSite';
import SiteProfileEditor from './manage/SiteProfileEditor';
import SiteInstructionsEditor from './manage/SiteInstructionsEditor';
import PatrolSetupEditor from './manage/PatrolSetupEditor';
import RotaRequirementsEditor from './manage/RotaRequirementsEditor';
import SiteContactsEditor from './manage/SiteContactsEditor';
import SiteNoticesEditor from './manage/SiteNoticesEditor';
import DashboardModulesEditor from './manage/DashboardModulesEditor';

interface InlineSiteSettingsProps {
  siteId: string;
  auth: AuthorizedClientSiteResult;
  onSaved: () => void;
}

const TABS = [
  { key: 'profile', label: 'Site Profile', icon: 'ri-building-line' },
  { key: 'instructions', label: 'Instructions & SOP', icon: 'ri-file-text-line' },
  { key: 'patrol', label: 'Patrol Setup', icon: 'ri-route-line' },
  { key: 'rota', label: 'Rota Requirements', icon: 'ri-calendar-todo-line' },
  { key: 'contacts', label: 'Contacts', icon: 'ri-contacts-line' },
  { key: 'notices', label: 'Notices', icon: 'ri-notification-3-line' },
  { key: 'modules', label: 'Dashboard Modules', icon: 'ri-dashboard-line' },
];

export default function InlineSiteSettings({ siteId, auth, onSaved }: InlineSiteSettingsProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [collapsed, setCollapsed] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleSaved = useCallback(() => {
    showToast('Changes saved successfully');
    auth.refresh();
    onSaved();
  }, [showToast, onSaved, auth]);

  const canEdit = auth.clientRole === 'admin' || auth.clientRole === 'manager';

  return (
    <div id="site-settings" className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden scroll-mt-20">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center bg-blue-500/10 rounded-lg border border-blue-500/20">
            <i className="ri-settings-3-line text-blue-400 text-sm"></i>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Site Settings & Data Entry</h3>
            <p className="text-[11px] text-gray-500">{canEdit ? 'Enter site data directly here — it updates this dashboard live' : 'View only — contact an admin to edit'}</p>
          </div>
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 cursor-pointer transition-colors"
        >
          <i className={collapsed ? 'ri-arrow-down-s-line' : 'ri-arrow-up-s-line'}></i>
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="flex border-b border-white/10 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap cursor-pointer transition-colors border-b-2 ${
                  activeTab === tab.key
                    ? 'text-white border-blue-500'
                    : 'text-gray-400 border-transparent hover:text-white hover:border-white/20'
                }`}
              >
                <div className="w-3.5 h-3.5 flex items-center justify-center">
                  <i className={tab.icon}></i>
                </div>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === 'profile' && <SiteProfileEditor siteId={siteId} auth={auth} onSaved={handleSaved} showToast={showToast} />}
            {activeTab === 'instructions' && <SiteInstructionsEditor siteId={siteId} auth={auth} onSaved={handleSaved} showToast={showToast} />}
            {activeTab === 'patrol' && <PatrolSetupEditor siteId={siteId} auth={auth} onSaved={handleSaved} showToast={showToast} />}
            {activeTab === 'rota' && <RotaRequirementsEditor siteId={siteId} auth={auth} onSaved={handleSaved} showToast={showToast} />}
            {activeTab === 'contacts' && <SiteContactsEditor siteId={siteId} auth={auth} onSaved={handleSaved} showToast={showToast} />}
            {activeTab === 'notices' && <SiteNoticesEditor siteId={siteId} auth={auth} onSaved={handleSaved} showToast={showToast} />}
            {activeTab === 'modules' && <DashboardModulesEditor siteId={siteId} auth={auth} onSaved={handleSaved} showToast={showToast} />}
          </div>
        </>
      )}

      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-xl border text-sm font-medium shadow-lg transition-all ${
          toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}