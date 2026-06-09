'use client';

import { useCompanyNotices } from '@/lib/useSiteNotices';
import { useAuth } from '@/lib/auth';
import { useSites } from '@/lib/useSites';
import { useGuards } from '@/lib/useGuards';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string; accent: string; glow: string; strip: string }> = {
  Urgent: { bg: 'bg-red-950/50', text: 'text-red-300', border: 'border-red-500/30', accent: 'bg-red-500', glow: 'shadow-red-500/15', strip: 'bg-red-500' },
  High: { bg: 'bg-orange-950/50', text: 'text-orange-300', border: 'border-orange-500/30', accent: 'bg-orange-500', glow: 'shadow-orange-500/15', strip: 'bg-orange-500' },
  Normal: { bg: 'bg-blue-950/50', text: 'text-blue-300', border: 'border-blue-500/30', accent: 'bg-blue-500', glow: 'shadow-blue-500/15', strip: 'bg-blue-500' },
  Low: { bg: 'bg-gray-900/60', text: 'text-gray-300', border: 'border-gray-600/30', accent: 'bg-gray-500', glow: 'shadow-gray-500/15', strip: 'bg-gray-500' },
};

const GUARD_COLORS = [
  'bg-emerald-500','bg-cyan-500','bg-violet-500','bg-amber-500','bg-pink-500',
  'bg-sky-500','bg-lime-500','bg-rose-500','bg-teal-500','bg-indigo-500',
];

function getGuardColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return GUARD_COLORS[Math.abs(hash) % GUARD_COLORS.length];
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getWeekDates(base: Date) {
  const day = base.getDay();
  const diff = base.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(base);
  monday.setDate(diff);
  monday.setHours(0,0,0,0);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatShiftTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function KioskNoticeSquare({ notice, siteName }: { notice: any; siteName: string }) {
  const priority = PRIORITY_COLORS[notice.priority] || PRIORITY_COLORS.Normal;
  const isExpired = notice.expiry_date && new Date(notice.expiry_date) < new Date();

  return (
    <div className={`relative ${priority.bg} border ${priority.border} rounded-2xl overflow-hidden shadow-lg ${priority.glow} flex flex-col h-full ${notice.pinned ? 'ring-2 ring-blue-400/40' : ''}`}>
      <div className={`h-1.5 w-full ${priority.strip}`} />
      <div className="p-5 flex flex-col flex-1 min-h-0">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-lg font-bold text-white leading-tight line-clamp-2">{notice.title}</h3>
          {notice.pinned && (
            <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30 flex-shrink-0">
              <i className="ri-pushpin-line text-blue-400 text-sm"></i>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
          <span className={`px-2 py-0.5 rounded-md font-semibold text-xs ${priority.bg} ${priority.text} ${priority.border} border`}>
            {notice.priority}
          </span>
          <span className="truncate">{siteName}</span>
        </div>
        <p className="text-sm text-gray-200 leading-relaxed line-clamp-4 flex-1">{notice.body}</p>
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
          <span>{new Date(notice.updated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
          {isExpired && <span className="text-red-400">Expired</span>}
          {notice.expiry_date && !isExpired && (
            <span>Expires {new Date(notice.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function DayColumn({ date, shifts, guards, sites }: { date: Date; shifts: any[]; guards: any[]; sites: any[] }) {
  const dayShifts = shifts.filter(s => {
    const sDate = new Date(s.start_time);
    return sDate.toDateString() === date.toDateString();
  });

  const isToday = new Date().toDateString() === date.toDateString();
  const dayName = date.toLocaleDateString('en-GB', { weekday: 'short' });
  const dayNum = date.getDate();

  return (
    <div className={`flex-1 flex flex-col rounded-xl border ${isToday ? 'border-blue-500/40 bg-blue-950/20' : 'border-white/5 bg-white/[0.02]'} overflow-hidden`}>
      <div className={`px-3 py-2.5 text-center border-b ${isToday ? 'border-blue-500/30 bg-blue-500/10' : 'border-white/5 bg-white/[0.03]'}`}>
        <div className={`text-xs font-semibold uppercase tracking-wider ${isToday ? 'text-blue-300' : 'text-gray-400'}`}>{dayName}</div>
        <div className={`text-xl font-bold ${isToday ? 'text-white' : 'text-gray-300'}`}>{dayNum}</div>
      </div>
      <div className="flex-1 p-2.5 space-y-2 overflow-y-auto">
        {dayShifts.length === 0 ? (
          <div className="text-center py-4">
            <span className="text-xs text-gray-600">No shifts</span>
          </div>
        ) : (
          dayShifts.map((shift, i) => {
            const guard = guards.find(g => g.id === shift.guard_id);
            const site = sites.find(s => s.id === shift.site_id);
            const color = guard ? getGuardColor(guard.id) : 'bg-gray-500';
            return (
              <div key={shift.id + i} className="rounded-lg bg-white/[0.04] border border-white/5 p-2.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold text-white ${color}`}>
                    {guard ? getInitials(`${guard.first_name || ''} ${guard.last_name || ''}`) : '??'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate">
                      {guard ? `${guard.first_name || ''} ${guard.last_name || ''}`.trim() : 'Unassigned'}
                    </div>
                    <div className="text-[10px] text-gray-500 truncate">{site?.site_name || 'Unknown'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                  <i className="ri-time-line text-[10px]"></i>
                  <span>{formatShiftTime(shift.start_time)} – {formatShiftTime(shift.end_time)}</span>
                </div>
                <div className="mt-1 flex items-center gap-1">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${shift.status === 'active' ? 'bg-emerald-400' : shift.status === 'completed' ? 'bg-gray-500' : 'bg-amber-400'}`}></span>
                  <span className="text-[10px] text-gray-500 capitalize">{shift.status || 'scheduled'}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function KioskNoticesPage() {
  const { profile, companyId } = useAuth();
  const { notices, loading: noticesLoading } = useCompanyNotices(profile?.company_id || null);
  const { sites } = useSites();
  const { guards } = useGuards();
  const siteMap = useMemo(() => new Map(sites.map(s => [s.id, s.site_name])), [sites]);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [weekShifts, setWeekShifts] = useState<any[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const hideTimer = setTimeout(() => setShowControls(false), 5000);
    const showOnMove = () => {
      setShowControls(true);
      clearTimeout(hideTimer);
      setTimeout(() => setShowControls(false), 5000);
    };
    window.addEventListener('mousemove', showOnMove);
    return () => {
      window.removeEventListener('mousemove', showOnMove);
      clearTimeout(hideTimer);
    };
  }, []);

  const weekDates = useMemo(() => getWeekDates(currentTime), [currentTime]);

  const loadWeekShifts = useCallback(async () => {
    if (!companyId) { setShiftsLoading(false); return; }
    setShiftsLoading(true);
    const start = weekDates[0].toISOString();
    const end = new Date(weekDates[6]);
    end.setHours(23, 59, 59, 999);
    const { data, error } = await supabase
      .from('shifts')
      .select('id, site_id, guard_id, start_time, end_time, status, shift_type')
      .eq('company_id', companyId)
      .gte('start_time', start)
      .lt('start_time', end.toISOString())
      .order('start_time');
    if (!error) setWeekShifts(data || []);
    setShiftsLoading(false);
  }, [companyId, weekDates]);

  useEffect(() => {
    loadWeekShifts();
    const interval = setInterval(loadWeekShifts, 60000);
    return () => clearInterval(interval);
  }, [loadWeekShifts]);

  const enterFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (document.exitFullscreen) {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const pinned = notices.filter(n => n.pinned);
  const regular = notices.filter(n => !n.pinned);
  const urgentCount = notices.filter(n => n.priority === 'Urgent').length;
  const highCount = notices.filter(n => n.priority === 'High').length;

  const activeGuardsToday = useMemo(() => {
    const today = new Date().toDateString();
    const todayShifts = weekShifts.filter(s => new Date(s.start_time).toDateString() === today);
    const unique = new Set(todayShifts.map(s => s.guard_id).filter(Boolean));
    return unique.size;
  }, [weekShifts]);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden flex flex-col">
      {/* Slim status bar */}
      <div className={`shrink-0 flex items-center justify-between px-6 py-3 border-b border-white/10 bg-black/90 backdrop-blur-sm z-40 transition-all duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-semibold text-emerald-400">LIVE</span>
          </div>
          <div className="h-4 w-px bg-white/10"></div>
          <span className="text-sm text-gray-400">Notice Board</span>
        </div>

        <div className="flex items-center gap-5">
          {urgentCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-red-500/15 border border-red-500/25">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-sm font-semibold text-red-300">{urgentCount} Urgent</span>
            </div>
          )}
          {highCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-500/15 border border-orange-500/25">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-sm font-semibold text-orange-300">{highCount} High</span>
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/5">
            <i className="ri-shield-user-line text-gray-400 text-sm"></i>
            <span className="text-sm text-gray-300">{activeGuardsToday} on duty today</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-white tabular-nums">
              {currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="text-xs text-gray-500">
              {currentTime.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
            </div>
          </div>
        </div>
      </div>

      {/* Main dashboard grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Notices grid */}
        <div className="flex-1 flex flex-col min-w-0 p-5 overflow-hidden">
          <div className="flex items-center gap-3 mb-4 shrink-0">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/15">
              <i className="ri-notification-3-line text-blue-400"></i>
            </div>
            <h2 className="text-lg font-bold text-white">Site Notices</h2>
            <span className="text-sm text-gray-500">({notices.length})</span>
            {pinned.length > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-300 font-medium">
                {pinned.length} pinned
              </span>
            )}
          </div>

          {noticesLoading ? (
            <div className="grid grid-cols-3 gap-4 flex-1">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="rounded-2xl bg-white/[0.03] border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : notices.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1">
              <div className="w-16 h-16 flex items-center justify-center rounded-full bg-white/[0.03] border border-white/5 mb-4">
                <i className="ri-notification-off-line text-gray-600 text-2xl"></i>
              </div>
              <p className="text-gray-400 text-lg font-medium">All Clear</p>
              <p className="text-sm text-gray-600">No active notices</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 overflow-y-auto pr-1">
              {pinned.map(notice => (
                <div key={notice.id} className="aspect-square">
                  <KioskNoticeSquare notice={notice} siteName={siteMap.get(notice.site_id) || 'Unknown Site'} />
                </div>
              ))}
              {regular.map(notice => (
                <div key={notice.id} className="aspect-square">
                  <KioskNoticeSquare notice={notice} siteName={siteMap.get(notice.site_id) || 'Unknown Site'} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Weekly roster */}
        <div className="w-[420px] shrink-0 flex flex-col border-l border-white/10 bg-white/[0.01]">
          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-500/15">
              <i className="ri-calendar-line text-emerald-400"></i>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Week Roster</h2>
              <p className="text-xs text-gray-500">
                {weekDates[0].toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – {weekDates[6].toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {shiftsLoading ? (
              <div className="space-y-3">
                {[1,2,3,4,5,6,7].map(i => (
                  <div key={i} className="h-20 rounded-xl bg-white/[0.03] animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="flex gap-2 h-full">
                {weekDates.map(date => (
                  <DayColumn
                    key={date.toISOString()}
                    date={date}
                    shifts={weekShifts}
                    guards={guards}
                    sites={sites}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom controls overlay */}
      <div className={`shrink-0 flex items-center justify-center gap-3 px-6 py-3 border-t border-white/10 bg-black/90 backdrop-blur-sm transition-all duration-500 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        {!isFullscreen ? (
          <button
            onClick={enterFullscreen}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors cursor-pointer"
          >
            <i className="ri-fullscreen-line"></i>
            Fullscreen
          </button>
        ) : (
          <button
            onClick={exitFullscreen}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium transition-colors cursor-pointer border border-white/10"
          >
            <i className="ri-fullscreen-exit-line"></i>
            Exit Fullscreen
          </button>
        )}
        <Link
          href="/dashboard/notices"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition-colors border border-white/10"
        >
          <i className="ri-arrow-left-line"></i>
          Back to Notices
        </Link>
        <Link
          href="/dashboard/notices/live"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition-colors border border-white/10"
        >
          <i className="ri-live-line"></i>
          Live Board
        </Link>
      </div>
    </div>
  );
}