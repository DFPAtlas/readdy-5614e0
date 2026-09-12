'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface PanicButtonProps {
  companyId: string | null;
  siteId: string | null;
  guardId: string | null;
  guardName: string;
}

export default function PanicButton({ companyId, siteId, guardId, guardName }: PanicButtonProps) {
  const router = useRouter();
  const [pressed, setPressed] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [sent, setSent] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handlePressStart() {
    if (!companyId || !siteId || !guardId) return;
    setPressed(true);
    setConfirming(false);
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
      triggerPanic();
    }, 3000);
  }

  function handlePressEnd() {
    if (!pressed) return;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    if (!confirming && !sent) {
      setConfirming(true);
      setPressed(false);
    }
  }

  async function triggerPanic() {
    if (!companyId || !siteId || !guardId) return;
    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 500]);
    setPressed(false);
    setConfirming(false);
    setSent(true);

    const { supabase } = await import('@/lib/supabase');

    let loc: { lat: number; lng: number } | null = null;
    try {
      const pos: GeolocationPosition = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000 });
      });
      loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch {}

    await supabase.from('occurrence_books').insert({
      company_id: companyId,
      site_id: siteId,
      guard_id: guardId,
      entry_type: 'SOS / Emergency',
      entry: `EMERGENCY SOS ALERT: Panic alarm activated by ${guardName} at ${new Date().toLocaleTimeString('en-GB')}. GPS: ${loc ? `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}` : 'Not available'}.`,
      occurred_at: new Date().toISOString(),
    });

    await supabase.from('ai_activity_logs').insert({
      company_id: companyId,
      guard_id: guardId,
      action_type: 'sos_panic_alarm',
      details: { site_id: siteId, guard_name: guardName, gps: loc, time: new Date().toISOString() },
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
        company_id: companyId,
        site_id: siteId,
        guard_id: guardId,
        guard_name: guardName,
        lat: loc?.lat || null,
        lng: loc?.lng || null,
      }),
    }).catch(() => {});
  }

  function cancelPanic() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    setPressed(false);
    setConfirming(false);
    setSent(false);
  }

  return (
    <>
      {/* Panic button — bottom-right floating, above nav */}
      <button
        onPointerDown={handlePressStart}
        onPointerUp={handlePressEnd}
        onPointerLeave={handlePressEnd}
        onTouchStart={(e) => { e.preventDefault(); handlePressStart(); }}
        onTouchEnd={(e) => { e.preventDefault(); handlePressEnd(); }}
        className="fixed bottom-20 right-4 z-40 w-16 h-16 rounded-full bg-red-600 border-4 border-red-500/30 shadow-lg shadow-red-900/40 flex items-center justify-center cursor-pointer select-none active:scale-95 transition-transform"
        aria-label="Panic button — hold for 3 seconds to trigger alarm"
      >
        <div className="w-6 h-6 flex items-center justify-center text-white">
          <i className="ri-alarm-warning-line text-xl"></i>
        </div>
      </button>

      {/* Press-and-hold countdown overlay */}
      {pressed && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="w-28 h-28 rounded-full border-4 border-red-500/40 flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 rounded-full bg-red-500/10 animate-pulse"></div>
              <span className="text-5xl font-bold text-white">{countdown}</span>
            </div>
            <p className="text-xl font-bold text-red-400 mb-2">Hold to trigger panic</p>
            <p className="text-sm text-gray-400">Release to cancel</p>
          </div>
        </div>
      )}

      {/* Confirm after short press */}
      {confirming && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center px-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-sm">
            <div className="w-14 h-14 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <div className="w-7 h-7 flex items-center justify-center">
                <i className="ri-alarm-warning-line text-red-400 text-2xl"></i>
              </div>
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-2">Confirm Panic Alarm</h3>
            <p className="text-sm text-gray-400 text-center mb-6">
              This will immediately alert operations and log an emergency. Only use in genuine emergencies.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelPanic}
                className="flex-1 h-14 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl cursor-pointer transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={triggerPanic}
                className="flex-1 h-14 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl cursor-pointer transition-colors whitespace-nowrap"
              >
                Trigger Alarm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sent confirmation */}
      {sent && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center px-4">
          <div className="w-24 h-24 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 animate-pulse">
            <div className="w-10 h-10 flex items-center justify-center">
              <i className="ri-alarm-warning-line text-red-400 text-4xl"></i>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Panic Alarm Sent</h2>
          <p className="text-base text-gray-400 text-center mb-1">Operations has been notified immediately.</p>
          <p className="text-sm text-gray-500 text-center mb-8">Stay safe. Help is on the way.</p>
          <button
            onClick={() => { setSent(false); router.push('/guard'); }}
            className="w-full max-w-xs h-14 bg-[#3b82f6] hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            Return to Home
          </button>
        </div>
      )}
    </>
  );
}