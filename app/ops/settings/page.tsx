// ... existing code ...

'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import NotificationSettings from '@/app/dashboard/settings/NotificationSettings';

export default function OpsSettings() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('account');

  const tabs = [
    { id: 'account', label: 'Account', icon: 'ri-user-line' },
    { id: 'notifications', label: 'Notifications', icon: 'ri-notification-line' },
    { id: 'security', label: 'Security', icon: 'ri-shield-line' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-2 space-y-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id ? 'bg-blue-600/15 text-blue-400' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}>
                <div className="w-4 h-4 flex items-center justify-center"><i className={tab.icon}></i></div>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'account' && (
            <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-5">
              <h2 className="text-sm font-semibold text-white">Account Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">First Name</label>
                  <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">{user?.first_name || '—'}</div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Last Name</label>
                  <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">{user?.last_name || '—'}</div>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Email</label>
                <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">{user?.email || '—'}</div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Role</label>
                <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white capitalize">{user?.role || '—'}</div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <NotificationSettings />
          )}

          {activeTab === 'security' && (
            <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-5">
              <h2 className="text-sm font-semibold text-white">Security</h2>
              <div className="space-y-3">
                <button className="w-full text-left bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors cursor-pointer">
                  Change Password
                </button>
                <button className="w-full text-left bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white hover:bg-white/10 transition-colors cursor-pointer">
                  Two-Factor Authentication
                </button>
                <button onClick={signOut}
                  className="w-full text-left bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer">
                  Sign Out of All Devices
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}