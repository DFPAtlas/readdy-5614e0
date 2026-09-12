'use client';

import { useState, useEffect, useCallback } from 'react';
import GlassCard from '@/app/components/GlassCard';
import { useEvidenceVault } from '@/lib/useEvidenceVault';
import { useSites } from '@/lib/useSites';
import { useAuth } from '@/lib/auth';
import { callAgent } from '@/lib/guardianhubAgents';
import AgentStatusBar from '@/components/AgentStatusBar';
import WidgetBoundary from '@/components/dashboard/WidgetBoundary';
import { logEvidenceAccess, logPageAccess } from '@/lib/useEvidenceAuditLog';
import SummaryCards from './SummaryCards';
import EvidenceFilters from './EvidenceFilters';
import EvidenceGallery from './EvidenceGallery';
import UploadModal from './UploadModal';
import ReviewModal from './ReviewModal';
import ViewerModal from './ViewerModal';
import EvidenceAccessLog from './EvidenceAccessLog';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';
import { useGuards } from '@/lib/useGuards';
import { supabase } from '@/lib/supabase';

interface Props {
  initialClientId?: string;
  initialSiteId?: string;
}

export default function EvidenceVaultClient({ initialClientId, initialSiteId }: Props) {
  const [filters, setFilters] = useState<Record<string, any>>({
    client_id: initialClientId || undefined,
    site_id: initialSiteId || undefined,
  });
  const [showUpload, setShowUpload] = useState(false);
  const [reviewFile, setReviewFile] = useState<{ id: string; name: string } | null>(null);
  const [viewerFile, setViewerFile] = useState<{ url: string; name: string; type: string } | null>(null);
  const [noteFile, setNoteFile] = useState<{ id: string; name: string } | null>(null);
  const [noteText, setNoteText] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [linkFile, setLinkFile] = useState<string | null>(null);
  const [linkIncidentId, setLinkIncidentId] = useState('');
  const [showLink, setShowLink] = useState(false);
  const [allClients, setAllClients] = useState<{ id: string; name: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'gallery' | 'access-log'>('gallery');

  const { files, incidentMedia, stats, loading, error, refetch, uploadFile, markReviewed, linkToIncident, addNote, downloadFile, isSuperAdmin, role } = useEvidenceVault(filters);
  const { sites } = useSites();
  const { guards } = useGuards();
  const { companyId, profile } = useAuth();

  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [agentData, setAgentData] = useState<any>(null);

  const fetchAgent = useCallback(async () => {
    if (!profile?.id || !companyId) return;
    setAgentLoading(true);
    setAgentError(null);
    try {
      const result = await callAgent(
        'compliance',
        {
          total_files: stats?.total || 0,
          reviewed: stats?.reviewed || 0,
          flagged: stats?.flagged || 0,
        },
        {
          clientId: companyId,
          userId: profile.id,
          requestedPage: '/dashboard/evidence-vault',
          requestedFeature: 'compliance',
        }
      );
      if (result.error) setAgentError(result.error);
      setAgentData(result.data);
    } catch (err: any) {
      setAgentError(err.message || 'Agent call failed');
    } finally {
      setAgentLoading(false);
    }
  }, [profile?.id, companyId, stats?.total, stats?.reviewed, stats?.flagged]);

  useEffect(() => {
    if (profile?.id && !loading) {
      fetchAgent();
    }
  }, [profile?.id, loading]);

  useEffect(() => {
    if (!companyId || !profile?.id) return;
    logPageAccess({
      company_id: companyId,
      user_id: profile.id,
      user_role: profile.role || 'unknown',
      source_route: '/dashboard/evidence-vault',
    });
  }, [companyId, profile?.id, profile?.role]);

  useEffect(() => {
    if (!companyId) return;
    supabase.from('clients').select('id, name').eq('company_id', companyId).order('name').then(({ data, error }) => {
      if (!error && data) {
        setAllClients((data || []).map((c: any) => ({ id: c.id, name: c.name || 'Unnamed' })));
      }
    });
  }, [companyId]);

  const handleMarkReviewed = useCallback(async (fileId: string, status: 'reviewed' | 'flagged' | 'archived') => {
    const file = files.find((f) => f.id === fileId);
    if (!file) return;
    setReviewFile({ id: fileId, name: file.file_name });
  }, [files]);

  const handleReviewSubmit = useCallback(async (status: 'reviewed' | 'flagged' | 'archived', notes: string, rejectionReason?: string) => {
    if (!reviewFile) return;
    await markReviewed(reviewFile.id, status, notes, rejectionReason);
    setReviewFile(null);
  }, [reviewFile, markReviewed]);

  const handleAddNote = useCallback(async () => {
    if (!noteFile || !noteText.trim()) return;
    await addNote(noteFile.id, noteText.trim());
    setNoteText('');
    setNoteFile(null);
    setShowNote(false);
  }, [noteFile, noteText, addNote]);

  const handleLinkIncident = useCallback(async () => {
    if (!linkFile || !linkIncidentId.trim()) return;
    await linkToIncident(linkFile, linkIncidentId.trim());
    setLinkFile(null);
    setLinkIncidentId('');
    setShowLink(false);
  }, [linkFile, linkIncidentId, linkToIncident]);

  const allSites = sites.map((s) => ({ id: s.id, site_name: s.site_name }));
  const allGuards = guards.map((g) => ({ id: g.id, first_name: g.first_name || '', last_name: g.last_name || '' }));

  const totalItems = files.length + incidentMedia.length;

  const wrappedDownloadFile = useCallback((url: string, name: string) => {
    if (companyId && profile?.id) {
      logEvidenceAccess({
        company_id: companyId,
        user_id: profile.id,
        user_role: profile.role || 'unknown',
        action: 'download',
        source_route: '/dashboard/evidence-vault',
        metadata: { file_name: name },
      });
    }
    downloadFile(url, name);
  }, [companyId, profile?.id, profile?.role, downloadFile]);

  const wrappedUploadFile = useCallback(async (file: File, metadata: any) => {
    const result = await uploadFile(file, metadata);
    if (!result.error && companyId && profile?.id) {
      logEvidenceAccess({
        company_id: companyId,
        site_id: metadata.site_id || null,
        client_id: metadata.client_id || null,
        user_id: profile.id,
        user_role: profile.role || 'unknown',
        evidence_file_id: result.data?.id || null,
        action: 'upload',
        source_route: '/dashboard/evidence-vault',
        metadata: { file_name: file.name, file_size: file.size, file_type: metadata.file_type },
      });
    }
    return result;
  }, [companyId, profile?.id, profile?.role, uploadFile]);

  const handleView = useCallback((url: string, name: string, type: string) => {
    if (companyId && profile?.id) {
      logEvidenceAccess({
        company_id: companyId,
        user_id: profile.id,
        user_role: profile.role || 'unknown',
        action: 'view',
        source_route: '/dashboard/evidence-vault',
        metadata: { file_name: name, file_type: type },
      });
    }
    setViewerFile({ url, name, type });
  }, [companyId, profile?.id, profile?.role]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Evidence Vault</h1>
          <p className="text-sm text-gray-400 mt-1">Secure photo, video, and document storage</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-800/60 rounded-lg p-0.5">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'gallery' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Gallery
            </button>
            <button
              onClick={() => setActiveTab('access-log')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'access-log' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Access Log
            </button>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <i className="ri-upload-cloud-line"></i>
            Upload Evidence
          </button>
          <button
            onClick={() => refetch()}
            className="bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer"
          >
            <i className="ri-refresh-line"></i>
          </button>
        </div>
      </div>

      <WidgetBoundary widgetName="EvidenceAgent" pagePath="/dashboard/evidence-vault" clientId={companyId || undefined} userId={profile?.id || undefined}>
        <AgentStatusBar
          agentKey="compliance"
          loading={agentLoading}
          error={agentError}
          data={agentData}
          onRetry={fetchAgent}
        />
      </WidgetBoundary>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={() => refetch()} className="text-sm text-red-400 hover:text-white underline cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {activeTab === 'access-log' ? (
        <EvidenceAccessLog />
      ) : loading ? (
        <LoadingState />
      ) : (
        <>
          <WidgetBoundary widgetName="EvidenceSummaryCards" pagePath="/dashboard/evidence-vault" clientId={companyId || undefined} userId={profile?.id || undefined}>
            <SummaryCards stats={stats} />
          </WidgetBoundary>

          <WidgetBoundary widgetName="EvidenceFilters" pagePath="/dashboard/evidence-vault" clientId={companyId || undefined} userId={profile?.id || undefined}>
            <EvidenceFilters
              sites={allSites}
              guards={allGuards}
              clients={allClients}
              onChange={(f) => setFilters(f)}
            />
          </WidgetBoundary>

          {totalItems === 0 ? (
            <EmptyState onUpload={() => setShowUpload(true)} />
          ) : (
            <WidgetBoundary widgetName="EvidenceGallery" pagePath="/dashboard/evidence-vault" clientId={companyId || undefined} userId={profile?.id || undefined}>
              <EvidenceGallery
                files={files}
                incidentMedia={incidentMedia}
                onView={handleView}
                onDownload={wrappedDownloadFile}
                onMarkReviewed={handleMarkReviewed}
                onLinkIncident={(fileId) => { setLinkFile(fileId); setShowLink(true); }}
                onAddNote={(fileId) => {
                  const f = files.find((x) => x.id === fileId);
                  if (f) { setNoteFile({ id: fileId, name: f.file_name }); setShowNote(true); }
                }}
              />
            </WidgetBoundary>
          )}
        </>
      )}

      {showUpload && (
        <UploadModal
          sites={allSites}
          clients={allClients}
          onUpload={wrappedUploadFile}
          onClose={() => setShowUpload(false)}
        />
      )}

      {reviewFile && (
        <ReviewModal
          fileName={reviewFile.name}
          onReview={handleReviewSubmit}
          onClose={() => setReviewFile(null)}
        />
      )}

      {viewerFile && (
        <ViewerModal
          fileUrl={viewerFile.url}
          fileName={viewerFile.name}
          fileType={viewerFile.type}
          onClose={() => setViewerFile(null)}
          onDownload={wrappedDownloadFile}
        />
      )}

      {showNote && noteFile && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-md">
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Add Note</h2>
                <button onClick={() => setShowNote(false)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer">
                  <i className="ri-close-line text-lg"></i>
                </button>
              </div>
              <p className="text-sm text-gray-400">{noteFile.name}</p>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Enter your note..."
                maxLength={500}
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none h-24"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddNote}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  Save Note
                </button>
                <button
                  onClick={() => setShowNote(false)}
                  className="bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {showLink && linkFile && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <GlassCard className="w-full max-w-md">
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Link to Incident</h2>
                <button onClick={() => setShowLink(false)} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer">
                  <i className="ri-close-line text-lg"></i>
                </button>
              </div>
              <p className="text-sm text-gray-400">Enter the incident ID to link this evidence</p>
              <input
                type="text"
                value={linkIncidentId}
                onChange={(e) => setLinkIncidentId(e.target.value)}
                placeholder="Incident ID (UUID)"
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleLinkIncident}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  Link
                </button>
                <button
                  onClick={() => setShowLink(false)}
                  className="bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}