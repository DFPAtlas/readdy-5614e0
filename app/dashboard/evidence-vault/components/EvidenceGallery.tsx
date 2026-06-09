'use client';

import { useState } from 'react';
import GlassCard from '@/app/components/GlassCard';
import type { EvidenceFile, IncidentMediaItem } from '@/lib/useEvidenceVault';

interface Props {
  files: EvidenceFile[];
  incidentMedia: IncidentMediaItem[];
  onView: (url: string, name: string, type: string) => void;
  onDownload: (url: string, name: string) => void;
  onMarkReviewed: (fileId: string, status: 'reviewed' | 'flagged' | 'archived') => void;
  onLinkIncident: (fileId: string) => void;
  onAddNote: (fileId: string) => void;
}

const statusBadge: Record<string, { bg: string; text: string; label: string }> = {
  unreviewed: { bg: 'bg-gray-500/10', text: 'text-gray-400', label: 'Unreviewed' },
  reviewed: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Reviewed' },
  flagged: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Flagged' },
  archived: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Archived' },
};

const typeIcon: Record<string, string> = {
  image: 'ri-image-line',
  video: 'ri-video-line',
  pdf: 'ri-file-pdf-line',
  audio: 'ri-mic-line',
  document: 'ri-file-text-line',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatBytes(bytes: number | null) {
  if (!bytes) return '-';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function EvidenceRow({
  item,
  isIncident,
  onView,
  onDownload,
  onMarkReviewed,
  onLinkIncident,
  onAddNote,
}: {
  item: EvidenceFile | IncidentMediaItem;
  isIncident: boolean;
  onView: (url: string, name: string, type: string) => void;
  onDownload: (url: string, name: string) => void;
  onMarkReviewed: (fileId: string, status: 'reviewed' | 'flagged' | 'archived') => void;
  onLinkIncident: (fileId: string) => void;
  onAddNote: (fileId: string) => void;
}) {
  const [showActions, setShowActions] = useState(false);

  if (isIncident) {
    const m = item as IncidentMediaItem;
    const icon = typeIcon[m.media_type] || 'ri-file-line';
    return (
      <div className="flex items-start gap-4 px-5 py-4 border-b border-gray-800/50 hover:bg-white/5 transition-colors">
        <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
          <div className="w-6 h-6 flex items-center justify-center">
            <i className={`${icon} text-gray-400 text-lg`}></i>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-white truncate">{m.filename || 'Unnamed file'}</p>
            <span className="bg-blue-500/10 text-blue-400 text-xs rounded-full px-2 py-0.5">Incident Media</span>
            <span className="bg-orange-500/10 text-orange-400 text-xs rounded-full px-2 py-0.5">{m.incident_type || 'Incident'}</span>
            {m.incident_status === 'open' && (
              <span className="bg-red-500/10 text-red-400 text-xs rounded-full px-2 py-0.5">Open</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">{m.site_name || 'Unknown site'} · {formatDate(m.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(m.file_url, m.filename || 'file', m.media_type)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <i className="ri-eye-line text-sm"></i>
          </button>
          <button
            onClick={() => onDownload(m.file_url, m.filename || 'download')}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <i className="ri-download-line text-sm"></i>
          </button>
        </div>
      </div>
    );
  }

  const f = item as EvidenceFile;
  const icon = typeIcon[f.file_type] || 'ri-file-line';
  const status = statusBadge[f.review_status] || statusBadge.unreviewed;

  return (
    <div className="flex items-start gap-4 px-5 py-4 border-b border-gray-800/50 hover:bg-white/5 transition-colors">
      <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
        <div className="w-6 h-6 flex items-center justify-center">
          <i className={`${icon} text-gray-400 text-lg`}></i>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-white truncate">{f.file_name}</p>
          <span className={`${status.bg} ${status.text} text-xs rounded-full px-2 py-0.5`}>{status.label}</span>
          {f.linked_to_incident && (
            <span className="bg-orange-500/10 text-orange-400 text-xs rounded-full px-2 py-0.5">Incident</span>
          )}
          {f.linked_to_patrol && (
            <span className="bg-blue-500/10 text-blue-400 text-xs rounded-full px-2 py-0.5">Patrol</span>
          )}
          {f.linked_to_ob && (
            <span className="bg-purple-500/10 text-purple-400 text-xs rounded-full px-2 py-0.5">OB</span>
          )}
          {f.linked_to_welfare && (
            <span className="bg-red-500/10 text-red-400 text-xs rounded-full px-2 py-0.5">Welfare</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {f.site_name || 'Unknown site'} · {f.uploader_name || 'Unknown'} · {formatDate(f.created_at)} · {formatBytes(f.file_size_bytes)}
        </p>
        {(f.gps_latitude || f.gps_longitude) && (
          <p className="text-xs text-gray-500 mt-0.5">
            GPS: {f.gps_latitude?.toFixed(5)}, {f.gps_longitude?.toFixed(5)}
          </p>
        )}
      </div>
      <div className="relative">
        <button
          onClick={() => setShowActions(!showActions)}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <i className="ri-more-2-line text-sm"></i>
        </button>
        {showActions && (
          <div className="absolute right-0 mt-2 w-48 bg-[#0f172a] rounded-lg shadow-lg border border-white/10 z-50">
            <div className="p-1">
              <button
                onClick={() => { onView(f.file_url, f.file_name, f.file_type); setShowActions(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white rounded-md cursor-pointer text-left"
              >
                <i className="ri-eye-line"></i> View
              </button>
              <button
                onClick={() => { onDownload(f.file_url, f.file_name); setShowActions(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white rounded-md cursor-pointer text-left"
              >
                <i className="ri-download-line"></i> Download
              </button>
              <button
                onClick={() => { onLinkIncident(f.id); setShowActions(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white rounded-md cursor-pointer text-left"
              >
                <i className="ri-link-m"></i> Link to Incident
              </button>
              <button
                onClick={() => { onMarkReviewed(f.id, 'reviewed'); setShowActions(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white rounded-md cursor-pointer text-left"
              >
                <i className="ri-check-double-line"></i> Mark Reviewed
              </button>
              <button
                onClick={() => { onMarkReviewed(f.id, 'flagged'); setShowActions(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white rounded-md cursor-pointer text-left"
              >
                <i className="ri-flag-line"></i> Flag
              </button>
              <button
                onClick={() => { onAddNote(f.id); setShowActions(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white rounded-md cursor-pointer text-left"
              >
                <i className="ri-sticky-note-line"></i> Add Note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EvidenceGallery({
  files,
  incidentMedia,
  onView,
  onDownload,
  onMarkReviewed,
  onLinkIncident,
  onAddNote,
}: Props) {
  const [view, setView] = useState<'list' | 'grid'>('list');
  const allItems = [
    ...files.map((f) => ({ item: f as any, isIncident: false })),
    ...incidentMedia.map((m) => ({ item: m as any, isIncident: true })),
  ];

  return (
    <GlassCard className="overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
        <p className="text-sm font-medium text-white">
          Evidence Gallery ({allItems.length})
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setView('list')}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${view === 'list' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <i className="ri-list-check text-sm"></i>
          </button>
          <button
            onClick={() => setView('grid')}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${view === 'grid' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            <i className="ri-grid-line text-sm"></i>
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <div>
          {allItems.map(({ item, isIncident }) => (
            <EvidenceRow
              key={isIncident ? `inc-${item.id}` : `ev-${item.id}`}
              item={item}
              isIncident={isIncident}
              onView={onView}
              onDownload={onDownload}
              onMarkReviewed={onMarkReviewed}
              onLinkIncident={onLinkIncident}
              onAddNote={onAddNote}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-4">
          {allItems.map(({ item, isIncident }) => {
            const f = isIncident ? null : (item as EvidenceFile);
            const m = isIncident ? (item as IncidentMediaItem) : null;
            const url = isIncident ? m!.file_url : f!.file_url;
            const name = isIncident ? (m!.filename || 'file') : f!.file_name;
            const type = isIncident ? m!.media_type : f!.file_type;
            const isImage = type === 'image';
            const icon = typeIcon[type] || 'ri-file-line';

            return (
              <div
                key={isIncident ? `inc-${item.id}` : `ev-${item.id}`}
                className="bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:bg-white/10 transition-colors cursor-pointer group"
                onClick={() => onView(url, name, type)}
              >
                <div className="aspect-square bg-black/40 flex items-center justify-center relative">
                  {isImage ? (
                    <img src={url} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center">
                      <i className={`${icon} text-gray-400 text-2xl`}></i>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onView(url, name, type); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 text-white"
                    >
                      <i className="ri-eye-line text-sm"></i>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDownload(url, name); }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 text-white"
                    >
                      <i className="ri-download-line text-sm"></i>
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs text-white truncate font-medium">{name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isIncident ? 'Incident media' : (f?.site_name || 'Unknown')}
                  </p>
                  {!isIncident && f?.review_status !== 'reviewed' && (
                    <span className={`inline-block mt-1 text-xs rounded-full px-2 py-0.5 ${statusBadge[f?.review_status || 'unreviewed'].bg} ${statusBadge[f?.review_status || 'unreviewed'].text}`}>
                      {statusBadge[f?.review_status || 'unreviewed'].label}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}