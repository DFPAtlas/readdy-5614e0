'use client';

import { supabase } from '@/lib/supabase';

export type NotificationSeverity = 'info' | 'warning' | 'critical';
export type NotificationType =
  | 'incident_critical'
  | 'incident_created'
  | 'sos_alert'
  | 'panic_alert'
  | 'lone_worker_overdue'
  | 'patrol_missed'
  | 'guard_no_bookon'
  | 'shift_unfilled'
  | 'shift_changed'
  | 'shift_assigned'
  | 'shift_cover_offer'
  | 'cover_offer_received'
  | 'sia_expiring'
  | 'compliance_expiring'
  | 'message_received'
  | 'ticket_new'
  | 'ticket_reply'
  | 'report_ready'
  | 'weekly_report_ready'
  | 'risk_score_increased'
  | 'payment_failed'
  | 'payment_upgraded'
  | 'agent_failed';

interface TriggerNotificationParams {
  userId: string;
  companyId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  relatedId?: string;
  relatedType?: string;
  severity?: NotificationSeverity;
}

function getSeverity(type: NotificationType): NotificationSeverity {
  switch (type) {
    case 'incident_critical':
    case 'sos_alert':
    case 'panic_alert':
    case 'lone_worker_overdue':
    case 'guard_no_bookon':
    case 'payment_failed':
    case 'agent_failed':
      return 'critical';
    case 'patrol_missed':
    case 'shift_unfilled':
    case 'sia_expiring':
    case 'compliance_expiring':
    case 'risk_score_increased':
      return 'warning';
    default:
      return 'info';
  }
}

export async function triggerNotification(params: TriggerNotificationParams): Promise<string | null> {
  const { userId, companyId, type, title, body, link, relatedId, relatedType, severity } = params;

  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        company_id: companyId,
        user_id: userId,
        type,
        title,
        body: body || null,
        link: link || null,
        related_id: relatedId || null,
        related_type: relatedType || null,
        severity: severity || getSeverity(type),
      })
      .select('id')
      .maybeSingle();

    if (error || !data) {
      console.error('Failed to create notification:', error?.message);
      return null;
    }

    try {
      await supabase.functions.invoke('send-notification-email', {
        body: { notification_id: data.id },
      });
    } catch {
      // email delivery failure should not block notification creation
    }

    return data.id;
  } catch (err: any) {
    console.error('triggerNotification error:', err?.message);
    return null;
  }
}

export async function triggerNotificationForRole(
  companyId: string,
  role: string,
  params: Omit<TriggerNotificationParams, 'userId' | 'companyId'>
): Promise<number> {
  let sent = 0;
  try {
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('company_id', companyId)
      .eq('role', role);

    if (!users || users.length === 0) return 0;

    for (const user of users) {
      const result = await triggerNotification({
        ...params,
        userId: user.id,
        companyId,
      });
      if (result) sent++;
    }
  } catch (err: any) {
    console.error('triggerNotificationForRole error:', err?.message);
  }
  return sent;
}

export async function triggerNotificationForSiteGuards(
  siteId: string,
  companyId: string,
  params: Omit<TriggerNotificationParams, 'userId' | 'companyId'>
): Promise<number> {
  let sent = 0;
  try {
    const { data: assignments } = await supabase
      .from('guard_site_assignments')
      .select('guard_id')
      .eq('site_id', siteId);

    if (!assignments || assignments.length === 0) return 0;

    const guardIds = assignments.map((a: any) => a.guard_id);

    const { data: guards } = await supabase
      .from('guards')
      .select('user_id')
      .in('id', guardIds)
      .eq('company_id', companyId);

    if (!guards || guards.length === 0) return 0;

    for (const guard of guards) {
      if (!guard.user_id) continue;
      const result = await triggerNotification({
        ...params,
        userId: guard.user_id,
        companyId,
      });
      if (result) sent++;
    }
  } catch (err: any) {
    console.error('triggerNotificationForSiteGuards error:', err?.message);
  }
  return sent;
}

export async function triggerNotificationForAllAdmins(
  companyId: string,
  params: Omit<TriggerNotificationParams, 'userId' | 'companyId'>
): Promise<number> {
  let sent = 0;
  try {
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('company_id', companyId)
      .in('role', ['company_admin', 'operations_manager']);

    if (!users || users.length === 0) return 0;

    for (const user of users) {
      const result = await triggerNotification({
        ...params,
        userId: user.id,
        companyId,
      });
      if (result) sent++;
    }
  } catch (err: any) {
    console.error('triggerNotificationForAllAdmins error:', err?.message);
  }
  return sent;
}