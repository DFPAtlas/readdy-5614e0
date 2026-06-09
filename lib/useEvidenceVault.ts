import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface EvidenceFile {
  id: string;
  company_id: string;
  file_name: string;
  file_url: string;
  file_type: 'image' | 'video' | 'pdf' | 'audio' | 'document';
  file_size_bytes: number | null;
  storage_bucket: string;
  storage_path: string | null;
  uploaded_by: string | null;
  uploaded_by_guard: string | null;
  uploader_name: string | null;
  site_id: string | null;
  site_name?: string | null;
  client_id: string | null;
  client_name?: string | null;
  linked_to_incident: boolean;
  linked_to_patrol: boolean;
  linked_to_ob: boolean;
  linked_to_report: boolean;
  linked_to_maintenance: boolean;
  linked_to_welfare: boolean;
  gps_latitude: number | null;
  gps_longitude: number | null;
  review_status: 'unreviewed' | 'reviewed' | 'flagged' | 'archived';
  created_at: string;
  updated_at: string;
  links?: EvidenceLink[];
  latest_review?: EvidenceReview | null;
}

export interface EvidenceReview {
  id: string;
  evidence_file_id: string;
  reviewed_by: string | null;
  reviewer_name?: string | null;
  review_status: 'reviewed' | 'flagged' | 'archived';
  review_notes: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export interface EvidenceLink {
  id: string;
  evidence_file_id: string;
  link_type: 'incident' | 'patrol_scan' | 'occurrence_book' | 'site_report' | 'maintenance' | 'welfare_alert' | 'support_ticket';
  linked_record_id: string;
  linked_record_type: string;
  created_at: string;
}

export interface EvidenceVaultStats {
  totalFiles: number;
  todayUploaded: number;
  linkedToOpenIncidents: number;
  unreviewed: number;
  storageBytes: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}

export interface EvidenceFilters {
  search?: string;
  site_id?: string;
  guard_id?: string;
  client_id?: string;
  file_type?: string;
  review_status?: string;
  date_from?: string;
  date_to?: string;
  linked_to?: string;
}

export interface IncidentMediaItem {
  id: string;
  incident_id: string;
  file_url: string;
  media_type: string;
  filename: string | null;
  uploaded_by: string | null;
  created_at: string;
  incident_status?: string | null;
  incident_type?: string | null;
  site_name?: string | null;
  client_name?: string | null;
  source: 'incident_media';
}

export function useEvidenceVault(filters?: EvidenceFilters) {
  const { companyId, profile, currentUser } = useAuth();
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [incidentMedia, setIncidentMedia] = useState<IncidentMediaItem[]>([]);
  const [stats, setStats] = useState<EvidenceVaultStats>({
    totalFiles: 0,
    todayUploaded: 0,
    linkedToOpenIncidents: 0,
    unreviewed: 0,
    storageBytes: 0,
    byType: {},
    byStatus: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const role = profile?.role;
  const isSuperAdmin = role === 'super_admin';
  const isGuard = role === 'guard';

  const loadData = useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayStartIso = todayStart.toISOString();

    let evidenceQuery = supabase
      .from('evidence_files')
      .select(`
        *,
        sites!evidence_files_site_id_fkey(site_name),
        clients!evidence_files_client_id_fkey(name)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (filters?.site_id) evidenceQuery = evidenceQuery.eq('site_id', filters.site_id);
    if (filters?.file_type) evidenceQuery = evidenceQuery.eq('file_type', filters.file_type);
    if (filters?.review_status) evidenceQuery = evidenceQuery.eq('review_status', filters.review_status);
    if (filters?.date_from) evidenceQuery = evidenceQuery.gte('created_at', filters.date_from);
    if (filters?.date_to) evidenceQuery = evidenceQuery.lt('created_at', filters.date_to);

    const [evidenceRes, incidentMediaRes, reviewsRes, linksRes] = await Promise.all([
      evidenceQuery,
      supabase
        .from('incident_media')
        .select(`
          *,
          incidents!inner(incident_type, status, site_id, company_id),
          sites!incidents(site_name)
        `)
        .eq('incidents.company_id', companyId)
        .order('created_at', { ascending: false }),
      supabase
        .from('evidence_reviews')
        .select('*, users(first_name, last_name)')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false }),
      supabase
        .from('evidence_links')
        .select('*')
        .eq('company_id', companyId),
    ]);

    if (evidenceRes.error) {
      setError(evidenceRes.error.message);
      setLoading(false);
      return;
    }

    const reviewsMap: Record<string, EvidenceReview[]> = {};
    (reviewsRes.data || []).forEach((r: any) => {
      const mapped: EvidenceReview = {
        id: r.id,
        evidence_file_id: r.evidence_file_id,
        reviewed_by: r.reviewed_by,
        reviewer_name: r.users?.first_name && r.users?.last_name
          ? `${r.users.first_name} ${r.users.last_name}`
          : r.users?.first_name || r.users?.last_name || 'Staff',
        review_status: r.review_status,
        review_notes: r.review_notes,
        rejection_reason: r.rejection_reason,
        created_at: r.created_at,
      };
      if (!reviewsMap[mapped.evidence_file_id]) reviewsMap[mapped.evidence_file_id] = [];
      reviewsMap[mapped.evidence_file_id].push(mapped);
    });

    const linksMap: Record<string, EvidenceLink[]> = {};
    (linksRes.data || []).forEach((l: any) => {
      const mapped: EvidenceLink = {
        id: l.id,
        evidence_file_id: l.evidence_file_id,
        link_type: l.link_type,
        linked_record_id: l.linked_record_id,
        linked_record_type: l.linked_record_type,
        created_at: l.created_at,
      };
      if (!linksMap[mapped.evidence_file_id]) linksMap[mapped.evidence_file_id] = [];
      linksMap[mapped.evidence_file_id].push(mapped);
    });

    let mappedEvidence: EvidenceFile[] = (evidenceRes.data || []).map((row: any) => ({
      id: row.id,
      company_id: row.company_id,
      file_name: row.file_name,
      file_url: row.file_url,
      file_type: row.file_type,
      file_size_bytes: row.file_size_bytes,
      storage_bucket: row.storage_bucket,
      storage_path: row.storage_path,
      uploaded_by: row.uploaded_by,
      uploaded_by_guard: row.uploaded_by_guard,
      uploader_name: row.uploader_name,
      site_id: row.site_id,
      site_name: row.sites?.site_name || null,
      client_id: row.client_id,
      client_name: row.clients?.name || null,
      linked_to_incident: row.linked_to_incident,
      linked_to_patrol: row.linked_to_patrol,
      linked_to_ob: row.linked_to_ob,
      linked_to_report: row.linked_to_report,
      linked_to_maintenance: row.linked_to_maintenance,
      linked_to_welfare: row.linked_to_welfare,
      gps_latitude: row.gps_latitude,
      gps_longitude: row.gps_longitude,
      review_status: row.review_status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      links: linksMap[row.id] || [],
      latest_review: reviewsMap[row.id]?.[0] || null,
    }));

    let mappedIncidentMedia: IncidentMediaItem[] = (incidentMediaRes.data || []).map((row: any) => ({
      id: row.id,
      incident_id: row.incident_id,
      file_url: row.file_url,
      media_type: row.media_type,
      filename: row.filename,
      uploaded_by: row.uploaded_by,
      created_at: row.created_at,
      incident_status: row.incidents?.status || null,
      incident_type: row.incidents?.incident_type || null,
      site_name: row.sites?.site_name || null,
      client_name: null,
      source: 'incident_media',
    }));

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      mappedEvidence = mappedEvidence.filter(
        (f) =>
          f.file_name.toLowerCase().includes(q) ||
          (f.uploader_name || '').toLowerCase().includes(q) ||
          (f.site_name || '').toLowerCase().includes(q)
      );
      mappedIncidentMedia = mappedIncidentMedia.filter(
        (m) =>
          (m.filename || '').toLowerCase().includes(q) ||
          (m.incident_type || '').toLowerCase().includes(q)
      );
    }

    if (filters?.linked_to) {
      mappedEvidence = mappedEvidence.filter((f) => {
        if (filters.linked_to === 'incident') return f.linked_to_incident;
        if (filters.linked_to === 'patrol') return f.linked_to_patrol;
        if (filters.linked_to === 'ob') return f.linked_to_ob;
        if (filters.linked_to === 'report') return f.linked_to_report;
        if (filters.linked_to === 'maintenance') return f.linked_to_maintenance;
        if (filters.linked_to === 'welfare') return f.linked_to_welfare;
        return true;
      });
    }

    if (filters?.guard_id) {
      mappedEvidence = mappedEvidence.filter((f) => f.uploaded_by_guard === filters.guard_id);
      mappedIncidentMedia = mappedIncidentMedia.filter((m) => m.uploaded_by === filters.guard_id);
    }

    if (filters?.client_id) {
      mappedEvidence = mappedEvidence.filter((f) => f.client_id === filters.client_id);
    }

    if (isGuard && profile?.id) {
      mappedEvidence = mappedEvidence.filter(
        (f) => f.uploaded_by === profile.id || f.uploaded_by_guard === profile.id
      );
      mappedIncidentMedia = mappedIncidentMedia.filter(
        (m) => m.uploaded_by === profile.id
      );
    }

    setFiles(mappedEvidence);
    setIncidentMedia(mappedIncidentMedia);

    const totalFiles = mappedEvidence.length + mappedIncidentMedia.length;
    const todayUploaded = mappedEvidence.filter((f) => f.created_at >= todayStartIso).length +
      mappedIncidentMedia.filter((m) => m.created_at >= todayStartIso).length;
    const linkedToOpen = mappedIncidentMedia.filter((m) => m.incident_status === 'open').length +
      mappedEvidence.filter((f) => f.linked_to_incident && f.links?.some((l) => l.link_type === 'incident')).length;
    const unreviewed = mappedEvidence.filter((f) => f.review_status === 'unreviewed').length;
    const storageBytes = mappedEvidence.reduce((sum, f) => sum + (f.file_size_bytes || 0), 0);

    const byType: Record<string, number> = {};
    mappedEvidence.forEach((f) => { byType[f.file_type] = (byType[f.file_type] || 0) + 1; });
    mappedIncidentMedia.forEach((m) => {
      const type = m.media_type === 'image' || m.media_type === 'video' || m.media_type === 'audio' || m.media_type === 'pdf'
        ? m.media_type
        : 'document';
      byType[type] = (byType[type] || 0) + 1;
    });

    const byStatus: Record<string, number> = {};
    mappedEvidence.forEach((f) => { byStatus[f.review_status] = (byStatus[f.review_status] || 0) + 1; });

    setStats({
      totalFiles,
      todayUploaded,
      linkedToOpenIncidents: linkedToOpen,
      unreviewed,
      storageBytes,
      byType,
      byStatus,
    });

    setLoading(false);
  }, [companyId, profile?.id, profile?.role, isGuard, JSON.stringify(filters)]);

  useEffect(() => {
    if (!companyId) return;
    loadData();
  }, [companyId, loadData]);

  useEffect(() => {
    if (!companyId) return;
    const channels = [
      supabase.channel('evidence-files-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'evidence_files', filter: `company_id=eq.${companyId}` }, () => loadData())
        .subscribe(),
      supabase.channel('evidence-reviews-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'evidence_reviews', filter: `company_id=eq.${companyId}` }, () => loadData())
        .subscribe(),
      supabase.channel('evidence-links-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'evidence_links', filter: `company_id=eq.${companyId}` }, () => loadData())
        .subscribe(),
      supabase.channel('incident-media-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'incident_media' }, () => loadData())
        .subscribe(),
    ];
    return () => { channels.forEach((c) => supabase.removeChannel(c)); };
  }, [companyId, loadData]);

  const uploadFile = async (
    file: File,
    metadata: {
      site_id?: string;
      client_id?: string;
      file_type: 'image' | 'video' | 'pdf' | 'audio' | 'document';
      gps_latitude?: number;
      gps_longitude?: number;
      linked_to_incident?: boolean;
      linked_to_patrol?: boolean;
      linked_to_ob?: boolean;
      linked_to_report?: boolean;
      linked_to_maintenance?: boolean;
      linked_to_welfare?: boolean;
    }
  ) => {
    if (!companyId || !currentUser?.id) return { error: new Error('Not authenticated') };

    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${companyId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('evidence')
      .upload(filePath, file);

    if (uploadError) return { error: uploadError };

    const { data: publicUrlData } = supabase.storage
      .from('evidence')
      .getPublicUrl(filePath);

    const { data, error: insertError } = await supabase
      .from('evidence_files')
      .insert({
        company_id: companyId,
        file_name: file.name,
        file_url: publicUrlData.publicUrl,
        file_type: metadata.file_type,
        file_size_bytes: file.size,
        storage_bucket: 'evidence',
        storage_path: filePath,
        uploaded_by: currentUser.id,
        uploaded_by_guard: isGuard ? profile?.id || null : null,
        uploader_name: profile?.first_name && profile?.last_name
          ? `${profile.first_name} ${profile.last_name}`
          : profile?.first_name || profile?.last_name || 'Staff',
        site_id: metadata.site_id || null,
        client_id: metadata.client_id || null,
        linked_to_incident: metadata.linked_to_incident || false,
        linked_to_patrol: metadata.linked_to_patrol || false,
        linked_to_ob: metadata.linked_to_ob || false,
        linked_to_report: metadata.linked_to_report || false,
        linked_to_maintenance: metadata.linked_to_maintenance || false,
        linked_to_welfare: metadata.linked_to_welfare || false,
        gps_latitude: metadata.gps_latitude || null,
        gps_longitude: metadata.gps_longitude || null,
      })
      .select()
      .maybeSingle();

    if (insertError) return { error: insertError };
    return { data };
  };

  const markReviewed = async (fileId: string, status: 'reviewed' | 'flagged' | 'archived', notes?: string, rejectionReason?: string) => {
    if (!companyId || !currentUser?.id) return { error: new Error('Not authenticated') };

    const { error: fileUpdateError } = await supabase
      .from('evidence_files')
      .update({ review_status: status })
      .eq('id', fileId)
      .eq('company_id', companyId);

    if (fileUpdateError) return { error: fileUpdateError };

    const { error: reviewError } = await supabase
      .from('evidence_reviews')
      .insert({
        company_id: companyId,
        evidence_file_id: fileId,
        reviewed_by: currentUser.id,
        review_status: status,
        review_notes: notes || null,
        rejection_reason: rejectionReason || null,
      });

    if (reviewError) return { error: reviewError };
    return { data: true };
  };

  const linkToIncident = async (fileId: string, incidentId: string) => {
    if (!companyId) return { error: new Error('No company') };
    const { error } = await supabase.from('evidence_links').insert({
      company_id: companyId,
      evidence_file_id: fileId,
      link_type: 'incident',
      linked_record_id: incidentId,
      linked_record_type: 'incident',
    });
    if (!error) {
      await supabase.from('evidence_files').update({ linked_to_incident: true }).eq('id', fileId);
    }
    return { error };
  };

  const addNote = async (fileId: string, note: string) => {
    if (!companyId || !currentUser?.id) return { error: new Error('Not authenticated') };
    const { error } = await supabase.from('evidence_reviews').insert({
      company_id: companyId,
      evidence_file_id: fileId,
      reviewed_by: currentUser.id,
      review_status: 'reviewed',
      review_notes: note,
    });
    return { error };
  };

  const downloadFile = (fileUrl: string, fileName: string) => {
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return {
    files,
    incidentMedia,
    stats,
    loading,
    error,
    refetch: loadData,
    uploadFile,
    markReviewed,
    linkToIncident,
    addNote,
    downloadFile,
    isSuperAdmin,
    role,
  };
}