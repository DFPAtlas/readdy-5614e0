'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import {
  useNotificationPreferences,
  NOTIF_TYPES,
  type TypePreference,
} from '@/lib/useNotificationPreferences';
import { supabase } from '@/lib/supabase';

function Switch({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={disabled ? undefined : onChange}
      className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${checked ? 'bg-blue-600' : 'bg-gray-700'}`}
      disabled={disabled}
    >
      <div
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
          checked ? 'left-5' : 'left-0.5'
        }`}
      />
    </button>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-800 rounded-xl bg-[#111827]/40 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-800">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function NotificationSettings() {
  const { profile, role } = useAuth();
  const {
    prefs,
    loading,
    saving,
    savedAt,
    pushPermission,
    savePreferences,
    updateTypePreference,
    requestPushPermission,
    resetToDefaults,
  } = useNotificationPreferences(profile?.id || null, role);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="bg-[#111827]/40 border border-gray-800 rounded-xl p-12 text-center">
        <i className="ri-loader-4-line animate-spin text-blue-500 text-2xl"></i>
      </div>
    );
  }

  const roleLabel = role
    ? role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'User';

  const sendTestEmail = async () => {
    if (!profile?.id || !profile?.company_id) return;
    setTestSending(true);
    setTestResult(null);

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        company_id: profile.company_id,
        user_id: profile.id,
        type: 'report_ready',
        title: 'Test notification from GuardianHub',
        body: 'This is a test email to verify your notification delivery is working correctly. If you received this, everything is set up!',
        link: '/dashboard',
        related_type: 'system',
        severity: 'info',
      })
      .select('id')
      .single();

    if (error || !data) {
      setTestResult('Failed to create test notification');
      setTestSending(false);
      return;
    }

    // Poll delivery log for 10s
    let attempts = 0;
    const checkDelivery = setInterval(async () => {
      attempts++;
      const { data: deliveries } = await supabase
        .from('notification_deliveries')
        .select('status, error, sent_at')
        .eq('notification_id', data.id)
        .eq('channel', 'email')
        .order('sent_at', { ascending: false })
        .limit(1);

      if (deliveries && deliveries.length > 0) {
        const d = deliveries[0];
        clearInterval(checkDelivery);
        if (d.status === 'sent') {
          setTestResult('Email sent successfully! Check your inbox.');
        } else if (d.status === 'suppressed') {
          setTestResult(`Email suppressed: ${d.error || 'Check your preferences'}`);
        } else {
          setTestResult(`Email failed: ${d.error || 'Unknown error'}`);
        }
        setTestSending(false);
        return;
      }

      if (attempts >= 20) {
        clearInterval(checkDelivery);
        setTestResult('Waiting for delivery log... Check your inbox or review settings.');
        setTestSending(false);
      }
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Save status */}
      {savedAt && (
        <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 rounded-lg px-3 py-2">
          <i className="ri-check-line"></i>
          Saved at {savedAt}
        </div>
      )}

      {/* Test email */}
      <div className="flex items-center justify-between border border-gray-800 rounded-xl bg-[#111827]/40 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10">
            <i className="ri-mail-send-line text-blue-400 text-sm"></i>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Send a test email</p>
            <p className="text-xs text-gray-500">Verify your email delivery is working</p>
          </div>
        </div>
        <button
          onClick={sendTestEmail}
          disabled={testSending}
          className="text-xs bg-blue-600/15 text-blue-400 hover:bg-blue-600/25 px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
        >
          {testSending ? 'Sending...' : 'Send test'}
        </button>
      </div>
      {testResult && (
        <div className={`text-sm rounded-lg px-3 py-2 ${testResult.includes('success') ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
          {testResult}
        </div>
      )}

      {/* 1. Channels */}
      <Section
        title="Notification Channels"
        description="Choose how you want to receive alerts from GuardianHub."
      >
        <div className="space-y-4">
          {/* In-app — always on */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10">
                <i className="ri-notification-3-line text-blue-400 text-sm"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-white">In-app</p>
                <p className="text-xs text-gray-500">Always enabled — shown in your notification bell</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-400 font-medium">Always on</span>
              <Switch checked={true} onChange={() => {}} disabled />
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-500/10">
                <i className="ri-mail-line text-emerald-400 text-sm"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Email</p>
                <p className="text-xs text-gray-500">
                  {prefs.email_address || profile?.email || 'No email set'}
                  <button
                    onClick={() => {
                      const val = window.prompt('Enter email address:', prefs.email_address || profile?.email || '');
                      if (val !== null) savePreferences({ email_address: val.trim() || null });
                    }}
                    className="ml-2 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    Update
                  </button>
                </p>
              </div>
            </div>
            <Switch
              checked={prefs.email_enabled}
              onChange={() => savePreferences({ email_enabled: !prefs.email_enabled })}
            />
          </div>

          {/* Push */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-500/10">
                <i className="ri-pushpin-line text-amber-400 text-sm"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-white">Push notifications</p>
                <p className="text-xs text-gray-500">
                  {pushPermission === 'granted'
                    ? 'Browser push is enabled'
                    : pushPermission === 'denied'
                    ? 'Push blocked — enable in browser settings'
                    : 'Browser push not enabled'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {pushPermission !== 'granted' && (
                <button
                  onClick={requestPushPermission}
                  className="text-xs bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                >
                  Enable push
                </button>
              )}
              <Switch
                checked={prefs.push_enabled}
                onChange={() => {
                  if (!prefs.push_enabled && pushPermission !== 'granted') {
                    requestPushPermission();
                  } else {
                    savePreferences({ push_enabled: !prefs.push_enabled });
                  }
                }}
              />
            </div>
          </div>

          {/* SMS */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-purple-500/10">
                <i className="ri-smartphone-line text-purple-400 text-sm"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-white">SMS</p>
                <p className="text-xs text-gray-500">
                  {prefs.phone_number || profile?.phone || 'No phone number set'}
                  <button
                    onClick={() => {
                      const val = window.prompt('Enter phone number:', prefs.phone_number || profile?.phone || '');
                      if (val !== null) savePreferences({ phone_number: val.trim() || null });
                    }}
                    className="ml-2 text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    Update
                  </button>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-purple-500/10 text-purple-400 px-2.5 py-1 rounded-md whitespace-nowrap">
                Coming soon
              </span>
              <Switch
                checked={prefs.sms_enabled}
                onChange={() => savePreferences({ sms_enabled: !prefs.sms_enabled })}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* 2. Per-type matrix */}
      <Section
        title="What to notify me about"
        description="Fine-tune which events trigger alerts on each channel."
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs font-medium text-gray-400 py-3 pr-4">Event type</th>
                <th className="text-center text-xs font-medium text-gray-400 py-3 px-3">In-app</th>
                <th className="text-center text-xs font-medium text-gray-400 py-3 px-3">Email</th>
                <th className="text-center text-xs font-medium text-gray-400 py-3 px-3">Push</th>
                <th className="text-center text-xs font-medium text-gray-400 py-3 px-3">SMS</th>
              </tr>
            </thead>
            <tbody>
              {NOTIF_TYPES.map((t) => {
                const tp = prefs.type_preferences[t.key] || { in_app: true, email: false, push: false, sms: false };
                return (
                  <tr key={t.key} className="border-b border-gray-800/50 last:border-0">
                    <td className="py-3 pr-4">
                      <p className="text-sm text-gray-300">{t.label}</p>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Switch
                        checked={tp.in_app}
                        onChange={() => updateTypePreference(t.key, 'in_app', !tp.in_app)}
                      />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Switch
                        checked={tp.email}
                        onChange={() => updateTypePreference(t.key, 'email', !tp.email)}
                      />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Switch
                        checked={tp.push}
                        onChange={() => updateTypePreference(t.key, 'push', !tp.push)}
                      />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Switch
                        checked={tp.sms}
                        onChange={() => updateTypePreference(t.key, 'sms', !tp.sms)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {/* 3. Quiet Hours */}
      <Section
        title="Quiet Hours"
        description="Outside quiet hours, only critical alerts will reach you via email, push, or SMS. In-app notifications still appear."
      >
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Start</label>
            <input
              type="time"
              value={prefs.quiet_hours_start || '22:00'}
              onChange={(e) => savePreferences({ quiet_hours_start: e.target.value })}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="pt-5 text-gray-600">
            <i className="ri-arrow-right-line"></i>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">End</label>
            <input
              type="time"
              value={prefs.quiet_hours_end || '07:00'}
              onChange={(e) => savePreferences({ quiet_hours_end: e.target.value })}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Section>

      {/* 4. Role-based defaults */}
      <Section
        title="Role-based Defaults"
        description={`Recommended settings have been applied for your role (${roleLabel}). You can reset to these defaults at any time.`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-300">
              Your role: <span className="font-medium text-white">{roleLabel}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Defaults are tailored for what matters most to your position.
            </p>
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            Reset to defaults
          </button>
        </div>
      </Section>

      {/* Reset confirmation modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 max-w-sm w-full mx-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <i className="ri-refresh-line text-amber-400"></i>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Reset preferences?</h3>
            <p className="text-sm text-gray-400 mb-6">
              This will restore the recommended defaults for your role ({roleLabel}). Your custom changes will be lost.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await resetToDefaults();
                  setShowResetConfirm(false);
                }}
                disabled={saving}
                className="flex-1 px-4 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}