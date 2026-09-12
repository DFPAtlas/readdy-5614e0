'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useGuardAuth } from '@/lib/useGuardAuth';

export default function SOSPage() {
  const router = useRouter();
  const g = useGuardAuth();
  const [pressed, setPressed] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handlePressStart() {
    setPressed(true);
    setCountdown(3);
    setSent(false);

    let count = 3;
    timerRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0 && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, 1000);

    timeoutRef.current = setTimeout(() => {
      triggerSOS();
    }, 3000);
  }

  function handlePressEnd() {
    if (!pressed || sent) return;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    setPressed(false);
  }

  async function triggerSOS() {
    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 500]);
    setPressed(false);
    setSent(true);
    setSending(true);

    if (!g.companyId || !g.guardId) {
      setSending(false);
      return;
    }

    let loc: { lat: number; lng: number } | null = null;
    try {
      const pos: GeolocationPosition = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000 });
      });
      loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch {}

    await supabase.from('occurrence_books').insert({
      company_id: g.companyId,
      site_id: g.todayShift?.site_id || null,
      guard_id: g.guardId,
      entry_type: 'SOS / Emergency',
      entry: `EMERGENCY SOS ALERT triggered by ${g.guardName} at ${new Date().toLocaleTimeString('en-GB')}. GPS: ${loc ? `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}` : 'Not available'}. Immediate response required.`,
      occurred_at: new Date().toISOString(),
    });

    await supabase.from('ai_activity_logs').insert({
      company_id: g.companyId,
      guard_id: g.guardId,
      action_type: 'sos_panic_alarm',
      details: { guard_name: g.guardName, site_id: g.todayShift?.site_id, gps: loc, time: new Date().toISOString() },
    });

    const sosUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/sos-emergency-notify`;
    const sessionData = await supabase.auth.getSession();
    const token = sessionData.data.session?.access_token;
    fetch(sosUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        company_id: g.companyId,
        site_id: g.todayShift?.site_id || null,
        guard_id: g.guardId,
        guard_name: g.guardName,
        shift_id: g.todayShift?.id || null,
        lat: loc?.lat || null,
        lng: loc?.lng || null,
      }),
    }).catch(() => {});

    setSending(false);
  }

  if (g.loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <i className="ri-loader-4-line animate-spin text-[#3b82f6] text-2xl"></i>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
        <div className="w-28 h-28 bg-red-500/10 rounded-3xl flex items-center justify-center mb-8 animate-pulse">
          <i className="ri-alarm-warning-line text-red-400 text-5xl"></i>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">SOS Alert Sent</h1>
        <p className="text-base text-gray-400 text-center mb-2">Operations has been notified immediately.</p>
        <p className="text-sm text-gray-500 text-center mb-2">
          {sending ? 'Sending alert...' : 'Incident created, notifications dispatched.'}
        </p>
        <p className="text-sm text-gray-500 text-center mb-12">Stay safe. Help is on the way.</p>
        <button
          onClick={() => { setSent(false); router.push('/guard'); }}
          className="w-full max-w-xs h-16 bg-[#3b82f6] hover:bg-blue-500 text-white font-bold rounded-2xl transition-all active:scale-[0.98] cursor-pointer whitespace-nowrap"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      <div className="mb-8 text-center">
        <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">Emergency</p>
        <h1 className="text-2xl font-bold text-white">SOS Panic Alarm</h1>
        <p className="text-sm text-gray-400 mt-2">Hold the button for 3 seconds to trigger</p>
      </div>

      <button
        onPointerDown={handlePressStart}
        onPointerUp={handlePressEnd}
        onPointerLeave={handlePressEnd}
        onTouchStart={(e) => { e.preventDefault(); handlePressStart(); }}
        onTouchEnd={(e) => { e.preventDefault(); handlePressEnd(); }}
        className="w-40 h-40 rounded-full bg-gradient-to-br from-red-500 to-red-700 border-4 border-red-400/30 shadow-2xl shadow-red-900/50 flex flex-col items-center justify-center cursor-pointer select-none active:scale-95 transition-transform relative"
      >
        {pressed && (
          <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
        )}
        <div className="relative z-10 flex flex-col items-center">
          <i className="ri-alarm-warning-line text-white text-3xl mb-1"></i>
          <span className="text-white font-bold text-lg">
            {pressed ? countdown : 'SOS'}
          </span>
        </div>
      </button>

      {pressed && (
        <p className="mt-8 text-red-400 text-sm font-medium animate-pulse">Release to cancel</p>
      )}

      <button
        onClick={() => router.push('/guard')}
        className="mt-12 h-14 px-8 text-gray-500 font-medium cursor-pointer whitespace-nowrap"
      >
        Cancel
      </button>
    </div>
  );
}