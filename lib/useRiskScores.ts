'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface RiskScore {
  id: string;
  site_id: string;
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: Record<string, { value: number; weight: number; note: string }>;
  ai_narrative: string | null;
  recommendations: string[];
  generated_at: string;
  period_start: string;
  period_end: string;
  acknowledged_recommendations: string[];
}

export function useRiskScores(siteId?: string) {
  const { companyId } = useAuth();
  const [latest, setLatest] = useState<RiskScore | null>(null);
  const [history, setHistory] = useState<RiskScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadScores = useCallback(async () => {
    if (!siteId || !companyId) return;
    setLoading(true);

    const { data } = await supabase
      .from('site_risk_scores')
      .select('*')
      .eq('site_id', siteId)
      .eq('company_id', companyId)
      .order('generated_at', { ascending: false })
      .limit(10);

    if (data && data.length > 0) {
      setLatest(data[0] as RiskScore);
      setHistory(data as RiskScore[]);
    } else {
      setLatest(null);
      setHistory([]);
    }
    setLoading(false);
  }, [siteId, companyId]);

  useEffect(() => {
    loadScores();
  }, [loadScores]);

  const generate = async (periodDays = 30) => {
    if (!siteId || !companyId) return null;
    setGenerating(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-score-site-risk`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`,
          },
          body: JSON.stringify({ site_id: siteId, period_days: periodDays }),
        }
      );
      const data = await res.json();
      if (res.ok && !data.skipped) {
        await loadScores();
        return data as RiskScore;
      }
      return data;
    } catch {
      return null;
    } finally {
      setGenerating(false);
    }
  };

  const acknowledgeRecommendation = async (recIndex: number) => {
    if (!latest || !siteId || !companyId) return;
    const rec = latest.recommendations[recIndex];
    if (!rec) return;

    const newAcked = [...(latest.acknowledged_recommendations || []), String(recIndex)];

    await supabase
      .from('site_risk_scores')
      .update({ acknowledged_recommendations: newAcked })
      .eq('id', latest.id)
      .eq('company_id', companyId);

    await loadScores();
  };

  return { latest, history, loading, generating, generate, acknowledgeRecommendation, refresh: loadScores };
}

export function useAllRiskScores() {
  const { companyId } = useAuth();
  const [scores, setScores] = useState<RiskScore[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);

    // Get latest score per site using a subquery pattern
    const { data } = await supabase
      .from('site_risk_scores')
      .select('*, sites!inner(site_name)')
      .eq('company_id', companyId)
      .gte('score', 60)
      .order('score', { ascending: false })
      .limit(20);

    // Deduplicate to latest per site
    const seen = new Set<string>();
    const deduped: RiskScore[] = [];
    for (const row of (data || [])) {
      if (!seen.has(row.site_id)) {
        seen.add(row.site_id);
        deduped.push(row as RiskScore);
      }
    }

    setScores(deduped);
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    load();
  }, [load]);

  return { scores, loading, refresh: load };
}