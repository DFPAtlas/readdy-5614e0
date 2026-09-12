'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AccountSettings from './AccountSettings';
import NotificationSettings from './NotificationSettings';
import SecuritySettings from './SecuritySettings';
import SystemSettings from './SystemSettings';
import BillingSettings from './BillingSettings';
import RolesAndPermissions from './RolesAndPermissions';
import AIIntegrationSettings from './AIIntegrationSettings';
import ComplianceSettings from './compliance/ComplianceSettings';

export default function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams?.get('tab');
    return tab && ['account','notifications','security','system','billing','roles','ai','compliance'].includes(tab) ? tab : 'account';
  });

  const tabs = [
    { id: 'account', name: 'Account', icon: 'ri-user-line' },
    { id: 'notifications', name: 'Notifications', icon: 'ri-notification-line' },
    { id: 'security', name: 'Security', icon: 'ri-shield-line' },
    { id: 'system', name: 'System', icon: 'ri-settings-line' },
    { id: 'ai', name: 'AI & Integrations', icon: 'ri-openai-line' },
    { id: 'compliance', name: 'Compliance', icon: 'ri-scales-3-line' },
    { id: 'billing', name: 'Billing', icon: 'ri-bank-card-line' },
    { id: 'roles', name: 'Roles & Permissions', icon: 'ri-shield-user-line', external: '/dashboard/settings/roles' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return <AccountSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'system':
        return <SystemSettings />;
      case 'ai':
        return <AIIntegrationSettings />;
      case 'compliance':
        return <ComplianceSettings />;
      case 'billing':
        return <BillingSettings />;
      case 'roles':
        return <RolesAndPermissions />;
      default:
        return <AccountSettings />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-2">Manage your account and system preferences</p>
        </div>

        <div className="flex space-x-8">
          <div className="w-64 bg-[#111827]/80 border border-gray-800 rounded-lg p-6 h-fit backdrop-blur-sm">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    if ('external' in tab && tab.external) {
                      router.push(tab.external);
                    } else {
                      setActiveTab(tab.id);
                    }
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600/15 text-blue-400 border-r-2 border-blue-500'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                  }`}
                >
                  <i className={`${tab.icon} mr-3`}></i>
                  {tab.name}
                  {'external' in tab && tab.external && (
                    <div className="w-3 h-3 flex items-center justify-center ml-auto">
                      <i className="ri-arrow-right-up-line text-gray-500 text-xs"></i>
                    </div>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}