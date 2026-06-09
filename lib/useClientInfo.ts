'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface ClientProfile {
  id: string;
  client_id: string;
  company_name: string;
  trading_name: string | null;
  company_registration_number: string | null;
  vat_number: string | null;
  main_office_address: string | null;
  main_contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  emergency_contact_number: string | null;
  logo_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientSite {
  id: string;
  client_id: string;
  site_name: string;
  site_address: string | null;
  site_contact_person: string | null;
  site_phone: string | null;
  client_contact_for_site: string | null;
  opening_hours: string | null;
  security_cover_hours: string | null;
  site_notes: string | null;
  site_map_url: string | null;
  risk_level: 'Low' | 'Medium' | 'High' | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientDocument {
  id: string;
  client_id: string;
  site_id: string | null;
  file_name: string;
  file_type: string | null;
  document_category: string | null;
  storage_path: string;
  file_size: number | null;
  uploaded_by: string | null;
  upload_date: string;
  is_public: boolean;
  created_at: string;
}

export interface ClientContact {
  id: string;
  client_id: string;
  site_id: string | null;
  name: string;
  job_title: string | null;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  contact_type: 'Operations' | 'Finance' | 'Emergency' | 'Site Contact' | 'Contract Manager' | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteAISummary {
  id: string;
  site_id: string;
  client_id: string;
  site_overview: string | null;
  key_contacts: string | null;
  important_procedures: string | null;
  risks: string | null;
  emergency_notes: string | null;
  guard_briefing_summary: string | null;
  generated_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useClientInfo() {
  const { currentUser, companyId, role } = useAuth();
  const [clientId, setClientId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [sites, setSites] = useState<ClientSite[]>([]);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [contacts, setContacts] = useState<ClientContact[]>([]);
  const [summaries, setSummaries] = useState<SiteAISummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSuperAdmin = role === 'super_admin';
  const isManager = role === 'company_admin' || role === 'operations_manager';
  const canEdit = isManager || isSuperAdmin;

  const fetchClientId = useCallback(async () => {
    if (!currentUser) return null;

    if (isSuperAdmin) {
      const { data } = await supabase
        .from('client_users')
        .select('client_id')
        .eq('user_id', currentUser.id)
        .maybeSingle();
      if (data?.client_id) return data.client_id;
      const { data: anyClient } = await supabase
        .from('clients')
        .select('id')
        .eq('company_id', companyId)
        .limit(1)
        .maybeSingle();
      return anyClient?.id || null;
    }

    const { data } = await supabase
      .from('client_users')
      .select('client_id')
      .eq('user_id', currentUser.id)
      .maybeSingle();
    return data?.client_id || null;
  }, [currentUser, companyId, isSuperAdmin]);

  const loadAll = useCallback(async () => {
    const cid = await fetchClientId();
    if (!cid) {
      setLoading(false);
      return;
    }
    setClientId(cid);
    setLoading(true);
    setError(null);

    try {
      const [{ data: prof }, { data: siteRows }, { data: docRows }, { data: conRows }, { data: sumRows }] = await Promise.all([
        supabase.from('client_profiles').select('*').eq('client_id', cid).maybeSingle(),
        supabase.from('client_sites').select('*').eq('client_id', cid).order('site_name'),
        supabase.from('client_documents').select('*').eq('client_id', cid).order('upload_date', { ascending: false }),
        supabase.from('client_contacts').select('*').eq('client_id', cid).order('name'),
        supabase.from('site_ai_summaries').select('*').eq('client_id', cid),
      ]);

      setProfile(prof || null);
      setSites(siteRows || []);
      setDocuments(docRows || []);
      setContacts(conRows || []);
      setSummaries(sumRows || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load client information');
    } finally {
      setLoading(false);
    }
  }, [fetchClientId]);

  useEffect(() => {
    if (currentUser) loadAll();
  }, [currentUser, loadAll]);

  const upsertProfile = useCallback(async (data: Partial<ClientProfile>) => {
    if (!clientId) return { error: new Error('No client id') };
    setSaving(true);
    const payload = { ...data, client_id: clientId, updated_at: new Date().toISOString() };
    if (profile) {
      const { error } = await supabase.from('client_profiles').update(payload).eq('id', profile.id);
      if (!error) setProfile({ ...profile, ...payload } as ClientProfile);
      setSaving(false);
      return { error };
    }
    const { data: inserted, error } = await supabase.from('client_profiles').insert({ ...payload, created_at: new Date().toISOString() }).select().single();
    if (!error && inserted) setProfile(inserted);
    setSaving(false);
    return { error };
  }, [clientId, profile]);

  const createSite = useCallback(async (data: Omit<ClientSite, 'id' | 'client_id' | 'created_by' | 'created_at' | 'updated_at'>) => {
    if (!clientId || !currentUser) return { data: null, error: new Error('No client id') };
    setSaving(true);
    const payload = {
      client_id: clientId,
      ...data,
      created_by: currentUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { data: inserted, error } = await supabase.from('client_sites').insert(payload).select().single();
    if (!error && inserted) setSites((prev) => [...prev, inserted].sort((a, b) => a.site_name.localeCompare(b.site_name)));
    setSaving(false);
    return { data: inserted, error };
  }, [clientId, currentUser]);

  const updateSite = useCallback(async (siteId: string, data: Partial<ClientSite>) => {
    if (!clientId) return { error: new Error('No client id') };
    setSaving(true);
    const { error } = await supabase.from('client_sites').update({ ...data, updated_at: new Date().toISOString() }).eq('id', siteId);
    if (!error) setSites((prev) => prev.map((s) => (s.id === siteId ? { ...s, ...data, updated_at: new Date().toISOString() } : s)));
    setSaving(false);
    return { error };
  }, [clientId]);

  const deleteSite = useCallback(async (siteId: string) => {
    if (!clientId) return { error: new Error('No client id') };
    setSaving(true);
    const { error } = await supabase.from('client_sites').delete().eq('id', siteId);
    if (!error) setSites((prev) => prev.filter((s) => s.id !== siteId));
    setSaving(false);
    return { error };
  }, [clientId]);

  const uploadDocument = useCallback(async (
    file: File,
    category: string,
    siteId: string | null,
    isPublic: boolean
  ) => {
    if (!clientId || !currentUser) return { data: null, error: new Error('No client id') };
    setSaving(true);

    const ext = file.name.split('.').pop() || '';
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const folder = siteId ? `${clientId}/${siteId}` : `${clientId}/general`;
    const path = `${folder}/${Date.now()}_${cleanName}`;

    const { error: upError } = await supabase.storage.from('client-documents').upload(path, file, { upsert: false });
    if (upError) {
      setSaving(false);
      return { data: null, error: upError };
    }

    const { data: inserted, error } = await supabase.from('client_documents').insert({
      client_id: clientId,
      site_id: siteId,
      file_name: file.name,
      file_type: ext,
      document_category: category,
      storage_path: path,
      file_size: file.size,
      uploaded_by: currentUser.id,
      upload_date: new Date().toISOString(),
      is_public: isPublic,
    }).select().single();

    if (!error && inserted) setDocuments((prev) => [inserted, ...prev]);
    setSaving(false);
    return { data: inserted, error };
  }, [clientId, currentUser]);

  const getDocumentUrl = useCallback(async (storagePath: string) => {
    const { data } = await supabase.storage.from('client-documents').createSignedUrl(storagePath, 300);
    return data?.signedUrl || null;
  }, []);

  const updateDocumentCategory = useCallback(async (docId: string, category: string) => {
    const { error } = await supabase.from('client_documents').update({ document_category: category }).eq('id', docId);
    if (!error) setDocuments((prev) => prev.map((d) => (d.id === docId ? { ...d, document_category: category } : d)));
    return { error };
  }, []);

  const deleteDocument = useCallback(async (docId: string, storagePath: string) => {
    setSaving(true);
    const { error: delError } = await supabase.storage.from('client-documents').remove([storagePath]);
    const { error } = await supabase.from('client_documents').delete().eq('id', docId);
    if (!error && !delError) setDocuments((prev) => prev.filter((d) => d.id !== docId));
    setSaving(false);
    return { error: error || delError };
  }, []);

  const createContact = useCallback(async (data: Omit<ClientContact, 'id' | 'client_id' | 'created_by' | 'created_at' | 'updated_at'>) => {
    if (!clientId || !currentUser) return { data: null, error: new Error('No client id') };
    setSaving(true);
    const payload = {
      client_id: clientId,
      ...data,
      created_by: currentUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const { data: inserted, error } = await supabase.from('client_contacts').insert(payload).select().single();
    if (!error && inserted) setContacts((prev) => [...prev, inserted].sort((a, b) => a.name.localeCompare(b.name)));
    setSaving(false);
    return { data: inserted, error };
  }, [clientId, currentUser]);

  const updateContact = useCallback(async (contactId: string, data: Partial<ClientContact>) => {
    if (!clientId) return { error: new Error('No client id') };
    setSaving(true);
    const { error } = await supabase.from('client_contacts').update({ ...data, updated_at: new Date().toISOString() }).eq('id', contactId);
    if (!error) setContacts((prev) => prev.map((c) => (c.id === contactId ? { ...c, ...data, updated_at: new Date().toISOString() } : c)));
    setSaving(false);
    return { error };
  }, [clientId]);

  const deleteContact = useCallback(async (contactId: string) => {
    if (!clientId) return { error: new Error('No client id') };
    setSaving(true);
    const { error } = await supabase.from('client_contacts').delete().eq('id', contactId);
    if (!error) setContacts((prev) => prev.filter((c) => c.id !== contactId));
    setSaving(false);
    return { error };
  }, [clientId]);

  const generateSiteSummary = useCallback(async (siteId: string) => {
    if (!clientId || !currentUser) return { data: null, error: new Error('No client id') };
    setSaving(true);

    const site = sites.find((s) => s.id === siteId);
    const siteDocs = documents.filter((d) => d.site_id === siteId);
    const siteContacts = contacts.filter((c) => c.site_id === siteId);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-summarize-day`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`,
          },
          body: JSON.stringify({
            type: 'site_briefing',
            site_id: siteId,
            client_id: clientId,
            site_name: site?.site_name,
            site_address: site?.site_address,
            site_notes: site?.site_notes,
            risk_level: site?.risk_level,
            documents: siteDocs.map((d) => ({ name: d.file_name, category: d.document_category })),
            contacts: siteContacts.map((c) => ({ name: c.name, type: c.contact_type, role: c.job_title })),
          }),
        }
      );
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || 'AI summary failed');

      const payload = {
        site_id: siteId,
        client_id: clientId,
        site_overview: json.site_overview || null,
        key_contacts: json.key_contacts || null,
        important_procedures: json.important_procedures || null,
        risks: json.risks || null,
        emergency_notes: json.emergency_notes || null,
        guard_briefing_summary: json.guard_briefing_summary || null,
        generated_by: currentUser.id,
        updated_at: new Date().toISOString(),
      };

      const existing = summaries.find((s) => s.site_id === siteId);
      let result;
      if (existing) {
        const { data, error } = await supabase.from('site_ai_summaries').update(payload).eq('id', existing.id).select().single();
        result = { data, error };
      } else {
        const { data, error } = await supabase.from('site_ai_summaries').insert({ ...payload, created_at: new Date().toISOString() }).select().single();
        result = { data, error };
      }

      if (!result.error && result.data) {
        setSummaries((prev) => {
          const filtered = prev.filter((s) => s.site_id !== siteId);
          return [...filtered, result.data];
        });
      }
      setSaving(false);
      return result;
    } catch (err: any) {
      setSaving(false);
      return { data: null, error: err };
    }
  }, [clientId, currentUser, sites, documents, contacts, summaries]);

  const updateSummary = useCallback(async (summaryId: string, data: Partial<SiteAISummary>) => {
    const { error } = await supabase.from('site_ai_summaries').update({ ...data, updated_at: new Date().toISOString() }).eq('id', summaryId);
    if (!error) setSummaries((prev) => prev.map((s) => (s.id === summaryId ? { ...s, ...data, updated_at: new Date().toISOString() } : s)));
    return { error };
  }, []);

  return {
    clientId,
    profile,
    sites,
    documents,
    contacts,
    summaries,
    loading,
    saving,
    error,
    canEdit,
    isSuperAdmin,
    isManager,
    loadAll,
    upsertProfile,
    createSite,
    updateSite,
    deleteSite,
    uploadDocument,
    getDocumentUrl,
    updateDocumentCategory,
    deleteDocument,
    createContact,
    updateContact,
    deleteContact,
    generateSiteSummary,
    updateSummary,
  };
}