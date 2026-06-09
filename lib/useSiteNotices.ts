import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export type NoticeCategory =
  | 'General Information'
  | 'Assignment Instructions'
  | 'Health & Safety'
  | 'Access Instructions'
  | 'Client Updates'
  | 'Emergency Procedures'
  | 'Parking / Keyholding'
  | 'Site Risks'
  | 'Temporary Changes';

export type NoticePriority = 'Low' | 'Normal' | 'High' | 'Urgent';
export type NoticeStatus = 'active' | 'inactive';

export interface SiteNotice {
  id: string;
  site_id: string;
  company_id: string | null;
  title: string;
  body: string;
  category: NoticeCategory;
  priority: NoticePriority;
  status: NoticeStatus;
  pinned: boolean;
  created_by: string | null;
  created_by_name: string | null;
  updated_by: string | null;
  updated_by_name: string | null;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface NoticeFormData {
  title: string;
  body: string;
  category: NoticeCategory;
  priority: NoticePriority;
  pinned: boolean;
  expiry_date: string | null;
  status: NoticeStatus;
}

export const NOTICE_CATEGORIES: NoticeCategory[] = [
  'General Information',
  'Assignment Instructions',
  'Health & Safety',
  'Access Instructions',
  'Client Updates',
  'Emergency Procedures',
  'Parking / Keyholding',
  'Site Risks',
  'Temporary Changes',
];

export const PRIORITY_LABELS: Record<NoticePriority, string> = {
  Low: 'Low',
  Normal: 'Normal',
  High: 'High',
  Urgent: 'Urgent',
};

export const CATEGORY_ICONS: Record<NoticeCategory, string> = {
  'General Information': 'ri-information-line',
  'Assignment Instructions': 'ri-file-list-line',
  'Health & Safety': 'ri-heart-pulse-line',
  'Access Instructions': 'ri-door-open-line',
  'Client Updates': 'ri-user-voice-line',
  'Emergency Procedures': 'ri-alarm-warning-line',
  'Parking / Keyholding': 'ri-key-2-line',
  'Site Risks': 'ri-alert-line',
  'Temporary Changes': 'ri-exchange-line',
};

export function useSiteNotices(siteId: string | null) {
  const { profile, companyId } = useAuth();
  const [notices, setNotices] = useState<SiteNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!siteId) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('site_notices')
      .select('*')
      .eq('site_id', siteId)
      .order('pinned', { ascending: false })
      .order('priority', { ascending: false })
      .order('updated_at', { ascending: false });

    if (err) {
      setError(err.message);
      setNotices([]);
    } else {
      const sorted = (data || []).sort((a: SiteNotice, b: SiteNotice) => {
        const priorityOrder: Record<NoticePriority, number> = { Urgent: 4, High: 3, Normal: 2, Low: 1 };
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
      setNotices(sorted);
    }
    setLoading(false);
  }, [siteId]);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(), 60000);
    return () => clearInterval(interval);
  }, [load]);

  const create = useCallback(async (form: NoticeFormData) => {
    if (!siteId || !companyId || !profile) return { error: new Error('Missing data') };
    const { data, error } = await supabase
      .from('site_notices')
      .insert({
        site_id: siteId,
        company_id: companyId,
        title: form.title,
        body: form.body,
        category: form.category,
        priority: form.priority,
        pinned: form.pinned,
        status: form.status,
        expiry_date: form.expiry_date,
        created_by: profile.id,
        created_by_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown',
        updated_by: profile.id,
        updated_by_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown',
      })
      .select()
      .single();
    if (!error) await load();
    return { data, error };
  }, [siteId, companyId, profile, load]);

  const update = useCallback(async (id: string, form: Partial<NoticeFormData>) => {
    if (!siteId || !profile) return { error: new Error('Missing data') };
    const { data, error } = await supabase
      .from('site_notices')
      .update({
        ...form,
        updated_by: profile.id,
        updated_by_name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown',
      })
      .eq('id', id)
      .eq('site_id', siteId)
      .select()
      .single();
    if (!error) await load();
    return { data, error };
  }, [siteId, profile, load]);

  const remove = useCallback(async (id: string) => {
    if (!siteId) return { error: new Error('No site') };
    const { error } = await supabase.from('site_notices').delete().eq('id', id).eq('site_id', siteId);
    if (!error) await load();
    return { error };
  }, [siteId, load]);

  return { notices, loading, error, refetch: load, create, update, remove };
}

