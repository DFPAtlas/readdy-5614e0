import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface IncidentComment {
  id: string;
  incident_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  user_name?: string | null;
}

export interface IncidentTimeline {
  id: string;
  incident_id: string;
  actor_user_id: string;
  event_type: string;
  metadata: Record<string, any>;
  created_at: string;
  actor_name?: string | null;
}

export interface IncidentMedia {
  id: string;
  incident_id: string;
  file_url: string;
  media_type: string;
  filename: string | null;
  storage_path: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface IncidentDetail {
  id: string;
  company_id: string | null;
  site_id: string | null;
  guard_id: string | null;
  user_id: string | null;
  shift_id: string | null;
  incident_number: string | null;
  incident_type: string | null;
  severity: string | null;
  title: string | null;
  description: string | null;
  location: string | null;
  ai_rewritten_report: string | null;
  status: string | null;
  occurred_at: string | null;
  reported_at: string | null;
  resolved_at: string | null;
  created_at: string | null;
  client_visible: boolean;
  requires_follow_up: boolean;
  follow_up_status: string | null;
  linked_evidence_count: number | null;
  site_name?: string | null;
  site_latitude?: number | null;
  site_longitude?: number | null;
  guard_name?: string | null;
  comments: IncidentComment[];
  timeline: IncidentTimeline[];
  media: IncidentMedia[];
}

export function useIncidentDetail(incidentId: string) {
  const { companyId, currentUser } = useAuth();
  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIncident = useCallback(async () => {
    if (!companyId || !incidentId) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    const { data: incidentData, error: err } = await supabase
      .from('incidents')
      .select(`
        *,
        sites(site_name, latitude, longitude),
        guards(first_name, last_name)
      `)
      .eq('id', incidentId)
      .eq('company_id', companyId)
      .maybeSingle();

    if (err || !incidentData) {
      setError(err?.message || 'Incident not found');
      setLoading(false);
      return;
    }

    const [{ data: commentsData }, { data: timelineData }, { data: mediaData }] = await Promise.all([
      supabase.from('incident_comments')
        .select('*, users(first_name, last_name)')
        .eq('incident_id', incidentId)
        .order('created_at', { ascending: false }),
      supabase.from('incident_timeline')
        .select('*, users(first_name, last_name)')
        .eq('incident_id', incidentId)
        .order('created_at', { ascending: true }),
      supabase.from('incident_media')
        .select('*')
        .eq('incident_id', incidentId)
        .order('created_at', { ascending: false }),
    ]);

    const mediaRows: any[] = await Promise.all((mediaData || []).map(async (m: any) => {
      if (m.storage_path) {
        const { data: signed } = await supabase.storage.from('incident-media').createSignedUrl(m.storage_path, 3600);
        if (signed?.signedUrl) return { ...m, file_url: signed.signedUrl };
      }
      return m;
    }));

    setIncident({
      id: incidentData.id,
      company_id: incidentData.company_id,
      site_id: incidentData.site_id,
      guard_id: incidentData.guard_id,
      user_id: incidentData.user_id,
      shift_id: incidentData.shift_id,
      incident_number: incidentData.incident_number,
      incident_type: incidentData.incident_type,
      severity: incidentData.severity,
      title: incidentData.title || incidentData.incident_type,
      description: incidentData.description,
      location: incidentData.location,
      ai_rewritten_report: incidentData.ai_rewritten_report,
      status: incidentData.status,
      occurred_at: incidentData.occurred_at,
      reported_at: incidentData.reported_at,
      resolved_at: incidentData.resolved_at,
      created_at: incidentData.created_at,
      client_visible: incidentData.client_visible ?? true,
      requires_follow_up: incidentData.requires_follow_up ?? false,
      follow_up_status: incidentData.follow_up_status,
      linked_evidence_count: incidentData.linked_evidence_count,
      site_name: (incidentData as any).sites?.site_name || null,
      site_latitude: (incidentData as any).sites?.latitude || null,
      site_longitude: (incidentData as any).sites?.longitude || null,
      guard_name: (incidentData as any).guards?.first_name && (incidentData as any).guards?.last_name
        ? `${(incidentData as any).guards.first_name} ${(incidentData as any).guards.last_name}`
        : (incidentData as any).guards?.first_name || (incidentData as any).guards?.last_name || null,
      comments: (commentsData || []).map((c: any) => ({
        id: c.id,
        incident_id: c.incident_id,
        user_id: c.user_id,
        comment: c.comment,
        created_at: c.created_at,
        user_name: c.users?.first_name && c.users?.last_name
          ? `${c.users.first_name} ${c.users.last_name}`
          : c.users?.first_name || c.users?.last_name || 'Staff',
      })),
      timeline: (timelineData || []).map((t: any) => ({
        id: t.id,
        incident_id: t.incident_id,
        actor_user_id: t.actor_user_id,
        event_type: t.event_type,
        metadata: t.metadata || {},
        created_at: t.created_at,
        actor_name: t.users?.first_name && t.users?.last_name
          ? `${t.users.first_name} ${t.users.last_name}`
          : t.users?.first_name || t.users?.last_name || 'Staff',
      })),
      media: mediaRows,
    });
    setLoading(false);
  }, [companyId, incidentId]);

  useEffect(() => {
    if (!companyId || !incidentId) return;
    loadIncident();
    const channels = [
      supabase.channel(`incident-${incidentId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents', filter: `id=eq.${incidentId}` }, () => loadIncident())
        .subscribe(),
      supabase.channel(`comments-${incidentId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'incident_comments', filter: `incident_id=eq.${incidentId}` }, () => loadIncident())
        .subscribe(),
      supabase.channel(`timeline-${incidentId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'incident_timeline', filter: `incident_id=eq.${incidentId}` }, () => loadIncident())
        .subscribe(),
      supabase.channel(`media-${incidentId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'incident_media', filter: `incident_id=eq.${incidentId}` }, () => loadIncident())
        .subscribe(),
    ];
    return () => { channels.forEach((c) => supabase.removeChannel(c)); };
  }, [companyId, incidentId, loadIncident]);

  const updateIncident = async (payload: Partial<any>) => {
    const { data, error } = await supabase.from('incidents').update(payload).eq('id', incidentId).select().maybeSingle();
    if (!error) await logTimelineEvent('status_change', { changed: Object.keys(payload), values: payload });
    return { data, error };
  };

  const addComment = async (comment: string) => {
    if (!currentUser?.id) return { error: new Error('Not authenticated') };
    const { data, error } = await supabase.from('incident_comments')
      .insert({ incident_id: incidentId, user_id: currentUser.id, comment })
      .select()
      .maybeSingle();
    if (!error) await logTimelineEvent('comment', { comment_id: data?.id, comment_text: comment });
    return { data, error };
  };

  const logTimelineEvent = async (eventType: string, metadata: Record<string, any> = {}) => {
    if (!currentUser?.id) return;
    await supabase.from('incident_timeline').insert({
      incident_id: incidentId,
      actor_user_id: currentUser.id,
      event_type: eventType,
      metadata,
    });
  };

  const addMedia = async (fileUrl: string, mediaType: string, filename: string, storagePath?: string | null) => {
    const { data, error } = await supabase.from('incident_media')
      .insert({ incident_id: incidentId, file_url: fileUrl, media_type: mediaType, filename, storage_path: storagePath || null, uploaded_by: currentUser?.id || null, client_visible: true })
      .select()
      .maybeSingle();
    if (!error) {
      await logTimelineEvent('media_upload', { media_id: data?.id, filename });
      const currentCount = incident?.linked_evidence_count ?? 0;
      await supabase.from('incidents').update({ linked_evidence_count: currentCount + 1 }).eq('id', incidentId);
    }
    return { data, error };
  };

  const deleteMedia = async (mediaId: string) => {
    const { error } = await supabase.from('incident_media').delete().eq('id', mediaId);
    return { error };
  };

  const deleteIncident = async () => {
    const { error } = await supabase.from('incidents').delete().eq('id', incidentId);
    return { error };
  };

  return {
    incident,
    loading,
    error,
    refetch: loadIncident,
    updateIncident,
    addComment,
    addMedia,
    deleteMedia,
    deleteIncident,
    logTimelineEvent,
  };
}