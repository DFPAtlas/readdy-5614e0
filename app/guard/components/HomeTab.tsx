'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import QuickNoteBar from './QuickNoteBar';
import GuardSOPView from './GuardSOPView';
import GuardBuiltSOPsView from './GuardBuiltSOPsView';
import { useNetworkStatus, queuePendingAction } from '@/lib/useNetworkStatus';
import type { GuardShift, AttendanceLog } from '@/lib/useGuardPortal';

interface HomeTabProps {
  todayShift: GuardShift | null;
  nextShift: GuardShift | null;
  activeAttendance: AttendanceLog | null;
  guardId: string | null;
  companyId: string | null;
  guardName?: string;
  onRefetch: () => void;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatDay(iso: string) {
  const d = new Date(iso);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${days[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}`;
}

function formatDuration(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function isWithinClockInWindow(start: string, end: string) {
  const now = new Date();
  const startTime = new Date(start);
  const endTime = new Date(end);
  const earlyWindow = new Date(startTime.getTime() - 30 * 60000);
  const lateWindow = new Date(endTime.getTime() + 30 * 60000);
  return now >= earlyWindow && now <= lateWindow;
}

function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function HomeTab({ todayShift, nextShift, activeAttendance, guardId, companyId, guardName, onRefetch }: HomeTabProps) {
  const router = useRouter();
  const { isOnline } = useNetworkStatus();
  const [clockingIn, setClockingIn] = useState(false);
  const [clockingOut, setClockingOut] = useState(false);
  const [confirmDistance, setConfirmDistance] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [gpsStatus, setGpsStatus] = useState<'searching' | 'ready' | 'error'>('searching');
  const [showActionMenu, setShowActionMenu] = useState(false);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isClockedIn = !!activeAttendance && !activeAttendance.clock_out;

  useEffect(() => {
    if (!navigator.geolocation) { setGpsStatus('error'); return; }
    navigator.geolocation.getCurrentPosition(
      () => setGpsStatus('ready'),
      () => setGpsStatus('error'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    if (isClockedIn && activeAttendance?.clock_in) {
      const start = new Date(activeAttendance.clock_in);
      const update = () => {
        const now = Date.now();
        setElapsed(now - start.getTime());
        if (todayShift) {
          const end = new Date(todayShift.end_time).getTime();
          setRemaining(Math.max(0, end - now));
        }
      };
      update();
      elapsedRef.current = setInterval(update, 1000);
    }
    return () => { if (elapsedRef.current) clearInterval(elapsedRef.current); };
  }, [isClockedIn, activeAttendance, todayShift]);

  async function getLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) { reject(new Error('No GPS')); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }

  async function handleClockIn() {
    if (!todayShift || !guardId || !companyId) return;
    setClockingIn(true);

    try {
      const loc = await getLocation();
      const site = todayShift.site;

      if (site?.latitude && site?.longitude) {
        const dist = distanceMeters(loc.lat, loc.lng, Number(site.latitude), Number(site.longitude));
        if (dist > 200) {
          setConfirmDistance(Math.round(dist));
          setClockingIn(false);
          return;
        }
      }

      await doClockIn(loc);
    } catch {
      await doClockIn(null);
    }
  }

  async function doClockIn(loc: { lat: number; lng: number } | null) {
    if (!todayShift || !guardId || !companyId) return;

    const payload = {
      company_id: companyId,
      shift_id: todayShift.id,
      guard_id: guardId,
      clock_in: new Date().toISOString(),
      clock_in_lat: loc?.lat ?? null,
      clock_in_lng: loc?.lng ?? null,
    };

    if (!isOnline) {
      queuePendingAction({ type: 'clock_in', payload });
      if (navigator.vibrate) navigator.vibrate(200);
      setConfirmDistance(null);
      setClockingIn(false);
      onRefetch();
      return;
    }

    const { error } = await supabase.from('attendance_logs').insert(payload);
    if (error) {
      if (navigator.vibrate) navigator.vibrate([100, 100, 100]);
      return;
    }

    await supabase.from('shifts').update({ status: 'active' }).eq('id', todayShift.id);
    await supabase.from('occurrence_books').insert({
      company_id: companyId,
      site_id: todayShift.site_id,
      guard_id: guardId,
      entry_type: 'Shift Start',
      entry: `Shift commenced at ${formatTime(new Date().toISOString())}. Officer on site.`,
    });

    if (navigator.vibrate) navigator.vibrate(200);
    setConfirmDistance(null);
    setClockingIn(false);
    onRefetch();
  }

  async function handleClockOut() {
    if (!activeAttendance || !todayShift || !guardId || !companyId) return;
    setClockingOut(true);

    let loc: { lat: number; lng: number } | null = null;
    try { loc = await getLocation(); } catch { /* silently fail */ }

    if (!isOnline) {
      queuePendingAction({
        type: 'clock_out',
        payload: { id: activeAttendance.id, clock_out: new Date().toISOString(), lat: loc?.lat, lng: loc?.lng },
      });
      if (navigator.vibrate) navigator.vibrate(200);
      setClockingOut(false);
      onRefetch();
      return;
    }

    await supabase.from('attendance_logs').update({
      clock_out: new Date().toISOString(),
      clock_out_lat: loc?.lat ?? null,
      clock_out_lng: loc?.lng ?? null,
    }).eq('id', activeAttendance.id);

    await supabase.from('shifts').update({ status: 'completed' }).eq('id', todayShift.id);
    await supabase.from('occurrence_books').insert({
      company_id: companyId,
      site_id: todayShift.site_id,
      guard_id: guardId,
      entry_type: 'Shift End',
      entry: `Shift ended at ${formatTime(new Date().toISOString())}. Officer leaving site.`,
    });

    if (navigator.vibrate) navigator.vibrate(200);
    setClockingOut(false);
    onRefetch();
  }

  const shiftWindow = todayShift ? isWithinClockInWindow(todayShift.start_time, todayShift.end_time) : false;
  const windowMessage = todayShift && !shiftWindow
    ? new Date(todayShift.start_time) > new Date()
      ? `Clock in opens at ${formatTime(todayShift.start_time)}`
      : 'Shift has ended'
    : '';

  const initials = guardName?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'G';

  if (isClockedIn && todayShift) {
    return (
      <div className="flex flex-col min-h-full pb-24">
        {/* Status Bar */}
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${gpsStatus === 'ready' ? 'bg-emerald-400' : gpsStatus === 'searching' ? 'bg-amber-400 animate-pulse' : 'bg-red-400'}`} />
            <span className={`text-xs font-medium ${gpsStatus === 'ready' ? 'text-emerald-400' : gpsStatus === 'searching' ? 'text-amber-400' : 'text-red-400'}`}>
              {gpsStatus === 'ready' ? 'GPS Ready' : gpsStatus === 'searching' ? 'GPS Searching...' : 'GPS Unavailable'}
            </span>
          </div>
          {!isOnline && (
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-medium">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-wifi-off-line"></i>
              </div>
              Offline
            </div>
          )}
        </div>

        {/* Shift Header */}
        <div className="px-4 pt-2 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#3b82f6]/15 flex items-center justify-center text-[#3b82f6] text-sm font-bold">
              {initials}
            </div>
            <div>
              <p className="text-gray-400 text-sm">On shift at</p>
              <h2 className="text-2xl font-bold text-white">{todayShift.site?.site_name || 'Site'}</h2>
            </div>
          </div>
        </div>

        {/* Timer Card */}
        <div className="px-4 py-2">
          <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider">Elapsed</p>
                <p className="text-4xl font-mono font-bold text-white mt-1 tabular-nums">{formatDuration(elapsed)}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs uppercase tracking-wider">Remaining</p>
                <p className="text-xl font-mono font-semibold text-[#3b82f6] mt-1 tabular-nums">
                  {remaining > 0 ? formatDuration(remaining) : 'Done'}
                </p>
              </div>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#3b82f6] h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${todayShift ? Math.min(100, (elapsed / (new Date(todayShift.end_time).getTime() - new Date(todayShift.start_time).getTime())) * 100) : 0}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {formatTime(todayShift.start_time)} — {formatTime(todayShift.end_time)}
            </p>
          </div>
        </div>

        <QuickNoteBar
          todayShift={todayShift}
          guardId={guardId}
          companyId={companyId}
          guardName={guardName || 'Officer'}
          onSubmitted={() => { if (navigator.vibrate) navigator.vibrate(50); }}
        />

        {/* Main Action Buttons — 2x2 Grid */}
        <div className="px-4 py-3 grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push('/guard/patrol')}
            className="bg-gradient-to-br from-[#3b82f6]/20 to-[#3b82f6]/5 border border-[#3b82f6]/20 rounded-2xl p-5 flex flex-col items-center gap-3 cursor-pointer active:scale-[0.97] transition-transform min-h-[120px] justify-center"
          >
            <div className="w-12 h-12 rounded-full bg-[#3b82f6]/15 flex items-center justify-center">
              <i className="ri-walk-line text-[#3b82f6] text-2xl"></i>
            </div>
            <span className="text-sm font-semibold text-white whitespace-nowrap">Start Patrol</span>
          </button>

          <button
            onClick={() => router.push('/guard/incident')}
            className="bg-gradient-to-br from-red-500/15 to-red-500/5 border border-red-500/20 rounded-2xl p-5 flex flex-col items-center gap-3 cursor-pointer active:scale-[0.97] transition-transform min-h-[120px] justify-center"
          >
            <div className="w-12 h-12 rounded-full bg-red-500/15 flex items-center justify-center">
              <i className="ri-alert-line text-red-400 text-2xl"></i>
            </div>
            <span className="text-sm font-semibold text-white whitespace-nowrap">Report Incident</span>
          </button>

          <button
            onClick={() => router.push('/guard/ob')}
            className="bg-gradient-to-br from-amber-500/15 to-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex flex-col items-center gap-3 cursor-pointer active:scale-[0.97] transition-transform min-h-[120px] justify-center"
          >
            <div className="w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center">
              <i className="ri-book-open-line text-amber-400 text-2xl"></i>
            </div>
            <span className="text-sm font-semibold text-white whitespace-nowrap">Log OB Entry</span>
          </button>

          <button
            onClick={() => setShowActionMenu(true)}
            className="bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-5 flex flex-col items-center gap-3 cursor-pointer active:scale-[0.97] transition-transform min-h-[120px] justify-center"
          >
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              <i className="ri-more-line text-gray-400 text-2xl"></i>
            </div>
            <span className="text-sm font-semibold text-gray-400 whitespace-nowrap">More</span>
          </button>
        </div>

        {/* More Action Menu */}
        {showActionMenu && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-t-3xl w-full max-w-lg mx-auto p-6 animate-in slide-in-from-bottom duration-200">
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6" />
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setShowActionMenu(false); router.push('/guard/notices'); }}
                  className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer active:scale-[0.97] transition-transform"
                >
                  <i className="ri-article-line text-amber-400 text-xl"></i>
                  <span className="text-xs font-medium text-white whitespace-nowrap">Site Notices</span>
                </button>
                <button
                  onClick={() => { setShowActionMenu(false); router.push('/guard/visitors'); }}
                  className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer active:scale-[0.97] transition-transform"
                >
                  <i className="ri-user-add-line text-emerald-400 text-xl"></i>
                  <span className="text-xs font-medium text-white whitespace-nowrap">Visitor Log</span>
                </button>
                <button
                  onClick={() => { setShowActionMenu(false); router.push('/guard/lone-worker'); }}
                  className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer active:scale-[0.97] transition-transform"
                >
                  <i className="ri-shield-user-line text-orange-400 text-xl"></i>
                  <span className="text-xs font-medium text-white whitespace-nowrap">Lone Worker</span>
                </button>
                <button
                  onClick={() => { setShowActionMenu(false); router.push('/guard/wellbeing'); }}
                  className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer active:scale-[0.97] transition-transform"
                >
                  <i className="ri-heart-pulse-line text-violet-400 text-xl"></i>
                  <span className="text-xs font-medium text-white whitespace-nowrap">Wellbeing</span>
                </button>
                <button
                  onClick={() => { setShowActionMenu(false); router.push('/guard/assistant'); }}
                  className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer active:scale-[0.97] transition-transform"
                >
                  <i className="ri-sparkling-line text-[#3b82f6] text-xl"></i>
                  <span className="text-xs font-medium text-white whitespace-nowrap">AI Assistant</span>
                </button>
                <button
                  onClick={() => { setShowActionMenu(false); router.push('/guard/sos'); }}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer active:scale-[0.97] transition-transform"
                >
                  <i className="ri-alarm-warning-line text-red-400 text-xl"></i>
                  <span className="text-xs font-medium text-red-400 whitespace-nowrap">SOS Alert</span>
                </button>
                <button
                  onClick={() => { setShowActionMenu(false); window.location.href = 'tel:999'; }}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer active:scale-[0.97] transition-transform"
                >
                  <i className="ri-phone-line text-red-400 text-xl"></i>
                  <span className="text-xs font-medium text-red-400 whitespace-nowrap">Emergency Call</span>
                </button>
                <button
                  onClick={() => { setShowActionMenu(false); router.push('/guard/menu'); }}
                  className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer active:scale-[0.97] transition-transform"
                >
                  <i className="ri-user-line text-gray-400 text-xl"></i>
                  <span className="text-xs font-medium text-white whitespace-nowrap">My Profile</span>
                </button>
                <button
                  onClick={() => { setShowActionMenu(false); router.push('/guard/shifts'); }}
                  className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer active:scale-[0.97] transition-transform"
                >
                  <i className="ri-calendar-event-line text-gray-400 text-xl"></i>
                  <span className="text-xs font-medium text-white whitespace-nowrap">My Shifts</span>
                </button>
                <button
                  onClick={() => { setShowActionMenu(false); router.push('/guard/cover-offers'); }}
                  className="bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer active:scale-[0.97] transition-transform"
                >
                  <i className="ri-hand-heart-line text-[#3b82f6] text-xl"></i>
                  <span className="text-xs font-medium text-white whitespace-nowrap">Cover Offers</span>
                </button>
              </div>
              <button
                onClick={() => setShowActionMenu(false)}
                className="w-full h-14 mt-4 bg-white/5 hover:bg-white/10 text-gray-400 font-medium rounded-xl cursor-pointer transition-colors whitespace-nowrap"
              >
                Close
              </button>
            </div>
          </div>
        )}

        <GuardSOPView siteId={todayShift.site_id} />
        <GuardBuiltSOPsView siteId={todayShift.site_id} guardId={guardId || ''} />

        {/* Site Instructions */}
        {todayShift.site?.assignment_instructions && (
          <div className="px-4 py-2">
            <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <i className="ri-clipboard-line"></i>
                Site Instructions
              </p>
              <p className="text-sm text-gray-300 leading-relaxed line-clamp-4">
                {todayShift.site.assignment_instructions}
              </p>
            </div>
          </div>
        )}

        {/* Clock Out Button */}
        <div className="mt-auto px-4 pb-6 pt-4">
          <button
            onClick={handleClockOut}
            disabled={clockingOut}
            className="w-full h-16 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-40 text-white font-bold rounded-2xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
          >
            {clockingOut ? (
              <i className="ri-loader-4-line animate-spin text-lg"></i>
            ) : (
              <>
                <div className="w-6 h-6 flex items-center justify-center">
                  <i className="ri-logout-circle-line text-lg"></i>
                </div>
                Book Off (Clock Out)
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (todayShift && !isClockedIn) {
    return (
      <div className="flex flex-col min-h-full pb-24">
        {/* Status Bar */}
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${gpsStatus === 'ready' ? 'bg-emerald-400' : gpsStatus === 'searching' ? 'bg-amber-400 animate-pulse' : 'bg-red-400'}`} />
            <span className={`text-xs font-medium ${gpsStatus === 'ready' ? 'text-emerald-400' : gpsStatus === 'searching' ? 'text-amber-400' : 'text-red-400'}`}>
              {gpsStatus === 'ready' ? 'GPS Ready' : gpsStatus === 'searching' ? 'GPS Searching...' : 'GPS Unavailable'}
            </span>
          </div>
          {!isOnline && (
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-medium">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-wifi-off-line"></i>
              </div>
              Offline
            </div>
          )}
        </div>

        {/* Shift Info */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-[#3b82f6]/15 flex items-center justify-center text-[#3b82f6] text-sm font-bold">
              {initials}
            </div>
            <div>
              <p className="text-gray-400 text-sm">Your shift today</p>
              <h2 className="text-2xl font-bold text-white">{todayShift.site?.site_name || 'Site'}</h2>
            </div>
          </div>
          {todayShift.site?.address && (
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(todayShift.site.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[#3b82f6] cursor-pointer"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-map-pin-line"></i>
              </div>
              {todayShift.site.address}
            </a>
          )}
        </div>

        {/* Shift Time Card */}
        <div className="px-4 py-2">
          <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Start</p>
                <p className="text-3xl font-bold text-white tabular-nums">{formatTime(todayShift.start_time)}</p>
              </div>
              <div className="w-10 h-10 flex items-center justify-center">
                <i className="ri-arrow-right-line text-gray-500 text-xl"></i>
              </div>
              <div className="text-center flex-1">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">End</p>
                <p className="text-3xl font-bold text-white tabular-nums">{formatTime(todayShift.end_time)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Cards */}
        <div className="px-4 py-2 space-y-2">
          {todayShift.site?.site_contact_phone && (
            <a
              href={`tel:${todayShift.site.site_contact_phone}`}
              className="block bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <i className="ri-phone-line text-emerald-400 text-lg"></i>
              </div>
              <div>
                <p className="text-xs text-gray-400">Site Contact</p>
                <p className="text-sm text-white font-medium">{todayShift.site.site_contact_phone}</p>
              </div>
              <div className="ml-auto w-6 h-6 flex items-center justify-center">
                <i className="ri-arrow-right-s-line text-gray-500"></i>
              </div>
            </a>
          )}

          {todayShift.site?.client_contact_name && (
            <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4">
              <p className="text-xs text-gray-400 mb-1">Client Contact</p>
              <p className="text-sm text-white font-medium">{todayShift.site.client_contact_name}</p>
              {todayShift.site.client_contact_email && (
                <a href={`mailto:${todayShift.site.client_contact_email}`} className="text-sm text-[#3b82f6] mt-1 block cursor-pointer">
                  {todayShift.site.client_contact_email}
                </a>
              )}
            </div>
          )}

          {todayShift.site?.assignment_instructions && (
            <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <i className="ri-clipboard-line"></i>
                Instructions
              </p>
              <p className="text-sm text-gray-300 leading-relaxed">{todayShift.site.assignment_instructions}</p>
            </div>
          )}
        </div>

        {/* Main CTA: Book On */}
        <div className="mt-auto px-4 pb-6 pt-4">
          <button
            onClick={handleClockIn}
            disabled={!shiftWindow || clockingIn}
            className="w-full h-20 bg-gradient-to-r from-[#3b82f6] to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:opacity-30 disabled:bg-gray-700 text-white font-bold rounded-2xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-3 shadow-lg shadow-blue-900/20 text-lg"
          >
            {clockingIn ? (
              <i className="ri-loader-4-line animate-spin text-xl"></i>
            ) : (
              <>
                <div className="w-7 h-7 flex items-center justify-center">
                  <i className="ri-login-circle-line text-xl"></i>
                </div>
                Book On (Clock In)
              </>
            )}
          </button>
          {!shiftWindow && windowMessage && (
            <p className="text-center text-xs text-gray-500 mt-2">{windowMessage}</p>
          )}
        </div>

        {/* Distance Confirm Modal */}
        {confirmDistance !== null && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center px-4">
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
              <div className="w-14 h-14 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="ri-route-line text-amber-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-white text-center mb-2">Distance Warning</h3>
              <p className="text-sm text-gray-400 text-center mb-6">
                You are {confirmDistance}m from {todayShift.site?.site_name || 'the site'}. Are you sure you want to clock in?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setConfirmDistance(null); setClockingIn(false); }}
                  className="flex-1 h-14 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => doClockIn(null)}
                  className="flex-1 h-14 bg-[#3b82f6] hover:bg-blue-500 text-white font-medium rounded-xl cursor-pointer transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // No shift today
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-4 pb-24">
      <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
        <i className="ri-calendar-line text-gray-500 text-3xl"></i>
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">No shift today</h2>
      {nextShift && nextShift.site ? (
        <div className="text-center mt-2">
          <p className="text-sm text-gray-400 mb-1">Your next shift:</p>
          <p className="text-base text-white font-medium">{nextShift.site.site_name}</p>
          <p className="text-sm text-[#3b82f6]">{formatDay(nextShift.start_time)} at {formatTime(nextShift.start_time)}</p>
        </div>
      ) : (
        <p className="text-sm text-gray-400 mt-2">Nothing scheduled in the next 7 days.</p>
      )}
      <button
        disabled
        className="mt-8 w-full h-16 bg-gray-700/30 text-gray-500 font-semibold rounded-2xl cursor-not-allowed flex items-center justify-center gap-2"
      >
        <div className="w-6 h-6 flex items-center justify-center">
          <i className="ri-login-circle-line"></i>
        </div>
        Book On (Clock In)
      </button>
    </div>
  );
}