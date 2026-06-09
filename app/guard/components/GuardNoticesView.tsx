'use client';

import { useSiteNotices, getPriorityBorder, NoticeCategory } from '@/lib/useSiteNotices';
import { useGuardPortal } from '@/lib/useGuardPortal';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';

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

const PRIORITY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Urgent: { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-500' },
  High: { bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-500' },
  Normal: { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-500' },
  Low: { bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-500' },
};

export default function GuardNoticesView() {
  const { currentUser, profile } = useAuth();
  const portal = useGuardPortal(currentUser?.id || null, profile?.company_id || null);
  const siteId = portal.todayShift?.site_id || portal.nextShift?.site_id || null;
  const siteName = portal.todayShift?.site?.site_name || portal.nextShift?.site?.site_name || '';

  const { notices, loading } = useSiteNotices(siteId);
  const [filter, setFilter] = useState('all');

  const activeNotices = notices.filter((n) => n.status === 'active');
  const filtered = filter === 'all' ? activeNotices : activeNotices.filter((n) => n.priority === filter);

  if (!siteId) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-16">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
          <i className="ri-article-line text-gray-500 text-2xl"></i>
        </div>
        <h2 className="text-lg font-semibold text-white mb-1">No Site Assigned</h2>
        <p className="text-sm text-gray-400 text-center">Notices will appear once you are assigned to a site.</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <i className="ri-article-line text-amber-400 text-lg"></i>
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">Site Notices</h1>
          <p className="text-xs text-gray-400">{siteName}</p>
        </div>
      </div>

      {/* Priority filter */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {['all', 'Urgent', 'High', 'Normal', 'Low'].map((p) => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors cursor-pointer whitespace-nowrap ${
              filter === p
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {p === 'all' ? 'All' : p}
          </button>
        ))}
      </div>

      {/* Notices */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-white/5" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-white/5 rounded w-32" />
                    <div className="h-2 bg-white/5 rounded w-20" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-2 bg-white/5 rounded w-full" />
                  <div className="h-2 bg-white/5 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-full mx-auto mb-3">
              <i className="ri-article-line text-gray-500 text-xl"></i>
            </div>
            <p className="text-sm text-gray-400 font-medium">No active notices</p>
            <p className="text-xs text-gray-500 mt-1">
              {filter !== 'all' ? `No ${filter} priority notices.` : 'Site notices will appear here.'}
            </p>
          </div>
        ) : (
          filtered.map((notice) => {
            const priority = PRIORITY_COLORS[notice.priority] || PRIORITY_COLORS.Normal;
            const icon = CATEGORY_ICONS[notice.category];

            return (
              <div
                key={notice.id}
                className={`bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 ${getPriorityBorder(notice.priority)}`}
              >
                <div className="flex items-start gap-3 mb-2.5">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 ${priority.bg} border border-white/5`}>
                    <i className={`${icon} ${priority.text} text-sm`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-white">{notice.title}</h3>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${priority.bg} ${priority.text}`}>
                        {notice.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                      <span>{notice.category}</span>
                      <span>|</span>
                      <span>{new Date(notice.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                  {notice.pinned && (
                    <div className="w-5 h-5 flex items-center justify-center text-blue-400 flex-shrink-0">
                      <i className="ri-pushpin-fill text-xs"></i>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">{notice.body}</p>

                {notice.expiry_date && (
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-gray-500">
                    <div className="w-3 h-3 flex items-center justify-center"><i className="ri-calendar-line"></i></div>
                    Expires: {new Date(notice.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </div>
                )}

                <div className="mt-2.5 pt-2.5 border-t border-white/5 flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                  <span className="text-[10px] text-gray-500">
                    By {notice.updated_by_name || 'Unknown'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}