export function useGuardsThisWeek(siteId: string | null) {
  const { companyId } = useAuth();
  const [guards, setGuards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!siteId || !companyId) { setLoading(false); return; }
    setLoading(true);

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const { data: shiftData, error } = await supabase
      .from('shifts')
      .select('*, guards!left(id,first_name,last_name,email,status,skills)')
      .eq('site_id', siteId)
      .eq('company_id', companyId)
      .gte('start_time', startOfWeek.toISOString())
      .lt('start_time', endOfWeek.toISOString())
      .order('start_time');

    if (error || !shiftData) {
      setGuards([]);
      setLoading(false);
      return;
    }

    const guardMap = new Map();
    shiftData.forEach((shift: any) => {
      const guard = shift.guards;
      if (!guard) return;
      const gid = guard.id;
      if (!guardMap.has(gid)) {
        guardMap.set(gid, {
          id: gid,
          name: `${guard.first_name || ''} ${guard.last_name || ''}`.trim() || 'Unnamed',
          initials: `${(guard.first_name || '')[0]}${(guard.last_name || '')[0]}`.toUpperCase(),
          email: guard.email,
          skills: guard.skills || [],
          status: guard.status,
          shifts: [],
        });
      }
      guardMap.get(gid).shifts.push({
        id: shift.id,
        start_time: shift.start_time,
        end_time: shift.end_time,
        shift_type: shift.shift_type,
        status: shift.status,
      });
    });

    setGuards(Array.from(guardMap.values()));
    setLoading(false);
  }, [siteId, companyId]);

  useEffect(() => {
    load();
  }, [load]);

  return { guards, loading, refetch: load };
}

export function getStatusColor(priority: NoticePriority) {
  switch (priority) {
    case 'Urgent': return 'bg-red-500 text-white border-red-600';
    case 'High': return 'bg-orange-500 text-white border-orange-600';
    case 'Normal': return 'bg-blue-500 text-white border-blue-600';
    case 'Low': return 'bg-gray-500 text-white border-gray-600';
  }
}

export function getStatusDot(priority: NoticePriority) {
  switch (priority) {
    case 'Urgent': return 'bg-red-500';
    case 'High': return 'bg-orange-500';
    case 'Normal': return 'bg-blue-500';
    case 'Low': return 'bg-gray-500';
  }
}

export function useCompanyNotices(companyId: string | null) {
  const { profile } = useAuth();
  const [notices, setNotices] = useState<SiteNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!companyId) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('site_notices')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'active')
      .order('pinned', { ascending: false })
      .order('priority', { ascending: false })
      .order('updated_at', { ascending: false });

    if (err) {
      setError(err.message);
      setNotices([]);
    } else {
      const sorted = (data || []).sort((a: SiteNotice, b: SiteNotice) => {
        const priorityOrder: Record<NoticePriority, number> = { Urgent: 4, High: 3, Normal: 2, Low: 1 };
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
      setNotices(sorted);
    }
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(), 60000);
    return () => clearInterval(interval);
  }, [load]);

  return { notices, loading, error, refetch: load };
}

export function getPriorityBorder(priority: NoticePriority) {
  switch (priority) {
    case 'Urgent': return 'border-l-4 border-l-red-500';
    case 'High': return 'border-l-4 border-l-orange-500';
    case 'Normal': return 'border-l-4 border-l-blue-500';
    case 'Low': return 'border-l-4 border-l-gray-500';
  }
}