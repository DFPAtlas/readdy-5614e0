'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useGuardAuth } from '@/lib/useGuardAuth';

function ScanContent({ checkpointCode }: { checkpointCode: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    currentUser, profile, guardId, todayShift, activeAttendance,
    isClockedIn, loading: authLoading, companyId,
  } = useGuardAuth();

  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [checkpoint, setCheckpoint] = useState<any>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'ready' | 'searching' | 'error' | 'unavailable' | 'lowAccuracy'>('searching');
  const [comment, setComment] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [needsPhoto, setNeedsPhoto] = useState(false);
  const [needsComment, setNeedsComment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [offlineScan, setOfflineScan] = useState(false);

  const code = checkpointCode.toUpperCase().trim();
  const patrolLogId = searchParams.get('patrol_log_id') || null;

  useEffect(() => {
    if (!code || authLoading) return;

    const loadCheckpoint = async () => {
      const { data } = await supabase
        .from('patrol_checkpoints')
        .select('*, sites!inner(site_name, company_id)')
        .eq('checkpoint_code', code)
        .eq('is_active', true)
        .maybeSingle();

      if (!data) {
        setCheckpoint(null);
        setLoading(false);
        return;
      }

      setCheckpoint(data);
      setNeedsPhoto(!!data.requires_photo);
      setNeedsComment(!!data.requires_comment);
      setLoading(false);
    };
    loadCheckpoint();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (pos.coords.accuracy > 100) setGpsStatus('lowAccuracy');
          else setGpsStatus('ready');
        },
        (err) => {
          if (err.code === err.PERMISSION_DENIED) setGpsStatus('error');
          else setGpsStatus('unavailable');
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    } else {
      setGpsStatus('unavailable');
    }
  }, [code, authLoading]);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.replace(`/login/guard?redirect=${encodeURIComponent(`/guard/patrol/scan/${code}`)}`);
    }
  }, [currentUser, authLoading, router, code]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <i className="ri-loader-4-line animate-spin text-[#3b82f6] text-3xl"></i>
          <p className="text-sm text-gray-500">Loading checkpoint...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <i className="ri-loader-4-line animate-spin text-[#3b82f6] text-3xl"></i>
        </div>
      </div>
    );
  }

  if (!checkpoint) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-red-400 text-3xl"></i>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Checkpoint Not Found</h2>
          <p className="text-sm text-gray-400 mb-6">This QR code is invalid, inactive, or has been removed.</p>
          <button onClick={() => router.push('/guard/patrol')} className="w-full h-14 bg-gradient-to-r from-[#3b82f6] to-blue-600 text-white font-semibold rounded-2xl cursor-pointer whitespace-nowrap">Back to Patrol</button>
        </div>
      </div>
    );
  }

  if (!isClockedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="ri-time-line text-amber-400 text-3xl"></i>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Not Clocked In</h2>
          <p className="text-sm text-gray-400 mb-6">You must be clocked in before scanning checkpoints.</p>
          <button onClick={() => router.push('/guard')} className="w-full h-14 bg-gradient-to-r from-[#3b82f6] to-blue-600 text-white font-semibold rounded-2xl cursor-pointer whitespace-nowrap">Go to Clock In</button>
        </div>
      </div>
    );
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function uploadPhoto(): Promise<string | null> {
    if (!photo) return null;
    const ext = photo.name.split('.').pop() || 'jpg';
    const fileName = `patrol-scan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const path = companyId ? `${companyId}/patrol/${fileName}` : fileName;
    const { data, error } = await supabase.storage.from('incident-media').upload(path, photo, { upsert: false });
    if (error) return null;
    const { data: urlData } = await supabase.storage.from('incident-media').createSignedUrl(path, 60 * 60 * 24 * 7);
    return urlData?.signedUrl || null;
  }

  async function performScan() {
    setScanning(true);
    setScanError(null);
    setResult(null);

    if (needsPhoto && !photo) {
      setScanError('A photo is required for this checkpoint.');
      setScanning(false);
      return;
    }

    if (needsComment && !comment.trim()) {
      setScanError('A comment is required for this checkpoint.');
      setScanning(false);
      return;
    }

    let gpsLat: number | null = null;
    let gpsLng: number | null = null;
    let gpsAcc: number | null = null;

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 })
      );
      gpsLat = pos.coords.latitude;
      gpsLng = pos.coords.longitude;
      gpsAcc = pos.coords.accuracy;
      if (pos.coords.accuracy > 100) setGpsStatus('lowAccuracy');
      else setGpsStatus('ready');
    } catch (err: any) {
      if (err?.code === err?.PERMISSION_DENIED) setGpsStatus('error');
      else setGpsStatus('unavailable');
    }

    let photoUrl: string | null = null;
    if (photo) photoUrl = await uploadPhoto();

    const deviceInfo = navigator.userAgent.slice(0, 250);

    try {
      const session = await supabase.auth.getSession();
      const funcUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/guard-scan-checkpoint`;
      const bodyPayload: any = {
        checkpoint_code: code,
        phone_latitude: gpsLat,
        phone_longitude: gpsLng,
        phone_gps_accuracy_meters: gpsAcc,
        device_user_agent: deviceInfo,
        mode: 'scan',
        photo_url: photoUrl,
        comment: comment.trim() || null,
      };
      if (patrolLogId) bodyPayload.patrol_log_id = patrolLogId;

      const res = await fetch(funcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.data.session?.access_token || ''}`,
        },
        body: JSON.stringify(bodyPayload),
      });

      const body = await res.json();

      if (!res.ok) {
        if (body.requires_photo) setScanError('Photo required. Please take a photo first.');
        else if (body.requires_comment) setScanError('Comment required. Please add a comment first.');
        else if (body.scan_status === 'unassigned_site') setScanError('You are not assigned to this site.');
        else setScanError(body.error || 'Scan failed. Please try again.');
        setScanning(false);
        return;
      }

      setResult(body);
      if (navigator.vibrate) navigator.vibrate([150, 50, 150]);
    } catch {
      setOfflineScan(true);
      setScanError('Could not sync scan. Check your connection and try again.');
    }
    setScanning(false);
  }

  if (result?.success) {
    const gpsStatusLabel = result.gps_status || '';
    const isVerified = result.gps_verified;
    const isWarning = gpsStatusLabel === 'outside_radius';
    const needsReview = ['checkpoint_not_approved', 'gps_unavailable', 'gps_low_accuracy'].includes(gpsStatusLabel);

    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-sm w-full">
          <div className={`w-24 h-24 ${isVerified ? 'bg-emerald-500/10 border-emerald-500/20' : needsReview ? 'bg-blue-500/10 border-blue-500/20' : 'bg-amber-500/10 border-amber-500/20'} border rounded-3xl flex items-center justify-center mx-auto mb-6`}>
            <i className={`${isVerified ? 'ri-check-double-line text-emerald-400' : needsReview ? 'ri-information-line text-blue-400' : 'ri-map-pin-line text-amber-400'} text-5xl`}></i>
          </div>
          <h2 className={`text-2xl font-bold ${isVerified ? 'text-emerald-400' : needsReview ? 'text-blue-400' : 'text-amber-400'} mb-2`}>
            {isVerified ? 'Checkpoint Scanned' : needsReview ? 'Scan Recorded - Review' : 'Scanned Outside Radius'}
          </h2>
          <p className="text-white font-medium mb-1">{result.checkpoint?.name || checkpoint.name}</p>
          <p className="text-sm text-gray-400 mb-6">{checkpoint?.sites?.site_name}</p>

          {isWarning && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-1"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-alert-line text-amber-400 text-sm"></i></div><p className="text-sm font-medium text-amber-400">Outside Approved Radius</p></div>
              <p className="text-xs text-amber-300/80">{Math.round(result.distance)}m away. Expected within {checkpoint?.expected_radius_meters || checkpoint?.allowed_radius_meters || 25}m. Flagged for supervisor review.</p>
            </div>
          )}

          {needsReview && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-1"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-information-line text-blue-400 text-sm"></i></div><p className="text-sm font-medium text-blue-400">Needs Review</p></div>
              <p className="text-xs text-blue-300/80 capitalize">{gpsStatusLabel.replace(/_/g, ' ')}. Your scan was recorded but requires supervisor review.</p>
            </div>
          )}

          {result.distance != null && isVerified && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-1"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-map-pin-2-line text-emerald-400 text-sm"></i></div><p className="text-sm font-medium text-emerald-400">GPS Verified</p></div>
              <p className="text-xs text-emerald-300/80">Distance: {Math.round(result.distance)}m · Limit: {checkpoint?.expected_radius_meters || checkpoint?.allowed_radius_meters || 25}m</p>
            </div>
          )}

          <div className="space-y-3">
            <button onClick={() => {
              if (patrolLogId) router.push(`/guard/patrol?patrol_log_id=${patrolLogId}`);
              else router.push('/guard/patrol');
            }} className="w-full h-14 bg-gradient-to-r from-[#3b82f6] to-blue-600 text-white font-semibold rounded-2xl cursor-pointer whitespace-nowrap">Back to Patrol</button>
            <button onClick={() => { setResult(null); setScanError(null); setComment(''); setPhoto(null); setPhotoPreview(null); }} className="w-full h-12 text-sm text-gray-400 hover:text-white cursor-pointer whitespace-nowrap">Scan Another</button>
          </div>
        </div>
      </div>
    );
  }

  if (offlineScan) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4"><i className="ri-wifi-off-line text-amber-400 text-3xl"></i></div>
          <h2 className="text-xl font-bold text-white mb-2">Sync Failed</h2>
          <p className="text-sm text-gray-400 mb-4">Could not sync scan. Keep this page open and tap Retry when your connection improves.</p>
          <button onClick={() => { setOfflineScan(false); setScanError(null); performScan(); }} className="w-full h-14 bg-gradient-to-r from-[#3b82f6] to-blue-600 text-white font-semibold rounded-2xl cursor-pointer whitespace-nowrap mb-3">Retry Sync</button>
          <button onClick={() => { setOfflineScan(false); setScanError(null); setResult(null); }} className="w-full h-12 text-sm text-gray-400 hover:text-white cursor-pointer whitespace-nowrap">Cancel</button>
        </div>
      </div>
    );
  }

  const gpsLabelMap: Record<string, { icon: string; color: string; label: string }> = {
    ready: { icon: 'ri-map-pin-2-line', color: 'text-emerald-400', label: 'GPS Ready' },
    searching: { icon: 'ri-map-pin-2-line animate-pulse', color: 'text-amber-400', label: 'Getting GPS...' },
    error: { icon: 'ri-map-pin-2-line', color: 'text-red-400', label: 'GPS Denied' },
    unavailable: { icon: 'ri-map-pin-2-line', color: 'text-red-400', label: 'GPS Unavailable' },
    lowAccuracy: { icon: 'ri-map-pin-2-line', color: 'text-amber-400', label: 'Low GPS Accuracy' },
  };
  const gpsLabel = gpsLabelMap[gpsStatus] || gpsLabelMap.unavailable;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-sm w-full">
        <div className="w-20 h-20 bg-gradient-to-br from-[#3b82f6]/20 to-[#3b82f6]/5 border border-[#3b82f6]/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <i className="ri-qr-scan-2-line text-[#3b82f6] text-4xl"></i>
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">Scan Checkpoint</h2>
        <p className="text-sm text-gray-400 mb-1">{checkpoint.name}</p>
        <p className="text-xs text-gray-500 mb-1">{checkpoint.sites?.site_name} · Code: {code}</p>
        {checkpoint.gps_capture_status === 'pending' && <p className="text-xs text-amber-500 mb-3">Checkpoint GPS not yet activated</p>}

        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-4 h-4 flex items-center justify-center"><i className={`${gpsLabel.icon} ${gpsLabel.color} text-sm`}></i></div>
          <span className={`text-xs ${gpsLabel.color}`}>{gpsLabel.label}</span>
        </div>

        {scanError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-1"><div className="w-4 h-4 flex items-center justify-center"><i className="ri-error-warning-line text-red-400 text-sm"></i></div><p className="text-sm font-medium text-red-400">Error</p></div>
            <p className="text-xs text-red-300/80">{scanError}</p>
          </div>
        )}

        {needsPhoto && (
          <div className="mb-4 text-left">
            <p className="text-xs text-gray-400 mb-2">Photo required *</p>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoSelect} className="hidden" />
            {photoPreview ? (
              <div className="relative">
                <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover rounded-xl border border-white/10" />
                <button onClick={() => { setPhoto(null); setPhotoPreview(null); }} className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center cursor-pointer"><i className="ri-close-line text-white text-sm"></i></button>
              </div>
            ) : (
              <button onClick={() => fileInputRef.current?.click()} className="w-full h-24 bg-white/5 border border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#3b82f6]/50 transition-colors whitespace-nowrap">
                <div className="w-6 h-6 flex items-center justify-center"><i className="ri-camera-line text-gray-400 text-lg"></i></div>
                <span className="text-xs text-gray-500">Tap to take photo</span>
              </button>
            )}
          </div>
        )}

        {needsComment && (
          <div className="mb-4 text-left">
            <p className="text-xs text-gray-400 mb-2">Comment required *</p>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#3b82f6] resize-none" placeholder="Describe what you see at this checkpoint..." rows={3} maxLength={500}></textarea>
            <p className="text-[10px] text-gray-600 text-right mt-1">{comment.length}/500</p>
          </div>
        )}

        <button onClick={performScan} disabled={scanning} className="w-full h-20 bg-gradient-to-r from-[#3b82f6] to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:opacity-40 text-white font-bold rounded-2xl cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 text-lg whitespace-nowrap">
          {scanning ? (<><i className="ri-loader-4-line animate-spin text-xl"></i>Scanning...</>) : (<><i className="ri-fingerprint-line text-xl"></i>Confirm Scan</>)}
        </button>

        <p className="text-xs text-gray-600 mt-4">Time recorded automatically. Location verified via GPS.</p>
      </div>
    </div>
  );
}

export default function GuardPatrolScanPage({ checkpointCode }: { checkpointCode: string }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <i className="ri-loader-4-line animate-spin text-[#3b82f6] text-3xl"></i>
      </div>
    }>
      <ScanContent checkpointCode={checkpointCode} />
    </Suspense>
  );
}