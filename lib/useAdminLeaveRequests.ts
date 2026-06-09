'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface AdminLeaveRequest {
  id: string;
  guard_id: string;
  shift_id: string | null;
  site_id: string | null;
  reason: string;
  notes: string | null;
  status: string;
  blocked_reason: string | null;
  cover_guard_id: string | null;
  cover_offer_expires_at: string | null;
  requested_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  guard_name: string;
  cover_guard_name: string | null;
  site_name: string | null;
  shift_start: string | null;
  shift_end: string | null;
}

export function useAdminLeaveRequests() {
  const { companyId } = useAuth();
  const [requests, setRequests] = useState<AdminLeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (!data || data.length === 0) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const guardIds = [
      ...new Set(data.map((r) => r.guard_id).filter(Boolean)),
      ...new Set(data.map((r) => r.cover_guard_id).filter(Boolean)),
    ];
    const siteIds = [...new Set(data.map((r) => r.site_id).filter(Boolean))];
    const shiftIds = [...new Set(data.map((r) => r.shift_id).filter(Boolean))];

    const [guardsRes, sitesRes, shiftsRes] = await Promise.all([
      supabase.from('guards').select('id, first_name, last_name').in('id', guardIds),
      siteIds.length > 0
        ? supabase.from('sites').select('id, site_name').in('id', siteIds)
        : Promise.resolve({ data: [] }),
      shiftIds.length > 0
        ? supabase.from('shifts').select('id, start_time, end_time').in('id', shiftIds)
        : Promise.resolve({ data: [] }),
    ]);

    const guardMap: Record<string, { first_name: string; last_name: string }> = {};
    (guardsRes.data || []).forEach((g: any) => {
      guardMap[g.id] = g;
    });

    const siteMap: Record<string, string> = {};
    (sitesRes.data || []).forEach((s: any) => {
      siteMap[s.id] = s.site_name;
    });

    const shiftMap: Record<string, { start_time: string; end_time: string }> = {};
    (shiftsRes.data || []).forEach((s: any) => {
      shiftMap[s.id] = s;
    });

    const enriched: AdminLeaveRequest[] = data.map((r) => {
      const guard = guardMap[r.guard_id];
      const coverGuard = r.cover_guard_id ? guardMap[r.cover_guard_id] : null;
      const shift = r.shift_id ? shiftMap[r.shift_id] : null;
      return {
        ...r,
        guard_name: guard
          ? `${guard.first_name || ''} ${guard.last_name || ''}`.trim()
          : 'Unknown Guard',
        cover_guard_name: coverGuard
          ? `${coverGuard.first_name || ''} ${coverGuard.last_name || ''}`.trim()
          : null,
        site_name: r.site_id ? siteMap[r.site_id] || null : null,
        shift_start: shift?.start_time || null,
        shift_end: shift?.end_time || null,
      };
    });

    setRequests(enriched);
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    if (companyId) load();
  }, [companyId, load]);

  return { requests, loading, refetch: load };
}