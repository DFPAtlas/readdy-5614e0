'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface FirstRunPolicy {
  policy_id: string;
  title: string;
  description: string | null;
  content_text: string | null;
  version: number;
  category: string;
  acknowledged: boolean;
  acknowledged_at: string | null;
}

export interface GuardAcknowledgementsState {
  policies: FirstRunPolicy[];
  pending: FirstRunPolicy[];
  loading: boolean;
  error: string | null;
  acknowledge: (policyId: string) => Promise<boolean>;
  acknowledgeAll: () => Promise<boolean>;
  refetch: () => void;
}

export function useGuardAcknowledgements(): GuardAcknowledgementsState {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || null;
  const [policies, setPolicies] = useState<FirstRunPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPolicies = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('guard_get_first_run_acknowledgements');
      if (rpcError) throw rpcError;
      setPolicies(data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load acknowledgements');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const acknowledge = useCallback(async (policyId: string) => {
    const { error: rpcError } = await supabase.rpc('guard_acknowledge_first_run_policy', {
      p_policy_id: policyId,
    });
    if (rpcError) {
      setError(rpcError.message);
      return false;
    }
    setPolicies((prev) =>
      prev.map((p) =>
        p.policy_id === policyId
          ? { ...p, acknowledged: true, acknowledged_at: new Date().toISOString() }
          : p
      )
    );
    return true;
  }, []);

  const acknowledgeAll = useCallback(async () => {
    const pendingNow = policies.filter((p) => !p.acknowledged);
    let ok = true;
    for (const p of pendingNow) {
      const res = await acknowledge(p.policy_id);
      if (!res) ok = false;
    }
    return ok;
  }, [policies, acknowledge]);

  const pending = policies.filter((p) => !p.acknowledged);

  return {
    policies,
    pending,
    loading,
    error,
    acknowledge,
    acknowledgeAll,
    refetch: fetchPolicies,
  };
}