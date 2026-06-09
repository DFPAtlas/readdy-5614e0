'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const TIER_LIMITS: Record<string, number> = {
  sentinel: 500,
  command: 5000,
  titan: Infinity,
};

export function useAISummary() {
  const [summarisingIds, setSummarisingIds] = useState<Set<string>>(new Set());
  const [summarisingDay, setSummarisingDay] = useState(false);
  const [aiUsage, setAiUsage] = useState<{ count: number; limit: number; tier: string } | null>(null);

  const markSummarising = useCallback((id: string) => {
    setSummarisingIds((prev) => new Set(prev).add(id));
  }, []);

  const unmarkSummarising = useCallback((id: string) => {
    setSummarisingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const summarizeEntry = useCallback(async (entryId: string): Promise<{ summary?: string; skipped?: boolean; error?: string }> => {
    markSummarising(entryId);
    try {
      const { data, error } = await supabase.functions.invoke('ai-summarize-ob-entry', {
        body: { occurrence_book_id: entryId },
      });
      if (error) throw error;
      return data || {};
    } catch (err: any) {
      return { error: err.message || 'Failed to summarise' };
    } finally {
      unmarkSummarising(entryId);
    }
  }, [markSummarising, unmarkSummarising]);

  const summarizeDay = useCallback(async (siteId: string, date: string): Promise<{ summary?: string; error?: string }> => {
    setSummarisingDay(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-summarize-day', {
        body: { site_id: siteId, date },
      });
      if (error) throw error;
      return data || {};
    } catch (err: any) {
      return { error: err.message || 'Failed to summarise day' };
    } finally {
      setSummarisingDay(false);
    }
  }, []);

  const fetchAIUsage = useCallback(async (companyId: string) => {
    const now = new Date();
    const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01T00:00:00Z`;
    const endOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}T23:59:59Z`;

    const { data: company } = await supabase.from('companies').select('subscription_plan').eq('id', companyId).maybeSingle();
    const tier = (company?.subscription_plan || 'sentinel').toLowerCase();
    const limit = TIER_LIMITS[tier] || TIER_LIMITS.sentinel;

    const { count } = await supabase
      .from('ai_activity_logs')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId)
      .gte('created_at', startOfMonth)
      .lte('created_at', endOfMonth);

    setAiUsage({ count: count || 0, limit, tier });
    return { count: count || 0, limit, tier };
  }, []);

  return {
    summarisingIds,
    summarisingDay,
    aiUsage,
    summarizeEntry,
    summarizeDay,
    fetchAIUsage,
  };
}