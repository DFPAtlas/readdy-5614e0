'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface SOPDocument {
  id: string;
  company_id: string;
  site_id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string | null;
  file_size: number | null;
  category: string | null;
  is_active: boolean;
  version_number: number;
  superseded_by_id: string | null;
  is_current: boolean;
  change_notes: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SOPVersion {
  id: string;
  file_url: string;
  file_name: string | null;
  file_size: number | null;
  version_number: number;
  change_notes: string | null;
  uploaded_by: string | null;
  created_at: string;
  is_current: boolean;
  is_active: boolean;
}

export function useSOPDocuments(siteId?: string, includeSuperseded?: boolean) {
  const { companyId } = useAuth();
  const [docs, setDocs] = useState<SOPDocument[]>([]);
  const [versions, setVersions] = useState<Record<string, SOPVersion[]>>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!companyId) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    let q = supabase
      .from('sop_documents')
      .select('*')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (siteId) q = q.eq('site_id', siteId);
    if (!includeSuperseded) q = q.eq('is_current', true);

    const { data, error: err } = await q;
    if (err) setError(err.message);
    else setDocs(data || []);
    setLoading(false);
  }, [companyId, siteId, includeSuperseded]);

  const loadVersions = useCallback(async (docId: string) => {
    const { data, error: err } = await supabase
      .from('sop_documents')
      .select('id, file_url, file_name, file_size, version_number, change_notes, uploaded_by, created_at, is_current, is_active')
      .or(`id.eq.${docId},superseded_by_id.eq.${docId}`)
      .order('version_number', { ascending: false });

    if (err) return;
    setVersions((prev) => ({ ...prev, [docId]: data || [] }));
  }, []);

  useEffect(() => {
    if (!companyId) return;
    load();
  }, [companyId, siteId, load]);

  const uploadSOP = async (
    siteId: string,
    file: File,
    title: string,
    description?: string,
    category?: string
  ) => {
    if (!companyId) return { error: new Error('No company') };

    const filePath = `sop-documents/${companyId}/${siteId}/${Date.now()}_${file.name}`;
    const { error: upErr } = await supabase.storage
      .from('sop-documents')
      .upload(filePath, file);

    if (upErr) return { error: upErr };

    const { data: urlData } = supabase.storage
      .from('sop-documents')
      .getPublicUrl(filePath);

    const { data, error } = await supabase.from('sop_documents').insert({
      company_id: companyId,
      site_id: siteId,
      title,
      description: description || null,
      file_url: urlData.publicUrl,
      file_name: file.name,
      file_size: file.size,
      category: category || 'General',
      is_active: true,
      version_number: 1,
      is_current: true,
    }).select().maybeSingle();

    if (!error) await load();
    return { data, error };
  };

  const uploadNewVersion = async (
    docId: string,
    file: File,
    changeNotes?: string
  ) => {
    if (!companyId) return { error: new Error('No company') };

    // Get current doc info
    const { data: currentDoc } = await supabase
      .from('sop_documents')
      .select('site_id, company_id, title, description, category, version_number, is_current')
      .eq('id', docId)
      .maybeSingle();

    if (!currentDoc) return { error: new Error('Document not found') };

    const newVersionNum = (currentDoc.version_number || 1) + 1;

    // Mark old version as superseded
    await supabase
      .from('sop_documents')
      .update({ is_current: false })
      .eq('id', docId);

    const filePath = `sop-documents/${companyId}/${currentDoc.site_id}/${Date.now()}_v${newVersionNum}_${file.name}`;
    const { error: upErr } = await supabase.storage
      .from('sop-documents')
      .upload(filePath, file);

    if (upErr) return { error: upErr };

    const { data: urlData } = supabase.storage
      .from('sop-documents')
      .getPublicUrl(filePath);

    const { data, error } = await supabase.from('sop_documents').insert({
      company_id: companyId,
      site_id: currentDoc.site_id,
      title: currentDoc.title,
      description: currentDoc.description,
      file_url: urlData.publicUrl,
      file_name: file.name,
      file_size: file.size,
      category: currentDoc.category,
      is_active: true,
      version_number: newVersionNum,
      is_current: true,
      change_notes: changeNotes || null,
      superseded_by_id: null,
    }).select().maybeSingle();

    // Link the old version to this new one
    if (data) {
      await supabase
        .from('sop_documents')
        .update({ superseded_by_id: data.id, is_current: false })
        .eq('id', docId);
    }

    if (!error) {
      setVersions((prev) => {
        const copy = { ...prev };
        delete copy[docId];
        return copy;
      });
      await load();
    }
    return { data, error };
  };

  const restoreVersion = async (versionId: string) => {
    // Find the doc this version belongs to by looking up its tree
    const { data: version } = await supabase
      .from('sop_documents')
      .select('id, superseded_by_id, title, description, category, site_id, company_id, file_url, file_name, file_size, version_number, change_notes')
      .eq('id', versionId)
      .maybeSingle();

    if (!version) return { error: new Error('Version not found') };

    // Find the current document chain root
    let { data: allVersions } = await supabase
      .from('sop_documents')
      .select('id, is_current, version_number')
      .eq('site_id', version.site_id)
      .eq('company_id', version.company_id)
      .eq('title', version.title)
      .eq('is_active', true);

    // Mark all as not current
    for (const v of (allVersions || [])) {
      await supabase.from('sop_documents').update({ is_current: false }).eq('id', v.id);
    }

    // Mark selected as current
    await supabase.from('sop_documents').update({ is_current: true }).eq('id', versionId);

    await load();
    return { success: true };
  };

  const deleteSOP = async (id: string) => {
    const doc = docs.find((d) => d.id === id);
    if (doc?.file_url) {
      const pathMatch = doc.file_url.match(/sop-documents\/(.+)/);
      if (pathMatch) {
        await supabase.storage.from('sop-documents').remove([pathMatch[1]]);
      }
    }
    const { error } = await supabase.from('sop_documents').delete().eq('id', id);
    if (!error) await load();
    return { error };
  };

  const toggleActive = async (id: string, active: boolean) => {
    const { error } = await supabase.from('sop_documents').update({ is_active: active }).eq('id', id);
    if (!error) await load();
    return { error };
  };

  return {
    docs, versions, loading, error, refetch: load,
    uploadSOP, uploadNewVersion, restoreVersion,
    loadVersions, deleteSOP, toggleActive
  };
}