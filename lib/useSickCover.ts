'use client';

import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';

export interface SickCoverItem {
  shift_id: string;
  site_name: string;
  shift_date: string;
  shift_time: string;
  shift_type: string;
  sick_guard_name: string;
  sick_guard_id: string;
  leave_start: string;
  leave_end: string;
  suggested_guard_id: string | null;
  suggested_guard_name: string | null;
  score: number;
  reasoning: string;
  confidence: number;
}

export interface SickCoverResponse {
  sick_count: number;
  affected_shifts: number;
  cover_plan: SickCoverItem[];
}

async function logActivity(actionType: string, details: any, companyId: string) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    await supabase.from('ai_activity_logs').insert({
      company_id: companyId,
      action_type: actionType,
      details,
      guard_id: session?.user?.id || null,
    });
  } catch {
    // Silent fail — don't block rota operations on logging
  }
}

export function useSickCover() {
  const [data, setData] = useState<SickCoverResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (companyId: string, weekStart: Date) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-sick-cover`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          },
          body: JSON.stringify({
            company_id: companyId,
            week_start: format(weekStart, 'yyyy-MM-dd'),
          }),
        }
      );
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);

      await logActivity('ai_sick_cover_generated', {
        module_name: 'ai_rota_helper',
        week_start_date: format(weekStart, 'yyyy-MM-dd'),
        sick_count: json.sick_count || 0,
        affected_shifts: json.affected_shifts || 0,
        cover_suggestions_count: (json.cover_plan || []).filter((p: any) => p.suggested_guard_id).length,
      }, companyId);
    } catch (err: any) {
      setError(err.message || 'Failed to generate sick cover plan');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  return { data, loading, error, generate, clear };
}