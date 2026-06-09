'use client';

import { useCompanyNotices } from '@/lib/useSiteNotices';
import { useAuth } from '@/lib/auth';
import { useSites } from '@/lib/useSites';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import NoticeForm from '@/app/dashboard/sites/[id]/notices/components/NoticeForm';

const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string; accent: string }> = {
  Urgent: { bg: 'bg-red-950/40', text: 'text-red-400', border: 'border-red-500/30', accent: 'bg-red-500' },
  High: { bg: 'bg-orange-950/40', text: 'text-orange-400', border: 'border-orange-500/30', accent: 'bg-orange-500' },
  Normal: { bg: 'bg-blue-950/40', text: 'text-blue-400', border: 'border-blue-500/30', accent: 'bg-blue-500' },
  Low: { bg: 'bg-gray-900/40', text: 'text-gray-400', border: 'border-gray-500/30', accent: 'bg-gray-500' },
};

const CATEGORY_ICONS: Record<string, string> = {
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

function LiveNoticeCard({ notice, siteName }: { notice: any; siteName: string }) {
  const priority = PRIORITY_COLORS[notice.priority] || PRIORITY_COLORS.Normal;
  const icon = CATEGORY_ICONS[notice.category] || 'ri-information-line';
  const isExpired = notice.expiry_date && new Date(notice.expiry_date) < new Date();

  const dateStr = new Date(notice.updated_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className={`relative ${priority.bg} border ${priority.border} rounded-2xl overflow-hidden transition-all`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${priority.accent}`} />
      <div className="p-6 pl-7">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0 ${priority.bg} border ${priority.border}`}>
            <i className={`${icon} ${priority.text} text-xl`}></i>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h3 className="text-lg font-semibold text-white">{notice.title}</h3>
              <span className={`text-xs px-3 py-1 rounded-full font-medium border ${priority.bg} ${priority.text} ${priority.border}`}>
                {notice.priority}
              </span>
              {notice.pinned && (
                <span className="text-xs px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium">
                  Pinned
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
              <span className="flex items-center gap-1.5">
                <i className="ri-building-line text-xs"></i>
                {siteName}
              </span>
              <span className="text-gray-600">|</span>
              <span>{notice.category}</span>
              <span className="text-gray-600">|</span>
              <span>{dateStr}</span>
              {isExpired && <span className="text-red-400">(Expired)</span>}
            </div>

            <p className="text-base text-gray-200 leading-relaxed whitespace-pre-wrap">{notice.body}</p>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Last updated by <span className="text-gray-300">{notice.updated_by_name || 'Unknown'}</span>
              </span>
              {notice.expiry_date && (
                <span className="text-sm text-gray-400 flex items-center gap-1.5">
                  <i className="ri-calendar-line"></i>
                  Expires: {new Date(notice.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LiveNoticesBoardPage() {
  const { profile } = useAuth();
  const { notices, loading } = useCompanyNotices(profile?.company_id || null);
  const { sites } = useSites();
  const siteMap = new Map(sites.map((s) => [s.id, s.site_name]));
  const [currentTime, setCurrentTime] = useState(new Date());
  const [formOpen, setFormOpen] = useState(false);
  const [noticeSiteId, setNoticeSiteId] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pinned = notices.filter((n) => n.pinned);
  const regular = notices.filter((n) => !n.pinned);

  const handleSave = () => {
    setFormOpen(false);
  };

  const openForm = () => {
    if (sites.length > 0) setNoticeSiteId(sites[0].id);
    setFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-600/15">
              <i className="ri-live-line text-blue-400 text-xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Live Notice Board</h1>
              <p className="text-sm text-gray-400">Real-time site notices · Auto-refreshes every minute</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Live
            </div>
            <div className="text-sm text-gray-500">
              {currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <Link
              href="/dashboard/notices/kiosk"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600/15 border border-emerald-500/20 text-sm text-emerald-400 hover:bg-emerald-600/25 transition-colors"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-tv-line text-sm"></i>
              </div>
              Kiosk Mode
            </Link>
            <button
              onClick={openForm}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600/15 border border-blue-500/20 text-sm text-blue-400 hover:bg-blue-600/25 transition-colors cursor-pointer"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-add-line text-sm"></i>
              </div>
              Add Notice
            </button>
            <Link
              href="/dashboard/notices"
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <i className="ri-list-check"></i>
              Standard View
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-800/30 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 flex items-center justify-center bg-gray-800/50 rounded-full mx-auto mb-4">
              <i className="ri-notification-off-line text-gray-500 text-2xl"></i>
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No active notices</h3>
            <p className="text-sm text-gray-400">All sites are clear. New notices will appear here automatically.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pinned.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-3">
                  <i className="ri-pushpin-line text-blue-400"></i>
                  <span className="text-sm font-medium text-blue-400">Pinned Notices</span>
                  <span className="text-xs text-gray-500">({pinned.length})</span>
                </div>
                <div className="space-y-3">
                  {pinned.map((notice) => (
                    <LiveNoticeCard
                      key={notice.id}
                      notice={notice}
                      siteName={siteMap.get(notice.site_id) || 'Unknown Site'}
                    />
                  ))}
                </div>
              </div>
            )}

            {regular.length > 0 && (
              <div>
                {pinned.length > 0 && (
                  <div className="flex items-center gap-2 mb-3 mt-6">
                    <i className="ri-notification-3-line text-gray-400"></i>
                    <span className="text-sm font-medium text-gray-400">All Notices</span>
                    <span className="text-xs text-gray-500">({regular.length})</span>
                  </div>
                )}
                <div className="space-y-3">
                  {regular.map((notice) => (
                    <LiveNoticeCard
                      key={notice.id}
                      notice={notice}
                      siteName={siteMap.get(notice.site_id) || 'Unknown Site'}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {formOpen && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-gray-400">Post to site:</span>
              <div className="relative">
                <select
                  value={noticeSiteId}
                  onChange={(e) => setNoticeSiteId(e.target.value)}
                  className="px-3 py-2 bg-[#0f172a]/80 border border-white/10 rounded-lg text-sm text-white appearance-none cursor-pointer pr-8 min-w-[180px]"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#0f172a] text-white">{s.site_name}</option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center pointer-events-none text-gray-400">
                  <i className="ri-arrow-down-s-line"></i>
                </div>
              </div>
            </div>
            {noticeSiteId && (
              <NoticeForm
                siteId={noticeSiteId}
                onClose={() => setFormOpen(false)}
                onSave={handleSave}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}