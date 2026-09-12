'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { GuardShift, AttendanceLog } from '@/lib/useGuardPortal';

interface PatrolTabProps {
  todayShift: GuardShift | null;
  activeAttendance: AttendanceLog | null;
  guardId: string | null;
  companyId: string | null;
  activePatrolId?: string | null;
}

interface Checkpoint {
  id: string;
  name: string;
  description: string | null;
  checkpoint_code: string;
  location_label: string | null;
  is_active: boolean;
  requires_photo: boolean;
  requires_comment: boolean;
  gps_capture_status: string;
  patrol_time: string | null;
  patrol_frequency: string | null;
}

interface ScanSummary {
  total: number;
  completed: number;
  gps_verified: number;
  out_of_radius: number;
  needs_review: number;
  photo_count: number;
  comment_count: number;
  scanned_ids: Set<string>;
}

export default function PatrolTab({ todayShift, activeAttendance, guardId, companyId, activePatrolId }: PatrolTabProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [patrolLogId, setPatrolLogId] = useState<string | null>(activePatrolId || searchParams.get('patrol_log_id') || null);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [scanSummary, setScanSummary] = useState<ScanSummary>({
    total: 0, completed: 0, gps_verified: 0, out_of_radius: 0,
    needs_review: 0, photo_count: 0, comment_count: 0, scanned_ids: new Set(),
  });
  const [patrolTimer, setPatrolTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const siteId = todayShift?.site_id || activeAttendance?.site_id;
  const isClockedIn = !!activeAttendance && !activeAttendance.clock_out;

  useEffect(() => {
    if (!patrolLogId) return;
    const interval = setInterval(() => setPatrolTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [patrolLogId]);

  const loadPatrolSession = useCallback(async () => {
    if (!todayShift || !guardId || !companyId) return;

    const { data: checkpointsData } = await supabase
      .from('patrol_checkpoints')
      .select('id, name, description, checkpoint_code, location_label, is_active, requires_photo, requires_comment, gps_capture_status, patrol_time, patrol_frequency')
      .eq('site_id', todayShift.site_id)
      .eq('is_active', true)
      .order('name', { ascending: true });
    setCheckpoints(checkpointsData || []);

    if (!activePatrolId && !searchParams.get('patrol_log_id')) {
      const { data: existingLog } = await supabase
        .from('patrol_logs')
        .select('id, start_time, status')
        .eq('guard_id', guardId)
        .eq('site_id', todayShift.site_id)
        .eq('company_id', companyId)
        .eq('status', 'active')
        .maybeSingle();

      if (existingLog) {
        setPatrolLogId(existingLog.id);
        setPatrolTimer(Math.floor((Date.now() - new Date(existingLog.start_time).getTime()) / 1000));
      }
    }
  }, [todayShift, guardId, companyId, activePatrolId, searchParams]);

  const loadScansForSession = useCallback(async (logId: string) => {
    if (!companyId) return;
    const { data: scansData } = await supabase
      .from('patrol_scans')
      .select('checkpoint_id, gps_verified, gps_status, scan_status, photo_url, comment')
      .eq('patrol_log_id', logId)
      .eq('company_id', companyId);

    const scans = scansData || [];
    const scannedIds = new Set<string>(scans.map((s: any) => s.checkpoint_id));
    const summary: ScanSummary = {
      total: checkpoints.length || scans.length,
      completed: scannedIds.size,
      gps_verified: scans.filter((s: any) => s.gps_verified).length,
      out_of_radius: scans.filter((s: any) => s.gps_status === 'outside_radius').length,
      needs_review: scans.filter((s: any) => s.scan_status === 'manual_review').length,
      photo_count: scans.filter((s: any) => s.photo_url).length,
      comment_count: scans.filter((s: any) => s.comment).length,
      scanned_ids: scannedIds,
    };
    setScanSummary(summary);
  }, [companyId, checkpoints.length]);

  useEffect(() => {
    if (isClockedIn) loadPatrolSession();
  }, [isClockedIn, loadPatrolSession]);

  useEffect(() => {
    if (patrolLogId) loadScansForSession(patrolLogId);
  }, [patrolLogId, loadScansForSession]);

  useEffect(() => {
    if (patrolLogId && checkpoints.length > 0) {
      setScanSummary(prev => ({ ...prev, total: checkpoints.length }));
    }
  }, [checkpoints.length, patrolLogId]);

  async function startPatrol() {
    if (!todayShift || !guardId || !companyId) return;
    setLoading(true);

    const { data: existingActive } = await supabase
      .from('patrol_logs')
      .select('id, site_id')
      .eq('guard_id', guardId)
      .eq('site_id', todayShift.site_id)
      .eq('company_id', companyId)
      .eq('status', 'active')
      .maybeSingle();

    if (existingActive) {
      setPatrolLogId(existingActive.id);
      setPatrolTimer(0);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('patrol_logs')
      .insert({
        company_id: companyId,
        site_id: todayShift.site_id,
        shift_id: todayShift.id,
        guard_id: guardId,
        start_time: new Date().toISOString(),
        status: 'active',
        checkpoints_total: checkpoints.length,
      })
      .select()
      .maybeSingle();

    if (data) {
      setPatrolLogId(data.id);
      setPatrolTimer(0);
      if (navigator.vibrate) navigator.vibrate([150, 50, 150]);
      setSuccessMessage('Patrol started');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
    }

    setLoading(false);
  }

  function navigateToScan(cp: Checkpoint) {
    if (!patrolLogId) return;
    router.push(`/guard/patrol/scan/${cp.checkpoint_code}?patrol_log_id=${patrolLogId}`);
  }

  async function endPatrol() {
    if (!patrolLogId || !companyId) return;
    setLoading(true);

    const { data: finalScans } = await supabase
      .from('patrol_scans')
      .select('checkpoint_id, gps_verified, gps_status, scan_status, photo_url, comment')
      .eq('patrol_log_id', patrolLogId)
      .eq('company_id', companyId);

    const scans = finalScans || [];
    const scannedIds = new Set(scans.map((s: any) => s.checkpoint_id));
    const completedCount = scannedIds.size;
    const gpsVerified = scans.filter((s: any) => s.gps_verified).length;
    const outOfRadius = scans.filter((s: any) => s.gps_status === 'outside_radius').length;
    const needsReview = scans.filter((s: any) => s.scan_status === 'manual_review').length;
    const missedCount = Math.max(0, checkpoints.length - completedCount);
    const photoCount = scans.filter((s: any) => s.photo_url).length;
    const commentCount = scans.filter((s: any) => s.comment).length;
    const startTime = patrolTimer > 0 ? new Date(Date.now() - patrolTimer * 1000).toISOString() : new Date().toISOString();
    const duration = patrolTimer;

    const { data: logRecord } = await supabase
      .from('patrol_logs')
      .select('start_time')
      .eq('id', patrolLogId)
      .maybeSingle();

    const actualStart = logRecord?.start_time || startTime;
    const actualDuration = logRecord?.start_time
      ? Math.floor((Date.now() - new Date(logRecord.start_time).getTime()) / 1000)
      : duration;

    await supabase
      .from('patrol_logs')
      .update({
        status: 'completed',
        end_time: new Date().toISOString(),
        ended_at: new Date().toISOString(),
        checkpoints_total: checkpoints.length,
        checkpoints_completed: completedCount,
        gps_verified_count: gpsVerified,
        out_of_radius_count: outOfRadius,
        needs_review_count: needsReview,
        missed_checkpoints: missedCount,
        duration_seconds: actualDuration,
        photo_count: photoCount,
        comment_count: commentCount,
      })
      .eq('id', patrolLogId)
      .eq('company_id', companyId);

    setPatrolLogId(null);
    setPatrolTimer(0);
    setScanSummary({ total: 0, completed: 0, gps_verified: 0, out_of_radius: 0, needs_review: 0, photo_count: 0, comment_count: 0, scanned_ids: new Set() });
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
        <button onClick={() => router.push('/guard')} className="mt-6 h-14 px-8 bg-gradient-to-r from-[#3b82f6] to-blue-600 text-white font-semibold rounded-2xl cursor-pointer active:scale-[0.97] transition-transform whitespace-nowrap">Go to Clock In</button>
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
        <button onClick={startPatrol} disabled={loading} className="w-full max-w-xs h-20 bg-gradient-to-r from-[#3b82f6] to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:opacity-40 text-white font-bold rounded-2xl cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 text-lg whitespace-nowrap">
          {loading ? <i className="ri-loader-4-line animate-spin text-xl"></i> : <i className="ri-play-fill text-xl"></i>}
          Start Patrol
        </button>
      </div>
    );
  }

  const progress = scanSummary.total > 0 ? (scanSummary.completed / scanSummary.total) * 100 : 0;

  return (
    <div className="flex flex-col min-h-full pb-24">
      <div className="px-4 pt-4 pb-2">
        <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-xs uppercase tracking-wider">Patrol Time</p>
              <p className="text-4xl font-mono font-bold text-white mt-1 tabular-nums">{formatPatrolTime(patrolTimer)}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs uppercase tracking-wider">Checkpoints</p>
              <p className="text-3xl font-bold text-[#3b82f6] mt-1 tabular-nums">{scanSummary.completed}/{scanSummary.total || '?'}</p>
            </div>
          </div>

          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden mb-4">
            <div className="bg-gradient-to-r from-[#3b82f6] to-blue-400 h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="bg-emerald-500/10 rounded-lg p-2 text-center">
              <p className="text-emerald-400 text-lg font-bold tabular-nums">{scanSummary.gps_verified}</p>
              <p className="text-[10px] text-emerald-400/70">Verified</p>
            </div>
            <div className="bg-amber-500/10 rounded-lg p-2 text-center">
              <p className="text-amber-400 text-lg font-bold tabular-nums">{scanSummary.out_of_radius}</p>
              <p className="text-[10px] text-amber-400/70">Out Radius</p>
            </div>
            <div className="bg-blue-500/10 rounded-lg p-2 text-center">
              <p className="text-blue-400 text-lg font-bold tabular-nums">{scanSummary.needs_review}</p>
              <p className="text-[10px] text-blue-400/70">Review</p>
            </div>
            <div className="bg-purple-500/10 rounded-lg p-2 text-center">
              <p className="text-purple-400 text-lg font-bold tabular-nums">{scanSummary.photo_count}</p>
              <p className="text-[10px] text-purple-400/70">Photos</p>
            </div>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="px-4 py-2">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center"><i className="ri-check-line text-emerald-400 text-lg"></i></div>
            <p className="text-sm text-emerald-400 font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      <div className="px-4 py-2">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Checkpoints</p>
        <div className="space-y-3">
          {checkpoints.map((cp, index) => {
            const scanned = scanSummary.scanned_ids.has(cp.id);
            return (
              <div key={cp.id} className={`flex items-center p-4 rounded-2xl border transition-all ${scanned ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-[#1a1a1a] border-white/5'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 mr-4 ${scanned ? 'bg-emerald-500/15' : 'bg-white/5'}`}>
                  {scanned ? <i className="ri-check-double-line text-emerald-400 text-xl"></i> : <span className="text-lg font-bold text-gray-500">{index + 1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${scanned ? 'text-emerald-400' : 'text-white'}`}>{cp.name}</p>
                  {cp.location_label && <p className="text-xs text-gray-500 mt-0.5">{cp.location_label}</p>}
                  {cp.description && <p className="text-xs text-gray-600">{cp.description}</p>}
                  {!scanned && cp.gps_capture_status === 'pending' && <p className="text-[10px] text-amber-500 mt-0.5">GPS not activated</p>}
                </div>
                <div className="flex items-center gap-1.5">
                  {cp.requires_photo && <span className="text-[10px] text-blue-400"><i className="ri-camera-line"></i></span>}
                  {cp.requires_comment && <span className="text-[10px] text-blue-400"><i className="ri-chat-1-line"></i></span>}
                  {!scanned && (
                    <button onClick={() => navigateToScan(cp)} className="h-11 px-5 bg-[#3b82f6]/20 text-[#3b82f6] text-sm font-semibold rounded-xl hover:bg-[#3b82f6]/30 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ml-2">
                      <i className="ri-qr-scan-line"></i>Scan
                    </button>
                  )}
                  {scanned && (
                    <button onClick={() => navigateToScan(cp)} className="h-11 px-4 text-emerald-400/60 text-sm font-medium rounded-xl hover:bg-emerald-500/10 active:scale-95 transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap ml-2">
                      <i className="ri-refresh-line"></i>Re-scan
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {checkpoints.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3"><i className="ri-map-pin-line text-gray-500 text-2xl"></i></div>
            <p className="text-sm text-gray-400">No checkpoints configured for this site.</p>
          </div>
        )}
      </div>

      <div className="mt-auto px-4 pb-6 pt-4">
        <button onClick={endPatrol} disabled={loading} className="w-full h-16 bg-gradient-to-r from-red-600/20 to-red-600/10 hover:from-red-600/30 text-red-400 font-bold rounded-2xl border border-red-500/20 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap">
          {loading ? <i className="ri-loader-4-line animate-spin text-lg"></i> : <i className="ri-stop-circle-line text-lg"></i>}
          End Patrol
        </button>
      </div>
    </div>
  );
}