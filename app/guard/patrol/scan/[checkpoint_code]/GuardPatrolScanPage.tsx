'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function GuardPatrolScanPage({ checkpointCode }: { checkpointCode: string }) {
  const router = useRouter();
  const { currentUser, profile, session, company } = useAuth();

  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkpoint, setCheckpoint] = useState<any>(null);
  const [gpsStatus, setGpsStatus] = useState<'ready' | 'searching' | 'error' | 'unavailable'>('searching');

  const code = checkpointCode.toUpperCase().trim();

  useEffect(() => {
    if (!code) return;
    if (!session?.access_token) return;

    const loadCheckpoint = async () => {
      const { data } = await supabase
        .from('patrol_checkpoints')
        .select('*, sites(site_name)')
        .eq('checkpoint_code', code)
        .eq('is_active', true)
        .maybeSingle();
      setCheckpoint(data);
      setLoading(false);
    };
    loadCheckpoint();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => setGpsStatus('ready'),
        () => setGpsStatus('error'),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setGpsStatus('unavailable');
    }
  }, [code, session]);

  useEffect(() => {
    if (!currentUser && !profile) {
      router.replace(`/login/guard?redirect=${encodeURIComponent(`/guard/patrol/scan/${code}`)}`);
    }
  }, [currentUser, profile, router, code]);

  const authLoading = !currentUser && !profile;

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

  if (!checkpoint) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-red-400 text-3xl"></i>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Checkpoint Not Found</h2>
          <p className="text-sm text-gray-400 mb-6">
            This QR code is invalid, inactive, or has been removed. Please scan a valid checkpoint QR code.
          </p>
          <button
            onClick={() => router.push('/guard/patrol')}
            className="w-full h-14 bg-gradient-to-r from-[#3b82f6] to-blue-600 text-white font-semibold rounded-2xl cursor-pointer"
          >
            Back to Patrol
          </button>
        </div>
      </div>
    );
  }

  async function performScan() {
    if (!session?.access_token) return;
    setScanning(true);
    setError(null);
    setResult(null);

    let gps_lat: number | null = null;
    let gps_lng: number | null = null;
    let gps_acc: number | null = null;

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        })
      );
      gps_lat = pos.coords.latitude;
      gps_lng = pos.coords.longitude;
      gps_acc = pos.coords.accuracy;
    } catch {
      // GPS unavailable, proceed
    }

    const deviceInfo = `${navigator.platform} | ${navigator.userAgent.slice(0, 100)}`;

    try {
      const funcUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/guard-scan-checkpoint`;
      const res = await fetch(funcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          checkpoint_code: code,
          gps_latitude: gps_lat,
          gps_longitude: gps_lng,
          gps_accuracy: gps_acc,
          device_info: deviceInfo,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        setError(body.error || 'Scan failed. Please try again.');
        setScanning(false);
        return;
      }

      setResult(body);
      if (navigator.vibrate) navigator.vibrate([150, 50, 150]);
    } catch (err: any) {
      setError(err.message || 'Network error. Please try again.');
    }
    setScanning(false);
  }

  if (result?.success) {
    const isSuccess = result.status === 'completed';
    const isWarning = result.status === 'completed_outside_radius';

    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-sm w-full">
          <div className={`w-24 h-24 ${isSuccess ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'} border rounded-3xl flex items-center justify-center mx-auto mb-6`}>
            <i className={`${isSuccess ? 'ri-check-double-line text-emerald-400' : 'ri-map-pin-line text-amber-400'} text-5xl`}></i>
          </div>

          <h2 className={`text-2xl font-bold ${isSuccess ? 'text-emerald-400' : 'text-amber-400'} mb-2`}>
            {isSuccess ? 'Checkpoint Scanned' : 'Scanned Outside Radius'}
          </h2>

          <p className="text-white font-medium mb-1">{result.checkpoint.name}</p>
          <p className="text-sm text-gray-400 mb-6">{checkpoint?.sites?.site_name}</p>

          {isWarning && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-alert-line text-amber-400 text-sm"></i>
                </div>
                <p className="text-sm font-medium text-amber-400">GPS Warning</p>
              </div>
              <p className="text-xs text-amber-300/80">
                You scanned from {Math.round(result.distance)}m away. Expected within {checkpoint?.allowed_radius_meters || 50}m.
              </p>
              <p className="text-xs text-amber-300/60 mt-1">Flagged for supervisor review.</p>
            </div>
          )}

          {result.distance != null && isSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 flex items-center justify-center">
                  <i className="ri-map-pin-2-line text-emerald-400 text-sm"></i>
                </div>
                <p className="text-sm font-medium text-emerald-400">Within Radius</p>
              </div>
              <p className="text-xs text-emerald-300/80">
                Distance: {Math.round(result.distance)}m · Limit: {checkpoint?.allowed_radius_meters || 50}m
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => router.push('/guard/patrol')}
              className="w-full h-14 bg-gradient-to-r from-[#3b82f6] to-blue-600 text-white font-semibold rounded-2xl cursor-pointer"
            >
              Back to Patrol
            </button>
            <button
              onClick={() => {
                setResult(null);
                setError(null);
              }}
              className="w-full h-12 text-sm text-gray-400 hover:text-white cursor-pointer"
            >
              Scan Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center max-w-sm w-full">
        <div className="w-20 h-20 bg-gradient-to-br from-[#3b82f6]/20 to-[#3b82f6]/5 border border-[#3b82f6]/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <i className="ri-qr-scan-2-line text-[#3b82f6] text-4xl"></i>
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">Scan Checkpoint</h2>
        <p className="text-sm text-gray-400 mb-1">{checkpoint.name}</p>
        <p className="text-xs text-gray-500 mb-8">{checkpoint.sites?.site_name} · Code: {code}</p>

        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-4 h-4 flex items-center justify-center">
            {gpsStatus === 'ready' ? (
              <i className="ri-map-pin-2-line text-emerald-400 text-sm"></i>
            ) : gpsStatus === 'searching' ? (
              <i className="ri-map-pin-2-line text-amber-400 text-sm animate-pulse"></i>
            ) : (
              <i className="ri-map-pin-2-line text-red-400 text-sm"></i>
            )}
          </div>
          <span className={`text-xs ${gpsStatus === 'ready' ? 'text-emerald-400' : gpsStatus === 'searching' ? 'text-amber-400' : 'text-red-400'}`}>
            {gpsStatus === 'ready' ? 'GPS Ready' : gpsStatus === 'searching' ? 'Getting GPS...' : gpsStatus === 'unavailable' ? 'GPS Unavailable' : 'GPS Error'}
          </span>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-error-warning-line text-red-400 text-sm"></i>
              </div>
              <p className="text-sm font-medium text-red-400">Scan Failed</p>
            </div>
            <p className="text-xs text-red-300/80">{error}</p>
          </div>
        )}

        <button
          onClick={performScan}
          disabled={scanning}
          className="w-full h-20 bg-gradient-to-r from-[#3b82f6] to-blue-600 hover:from-blue-400 hover:to-blue-500 disabled:opacity-40 text-white font-bold rounded-2xl cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 text-lg"
        >
          {scanning ? (
            <>
              <i className="ri-loader-4-line animate-spin text-xl"></i>
              Scanning...
            </>
          ) : (
            <>
              <i className="ri-fingerprint-line text-xl"></i>
              Confirm Scan
            </>
          )}
        </button>

        <p className="text-xs text-gray-600 mt-4">
          Time will be recorded automatically. Location verified via GPS.
        </p>
      </div>
    </div>
  );
}