import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface AIRotaSuggestion {
  id: string;
  company_id: string;
  site_id: string | null;
  shift_id: string;
  suggested_guard_id: string | null;
  suggestion_type: string;
  confidence: number | null;
  reasoning: string | null;
  warnings: any[] | null;
  status: 'pending' | 'approved' | 'rejected' | 'applied' | 'expired';
  approved_by: string | null;
  approved_at: string | null;
  rejected_by: string | null;
  rejected_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSuggestionInput {
  company_id: string;
  site_id?: string;
  shift_id: string;
  suggested_guard_id?: string;
  suggestion_type: string;
  confidence?: number;
  reasoning?: string;
  warnings?: any[];
  metadata?: Record<string, any>;
}

async function logActivity(
  actionType: string,
  details: any,
  companyId: string
) {
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

export interface SuggestionCounts {
  pending: number;
  approved: number;
  rejected: number;
  applied: number;
  expired: number;
  open_shift_cover: number;
  sick_cover: number;
  auto_fill: number;
  overtime_balance: number;
  conflict_fix: number;
  predicted_shortage: number;
}

export function useAIRotaSuggestions() {
  const [pending, setPending] = useState<AIRotaSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPending = useCallback(async (companyId: string) => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('ai_rota_suggestions')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setPending(data || []);
    setLoading(false);
  }, []);

  const createSuggestions = useCallback(async (
    inputs: CreateSuggestionInput[],
    createdBy?: string
  ) => {
    const { data: { session } } = await supabase.auth.getSession();
    const uid = createdBy || session?.user?.id;
    const rows = inputs.map(i => ({
      company_id: i.company_id,
      site_id: i.site_id || null,
      shift_id: i.shift_id,
      suggested_guard_id: i.suggested_guard_id || null,
      suggestion_type: i.suggestion_type,
      confidence: i.confidence ?? null,
      reasoning: i.reasoning ?? null,
      warnings: i.warnings ? JSON.stringify(i.warnings) : '[]',
      metadata: i.metadata ? JSON.stringify(i.metadata) : '{}',
      status: 'pending' as const,
      created_by: uid || null,
    }));
    const { data, error: err } = await supabase
      .from('ai_rota_suggestions')
      .insert(rows)
      .select();
    return { data, error: err };
  }, []);

  const approveAndApply = useCallback(async (
    suggestionId: string,
    companyId: string
  ) => {
    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user?.id;

    const { data: suggestion } = await supabase
      .from('ai_rota_suggestions')
      .select('*')
      .eq('id', suggestionId)
      .maybeSingle();

    if (!suggestion || !suggestion.suggested_guard_id) {
      return { error: new Error('Suggestion not found or no guard suggested') };
    }

    const { error: shiftError } = await supabase
      .from('shifts')
      .update({ guard_id: suggestion.suggested_guard_id, status: 'scheduled' })
      .eq('id', suggestion.shift_id)
      .eq('company_id', companyId);

    if (shiftError) return { error: shiftError };

    const now = new Date().toISOString();
    const { error: suggError } = await supabase
      .from('ai_rota_suggestions')
      .update({
        status: 'applied',
        approved_by: uid,
        approved_at: now,
        updated_at: now,
      })
      .eq('id', suggestionId);

    if (suggError) return { error: suggError };

    await logActivity('ai_rota_suggestion_approved', {
      module_name: 'ai_rota_helper',
      suggestion_id: suggestionId,
      shift_id: suggestion.shift_id,
      guard_id: suggestion.suggested_guard_id,
      suggestion_type: suggestion.suggestion_type,
    }, companyId);

    await logActivity('ai_rota_suggestion_applied', {
      module_name: 'ai_rota_helper',
      suggestion_id: suggestionId,
      shift_id: suggestion.shift_id,
      guard_id: suggestion.suggested_guard_id,
      suggestion_type: suggestion.suggestion_type,
    }, companyId);

    return { error: null };
  }, []);

  const rejectSuggestion = useCallback(async (
    suggestionId: string,
    companyId: string
  ) => {
    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user?.id;

    const { data: suggestion } = await supabase
      .from('ai_rota_suggestions')
      .select('shift_id,suggestion_type')
      .eq('id', suggestionId)
      .maybeSingle();

    const now = new Date().toISOString();
    const { error } = await supabase
      .from('ai_rota_suggestions')
      .update({
        status: 'rejected',
        rejected_by: uid,
        rejected_at: now,
        updated_at: now,
      })
      .eq('id', suggestionId);

    if (error) return { error };

    await logActivity('ai_rota_suggestion_rejected', {
      module_name: 'ai_rota_helper',
      suggestion_id: suggestionId,
      shift_id: suggestion?.shift_id,
      suggestion_type: suggestion?.suggestion_type,
    }, companyId);

    return { error: null };
  }, []);

  const approveAllHigh = useCallback(async (
    suggestionsList: AIRotaSuggestion[],
    companyId: string
  ) => {
    const high = suggestionsList.filter(
      s => s.suggested_guard_id && (s.confidence ?? 0) >= 80 && s.status === 'pending'
    );
    let applied = 0;
    for (const s of high) {
      const { error } = await approveAndApply(s.id, companyId);
      if (!error) applied++;
    }
    return applied;
  }, [approveAndApply]);

  const getCounts = useCallback(async (companyId: string): Promise<SuggestionCounts> => {
    const { data } = await supabase
      .from('ai_rota_suggestions')
      .select('status, suggestion_type')
      .eq('company_id', companyId);

    const result: SuggestionCounts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      applied: 0,
      expired: 0,
      open_shift_cover: 0,
      sick_cover: 0,
      auto_fill: 0,
      overtime_balance: 0,
      conflict_fix: 0,
      predicted_shortage: 0,
    };

    for (const row of (data || [])) {
      if (row.status === 'pending') result.pending++;
      if (row.status === 'approved') result.approved++;
      if (row.status === 'rejected') result.rejected++;
      if (row.status === 'applied') result.applied++;
      if (row.status === 'expired') result.expired++;
      if (row.suggestion_type === 'open_shift_cover') result.open_shift_cover++;
      if (row.suggestion_type === 'sick_cover') result.sick_cover++;
      if (row.suggestion_type === 'auto_fill') result.auto_fill++;
      if (row.suggestion_type === 'overtime_balance') result.overtime_balance++;
      if (row.suggestion_type === 'conflict_fix') result.conflict_fix++;
      if (row.suggestion_type === 'predicted_shortage') result.predicted_shortage++;
    }

    return result;
  }, []);

  const clearPending = useCallback(() => {
    setPending([]);
  }, []);

  return {
    pending,
    loading,
    error,
    fetchPending,
    createSuggestions,
    approveAndApply,
    rejectSuggestion,
    approveAllHigh,
    getCounts,
    clearPending,
  };
}