'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface IncidentDetail {
  id: string;
  site_id: string;
  guard_id: string;
  incident_number: string | null;
  incident_type: string;
  severity: string;
  description: string | null;
  ai_rewritten_report: string | null;
  status: string;
  client_visible: boolean;
  created_at: string;
  occurred_at: string;
  resolved_at: string | null;
  site_name: string | null;
  officer_name: string | null;
  officer_sia: string | null;
  media: { id: string; file_url: string; media_type: string; client_visible: boolean }[];
  timeline: { id: string; status: string; changed_at: string; notes: string | null }[];
}

export default function ClientIncidentDetailPage({ incidentId }: { incidentId: string }) {
  const { profile, companyId } = useAuth();

  const [detail, setDetail] = useState<IncidentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [msgOpen, setMsgOpen] = useState(false);
  const [msgSubject, setMsgSubject] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!profile?.id || !companyId) {
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setAccessDenied(false);
      setNotFound(false);
      setError(null);

      try {
        const { data: cu } = await supabase
          .from('client_users')
          .select('client_id')
          .eq('user_id', profile!.id)
          .eq('company_id', companyId)
          .maybeSingle();

        if (!cu?.client_id) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }

        const { data: allSites } = await supabase
          .from('sites')
          .select('id')
          .eq('client_id', cu.client_id)
          .eq('company_id', companyId);

        const siteIds = (allSites || []).map((s) => s.id);

        const { data: incident } = await supabase
          .from('incidents')
          .select('id, site_id, guard_id, incident_type, severity, description, ai_rewritten_report, status, created_at, occurred_at, resolved_at, client_visible, incident_number')
          .eq('id', incidentId)
          .eq('client_visible', true)
          .maybeSingle();

        if (!incident) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        if (!siteIds.includes(incident.site_id)) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }

        const siteName = allSites?.find((s) => s.id === incident.site_id) as any;
        const { data: guardData } = incident.guard_id
          ? await supabase.from('guards').select('first_name, last_name, sia_licence').eq('id', incident.guard_id).maybeSingle()
          : { data: null };

        const { data: mediaData } = await supabase
          .from('incident_media')
          .select('id, file_url, media_type, client_visible, storage_path')
          .eq('incident_id', incidentId)
          .eq('client_visible', true);

        const mediaRows = await Promise.all((mediaData || []).map(async (m: any) => {
          if (m.storage_path) {
            const { data: signed } = await supabase.storage.from('incident-media').createSignedUrl(m.storage_path, 3600);
            if (signed?.signedUrl) return { ...m, file_url: signed.signedUrl };
          }
          return m;
        }));

        const { data: timelineData } = await supabase
          .from('incident_timeline')
          .select('id, status, changed_at, notes')
          .eq('incident_id', incidentId)
          .in('event_type', ['created', 'status_change', 'severity_change', 'media_upload'])
          .order('changed_at', { ascending: true });

        setDetail({
          ...incident,
          officer_sia: guardData?.sia_licence || null,
          officer_name: guardData ? `${guardData.first_name} ${guardData.last_name}` : null,
          site_name: siteName?.site_name || null,
          media: mediaRows || [],
          timeline: timelineData || [],
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load incident data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [incidentId, profile?.id, companyId]);

  async function handleSendMessage() {
    if (!msgSubject.trim() || !msgBody.trim() || !profile?.id) return;
    setSending(true);
    try {
      const { data: cu } = await supabase
        .from('client_users')
        .select('client_id')
        .eq('user_id', profile.id)
        .eq('company_id', companyId)
        .maybeSingle();

      await supabase.from('client_messages').insert({
        company_id: companyId,
        client_id: cu?.client_id,
        site_id: detail?.site_id || null,
        incident_id: incidentId,
        from_user_id: profile.id,
        subject: msgSubject.trim(),
        body: msgBody.trim(),
        is_from_client: true,
        status: 'unread',
      });
    } catch {}
    setSending(false);
    setMsgOpen(false);
    setMsgSubject('');
    setMsgBody('');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-red-500/[0.06] backdrop-blur-sm border border-red-500/20 rounded-xl p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-2xl text-red-400"></i>
          </div>
          <h2 className="text-lg font-semibold text-white mb-1">Something went wrong</h2>
          <p className="text-sm text-gray-400">{error}</p>
          <Link href="/client/incidents" className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap mt-4">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
            Back to incidents
          </Link>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-red-500/[0.06] backdrop-blur-sm border border-red-500/20 rounded-xl p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <i className="ri-shield-keyhole-line text-2xl text-red-400"></i>
          </div>
          <h2 className="text-lg font-semibold text-white mb-1">Access Denied</h2>
          <p className="text-sm text-gray-400 mb-6">This incident belongs to a site not assigned to your account.</p>
          <Link href="/client/incidents" className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
            Back to incidents
          </Link>
        </div>
      </div>
    );
  }

  if (notFound || !detail) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
          <p className="text-gray-400">Incident not found or not accessible.</p>
          <Link href="/client/incidents" className="text-blue-400 text-sm mt-2 inline-block cursor-pointer">
            Back to incidents
          </Link>
        </div>
      </div>
    );
  }

  const statusSteps = ['open', 'under_review', 'resolved'];
  const currentStep = statusSteps.indexOf(detail.status);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
        <Link href="/client/incidents" className="hover:text-white cursor-pointer">Incidents</Link>
        <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-right-s-line"></i></div>
        <span className="text-white font-medium">{detail.incident_type}</span>
      </div>

      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-semibold text-white">{detail.incident_type}</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {detail.site_name}
              {detail.incident_number && <span className="text-gray-600 ml-2">#{detail.incident_number}</span>}
            </p>
          </div>
          <span className={`text-xs px-3 py-1 rounded border font-medium ${
            detail.severity === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
            detail.severity === 'high' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
            detail.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
            'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            {detail.severity} severity
          </span>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-1">
            {statusSteps.map((step, idx) => {
              const isDone = idx <= currentStep;
              const isCurrent = idx === currentStep;
              const statusLabel = step === 'open' ? 'New' : step === 'under_review' ? 'Under Review' : 'Resolved';
              return (
                <div key={step} className="flex items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    isDone ? 'bg-blue-600 border-blue-600 text-white' : 'bg-[#0f172a]/70 border-white/20 text-gray-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className={`flex-1 h-0.5 mx-1 ${isDone && idx < currentStep ? 'bg-blue-600' : 'bg-white/10'}`}></div>
                  <div className="text-center min-w-[80px]">
                    <p className={`text-xs font-medium ${isCurrent ? 'text-blue-400' : isDone ? 'text-white' : 'text-gray-500'}`}>
                      {statusLabel}
                    </p>
                    {detail.timeline.find((t) => t.status === step) && (
                      <p className="text-[10px] text-gray-500">
                        {new Date(detail.timeline.find((t) => t.status === step)!.changed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Date & Time</p>
            <p className="text-white">
              {new Date(detail.occurred_at || detail.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="text-gray-400">
              {new Date(detail.occurred_at || detail.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Reported by</p>
            <p className="text-white font-medium">{detail.officer_name || 'Officer'}</p>
            {detail.officer_sia && <p className="text-gray-500 text-xs">SIA: {detail.officer_sia}</p>}
          </div>
        </div>
      </div>

      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-file-text-line text-blue-400"></i></div>
          Incident Report
        </h2>
        {detail.ai_rewritten_report ? (
          <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
            {detail.ai_rewritten_report}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">The full incident report is being prepared by the operations team and will appear here shortly.</p>
        )}
      </div>

      {detail.media.length > 0 && (
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-white mb-3">Evidence</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {detail.media.map((m) => (
              <a key={m.id} href={m.file_url} target="_blank" rel="noopener noreferrer" className="block cursor-pointer">
                {m.media_type?.startsWith('image') ? (
                  <img src={m.file_url} alt="" className="w-full h-32 object-cover rounded-lg border border-white/10 hover:opacity-90 transition-opacity" />
                ) : (
                  <div className="w-full h-32 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="w-8 h-8 flex items-center justify-center"><i className="ri-video-line text-gray-500 text-xl"></i></div>
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-white mb-2">Need to discuss this incident?</h2>
        <p className="text-sm text-gray-400 mb-4">Send a message directly to your operations manager.</p>
        {!msgOpen ? (
          <button
            onClick={() => setMsgOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-mail-send-line"></i></div>
            Contact ops manager
          </button>
        ) : (
          <div className="space-y-3">
            <input
              type="text"
              value={msgSubject}
              onChange={(e) => setMsgSubject(e.target.value)}
              placeholder="Subject"
              className="w-full px-3 py-2.5 text-sm bg-[#0f172a]/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <textarea
              value={msgBody}
              onChange={(e) => setMsgBody(e.target.value)}
              placeholder="Your message..."
              rows={4}
              maxLength={500}
              className="w-full px-3 py-2.5 text-sm bg-[#0f172a]/60 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSendMessage}
                disabled={sending || !msgSubject.trim() || !msgBody.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                {sending ? 'Sending...' : 'Send message'}
              </button>
              <button
                onClick={() => setMsgOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}