'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useGuardAuth } from '@/lib/useGuardAuth';

const INTERVALS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '60 min' },
];

const CHECK_METHODS = [
  { value: 'safe', label: 'I am Safe', icon: 'ri-shield-check-line', color: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' },
  { value: 'support', label: 'Need Support', icon: 'ri-question-line', color: 'bg-amber-500/15 border-amber-500/40 text-amber-400' },
  { value: 'emergency', label: 'Emergency', icon: 'ri-alarm-warning-line', color: 'bg-red-500/15 border-red-500/40 text-red-400' },
];

interface ActiveSession {
  id: string;
  status: string;
  check_in_interval_minutes: number;
  session_start: string;
  last_check_in_at: string | null;
  next_check_in_due_at: string | null;
  total_check_ins: number;
  missed_check_ins: number;
  escalation_level: number;
  alarm_triggered_at: string | null;
}

export default function LoneWorkerPage() {
  const g = useGuardAuth();
  const router = useRouter();

  const [session, setSession] = useState<ActiveSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [method, setMethod] = useState<'safe' | 'support' | 'emergency'>('safe');
  const [note, setNote] = useState('');
  const [interval, setInterval] = useState(30);
  const [showStartForm, setShowStartForm] = useState(false);
  const [checkins, setCheckins] = useState<any[]>([]);
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);

  const fetchSession = useCallback(async () => {
    if (!g.guardId) return;

    const { data, error } = await supabase
      .from('lone_worker_sessions')
      .select('*')
      .eq('guard_id', g.guardId)
      .eq('status', 'active')
      .order('session_start', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setSession(data as ActiveSession);
      setShowStartForm(false);
    } else {
      setSession(null);
      setShowStartForm(true);
    }

    const { data: history } = await supabase
      .from('lone_worker_checkins')
      .select('*')
      .eq('guard_id', g.guardId)
      .order('checked_in_at', { ascending: false })
      .limit(20);

    setCheckins(history || []);
    setLoading(false);
  }, [g.guardId]);

  useEffect(() => {
    if (!g.guardId) return;
    fetchSession();
  }, [g.guardId, fetchSession]);

  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      fetchSession();
    }, 30000);
    return () => clearInterval(interval);
  }, [session?.id, fetchSession]);

  const handleStartSession = async () => {
    if (!g.guardId || !g.companyId) return;
    setStarting(true);

    try {
      let loc: { lat: number; lng: number } | null = null;
      try {
        const pos: GeolocationPosition = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000 });
        });
        loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setGps(loc);
      } catch {}

      const now = new Date();
      const dueAt = new Date(now.getTime() + interval * 60000);

      const { data, error } = await supabase
        .from('lone_worker_sessions')
        .insert({
          guard_id: g.guardId,
          company_id: g.companyId,
          site_id: g.todayShift?.site_id || null,
          shift_id: g.todayShift?.id || null,
          check_in_interval_minutes: interval,
          session_start: now.toISOString(),
          status: 'active',
          next_check_in_due_at: dueAt.toISOString(),
          total_check_ins: 0,
          missed_check_ins: 0,
          escalation_level: 0,
          last_lat: loc?.lat || null,
          last_lng: loc?.lng || null,
        })
        .select('*')
        .maybeSingle();

      if (!error && data) {
        setSession(data as ActiveSession);
        setShowStartForm(false);
        setToast('Lone worker session started');
        if (navigator.vibrate) navigator.vibrate(50);
      } else {
        setToast('Failed to start session');
      }
    } catch {
      setToast('Failed to start session');
    } finally {
      setStarting(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleEndSession = async () => {
    if (!session) return;
    setEnding(true);

    const { error } = await supabase
      .from('lone_worker_sessions')
      .update({
        status: 'ended',
        session_end: new Date().toISOString(),
      })
      .eq('id', session.id);

    if (!error) {
      setSession(null);
      setShowStartForm(true);
      setToast('Session ended. You are no longer being monitored.');
      if (navigator.vibrate) navigator.vibrate(50);
    } else {
      setToast('Failed to end session');
    }

    setEnding(false);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCheckIn = async () => {
    if (!g.guardId || !g.companyId || !session) return;
    setSubmitting(true);

    let loc: { lat: number; lng: number } | null = null;
    try {
      const pos: GeolocationPosition = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000 });
      });
      loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setGps(loc);
    } catch {}

    const now = new Date();
    const dueAt = new Date(now.getTime() + interval * 60000);

    const { error } = await supabase.from('lone_worker_checkins').insert({
      session_id: session.id,
      guard_id: g.guardId,
      checked_in_at: now.toISOString(),
      method,
      lat: loc?.lat ?? null,
      lng: loc?.lng ?? null,
      note: note.trim() || null,
    });

    if (!error) {
      await supabase
        .from('lone_worker_sessions')
        .update({
          last_check_in_at: now.toISOString(),
          next_check_in_due_at: dueAt.toISOString(),
          total_check_ins: (session.total_check_ins || 0) + 1,
          last_lat: loc?.lat || undefined,
          last_lng: loc?.lng || undefined,
        })
        .eq('id', session.id);

      const msg = method === 'emergency'
        ? 'Emergency escalation logged — supervisor notified'
        : method === 'support'
        ? 'Support request logged — supervisor will be notified'
        : 'Check-in confirmed — you are safe';

      setToast(msg);
      setNote('');

      if (method === 'emergency') {
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
      }

      fetchSession();
      if (navigator.vibrate) navigator.vibrate(100);
    } else {
      setToast('Failed to log check-in');
    }

    setSubmitting(false);
    setTimeout(() => setToast(null), 3000);
  };

  const getStatusColor = () => {
    if (!session) return 'text-gray-400';
    if (session.alarm_triggered_at) return 'text-red-400';
    if (session.escalation_level >= 2) return 'text-orange-400';
    if (session.missed_check_ins > 0) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const getStatusLabel = () => {
    if (!session) return 'Not Active';
    if (session.alarm_triggered_at) return 'Alarm Triggered';
    if (session.escalation_level >= 2) return 'Supervisor Alerted';
    if (session.missed_check_ins > 0) return 'Warning';
    return 'Active';
  };

  const getDueInfo = () => {
    if (!session?.next_check_in_due_at) return null;
    const diff = Math.floor((new Date(session.next_check_in_due_at).getTime() - Date.now()) / 60000);
    if (diff < 0) return { label: 'OVERDUE', color: 'text-red-400', urgent: true };
    if (diff < 5) return { label: `Due in ${diff}m`, color: 'text-amber-400', urgent: true };
    return { label: `Due in ${diff}m`, color: 'text-gray-400', urgent: false };
  };

  if (g.loading || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const dueInfo = getDueInfo();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex items-center px-4 h-14 border-b border-white/5">
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer">
          <i className="ri-arrow-left-line"></i>
        </button>
        <h1 className="text-base font-semibold ml-2">Lone Worker</h1>
        {session && (
          <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold ${session.alarm_triggered_at ? 'bg-red-500/10 text-red-400' : session.escalation_level >= 2 ? 'bg-orange-500/10 text-orange-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
            {getStatusLabel()}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {toast && (
          <div className="px-4 pt-3">
            <div className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${
              method === 'emergency' ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                : method === 'support' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            }`}>
              <div className="w-5 h-5 flex items-center justify-center">
                <i className={method === 'emergency' ? 'ri-alarm-warning-line' : method === 'support' ? 'ri-question-line' : 'ri-check-line'}></i>
              </div>
              {toast}
            </div>
          </div>
        )}

        <div className="px-4 pt-6 space-y-4">
          {showStartForm ? (
            <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 space-y-5">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <i className="ri-shield-user-line text-blue-400 text-2xl"></i>
                </div>
                <h2 className="text-lg font-bold text-white">Start Lone Worker Session</h2>
                <p className="text-sm text-gray-400 mt-1">Regular check-ins keep you safe. Missed checks escalate automatically.</p>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-2 block">Check-in Interval</label>
                <div className="grid grid-cols-3 gap-3">
                  {INTERVALS.map((iv) => (
                    <button
                      key={iv.value}
                      onClick={() => setInterval(iv.value)}
                      className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        interval === iv.value ? 'bg-blue-500/10 border-blue-500/40' : 'bg-white/[0.02] border-white/5'
                      }`}
                    >
                      <span className={`text-lg font-bold ${interval === iv.value ? 'text-blue-400' : 'text-gray-400'}`}>{iv.value}</span>
                      <span className={`text-xs ${interval === iv.value ? 'text-blue-400' : 'text-gray-500'}`}>{iv.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {g.todayShift && (
                <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <i className="ri-building-line text-emerald-400 text-sm"></i>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Current Site</p>
                    <p className="text-sm font-medium text-white">You are on shift today</p>
                  </div>
                </div>
              )}

              <button
                onClick={handleStartSession}
                disabled={starting}
                className="w-full h-14 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white font-semibold rounded-xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                {starting ? (
                  <i className="ri-loader-4-line animate-spin text-lg"></i>
                ) : (
                  <>
                    <div className="w-5 h-5 flex items-center justify-center">
                      <i className="ri-play-circle-line"></i>
                    </div>
                    Start Lone Worker Session
                  </>
                )}
              </button>
            </div>
          ) : session ? (
            <>
              <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Session Status</p>
                    <p className={`text-lg font-bold ${getStatusColor()}`}>{getStatusLabel()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Interval</p>
                    <p className="text-sm font-medium text-white">{session.check_in_interval_minutes} min</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Total Checks</p>
                    <p className="text-lg font-bold text-white">{session.total_check_ins || 0}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Missed</p>
                    <p className={`text-lg font-bold ${session.missed_check_ins > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{session.missed_check_ins || 0}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-500 mb-1">Escalation</p>
                    <p className={`text-lg font-bold ${session.escalation_level >= 2 ? 'text-red-400' : session.escalation_level >= 1 ? 'text-amber-400' : 'text-gray-400'}`}>
                      L{ session.escalation_level || 0}
                    </p>
                  </div>
                </div>

                {dueInfo && (
                  <div className={`rounded-xl p-4 flex items-center gap-3 ${dueInfo.urgent ? 'bg-red-500/10 border border-red-500/20' : 'bg-white/5'}`}>
                    <div className={`w-10 h-10 rounded-xl ${dueInfo.urgent ? 'bg-red-500/20' : 'bg-white/10'} flex items-center justify-center`}>
                      <i className={`ri-time-line ${dueInfo.color} text-lg`}></i>
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${dueInfo.color}`}>{dueInfo.label}</p>
                      <p className="text-xs text-gray-400">{dueInfo.urgent ? 'Check in now to avoid escalation' : 'Next check-in deadline'}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleEndSession}
                  disabled={ending}
                  className="w-full h-12 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-30 text-red-400 font-medium rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-red-500/20"
                >
                  {ending ? (
                    <i className="ri-loader-4-line animate-spin"></i>
                  ) : (
                    <>
                      <div className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-stop-circle-line"></i>
                      </div>
                      End Lone Worker Session
                    </>
                  )}
                </button>
              </div>

              <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white">Check In Now</h3>

                <div className="grid grid-cols-1 gap-3">
                  {CHECK_METHODS.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setMethod(m.value as 'safe' | 'support' | 'emergency')}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                        method === m.value ? m.color : 'bg-white/[0.02] border-white/5'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl ${method === m.value ? m.color.split(' ')[0] : 'bg-white/5'} flex items-center justify-center`}>
                        <i className={`${m.icon} ${method === m.value ? m.color.split(' ')[2] : 'text-gray-400'} text-lg`}></i>
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-semibold ${method === m.value ? m.color.split(' ')[2] : 'text-white'}`}>{m.label}</p>
                        <p className="text-xs text-gray-400">
                          {m.value === 'emergency' ? 'Immediate escalation to supervisor' : m.value === 'support' ? 'Non-urgent assistance needed' : 'Routine check-in — everything is OK'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Notes (optional)</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/40 resize-none"
                    rows={2}
                    placeholder={method === 'emergency' ? 'Describe the situation...' : method === 'support' ? 'What help do you need?' : 'Any notes for your supervisor?'}
                    maxLength={500}
                  />
                </div>

                <button
                  onClick={handleCheckIn}
                  disabled={submitting}
                  className={`w-full h-14 rounded-xl font-semibold transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 ${
                    method === 'emergency'
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : method === 'support'
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  } disabled:opacity-30`}
                >
                  {submitting ? (
                    <i className="ri-loader-4-line animate-spin text-lg"></i>
                  ) : (
                    <>
                      <div className="w-5 h-5 flex items-center justify-center">
                        <i className={method === 'emergency' ? 'ri-alarm-warning-line' : method === 'support' ? 'ri-send-plane-line' : 'ri-check-line'}></i>
                      </div>
                      {method === 'emergency' ? 'Send Emergency Alert' : method === 'support' ? 'Request Support' : 'Check In — I am Safe'}
                    </>
                  )}
                </button>
              </div>
            </>
          ) : null}

          {checkins.length > 0 && (
            <div>
              <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-3 px-1">Recent Check-Ins</h4>
              <div className="space-y-2">
                {checkins.slice(0, 10).map((c) => (
                  <div key={c.id} className="bg-[#1a1a1a] border border-white/5 rounded-xl p-3 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      c.method === 'emergency' ? 'bg-red-500/15' : c.method === 'support' ? 'bg-amber-500/15' : 'bg-emerald-500/15'
                    }`}>
                      <i className={`${
                        c.method === 'emergency' ? 'ri-alarm-warning-line text-red-400' : c.method === 'support' ? 'ri-question-line text-amber-400' : 'ri-check-line text-emerald-400'
                      } text-sm`}></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-white font-medium capitalize">{c.method === 'emergency' ? 'Emergency' : c.method === 'support' ? 'Support' : 'Safe'}</p>
                      <p className="text-[11px] text-gray-500">{new Date(c.checked_in_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    {c.note && <p className="text-[11px] text-gray-400 max-w-[120px] truncate">{c.note}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-lg border-t border-white/5">
        <div className="flex items-center h-[72px] max-w-lg mx-auto px-4">
          <button onClick={() => router.push('/guard')} className="flex-1 flex flex-col items-center justify-center gap-1 text-gray-500 cursor-pointer">
            <div className="w-9 h-9 flex items-center justify-center">
              <i className="ri-arrow-left-line text-xl"></i>
            </div>
            <span className="text-[11px] font-medium whitespace-nowrap">Back to Home</span>
          </button>
        </div>
      </nav>
    </div>
  );
}