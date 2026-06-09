'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface GuardLeaveRequest {
  id: string;
  shift_id: string | null;
  site_id: string | null;
  reason: string;
  notes: string | null;
  status: string;
  blocked_reason: string | null;
  cover_guard_id: string | null;
  cover_offer_expires_at: string | null;
  created_at: string;
  shift_start: string | null;
  shift_end: string | null;
  site_name: string | null;
}

export interface GuardFutureShift {
  id: string;
  site_id: string;
  start_time: string;
  end_time: string;
  status: string;
  site_name: string | null;
  hasLeaveRequest: boolean;
  leaveRequestStatus: string | null;
}

export function useGuardLeaveRequests(userId: string | null, companyId: string | null) {
  const [leaveRequests, setLeaveRequests] = useState<GuardLeaveRequest[]>([]);
  const [futureShifts, setFutureShifts] = useState<GuardFutureShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [guardId, setGuardId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!userId || !companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data: guardData } = await supabase
      .from('guards')
      .select('id')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .maybeSingle();

    if (!guardData) {
      setLoading(false);
      return;
    }

    const gId = guardData.id;
    setGuardId(gId);

    const now = new Date().toISOString();

    const [shiftsRes, leaveRes] = await Promise.all([
      supabase
        .from('shifts')
        .select('id, site_id, start_time, end_time, status')
        .eq('guard_id', gId)
        .eq('company_id', companyId)
        .gt('end_time', now)
        .order('start_time', { ascending: true }),
      supabase
        .from('leave_requests')
        .select('id, shift_id, site_id, reason, notes, status, blocked_reason, cover_guard_id, cover_offer_expires_at, created_at')
        .eq('guard_id', gId)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false }),
    ]);

    const shifts = shiftsRes.data || [];
    const leaves = leaveRes.data || [];

    const siteIds = shifts.map((s) => s.site_id).filter(Boolean);
    let siteMap: Record<string, string> = {};
    if (siteIds.length > 0) {
      const { data: sitesData } = await supabase
        .from('sites')
        .select('id, site_name')
        .eq('company_id', companyId)
        .in('id', siteIds);
      (sitesData || []).forEach((s: any) => {
        siteMap[s.id] = s.site_name;
      });
    }

    const leaveByShift: Record<string, any> = {};
    leaves.forEach((l) => {
      if (l.shift_id) leaveByShift[l.shift_id] = l;
    });

    const enrichedShifts: GuardFutureShift[] = shifts.map((s) => ({
      id: s.id,
      site_id: s.site_id,
      start_time: s.start_time,
      end_time: s.end_time,
      status: s.status,
      site_name: siteMap[s.site_id] || null,
      hasLeaveRequest: !!leaveByShift[s.id],
      leaveRequestStatus: leaveByShift[s.id]?.status || null,
    }));

    const enrichedLeaves: GuardLeaveRequest[] = leaves.map((l) => ({
      ...l,
      shift_start: leaveByShift[l.shift_id]?.start_time || null,
      shift_end: leaveByShift[l.shift_id]?.end_time || null,
      site_name: l.site_id ? siteMap[l.site_id] || null : null,
    }));

    setFutureShifts(enrichedShifts);
    setLeaveRequests(enrichedLeaves);
    setLoading(false);
  }, [userId, companyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const requestLeave = useCallback(
    async (shiftId: string, reason: string, notes: string, responseMinutes: number) => {
      setSubmitting(true);
      const { data, error } = await supabase.rpc('request_shift_leave', {
        p_shift_id: shiftId,
        p_reason: reason,
        p_notes: notes || null,
        p_response_minutes: responseMinutes,
      });
      setSubmitting(false);
      if (!error) {
        await loadData();
      }
      return { data, error };
    },
    [loadData]
  );

  return {
    leaveRequests,
    futureShifts,
    guardId,
    loading,
    submitting,
    requestLeave,
    refetch: loadData,
  };
}