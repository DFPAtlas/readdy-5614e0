'use client';

import { SiteNotice, getPriorityBorder, getStatusDot, NoticeCategory, NoticePriority } from '@/lib/useSiteNotices';
import { useState } from 'react';

interface NoticeCardProps {
  notice: SiteNotice;
  canManage: boolean;
  onEdit: (notice: SiteNotice) => void;
  onToggleStatus: (id: string, status: 'active' | 'inactive') => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string, pinned: boolean) => void;
}

const CATEGORY_ICONS: Record<NoticeCategory, string> = {
  'General Information': 'ri-information-line',
  'Assignment Instructions': 'ri-file-list-line',
  'Health & Safety': 'ri-heart-pulse-line',
  'Access Instructions': 'ri-door-open-line',
  'Client Updates': 'ri-user-voice-line',
  'Emergency Procedures': 'ri-alarm-warning-line',
  'Parking / Keyholding': 'ri-key-2-line',
  'Site Risks': 'ri-alert-line',
  'Temporary Changes': 'ri-exchange-line',
};

const PRIORITY_COLORS: Record<NoticePriority, { bg: string; text: string; border: string; dot: string }> = {
  Urgent: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-500' },
  High: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', dot: 'bg-orange-500' },
  Normal: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', dot: 'bg-blue-500' },
  Low: { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20', dot: 'bg-gray-500' },
};

export default function NoticeCard({ notice, canManage, onEdit, onToggleStatus, onDelete, onTogglePin }: NoticeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const priority = PRIORITY_COLORS[notice.priority];
  const icon = CATEGORY_ICONS[notice.category];
  const isExpired = notice.expiry_date && new Date(notice.expiry_date) < new Date();
  const isInactive = notice.status === 'inactive';

  const dateStr = new Date(notice.updated_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`relative bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden transition-all hover:border-white/15 ${getPriorityBorder(notice.priority)} ${isInactive ? 'opacity-60' : ''}`}>
      {notice.pinned && (
        <div className="absolute top-0 right-0 w-0 h-0 border-t-[28px] border-t-blue-500/80 border-l-[28px] border-l-transparent">
          <i className="ri-pushpin-line text-white text-[10px] absolute -top-[22px] right-[3px]"></i>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-9 h-9 flex items-center justify-center rounded-lg flex-shrink-0 ${priority.bg} border ${priority.border}`}>
            <i className={`${icon} ${priority.text} text-base`}></i>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-white truncate">{notice.title}</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${priority.bg} ${priority.text} ${priority.border}`}>
                {notice.priority}
              </span>
              {isExpired && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-500/10 border border-gray-500/20 text-gray-400">
                  Expired
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
              <span>{notice.category}</span>
              <span className="text-gray-600">|</span>
              <span>{dateStr}</span>
            </div>
          </div>

          {canManage && (
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <i className="ri-more-2-fill text-sm"></i>
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-8 w-44 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-xl z-20 py-1 overflow-hidden">
                    <button
                      onClick={() => { setMenuOpen(false); onTogglePin(notice.id, !notice.pinned); }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <div className="w-4 h-4 flex items-center justify-center"><i className={`${notice.pinned ? 'ri-unpin-line' : 'ri-pushpin-line'} text-blue-400`}></i></div>
                      {notice.pinned ? 'Unpin' : 'Pin to top'}
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); onToggleStatus(notice.id, notice.status === 'active' ? 'inactive' : 'active'); }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <div className="w-4 h-4 flex items-center justify-center"><i className={`${notice.status === 'active' ? 'ri-eye-off-line' : 'ri-eye-line'} text-amber-400`}></i></div>
                      {notice.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); onEdit(notice); }}
                      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <div className="w-4 h-4 flex items-center justify-center"><i className="ri-edit-line text-blue-400"></i></div>
                      Edit
                    </button>
                    <div className="border-t border-white/5 my-1" />
                    <button
                      onClick={() => { setMenuOpen(false); setConfirmDelete(true); }}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <div className="w-4 h-4 flex items-center justify-center"><i className="ri-delete-bin-line"></i></div>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="text-sm text-gray-300 leading-relaxed">
          {expanded || notice.body.length <= 200 ? (
            <p>{notice.body}</p>
          ) : (
            <p>{notice.body.slice(0, 200)}...</p>
          )}
          {notice.body.length > 200 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-blue-400 text-xs mt-1 hover:text-blue-300 transition-colors cursor-pointer"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {notice.expiry_date && (
          <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
            <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-calendar-line"></i></div>
            Expires: {new Date(notice.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            {isExpired && <span className="text-red-400 ml-1">(Expired)</span>}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusDot(notice.priority)}`} />
            <span className="text-xs text-gray-500">
              Last updated by {notice.updated_by_name || 'Unknown'}
            </span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${notice.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'}`}>
            {notice.status === 'active' ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setConfirmDelete(false)} />
          <div className="relative bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 flex items-center justify-center bg-red-500/10 rounded-full mx-auto mb-3">
              <i className="ri-delete-bin-line text-red-400 text-xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-white text-center mb-1">Delete Notice?</h3>
            <p className="text-sm text-gray-400 text-center mb-5">This will permanently remove &quot;{notice.title}&quot;. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => { setConfirmDelete(false); onDelete(notice.id); }}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-500 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}