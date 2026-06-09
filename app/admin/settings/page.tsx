'use client';

import { useState } from 'react';
import APIKeyManager from '../components/APIKeyManager';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    autoSuspendOnNonPayment: false,
    requireEmailVerification: true,
    allowGuardSelfSignup: true,
    enableTrialByDefault: true,
    trialDays: 14,
    defaultPlan: 'sentinel',
  });

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Configure global platform behaviour</p>
      </div>

      <div className="space-y-5">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
          <APIKeyManager />
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5 space-y-5">
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Onboarding</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-800/60">
                <div>
                  <div className="text-sm text-white">Enable trial by default</div>
                  <div className="text-xs text-gray-500">New signups get a free trial period</div>
                </div>
                <button
                  onClick={() => setSettings(s => ({ ...s, enableTrialByDefault: !s.enableTrialByDefault }))}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${settings.enableTrialByDefault ? 'bg-indigo-600' : 'bg-gray-700'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.enableTrialByDefault ? 'translate-x-5' : ''}`}></span>
                </button>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-800/60">
                <div>
                  <div className="text-sm text-white">Trial duration (days)</div>
                </div>
                <input
                  type="number"
                  value={settings.trialDays}
                  onChange={(e) => setSettings(s => ({ ...s, trialDays: parseInt(e.target.value) || 14 }))}
                  className="w-20 bg-gray-800/40 border border-gray-700/60 rounded-lg px-3 py-1.5 text-sm text-white text-center focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-800/60">
                <div>
                  <div className="text-sm text-white">Require email verification</div>
                  <div className="text-xs text-gray-500">Users must verify email before accessing dashboard</div>
                </div>
                <button
                  onClick={() => setSettings(s => ({ ...s, requireEmailVerification: !s.requireEmailVerification }))}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${settings.requireEmailVerification ? 'bg-indigo-600' : 'bg-gray-700'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.requireEmailVerification ? 'translate-x-5' : ''}`}></span>
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Guard Management</h3>
            <div className="flex items-center justify-between py-2 border-b border-gray-800/60">
              <div>
                <div className="text-sm text-white">Allow guard self-signup</div>
                <div className="text-xs text-gray-500">Guards can create their own accounts via invite link</div>
              </div>
              <button
                onClick={() => setSettings(s => ({ ...s, allowGuardSelfSignup: !s.allowGuardSelfSignup }))}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${settings.allowGuardSelfSignup ? 'bg-indigo-600' : 'bg-gray-700'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.allowGuardSelfSignup ? 'translate-x-5' : ''}`}></span>
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Billing</h3>
            <div className="flex items-center justify-between py-2 border-b border-gray-800/60">
              <div>
                <div className="text-sm text-white">Auto-suspend on non-payment</div>
                <div className="text-xs text-gray-500">Automatically suspend clients when subscription is past due</div>
              </div>
              <button
                onClick={() => setSettings(s => ({ ...s, autoSuspendOnNonPayment: !s.autoSuspendOnNonPayment }))}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${settings.autoSuspendOnNonPayment ? 'bg-indigo-600' : 'bg-gray-700'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.autoSuspendOnNonPayment ? 'translate-x-5' : ''}`}></span>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}