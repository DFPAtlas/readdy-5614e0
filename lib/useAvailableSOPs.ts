'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface AvailableSOP {
  id: string;
  title: string;
  file_name: string | null;
  category: string | null;
  isIndexed: boolean;
}

export function useAvailableSOPs() {
  const { companyId } = useAuth();
  const [docs, setDocs] = useState<AvailableSOP[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!companyId) { setLoading(false); return; }
    setLoading(true);

    const { data: sopDocs, error } = await supabase
      .from('sop_documents')
      .select('id, title, file_name, category')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .eq('is_current', true)
      .order('created_at', { ascending: false });

    if (error || !sopDocs) {
      setDocs([]);
      setLoading(false);
      return;
    }

    const docIds = sopDocs.map(d => d.id);
    if (docIds.length === 0) {
      setDocs([]);
      setLoading(false);
      return;
    }

    const { data: chunks } = await supabase
      .from('sop_chunks')
      .select('document_id')
      .in('document_id', docIds);

    const indexedCounts: Record<string, number> = {};
    for (const c of (chunks || [])) {
      indexedCounts[c.document_id] = (indexedCounts[c.document_id] || 0) + 1;
    }

    setDocs(sopDocs.map(d => ({
      id: d.id,
      title: d.title,
      file_name: d.file_name,
      category: d.category,
      isIndexed: (indexedCounts[d.id] || 0) > 0,
    })));
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    load();
  }, [load]);

  return { docs, loading, refetch: load };
}