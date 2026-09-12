'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import SiteProfileEditor from './SiteProfileEditor';
import PatrolSetupEditor from './PatrolSetupEditor';
import RotaRequirementsEditor from './RotaRequirementsEditor';
import NoticesManager from './NoticesManager';
import DashboardModulesEditor from './DashboardModulesEditor';
import InstructionsEditor from './InstructionsEditor';
import ContactsEditor from './ContactsEditor';

type Tab = 'profile' | 'instructions' | 'patrol' | 'rota' | 'contacts' | 'notices' | 'modules';

interface ManageSitePanelProps {
  siteId: string;
  onClose: () => void;
  onSaved: () => void;
}

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: 'profile', label: 'Site Profile', icon: 'ri-building-line' },
  { key: 'instructions', label: 'Instructions', icon: 'ri-file-text-line' },
  { key: 'patrol', label: 'Patrol Setup', icon: 'ri-route-line' },
  { key: 'rota', label: 'Rota Requirements', icon: 'ri-calendar-event-line' },
  { key: 'contacts', label: 'Contacts', icon: 'ri-contacts-line' },
  { key: 'notices', label: 'Notices', icon: 'ri-article-line' },
  { key: 'modules', label: 'Dashboard Modules', icon: 'ri-layout-grid-line' },
];

export default function ManageSitePanel({ siteId, onClose, onSaved }: ManageSitePanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const { profile, companyId } = useAuth();
  const [siteInfo, setSiteInfo] = useState<{ site_name: string } | null>(null);

  useEffect(() => {
    supabase
      .from('sites')
      .select('site_name')
      .eq('id', siteId)
      .maybeSingle()
      .then(({ data }) => { if (data) setSiteInfo(data); });
  }, [siteId]);

  const handleSaved = () => {
    onSaved();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-[#0b0f19] border border-white/10 rounded-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center">
              <i className="ri-settings-3-line text-blue-400"></i>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Manage Site</h2>
              <p className="text-xs text-gray-400">{siteInfo?.site_name || 'Loading...'} — Configure all site settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-gray-400 text-lg"></i>
          </button>
        </div>

        <div className="flex border-b border-white/10 px-6 pt-3 gap-1 overflow-x-auto flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.key
                  ? 'text-blue-400 bg-blue-500/10 border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={tab.icon}></i>
              </div>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'profile' && (
            <SiteProfileEditor siteId={siteId} companyId={companyId} userId={profile?.id || ''} onSaved={handleSaved} />
          )}
          {activeTab === 'instructions' && (
            <InstructionsEditor siteId={siteId} companyId={companyId} onSaved={handleSaved} />
          )}
          {activeTab === 'patrol' && (
            <PatrolSetupEditor siteId={siteId} companyId={companyId} userId={profile?.id || ''} onSaved={handleSaved} />
          )}
          {activeTab === 'rota' && (
            <RotaRequirementsEditor siteId={siteId} companyId={companyId} userId={profile?.id || ''} onSaved={handleSaved} />
          )}
          {activeTab === 'contacts' && (
            <ContactsEditor siteId={siteId} companyId={companyId} userId={profile?.id || ''} onSaved={handleSaved} />
          )}
          {activeTab === 'notices' && (
            <NoticesManager siteId={siteId} companyId={companyId} userId={profile?.id || ''} onSaved={handleSaved} />
          )}
          {activeTab === 'modules' && (
            <DashboardModulesEditor siteId={siteId} companyId={companyId} onSaved={handleSaved} />
          )}
        </div>
      </div>
    </div>
  );
}