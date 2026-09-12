'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface TypePreference {
  in_app: boolean;
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface NotificationPreferences {
  user_id: string;
  in_app_enabled: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  email_address: string | null;
  phone_number: string | null;
  type_preferences: Record<string, TypePreference>;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  updated_at: string;
}

export const NOTIF_TYPES = [
  { key: 'incident_critical', label: 'Critical incidents', default: { in_app: true, email: true, push: true, sms: false } },
  { key: 'incident_created', label: 'New incidents', default: { in_app: true, email: true, push: false, sms: false } },
  { key: 'sos_alert', label: 'SOS alerts', default: { in_app: true, email: true, push: true, sms: true } },
  { key: 'panic_alert', label: 'Panic alerts', default: { in_app: true, email: true, push: true, sms: true } },
  { key: 'lone_worker_overdue', label: 'Lone worker overdue', default: { in_app: true, email: true, push: true, sms: false } },
  { key: 'patrol_missed', label: 'Missed patrols', default: { in_app: true, email: false, push: false, sms: false } },
  { key: 'guard_no_bookon', label: 'Guard no-show', default: { in_app: true, email: true, push: false, sms: false } },
  { key: 'shift_unfilled', label: 'Shifts unfilled', default: { in_app: true, email: false, push: false, sms: false } },
  { key: 'shift_changed', label: 'Shift changed', default: { in_app: true, email: true, push: true, sms: false } },
  { key: 'shift_assigned', label: 'Shift assigned', default: { in_app: true, email: true, push: true, sms: false } },
  { key: 'shift_cover_offer', label: 'Cover offers', default: { in_app: true, email: true, push: true, sms: false } },
  { key: 'cover_offer_received', label: 'Cover offer received', default: { in_app: true, email: false, push: true, sms: false } },
  { key: 'sia_expiring', label: 'SIA expiring', default: { in_app: true, email: true, push: false, sms: false } },
  { key: 'compliance_expiring', label: 'Compliance expiring', default: { in_app: true, email: true, push: false, sms: false } },
  { key: 'message_received', label: 'Messages', default: { in_app: true, email: true, push: true, sms: false } },
  { key: 'ticket_new', label: 'New support ticket', default: { in_app: true, email: true, push: false, sms: false } },
  { key: 'ticket_reply', label: 'Support reply', default: { in_app: true, email: true, push: false, sms: false } },
  { key: 'report_ready', label: 'Reports ready', default: { in_app: true, email: true, push: false, sms: false } },
  { key: 'weekly_report_ready', label: 'Weekly report ready', default: { in_app: true, email: true, push: false, sms: false } },
  { key: 'risk_score_increased', label: 'Risk score increased', default: { in_app: true, email: true, push: false, sms: false } },
  { key: 'payment_failed', label: 'Payment failed', default: { in_app: true, email: true, push: false, sms: false } },
  { key: 'payment_upgraded', label: 'Subscription upgrade', default: { in_app: true, email: true, push: false, sms: false } },
  { key: 'agent_failed', label: 'Agent failure', default: { in_app: true, email: true, push: false, sms: false } },
] as const;

export type UserRole = 'super_admin' | 'company_admin' | 'operations_manager' | 'guard' | 'client';

