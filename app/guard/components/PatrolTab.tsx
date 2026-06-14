'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { GuardShift, AttendanceLog } from '@/lib/useGuardPortal';

interface PatrolTabProps {
  todayShift: GuardShift | null;
  activeAttendance: AttendanceLog | null;
  guardId: string | null;
  companyId: string | null;
}

interface Checkpoint {
  id: string;
  name: string;
  description: string | null;
  lat: number | null;
  lng: number | null;
  qr_code: string | null;
  order_index: number;
}

interface Scan {
  checkpoint_id: string;
  scanned_at: string;
}

export default function PatrolTab({ todayShift, activeAttendance, guardId, companyId }: PatrolTabProps) {
  const router = useRouter();
  const [patrolLogId, setPatrolLogId] = useState<string | null>(null);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [patrolTimer, setPatrolTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const isClockedIn = !!activeAttendance && !activeAttendance.clock_out;

  useEffect(() => {
    if (!patrolLogId) return;
    const interval = setInterval(() => setPatrolTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [patrolLogId]);

  const loadPatrol = useCallback(async () => {
    if (!todayShift || !guardId) return;
    const { data } = await supabase
      .from('patrol_logs')
      .select('*')
      .eq('shift_id', todayShift.id)
      .eq('status', 'active')
      .maybeSingle();

    if (data) {
      setPatrolLogId(data.id);
      setPatrolTimer(Math.floor((Date.now() - new Date(data.start_time).getTime()) / 1000));

      const { data: scansData } = await supabase
        .from('patrol_checkpoint_scans')
        .select('checkpoint_id, scanned_at')
        .eq('patrol_log_id', data.id);
      setScans(scansData || []);
    }

    const { data: cps } = await supabase
      .from('patrol_checkpoints')
      .select('*')
      .eq('site_id', todayShift.site_id)
      .order('order_index', { ascending: true });
    setCheckpoints(cps || []);
  }, [todayShift, guardId]);

  useEffect(() => {
    if (isClockedIn) loadPatrol();
  }, [isClockedIn, loadPatrol]);

  async function startPatrol() {
    if (!todayShift || !guardId || !companyId) return;
    setLoading(true);

    const { data } = await supabase
      .from('patrol_logs')
      .insert({
        company_id: companyId,
        site_id: todayShift.site_id,
        shift_id: todayShift.id,
        guard_id: guardId,
        start_time: new Date().toISOString(),
        status: 'active',
      })
      .select()
      .maybeSingle();

    if (data) {
      setPatrolLogId(data.id);
      setPatrolTimer(0);
      if (navigator.vibrate) navigator.vibrate([150, 50, 150]);
    }

    setLoading(false);
  }

  async function scanCheckpoint(cp: Checkpoint) {
    if (!patrolLogId || !companyId) return;
    setChecking(true);

    let lat: number | null = null;
    let lng: number | null = null;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      );
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
    } catch { /* no location */ }

    await supabase.from('patrol_checkpoint_scans').insert({
      company_id: companyId,
      patrol_log_id: patrolLogId,
      checkpoint_id: cp.id,
      lat,
      lng,
    });

    setScans((prev) => [...prev, { checkpoint_id: cp.id, scanned_at: new Date().toISOString() }]);
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1500);
    setChecking(false);
  }

  async function endPatrol() {
    if (!patrolLogId) return;
    setLoading(true);

    await supabase.from('patrol_logs').update({
      status: 'completed',
      end_time: new Date().toISOString(),
      checkpoints_total: checkpoints.length,
      checkpoints_completed: scans.length,
    }).eq('id', patrolLogId);

    setPatrolLogId(null);
    setPatrolTimer(0);
    setScans([]);
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    setLoading(false);
  }

  function formatPatrolTime(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  if (!isClockedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-4 pb-24">
        <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
          <i className="ri-walk-line text-gray-500 text-3xl"></i>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Patrol</h2>
        <p className="text-sm text-gray-400 text-center">Clock in first to start a patrol.</p>
        <button
          onClick={() => router.push('/guard')}
          className="mt-6 h-14 px-8 bg-gradient-to-r from-[#3b82f6] to-blue-600 text-white font-semibold rounded-2xl cursor-pointer active:scale-[0.97] transition-transform"
        >
          Go to Clock In
        </button>
      </div>
    );
  }

  if (!patrolLogId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-4 pb-24">
        <div className="w-24 h-24 bg-gradient-to-br from-[#3b82f6]/20 to-[#3b82f6]/5 border border-[#3b82f6]/20 rounded-2xl flex items-center justify-center mb-4">
          <i className="ri-walk-line text-[#3b82f6] text-4xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Start Patrol</h2>
        <p className="text-sm text-gray-400 text-center mb-1">Begin your site patrol</p>
        <p className="text-sm text-gray-500 text-center mb-8">Scan checkpoints as you go</p>
        <button
          onClick={startPatrol}
          disabled={loading}
          className="w-full max-w-xs h-20 bg-gradient-to-r from-[#3b82f6] to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:opacity-40 text-white font-bold rounded-2xl cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 text-lg"
        >
          {loading ? <i className="ri-loader-4-line animate-spin text-xl"></i> : <i className="ri-play-fill text-xl"></i>}
          Start Patrol
        </button>
      </div>
    );
  }

  const completedCount = checkpoints.filter((cp) => scans.find((s) => s.checkpoint_id === cp.id)).length;
  const progress = checkpoints.length > 0 ? (completedCount / checkpoints.length) * 100 : 0;

  return (
    <div className="flex flex-col min-h-full pb-24">
      {/* Timer + Progress Card */}
      <div className="px-4 pt-4 pb-2">
        <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider">Patrol Time</p>
              <p className="text-4xl font-mono font-bold text-white mt-1 tabular-nums">{formatPatrolTime(patrolTimer)}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Checkpoints</p>
              <p className="text-3xl font-bold text-[#3b82f6] mt-1 tabular-nums">{completedCount}/{checkpoints.length || '?'}</p>
            </div>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#3b82f6] to-blue-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="px-4 py-2">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <i className="ri-check-line text-emerald-400 text-lg"></i>
            </div>
            <p className="text-sm text-emerald-400 font-medium">Checkpoint scanned successfully</p>
          </div>
        </div>
      )}

      {/* Checkpoints List */}
      <div className="px-4 py-2">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Checkpoints</p>
        <div className="space-y-3">
          {checkpoints.map((cp, index) => {
            const scanned = scans.find((s) => s.checkpoint_id === cp.id);
            return (
              <div
                key={cp.id}
                className={`flex items-center p-4 rounded-2xl border transition-all ${
                  scanned
                    ? 'bg-emerald-500/5 border-emerald-500/15'
                    : 'bg-[#1a1a1a] border-white/5'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 mr-4 ${
                  scanned ? 'bg-emerald-500/15' : 'bg-white/5'
                }`}>
                  {scanned ? (
                    <i className="ri-check-double-line text-emerald-400 text-xl"></i>
                  ) : (
                    <span className="text-lg font-bold text-gray-500">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${scanned ? 'text-emerald-400' : 'text-white'}`}>{cp.name}</p>
                  {cp.description && <p className="text-xs text-gray-500 mt-0.5">{cp.description}</p>}
                </div>
                {!scanned && (
                  <button
                    onClick={() => scanCheckpoint(cp)}
                    disabled={checking}
                    className="h-11 px-5 bg-[#3b82f6]/20 text-[#3b82f6] text-sm font-semibold rounded-xl hover:bg-[#3b82f6]/30 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                  >
                    {checking ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-qr-scan-line"></i>}
                    Scan
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {checkpoints.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <i className="ri-map-pin-line text-gray-500 text-2xl"></i>
            </div>
            <p className="text-sm text-gray-400">No checkpoints configured for this site.</p>
          </div>
        )}
      </div>

      {/* End Patrol */}
      <div className="mt-auto px-4 pb-6 pt-4">
        <button
          onClick={endPatrol}
          disabled={loading}
          className="w-full h-16 bg-gradient-to-r from-red-600/20 to-red-600/10 hover:from-red-600/30 text-red-400 font-bold rounded-2xl border border-red-500/20 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? <i className="ri-loader-4-line animate-spin text-lg"></i> : <i className="ri-stop-circle-line text-lg"></i>}
          End Patrol
        </button>
      </div>
    </div>
  );
}