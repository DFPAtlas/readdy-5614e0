'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export function useGuardScanCheckpoint() {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const scanCheckpoint = useCallback(async (checkpointCode: string) => {
    if (!session?.access_token) {
      setError('Not authenticated');
      return null;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    // Get GPS
    let gps_lat: number | null = null;
    let gps_lng: number | null = null;
    let gps_acc: number | null = null;

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      );
      gps_lat = pos.coords.latitude;
      gps_lng = pos.coords.longitude;
      gps_acc = pos.coords.accuracy;
    } catch {
      // GPS unavailable, proceed without
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
          checkpoint_code: checkpointCode,
          gps_latitude: gps_lat,
          gps_longitude: gps_lng,
          gps_accuracy: gps_acc,
          device_info: deviceInfo,
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        setError(body.error || 'Scan failed');
        setLoading(false);
        return null;
      }

      setResult(body);
      setLoading(false);
      return body;
    } catch (err: any) {
      setError(err.message || 'Network error');
      setLoading(false);
      return null;
    }
  }, [session]);

  return { scanCheckpoint, loading, error, result, clearResult: () => { setResult(null); setError(null); } };
}