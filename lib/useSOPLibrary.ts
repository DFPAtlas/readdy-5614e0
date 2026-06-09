'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

const edgeBase = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1`
  : '';

export interface SOPLibraryDocument {
  id: string;
  company_id: string;
  site_id: string | null;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string | null;
  file_size: number | null;
  file_type: string | null;
  status: 'processing' | 'indexed' | 'failed' | null;
  error_message: string | null;
  category: string | null;
  uploaded_by: string | null;
  created_at: string;
  site_name?: string | null;
  uploader_name?: string | null;
}

export function useSOPLibrary() {
  const { companyId, user } = useAuth();
  const [docs, setDocs] = useState<SOPLibraryDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!companyId) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('sop_documents')
      .select(`
        id, company_id, site_id, title, description,
        file_url, file_name, file_size, file_type, status, error_message,
        category, uploaded_by, created_at,
        sites:site_id (site_name),
        users:uploaded_by (full_name)
      `)
      .eq('company_id', companyId)
      .eq('is_active', true)
      .eq('is_current', true)
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
      setDocs([]);
    } else {
      const mapped = (data || []).map((d: any) => ({
        ...d,
        site_name: d.sites?.site_name || null,
        uploader_name: d.users?.full_name || null,
      }));
      setDocs(mapped);
    }
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    if (!companyId) return;
    load();

    const channel = supabase
      .channel('sop_documents_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sop_documents', filter: `company_id=eq.${companyId}` },
        () => { load(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [companyId, load]);

  const addDocument = async (
    file: File,
    title: string,
    description: string,
    siteId: string | null,
    category?: string
  ): Promise<{ data?: SOPLibraryDocument; error?: any }> => {
    if (!companyId || !user) return { error: new Error('Not authenticated') };

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const fileType = ext === 'pdf' ? 'PDF' : ext === 'docx' || ext === 'doc' ? 'DOCX' : ext === 'txt' ? 'TXT' : ext.toUpperCase();

    const folder = siteId || 'company-wide';
    const filePath = `sop-documents/${companyId}/${folder}/${Date.now()}_${file.name}`;

    const { error: upErr } = await supabase.storage
      .from('sop-documents')
      .upload(filePath, file, { upsert: false });

    if (upErr) return { error: upErr };

    const { data: urlData } = supabase.storage
      .from('sop-documents')
      .getPublicUrl(filePath);

    const { data, error: insertErr } = await supabase
      .from('sop_documents')
      .insert({
        company_id: companyId,
        site_id: siteId,
        title,
        description: description || null,
        file_url: urlData.publicUrl,
        file_name: file.name,
        file_size: file.size,
        file_type: fileType,
        status: 'processing',
        category: category || 'General',
        is_active: true,
        version_number: 1,
        is_current: true,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (!insertErr && data && edgeBase) {
      const session = await supabase.auth.getSession();
      fetch(`${edgeBase}/ai-index-sop-document`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.data.session?.access_token || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ document_id: data.id }),
      }).catch(() => {});
    }

    if (!insertErr) await load();
    return { data, error: insertErr };
  };

  const deleteDocument = async (id: string): Promise<{ error?: any }> => {
    const doc = docs.find((d) => d.id === id);
    if (doc?.file_url) {
      const pathMatch = doc.file_url.match(/sop-documents\/(.+)/);
      if (pathMatch) {
        await supabase.storage.from('sop-documents').remove([pathMatch[1]]);
      }
    }
    const { error: delErr } = await supabase.from('sop_documents').delete().eq('id', id);
    if (!delErr) await load();
    return { error: delErr };
  };

  const reindexDocument = async (id: string): Promise<{ error?: any }> => {
    const { error: updErr } = await supabase
      .from('sop_documents')
      .update({ status: 'processing', error_message: null })
      .eq('id', id);

    if (!updErr && edgeBase) {
      const session = await supabase.auth.getSession();
      fetch(`${edgeBase}/ai-index-sop-document`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.data.session?.access_token || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ document_id: id }),
      }).catch(() => {});
    }

    if (!updErr) await load();
    return { error: updErr };
  };

  return { docs, loading, error, refetch: load, addDocument, deleteDocument, reindexDocument };
}