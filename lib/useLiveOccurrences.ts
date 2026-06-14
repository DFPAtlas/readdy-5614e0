'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { LiveOccurrence } from '@/lib/dashboardFetch';

export function useLiveOccurrences(companyId: string | null, baseOccurrences: LiveOccurrence[]) {
  const [occurrences, setOccurrences] = useState<LiveOccurrence[]>(baseOccurrences);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const baseRef = useRef(baseOccurrences);
  const localRef = useRef<LiveOccurrence[]>([]);

  useEffect(() => {
    baseRef.current = baseOccurrences;
    setOccurrences([...localRef.current, ...baseOccurrences]);
  }, [baseOccurrences]);

  useEffect(() => {
    if (!companyId) return;

    const channel = supabase
      .channel('live-occurrence-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'occurrence_books',
          filter: `company_id=eq.${companyId}`,
        },
        async (payload) => {
          const entry = payload.new as any;
          const { data } = await supabase
            .from('occurrence_books')
            .select('id, entry, entry_type, ai_summary, occurred_at, created_at, site_id, sites!inner(site_name), guard_id, guards(first_name, last_name)')
            .eq('id', entry.id)
            .maybeSingle();

          if (data) {
            const occurrence: LiveOccurrence = {
              id: data.id,
              entry: data.entry,
              entry_type: data.entry_type,
              ai_summary: (data as any).ai_summary || null,
              occurred_at: data.occurred_at,
              created_at: data.created_at,
              site_name: (data as any).sites?.site_name || 'Unknown',
              guard_first_name: (data as any).guards?.first_name || null,
              guard_last_name: (data as any).guards?.last_name || null,
            };

            localRef.current = [occurrence, ...localRef.current].slice(0, 24);
            setNewIds((prev) => new Set(prev).add(occurrence.id));
            setOccurrences([...localRef.current, ...baseRef.current].slice(0, 24));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'occurrence_books',
          filter: `company_id=eq.${companyId}`,
        },
        (payload) => {
          const updated = payload.new as any;
          setOccurrences((prev) =>
            prev.map((o) =>
              o.id === updated.id
                ? {
                    ...o,
                    entry: updated.entry,
                    entry_type: updated.entry_type,
                    occurred_at: updated.occurred_at,
                    ai_summary: updated.ai_summary || o.ai_summary,
                  }
                : o
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [companyId]);

  useEffect(() => {
    if (newIds.size === 0) return;
    const timer = setTimeout(() => setNewIds(new Set()), 1800);
    return () => clearTimeout(timer);
  }, [newIds]);

  return { occurrences, newIds };
}