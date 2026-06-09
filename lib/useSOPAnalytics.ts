'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface SOPAnalytics {
  totalDocuments: number;
  totalChunks: number;
  questionsThisMonth: number;
  dontKnowRate: number;
  topQuestions: { text: string; count: number }[];
  gapQuestions: { text: string; count: number }[];
  aiActionsThisMonth: number;
  dailyQueries: { day: string; count: number }[];
  acknowledgedGaps: Set<string>;
}

const TIER_LIMITS: Record<string, number> = {
  sentinel: 500,
  command: 5000,
  titan: Infinity,
};

function normalizeQuestion(q: string): string {
  return q.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[^a-z0-9\s]/g, '');
}

function isDontKnowResponse(content: string): boolean {
  const c = content.toLowerCase();
  return (
    c.includes("couldn't find") ||
    c.includes("i don't have that") ||
    c.includes("not in your sops") ||
    c.includes("not in the context") ||
    c.includes("couldn't find anything")
  );
}

export function useSOPAnalytics(companyId: string | null): {
  analytics: SOPAnalytics | null;
  loading: boolean;
  error: string | null;
  acknowledgeGap: (text: string) => Promise<void>;
  tierLimit: number;
  tierName: string;
} {
  const [analytics, setAnalytics] = useState<SOPAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());
  const [tier, setTier] = useState<string>('sentinel');

  const tierName = tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Sentinel';
  const tierLimit = TIER_LIMITS[tier?.toLowerCase()] || 500;

  const fetchData = useCallback(async () => {
    if (!companyId) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    try {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      fourteenDaysAgo.setHours(0, 0, 0, 0);

      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const [
        { data: docCount },
        { data: chunkCount },
        { data: userMsgs },
        { data: assistantMsgs },
        { data: gapAcks },
        { data: companyData },
        { data: dailyRaw },
      ] = await Promise.all([
        supabase.from('sop_documents').select('*', { count: 'exact', head: true }).eq('company_id', companyId),
        supabase.from('sop_chunks').select('*', { count: 'exact', head: true }).eq('company_id', companyId),
        supabase
          .from('sop_chat_messages')
          .select('content')
          .eq('company_id', companyId)
          .eq('user_id', authUser.id)
          .eq('role', 'user')
          .gte('created_at', monthStart.toISOString()),
        supabase
          .from('sop_chat_messages')
          .select('content')
          .eq('company_id', companyId)
          .eq('user_id', authUser.id)
          .eq('role', 'assistant')
          .gte('created_at', monthStart.toISOString()),
        supabase.from('sop_gap_acknowledgments').select('question_text').eq('company_id', companyId),
        supabase.from('companies').select('subscription_plan').eq('id', companyId).maybeSingle(),
        supabase.rpc('sop_daily_queries', { p_company_id: companyId, p_since: fourteenDaysAgo.toISOString() }),
      ]);

      // Fallback if RPC doesn't exist
      let dailyQueries: { day: string; count: number }[] = [];
      if (dailyRaw) {
        dailyQueries = (dailyRaw as any[]).map((r) => ({ day: r.day || r.date, count: Number(r.count) }));
      } else {
        const { data: fallbackDaily } = await supabase
          .from('sop_chat_messages')
          .select('created_at')
          .eq('company_id', companyId)
          .eq('role', 'user')
          .gte('created_at', fourteenDaysAgo.toISOString());
        const dayMap: Record<string, number> = {};
        for (const r of fallbackDaily || []) {
          const day = new Date(r.created_at).toISOString().slice(0, 10);
          dayMap[day] = (dayMap[day] || 0) + 1;
        }
        dailyQueries = Object.entries(dayMap)
          .map(([day, count]) => ({ day, count }))
          .sort((a, b) => a.day.localeCompare(b.day));
      }

      const t = (companyData?.subscription_plan || 'sentinel').toLowerCase();
      setTier(t);

      const ackSet = new Set((gapAcks || []).map((a) => a.question_text));
      setAcknowledged(ackSet);

      const totalDocs = docCount || 0;
      const totalChunkCount = chunkCount || 0;
      const userMessages = userMsgs || [];
      const assistantMessages = assistantMsgs || [];

      const questionsThisMonth = userMessages.length;
      const totalAssistant = assistantMessages.length;
      const dontKnowCount = assistantMessages.filter((m) => isDontKnowResponse(m.content)).length;
      const dontKnowRate = totalAssistant > 0 ? Math.round((dontKnowCount / totalAssistant) * 100) : 0;

      // Group top questions
      const qCounts: Record<string, number> = {};
      for (const m of userMessages) {
        const norm = normalizeQuestion(m.content);
        if (!norm) continue;
        qCounts[norm] = (qCounts[norm] || 0) + 1;
      }
      const topQuestions = Object.entries(qCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([text, count]) => ({ text, count }));

      // Gap questions (don't know responses)
      const dontKnowQuestions = userMessages.filter((_, i) =>
        i < assistantMessages.length && isDontKnowResponse(assistantMessages[i]?.content)
      );
      const gapCounts: Record<string, number> = {};
      for (const m of dontKnowQuestions) {
        const norm = normalizeQuestion(m.content);
        if (!norm || ackSet.has(norm)) continue;
        gapCounts[norm] = (gapCounts[norm] || 0) + 1;
      }
      const gapQuestions = Object.entries(gapCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([text, count]) => ({ text, count }));

      // AI actions this month
      const { count: aiCount } = await supabase
        .from('ai_activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .gte('created_at', monthStart.toISOString());

      setAnalytics({
        totalDocuments: totalDocs,
        totalChunks: totalChunkCount,
        questionsThisMonth,
        dontKnowRate,
        topQuestions,
        gapQuestions,
        aiActionsThisMonth: aiCount || 0,
        dailyQueries,
        acknowledgedGaps: ackSet,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const acknowledgeGap = useCallback(async (text: string) => {
    if (!companyId) return;
    const norm = normalizeQuestion(text);
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;

    await supabase.from('sop_gap_acknowledgments').upsert({
      company_id: companyId,
      question_text: norm,
      acknowledged_by: userId,
    }, { onConflict: 'company_id, question_text' });

    setAcknowledged((prev) => {
      const next = new Set(prev);
      next.add(norm);
      return next;
    });

    setAnalytics((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        gapQuestions: prev.gapQuestions.filter((g) => g.text !== norm),
        acknowledgedGaps: new Set([...Array.from(prev.acknowledgedGaps), norm]),
      };
    });
  }, [companyId]);

  return { analytics, loading, error, acknowledgeGap, tierLimit, tierName };
}