'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addDays, format, subDays } from 'date-fns';
import { useIncidentDetail, type IncidentDetail } from '@/lib/useIncidentDetail';
import { SEVERITY_COLORS, INCIDENT_TYPES } from '@/lib/useIncidents';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import SeverityBadge from '../components/SeverityBadge';
import IncidentStatusBadge from '../components/IncidentStatusBadge';
import Toast from '@/app/sites/components/Toast';
import GenerateReportModal from './components/GenerateReportModal';
import ReportsTab from './components/ReportsTab';

export default function IncidentDetailClient({ incidentId }: { incidentId: string }) {
  const { incident, loading, error, refetch, updateIncident, addComment, addMedia, deleteMedia, deleteIncident, logTimelineEvent } = useIncidentDetail(incidentId);
  const { currentUser, user } = useAuth();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showAiReport, setShowAiReport] = useState(false);
  const [comment, setComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'comments' | 'reports'>('overview');
  const [tabToast, setTabToast] = useState<string | null>(null);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedShifts, setRelatedShifts] = useState<any[]>([]);
  const [relatedIncidents, setRelatedIncidents] = useState<any[]>([]);

  const isAdmin = user?.role === 'company_admin' || user?.role === 'super_admin';

  useEffect(() => {
    if (!incident?.site_id || !incident.company_id) return;
    let active = true;
    const anchor = new Date(incident.occurred_at || incident.created_at || new Date().toISOString());
    setRelatedLoading(true);

    Promise.all([
      supabase
        .from('shifts')
        .select('id, start_time, end_time, status, shift_type, guard_id, guards(first_name, last_name)')
        .eq('company_id', incident.company_id)
        .eq('site_id', incident.site_id)
        .gte('start_time', subDays(anchor, 1).toISOString())
        .lte('start_time', addDays(anchor, 1).toISOString())
        .order('start_time', { ascending: false })
        .limit(5),
      supabase
        .from('incidents')
        .select('id, incident_number, title, incident_type, severity, status, occurred_at, created_at')
        .eq('company_id', incident.company_id)
        .eq('site_id', incident.site_id)
        .neq('id', incident.id)
        .gte('occurred_at', subDays(anchor, 30).toISOString())
        .lte('occurred_at', addDays(anchor, 1).toISOString())
        .order('occurred_at', { ascending: false })
        .limit(5),
    ]).then(([shiftsResult, incidentsResult]) => {
      if (!active) return;
      setRelatedShifts(shiftsResult.data || []);
      setRelatedIncidents(incidentsResult.data || []);
      setRelatedLoading(false);
    });

    return () => { active = false; };
  }, [incident?.id, incident?.site_id, incident?.company_id, incident?.occurred_at, incident?.created_at]);

  const handleStatusChange = async (newStatus: string) => {
    setSaving(true);
    const { error } = await updateIncident({ status: newStatus });
    if (!error) {
      setToast(`Status updated to ${newStatus}`);
      refetch();
    } else setToast('Failed to update status');
    setSaving(false);
  };

  const handleSeverityChange = async (newSeverity: string) => {
    setSaving(true);
    const { error } = await updateIncident({ severity: newSeverity });
    if (!error) {
      setToast(`Severity updated to ${newSeverity}`);
      refetch();
    } else setToast('Failed to update severity');
    setSaving(false);
  };

  const handleClientVisibleToggle = async () => {
    if (!incident) return;
    setSaving(true);
    const { error } = await updateIncident({ client_visible: !incident.client_visible });
    if (!error) {
      setToast(`Client visibility ${!incident.client_visible ? 'enabled' : 'disabled'}`);
      refetch();
    } else setToast('Failed to update client visibility');
    setSaving(false);
  };

  const handleFollowUpToggle = async () => {
    if (!incident) return;
    setSaving(true);
    const { error } = await updateIncident({ requires_follow_up: !incident.requires_follow_up });
    if (!error) {
      setToast(`Follow-up ${!incident.requires_follow_up ? 'required' : 'not required'}`);
      refetch();
    } else setToast('Failed to update follow-up');
    setSaving(false);
  };

  const handleEscalate = async () => {
    setSaving(true);
    const { error } = await updateIncident({ severity: 'critical', status: 'reviewing' });
    if (!error) {
      await logTimelineEvent('escalate', { severity: 'critical', status: 'reviewing' });
      setToast('Incident escalated to Critical / Reviewing');
      refetch();
    } else setToast('Failed to escalate');
    setSaving(false);
  };

  const handlePostComment = async () => {
    if (!comment.trim()) return;
    setPostingComment(true);
    const { error } = await addComment(comment.trim());
    if (!error) { setComment(''); setToast('Comment added'); refetch(); }
    else setToast('Failed to post comment');
    setPostingComment(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !incident || !currentUser?.id) return;
    setUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 50 * 1024 * 1024) {
        setToast(`File "${file.name}" exceeds 50MB limit`);
        continue;
      }
      const path = `${incident.company_id || 'no-company'}/${incidentId}/${Date.now()}_${file.name}`;
      const { error: upError } = await supabase.storage.from('incident-media').upload(path, file, {
        contentType: file.type,
      });
      if (upError) {
        setToast(`Failed to upload ${file.name}`);
        continue;
      }
      const { data: signedUrl } = await supabase.storage.from('incident-media').createSignedUrl(path, 60 * 60 * 24 * 7);
      await addMedia(signedUrl?.signedUrl || path, file.type.startsWith('video') ? 'video' : 'image', file.name, path);
      setUploadProgress(((i + 1) / files.length) * 100);
    }
    setToast('Evidence uploaded');
    setUploading(false);
    setUploadProgress(0);
    refetch();
  };

  const handleDelete = async () => {
    setSaving(true);
    const { error } = await deleteIncident();
    if (!error) { setToast('Incident deleted'); router.push('/incidents'); }
    else setToast('Failed to delete');
    setSaving(false);
  };

  const handleCloseInstead = async () => {
    const { error } = await updateIncident({ status: 'closed', resolved_at: new Date().toISOString() });
    if (!error) { setToast('Incident closed'); refetch(); }
    else setToast('Failed to close');
    setShowDelete(false);
  };

  const handlePdfGenerated = () => {
    setShowPdfModal(false);
    setTabToast('Incident report generated. Saved to Reports.');
    setTimeout(() => setTabToast(null), 4000);
    setActiveTab('reports');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="text-center py-24">
        <div className="w-12 h-12 mx-auto flex items-center justify-center text-gray-600 mb-3">
          <i className="ri-error-warning-line text-2xl"></i>
        </div>
        <p className="text-gray-400 text-sm">{error || 'Incident not found'}</p>
        <Link href="/incidents" className="text-blue-400 text-sm mt-4 inline-block hover:text-blue-300">
          Back to Incidents
        </Link>
      </div>
    );
  }

  const sevColor = SEVERITY_COLORS[(incident.severity || 'low').toLowerCase()] || SEVERITY_COLORS.low;
  const initials = `${(user?.first_name || 'S')[0]}${(user?.last_name || '')[0]}`.toUpperCase();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href="/incidents" className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors flex-shrink-0 mt-0.5">
            <div className="w-5 h-5 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-3 h-3 rounded-full ${sevColor.dot}`}></div>
              <h1 className="text-2xl font-bold text-white">{incident.title || incident.incident_type || 'Incident'}</h1>
              <IncidentStatusBadge status={incident.status} />
            </div>
            <p className="text-sm text-gray-400">{incident.site_name || 'Unknown site'}</p>
          </div>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button onClick={() => setEditing(true)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors cursor-pointer">
              <div className="w-5 h-5 flex items-center justify-center"><i className="ri-pencil-line"></i></div>
            </button>
            <button onClick={() => setShowDelete(true)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800/60 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer">
              <div className="w-5 h-5 flex items-center justify-center"><i className="ri-delete-bin-line"></i></div>
            </button>
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-gray-800">
        {([
          { key: 'overview', label: 'Overview' },
          { key: 'activity', label: 'Activity' },
          { key: 'comments', label: 'Comments' },
          { key: 'reports', label: 'Reports' },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium cursor-pointer whitespace-nowrap border-b-2 transition-colors ${
              activeTab === t.key
                ? 'text-white border-blue-500'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            {t.label}
            {t.key === 'comments' && incident.comments.length > 0 && (
              <span className="ml-1.5 text-xs text-gray-400">({incident.comments.length})</span>
            )}
            {t.key === 'reports' && (
              <span className="ml-1.5 text-xs text-gray-400"></span>
            )}
          </button>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        {/* LEFT COLUMN */}
        <div className="space-y-5">
          {activeTab === 'overview' && (
            <>
              {/* Quick facts */}
              <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Incident #</div>
                  <div className="text-sm font-medium text-white">{incident.incident_number || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Site</div>
                  <Link href={`/sites`} className="text-sm font-medium text-white hover:text-blue-400 transition-colors">
                    {incident.site_name || '—'}
                  </Link>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Reported By</div>
                  <div className="text-sm font-medium text-white">{incident.guard_name || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Date/Time</div>
                  <div className="text-sm text-gray-300 tabular-nums">
                    {incident.occurred_at ? format(new Date(incident.occurred_at), 'd MMM yyyy, HH:mm') : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Location</div>
                  <div className="text-sm font-medium text-white">{incident.location || incident.site_name || '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Logged</div>
                  <div className="text-sm text-gray-300 tabular-nums">
                    {incident.reported_at ? format(new Date(incident.reported_at), 'd MMM yyyy, HH:mm') : incident.created_at ? format(new Date(incident.created_at), 'd MMM yyyy, HH:mm') : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Client Visible</div>
                  <span className={`text-xs px-2 py-0.5 rounded border font-medium ${incident.client_visible ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-gray-500/10 border-gray-500/20 text-gray-400'}`}>
                    {incident.client_visible ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">Follow-up</div>
                  <span className={`text-xs px-2 py-0.5 rounded border font-medium ${incident.requires_follow_up ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-gray-500/10 border-gray-500/20 text-gray-400'}`}>
                    {incident.requires_follow_up ? (incident.follow_up_status || 'Pending') : 'None'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Description</h3>
                  <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer whitespace-nowrap">AI Rewrite</button>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{incident.description || 'No description provided.'}</p>
                {incident.ai_rewritten_report && (
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <button onClick={() => setShowAiReport(!showAiReport)} className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer whitespace-nowrap">
                        {showAiReport ? 'Hide AI Report' : 'Show AI Report'}
                      </button>
                    </div>
                    {showAiReport && (
                      <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {incident.ai_rewritten_report}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Evidence */}
              <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Evidence ({incident.media.length})</h3>
                  <label className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer whitespace-nowrap">
                    <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
                    Add Evidence
                    <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
                {uploading && (
                  <div className="mb-3">
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Uploading {Math.round(uploadProgress)}%</div>
                  </div>
                )}
                {incident.media.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-10 h-10 mx-auto flex items-center justify-center text-gray-600 mb-2">
                      <i className="ri-image-line text-xl"></i>
                    </div>
                    <p className="text-sm text-gray-500">No evidence uploaded yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {incident.media.map((m) => (
                      <div key={m.id} className="relative group cursor-pointer" onClick={() => setLightboxUrl(m.file_url)}>
                        {m.media_type === 'video' ? (
                          <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center border border-gray-800">
                            <div className="w-8 h-8 flex items-center justify-center text-gray-500">
                              <i className="ri-video-line text-lg"></i>
                            </div>
                          </div>
                        ) : (
                          <img src={m.file_url} alt={m.filename || ''} className="w-full aspect-video object-cover rounded-lg border border-gray-800" />
                        )}
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-8 h-8 flex items-center justify-center text-white">
                            <i className="ri-eye-line text-lg"></i>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'activity' && (
            <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Activity</h3>
              {incident.timeline.length === 0 ? (
                <p className="text-sm text-gray-500">No activity yet.</p>
              ) : (
                <div className="space-y-0">
                  {incident.timeline.map((t, idx) => (
                    <TimelineRow key={t.id} event={t} isLast={idx === incident.timeline.length - 1} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Comments ({incident.comments.length})</h3>
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 text-xs font-bold flex-shrink-0">{initials}</div>
                <div className="flex-1">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={2}
                    maxLength={500}
                    className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Add an internal comment..."
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-gray-500">{comment.length}/500</div>
                    <button
                      onClick={handlePostComment}
                      disabled={!comment.trim() || postingComment}
                      className="px-4 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {postingComment ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>
              </div>
              {incident.comments.length === 0 ? (
                <p className="text-sm text-gray-500">No comments yet.</p>
              ) : (
                <div className="space-y-3">
                  {incident.comments.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 text-xs font-bold flex-shrink-0">
                        {(c.user_name || 'S').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-white">{c.user_name || 'Staff'}</span>
                          <span className="text-xs text-gray-500">{format(new Date(c.created_at), 'd MMM, HH:mm')}</span>
                        </div>
                        <p className="text-sm text-gray-300">{c.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <ReportsTab incidentId={incidentId} />
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
          {/* Status & Severity */}
          <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Status & Severity</h3>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Status</label>
              <select
                value={incident.status || 'open'}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={saving}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer pr-8"
              >
                <option value="open">Open</option>
                <option value="reviewing">Reviewing</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Severity</label>
              <select
                value={incident.severity || 'medium'}
                onChange={(e) => handleSeverityChange(e.target.value)}
                disabled={saving}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer pr-8"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Visibility & Follow-up */}
          <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Client Portal</h3>
            <button
              onClick={handleClientVisibleToggle}
              disabled={saving}
              className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center justify-between ${
                incident.client_visible
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-gray-800/40 border border-gray-700 text-gray-400 hover:bg-gray-700/40'
              }`}
            >
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className={incident.client_visible ? 'ri-eye-line' : 'ri-eye-off-line'}></i>
                </div>
                Client Visible
              </span>
              <span className="text-xs">{incident.client_visible ? 'ON' : 'OFF'}</span>
            </button>
            <button
              onClick={handleFollowUpToggle}
              disabled={saving}
              className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center justify-between ${
                incident.requires_follow_up
                  ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                  : 'bg-gray-800/40 border border-gray-700 text-gray-400 hover:bg-gray-700/40'
              }`}
            >
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-task-line"></i>
                </div>
                Requires Follow-up
              </span>
              <span className="text-xs">{incident.requires_follow_up ? 'YES' : 'NO'}</span>
            </button>
            <div className="text-xs text-gray-500 pt-1">
              Evidence linked: <span className="text-white font-medium">{incident.linked_evidence_count ?? incident.media.length}</span>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Quick Actions</h3>
            <button
              onClick={() => setShowPdfModal(true)}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-file-pdf-line"></i></div>
              Generate Report PDF
            </button>
            <button className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors flex items-center gap-2 cursor-pointer">
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-mail-send-line"></i></div>
              Notify Client
            </button>
            <button
              onClick={handleEscalate}
              disabled={saving}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-fire-line"></i></div>
              Escalate
            </button>
          </div>

          {/* Linked records */}
          <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Related</h3>
            {relatedLoading ? (
              <div className="flex items-center gap-2 py-3 text-xs text-gray-500">
                <div className="w-4 h-4 border border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
                Loading related activity...
              </div>
            ) : (
              <>
                <div>
                  <div className="text-xs text-gray-500 mb-2">Shifts within 24 hours</div>
                  <div className="space-y-2">
                    {relatedShifts.length === 0 && <p className="text-xs text-gray-500">No nearby shifts found.</p>}
                    {relatedShifts.map((shift) => {
                      const guardName = [shift.guards?.first_name, shift.guards?.last_name].filter(Boolean).join(' ') || 'Unassigned';
                      return (
                        <div key={shift.id} className="rounded-lg border border-gray-800 bg-gray-800/30 px-3 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-gray-300 truncate">{guardName}</span>
                            <span className="text-[10px] text-gray-500 capitalize">{shift.status || 'Unknown'}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1">{format(new Date(shift.start_time), 'dd MMM yyyy · HH:mm')}–{format(new Date(shift.end_time), 'HH:mm')}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="pt-1">
                  <div className="text-xs text-gray-500 mb-2">Other incidents in 30 days</div>
                  <div className="space-y-2">
                    {relatedIncidents.length === 0 && <p className="text-xs text-gray-500">No related incidents found.</p>}
                    {relatedIncidents.map((item) => (
                      <Link key={item.id} href={`/incidents/${item.id}`} className="block rounded-lg border border-gray-800 bg-gray-800/30 px-3 py-2 hover:border-gray-700 transition-colors">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-gray-300 truncate">{item.title || item.incident_type || 'Incident'}</span>
                          <span className="text-[10px] text-gray-500 capitalize">{item.severity || 'Unrated'}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">{item.incident_number || 'No reference'} · {format(new Date(item.occurred_at || item.created_at), 'dd MMM yyyy')}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxUrl(null)}>
          <img src={lightboxUrl} alt="" className="max-w-full max-h-full rounded-lg" />
          <button className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-white hover:text-gray-300 transition-colors cursor-pointer">
            <div className="w-6 h-6 flex items-center justify-center"><i className="ri-close-line text-xl"></i></div>
          </button>
        </div>
      )}

      {/* Delete confirmation */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#151b27] border border-gray-800 rounded-xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <div className="w-5 h-5 flex items-center justify-center text-red-400"><i className="ri-delete-bin-line"></i></div>
              </div>
              <h2 className="text-lg font-semibold text-white">Delete this incident?</h2>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              It will be permanently removed and cannot be recovered. Consider closing it instead.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={handleCloseInstead} className="px-4 py-2 rounded-lg text-sm font-medium text-amber-400 border border-amber-500/30 hover:bg-amber-500/10 transition-colors cursor-pointer whitespace-nowrap">
                Mark as Closed
              </button>
              <button onClick={() => setShowDelete(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 hover:bg-red-500 text-white disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap">
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Modal */}
      {showPdfModal && (
        <GenerateReportModal
          incidentId={incidentId}
          incidentType={incident.incident_type || ''}
          siteName={incident.site_name || ''}
          hasAiReport={!!incident.ai_rewritten_report}
          onClose={() => setShowPdfModal(false)}
          onGenerated={handlePdfGenerated}
        />
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
      {tabToast && <Toast message={tabToast} onDismiss={() => setTabToast(null)} />}
    </div>
  );
}

function TimelineRow({ event, isLast }: { event: any; isLast: boolean }) {
  const colors: Record<string, string> = {
    status_change: 'bg-blue-500',
    severity_change: 'bg-amber-500',
    comment: 'bg-gray-500',
    media_upload: 'bg-emerald-500',
    escalate: 'bg-red-500',
    ai_rewrite: 'bg-purple-500',
    created: 'bg-blue-600',
  };
  const dotColor = colors[event.event_type] || 'bg-gray-500';

  const labels: Record<string, string> = {
    status_change: 'Status changed',
    severity_change: 'Severity changed',
    comment: 'Comment added',
    media_upload: 'Evidence uploaded',
    escalate: 'Escalated',
    ai_rewrite: 'AI rewrite applied',
    created: 'Incident logged',
  };

  let detail = '';
  if (event.metadata?.changed) {
    const vals = event.metadata.values || {};
    detail = Object.keys(vals).map((k) => `${k}: ${vals[k]}`).join(', ');
  }
  if (event.metadata?.comment_text) detail = event.metadata.comment_text;
  if (event.metadata?.filename) detail = event.metadata.filename;

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`}></div>
        {!isLast && <div className="w-px flex-1 bg-gray-800 my-1"></div>}
      </div>
      <div className="pb-4">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-medium text-white">{labels[event.event_type] || event.event_type}</span>
          <span className="text-[11px] text-gray-500">{format(new Date(event.created_at), 'd MMM, HH:mm')}</span>
        </div>
        {event.actor_name && <div className="text-[11px] text-gray-500 mb-0.5">by {event.actor_name}</div>}
        {detail && <div className="text-xs text-gray-400">{detail}</div>}
      </div>
    </div>
  );
}
