'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface TrainingModule {
  id: string;
  company_id: string | null;
  title: string;
  description: string | null;
  category: string | null;
  content_type: string | null;
  content_url: string | null;
  duration_minutes: number | null;
  pass_score: number | null;
  is_mandatory: boolean | null;
  mandatory_for_roles: string[] | null;
  active: boolean | null;
  created_at: string;
  quiz_questions: any | null;
}

export interface TrainingCompletion {
  id: string;
  module_id: string;
  guard_id: string;
  company_id: string;
  started_at: string | null;
  completed_at: string | null;
  score: number | null;
  passed: boolean | null;
  attempts: number | null;
  certificate_url: string | null;
  expires_at: string | null;
  created_at: string;
  module_title?: string;
  module_category?: string;
  guard_name?: string;
}

export interface TrainingData {
  modules: TrainingModule[];
  completions: TrainingCompletion[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTrainingModules(): TrainingData {
  const { companyId, profile } = useAuth();
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [completions, setCompletions] = useState<TrainingCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [modRes, compRes, guardRes] = await Promise.all([
        supabase.from('training_modules').select('*').or(`company_id.eq.${companyId},company_id.is.null`).eq('active', true).order('created_at', { ascending: false }),
        supabase.from('training_completions').select('*').eq('company_id', companyId).order('created_at', { ascending: false }),
        supabase.from('guards').select('id, first_name, last_name').eq('company_id', companyId),
      ]);

      if (modRes.error) throw new Error(modRes.error.message);
      if (compRes.error) throw new Error(compRes.error.message);

      const guardMap = new Map((guardRes.data || []).map((g: any) => [g.id, `${g.first_name || ''} ${g.last_name || ''}`.trim() || 'Unknown']));
      const moduleMap = new Map((modRes.data || []).map((m: any) => [m.id, m]));

      const enrichedCompletions: TrainingCompletion[] = (compRes.data || []).map((c: any) => ({
        ...c,
        module_title: moduleMap.get(c.module_id)?.title || 'Unknown Module',
        module_category: moduleMap.get(c.module_id)?.category || null,
        guard_name: guardMap.get(c.guard_id) || 'Unknown',
      }));

      setModules(modRes.data || []);
      setCompletions(enrichedCompletions);
    } catch (err: any) {
      setError(err.message || 'Failed to load training data');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (companyId) fetchData();
  }, [companyId, fetchData]);

  return { modules, completions, loading, error, refetch: fetchData };
}

export function useGuardTraining() {
  const { profile, companyId } = useAuth();
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [completions, setCompletions] = useState<TrainingCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!profile?.id || !companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [modRes, compRes] = await Promise.all([
        supabase.from('training_modules').select('*').or(`company_id.eq.${companyId},company_id.is.null`).eq('active', true).order('created_at', { ascending: false }),
        supabase.from('training_completions').select('*').eq('guard_id', profile.id).eq('company_id', companyId),
      ]);

      if (modRes.error) throw new Error(modRes.error.message);
      if (compRes.error) throw new Error(compRes.error.message);

      const moduleMap = new Map((modRes.data || []).map((m: any) => [m.id, m]));

      const enrichedCompletions: TrainingCompletion[] = (compRes.data || []).map((c: any) => ({
        ...c,
        module_title: moduleMap.get(c.module_id)?.title || 'Unknown Module',
        module_category: moduleMap.get(c.module_id)?.category || null,
        guard_name: null,
      }));

      setModules(modRes.data || []);
      setCompletions(enrichedCompletions);
    } catch (err: any) {
      setError(err.message || 'Failed to load training data');
    } finally {
      setLoading(false);
    }
  }, [profile?.id, companyId]);

  useEffect(() => {
    if (profile?.id && companyId) fetchData();
  }, [profile?.id, companyId, fetchData]);

  return { modules, completions, loading, error, refetch: fetchData };
}