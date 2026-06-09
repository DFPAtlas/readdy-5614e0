import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface StaffingSuggestion {
  shift_id: string;
  suggested_guard_id: string | null;
  confidence: number;
  reasoning: string;
}

export interface SuggestionResult {
  suggestions: StaffingSuggestion[];
  unfillable: Array<{ shift_id: string; reason: string }>;
  warnings: string[];
  shifts_count: number;
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

export interface GenerateResponse {
  data: SuggestionResult | null;
  error: string | null;
}

export function useAISuggestions() {
  const [suggestions, setSuggestions] = useState<StaffingSuggestion[]>([]);
  const [unfillable, setUnfillable] = useState<SuggestionResult['unfillable']>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [shiftsCount, setShiftsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCallStatus, setLastCallStatus] = useState<'idle' | 'success' | 'error' | 'no_shifts'>('idle');

  const generate = useCallback(async (companyId: string, weekStartDate: string): Promise<GenerateResponse> => {
    setLoading(true);
    setError(null);
    setLastCallStatus('idle');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || '';
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-suggest-staffing`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ week_start_date: weekStartDate }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = { error: 'Edge function returned invalid response' };
      }

      if (!res.ok) {
        const msg = data?.error || data?.message || `Edge function failed (${res.status})`;
        setError(msg);
        setSuggestions([]);
        setUnfillable([]);
        setWarnings([]);
        setLastCallStatus('error');
        return { data: null, error: msg };
      }

      const result: SuggestionResult = {
        suggestions: data.suggestions || [],
        unfillable: data.unfillable || [],
        warnings: data.warnings || [],
        shifts_count: data.shifts_count || 0,
      };

      setSuggestions(result.suggestions);
      setUnfillable(result.unfillable);
      setWarnings(result.warnings);
      setShiftsCount(result.shifts_count);

      if (result.suggestions.length === 0 && result.shifts_count === 0) {
        setLastCallStatus('no_shifts');
      } else {
        setLastCallStatus('success');
      }

      await logActivity('ai_rota_suggestions_generated', {
        module_name: 'ai_rota_helper',
        week_start_date: weekStartDate,
        open_shift_count: result.shifts_count,
        suggestions_count: result.suggestions.length,
        unfillable_count: result.unfillable.length,
        warnings_count: result.warnings.length,
      }, companyId);

      return { data: result, error: null };
    } catch (err: any) {
      const msg = err?.message || 'Failed to generate suggestions';
      setError(msg);
      setLastCallStatus('error');
      return { data: null, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    suggestions,
    unfillable,
    warnings,
    shiftsCount,
    loading,
    error,
    lastCallStatus,
    generate,
    setSuggestions,
  };
}