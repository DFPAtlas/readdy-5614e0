import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface GuardSiteAssignment {
  id: string;
  company_id: string;
  guard_id: string;
  site_id: string;
  status: string;
  induction_status: string;
  induction_date: string | null;
  notes: string | null;
  assigned_by: string | null;
  assigned_at: string;
  last_worked_at: string | null;
  is_blocked: boolean;
  block_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssignmentMatrixCell {
  guard_id: string;
  site_id: string;
  status: 'assigned' | 'approved' | 'not_trained' | 'blocked' | 'expired_docs' | 'available';
  induction_status?: string;
  last_worked_at?: string | null;
  is_blocked?: boolean;
  block_reason?: string | null;
  notes?: string | null;
  shift_count?: number;
  last_shift_date?: string | null;
}

export function useSiteAssignments() {
  const { companyId } = useAuth();
  const [assignments, setAssignments] = useState<GuardSiteAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAssignments = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('guard_site_assignments')
      .select('*')
      .eq('company_id', companyId);
    if (err) setError(err.message);
    else setAssignments(data || []);
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    if (!companyId) return;
    loadAssignments();
    const interval = setInterval(() => loadAssignments(), 30000);
    return () => clearInterval(interval);
  }, [companyId, loadAssignments]);

  const addAssignment = async (guard_id: string, site_id: string, payload: Partial<GuardSiteAssignment>) => {
    if (!companyId) return { error: new Error('No company') };
    const { data, error } = await supabase
      .from('guard_site_assignments')
      .insert({
        company_id: companyId,
        guard_id,
        site_id,
        status: payload.status || 'assigned',
        induction_status: payload.induction_status || 'not_started',
        induction_date: payload.induction_date || null,
        notes: payload.notes || null,
        is_blocked: payload.is_blocked || false,
        block_reason: payload.block_reason || null,
      })
      .select()
      .maybeSingle();
    if (!error) loadAssignments();
    return { data, error };
  };

  const updateAssignment = async (id: string, payload: Partial<GuardSiteAssignment>) => {
    const { data, error } = await supabase
      .from('guard_site_assignments')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (!error) loadAssignments();
    return { data, error };
  };

  const removeAssignment = async (id: string) => {
    const { error } = await supabase.from('guard_site_assignments').delete().eq('id', id);
    if (!error) loadAssignments();
    return { error };
  };

  return {
    assignments,
    loading,
    error,
    refetch: loadAssignments,
    addAssignment,
    updateAssignment,
    removeAssignment,
  };
}