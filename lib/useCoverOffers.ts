'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface CoverOffer {
  id: string;
  leave_request_id: string;
  shift_id: string;
  site_id: string | null;
  offered_to_guard_id: string;
  offered_to_user_id: string | null;
  status: string;
  response_deadline: string;
  responded_at: string | null;
  response_note: string | null;
  created_at: string;
  shift_start: string;
  shift_end: string;
  site_name: string | null;
  requesting_guard_name: string | null;
  reason: string | null;
}

export function useCoverOffers(userId: string | null, companyId: string | null) {
  const [offers, setOffers] = useState<CoverOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId || !companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const now = new Date().toISOString();

    const { data } = await supabase
      .from('shift_cover_offers')
      .select(
        'id, leave_request_id, shift_id, site_id, offered_to_guard_id, offered_to_user_id, status, response_deadline, responded_at, response_note, created_at'
      )
      .eq('offered_to_user_id', userId)
      .eq('status', 'pending')
      .gt('response_deadline', now)
      .order('response_deadline', { ascending: true });

    if (!data || data.length === 0) {
      setOffers([]);
      setLoading(false);
      return;
    }

    const shiftIds = data.map((o) => o.shift_id);
    const leaveIds = data.map((o) => o.leave_request_id);
    const siteIds = data.map((o) => o.site_id).filter(Boolean);

    const [shiftsRes, leaveRes, sitesRes] = await Promise.all([
      supabase.from('shifts').select('id, start_time, end_time').in('id', shiftIds),
      supabase.from('leave_requests').select('id, guard_id, reason, notes').in('id', leaveIds),
      siteIds.length > 0
        ? supabase.from('sites').select('id, site_name').in('id', siteIds)
        : Promise.resolve({ data: [] }),
    ]);

    const shiftMap: Record<string, any> = {};
    (shiftsRes.data || []).forEach((s: any) => (shiftMap[s.id] = s));

    const leaveMap: Record<string, any> = {};
    (leaveRes.data || []).forEach((l: any) => (leaveMap[l.id] = l));

    const siteMap: Record<string, string> = {};
    (sitesRes.data || []).forEach((s: any) => (siteMap[s.id] = s.site_name));

    const guardIds = Object.values(leaveMap)
      .map((l: any) => l.guard_id)
      .filter(Boolean);

    let guardMap: Record<string, { first_name: string; last_name: string }> = {};
    if (guardIds.length > 0) {
      const { data: guardsData } = await supabase
        .from('guards')
        .select('id, first_name, last_name')
        .in('id', guardIds);
      (guardsData || []).forEach((g: any) => {
        guardMap[g.id] = g;
      });
    }

    const enriched: CoverOffer[] = data.map((o) => {
      const leave = leaveMap[o.leave_request_id];
      const shift = shiftMap[o.shift_id];
      const guard = leave ? guardMap[leave.guard_id] : null;
      return {
        ...o,
        shift_start: shift?.start_time || '',
        shift_end: shift?.end_time || '',
        site_name: o.site_id ? siteMap[o.site_id] || null : null,
        requesting_guard_name: guard
          ? `${guard.first_name || ''} ${guard.last_name || ''}`.trim()
          : null,
        reason: leave?.reason || null,
      };
    });

    setOffers(enriched);
    setLoading(false);
  }, [userId, companyId]);

  useEffect(() => {
    load();
  }, [load]);

  const acceptOffer = useCallback(
    async (offerId: string, responseNote?: string) => {
      setActionLoading(offerId);
      const { data, error } = await supabase.rpc('accept_shift_cover_offer', {
        p_offer_id: offerId,
        p_response_note: responseNote || null,
      });
      setActionLoading(null);
      if (!error) await load();
      return { data, error };
    },
    [load]
  );

  const declineOffer = useCallback(
    async (offerId: string, responseNote?: string) => {
      setActionLoading(offerId);
      const { data, error } = await supabase.rpc('decline_shift_cover_offer', {
        p_offer_id: offerId,
        p_response_note: responseNote || null,
      });
      setActionLoading(null);
      if (!error) await load();
      return { data, error };
    },
    [load]
  );

  return { offers, loading, actionLoading, acceptOffer, declineOffer, refetch: load };
}