function getRoleDefaults(role: UserRole): Record<string, TypePreference> {
  const base = {
    incident_critical: { in_app: true, email: true, push: true, sms: false },
    incident_created: { in_app: true, email: true, push: false, sms: false },
    sos_alert: { in_app: true, email: true, push: true, sms: true },
    panic_alert: { in_app: true, email: true, push: true, sms: true },
    lone_worker_overdue: { in_app: true, email: true, push: true, sms: false },
    patrol_missed: { in_app: true, email: false, push: false, sms: false },
    guard_no_bookon: { in_app: true, email: true, push: false, sms: false },
    shift_unfilled: { in_app: true, email: false, push: false, sms: false },
    shift_changed: { in_app: true, email: true, push: true, sms: false },
    shift_assigned: { in_app: true, email: true, push: true, sms: false },
    shift_cover_offer: { in_app: true, email: true, push: true, sms: false },
    cover_offer_received: { in_app: true, email: false, push: true, sms: false },
    sia_expiring: { in_app: true, email: true, push: false, sms: false },
    compliance_expiring: { in_app: true, email: true, push: false, sms: false },
    message_received: { in_app: true, email: true, push: true, sms: false },
    ticket_new: { in_app: true, email: true, push: false, sms: false },
    ticket_reply: { in_app: true, email: true, push: false, sms: false },
    report_ready: { in_app: true, email: true, push: false, sms: false },
    weekly_report_ready: { in_app: true, email: true, push: false, sms: false },
    risk_score_increased: { in_app: true, email: true, push: false, sms: false },
    payment_failed: { in_app: true, email: true, push: false, sms: false },
    payment_upgraded: { in_app: true, email: true, push: false, sms: false },
    agent_failed: { in_app: true, email: true, push: false, sms: false },
  };

  const guardDefaults: Record<string, TypePreference> = {
    ...base,
    incident_created: { in_app: false, email: false, push: false, sms: false },
    shift_unfilled: { in_app: true, email: true, push: true, sms: false },
    report_ready: { in_app: false, email: false, push: false, sms: false },
    weekly_report_ready: { in_app: false, email: false, push: false, sms: false },
    risk_score_increased: { in_app: false, email: false, push: false, sms: false },
    payment_failed: { in_app: false, email: false, push: false, sms: false },
    payment_upgraded: { in_app: false, email: false, push: false, sms: false },
    agent_failed: { in_app: false, email: false, push: false, sms: false },
    ticket_new: { in_app: false, email: false, push: false, sms: false },
    ticket_reply: { in_app: false, email: false, push: false, sms: false },
    compliance_expiring: { in_app: true, email: true, push: false, sms: false },
    sia_expiring: { in_app: true, email: true, push: false, sms: false },
  };

  const clientDefaults: Record<string, TypePreference> = {
    ...base,
    shift_unfilled: { in_app: false, email: false, push: false, sms: false },
    shift_changed: { in_app: false, email: false, push: false, sms: false },
    shift_assigned: { in_app: false, email: false, push: false, sms: false },
    shift_cover_offer: { in_app: false, email: false, push: false, sms: false },
    cover_offer_received: { in_app: false, email: false, push: false, sms: false },
    sia_expiring: { in_app: false, email: false, push: false, sms: false },
    compliance_expiring: { in_app: true, email: true, push: false, sms: false },
    guard_no_bookon: { in_app: true, email: true, push: false, sms: false },
    patrol_missed: { in_app: true, email: true, push: false, sms: false },
  };

  if (role === 'guard') return guardDefaults;
  if (role === 'client') return clientDefaults;
  return base;
}

const DEFAULT_PREFS: NotificationPreferences = {
  user_id: '',
  in_app_enabled: true,
  email_enabled: true,
  push_enabled: false,
  sms_enabled: false,
  email_address: null,
  phone_number: null,
  type_preferences: {},
  quiet_hours_start: '22:00',
  quiet_hours_end: '07:00',
  updated_at: new Date().toISOString(),
};

export function useNotificationPreferences(userId: string | null, role: UserRole | null) {
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULT_PREFS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  const fetchPrefs = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) {
      const mergedTypePrefs = { ...getRoleDefaults(role || 'company_admin'), ...(data.type_preferences || {}) };
      setPrefs({ ...DEFAULT_PREFS, ...data, type_preferences: mergedTypePrefs });
    } else if (!error && !data) {
      const defaults = getRoleDefaults(role || 'company_admin');
      setPrefs({ ...DEFAULT_PREFS, user_id: userId, type_preferences: defaults });
    }
    setLoading(false);
  }, [userId, role]);

  useEffect(() => {
    fetchPrefs();
  }, [fetchPrefs]);

  const savePreferences = useCallback(async (updates: Partial<NotificationPreferences>) => {
    if (!userId) return;
    setSaving(true);

    const payload = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('notification_preferences')
      .upsert({ ...payload, user_id: userId }, { onConflict: 'user_id' });

    if (!error) {
      setPrefs((prev) => ({ ...prev, ...updates, updated_at: new Date().toISOString() }));
      setSavedAt(new Date().toLocaleTimeString());
    }
    setSaving(false);
  }, [userId]);

  const requestPushPermission = useCallback(async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPushPermission(result);
    if (result === 'granted' && userId) {
      await savePreferences({ push_enabled: true });
    }
  }, [userId, savePreferences]);

  const resetToDefaults = useCallback(async () => {
    if (!userId || !role) return;
    const defaults = getRoleDefaults(role);
    await savePreferences({
      in_app_enabled: true,
      email_enabled: true,
      push_enabled: role === 'operations_manager' || role === 'super_admin',
      sms_enabled: false,
      type_preferences: defaults,
      quiet_hours_start: '22:00',
      quiet_hours_end: '07:00',
    });
  }, [userId, role, savePreferences]);

  const updateTypePreference = useCallback(
    async (type: string, channel: keyof TypePreference, value: boolean) => {
      const current = prefs.type_preferences[type] || { in_app: true, email: false, push: false, sms: false };
      const updated = { ...current, [channel]: value };
      const newTypePrefs = { ...prefs.type_preferences, [type]: updated };
      await savePreferences({ type_preferences: newTypePrefs });
    },
    [prefs, savePreferences]
  );

  return {
    prefs,
    loading,
    saving,
    savedAt,
    pushPermission,
    savePreferences,
    updateTypePreference,
    requestPushPermission,
    resetToDefaults,
    refetch: fetchPrefs,
  };
}