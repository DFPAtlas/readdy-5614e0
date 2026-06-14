'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export default function LoneWorkerPage() {
  const { profile, company } = useAuth();
  const router = useRouter();
  const [guardId, setGuardId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [method, setMethod] = useState<'safe' | 'support' | 'emergency'>('safe');
  const [note, setNote] = useState('');
  const [checkins, setCheckins] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.id || !company?.id) return;
    loadGuardInfo();
  }, [profile?.id, company?.id]);

  const loadGuardInfo = async () => {
    const { data: guardData } = await supabase
      .from('guards')
      .select('id')
      .eq('user_id', profile!.id)
      .maybeSingle();

    if (guardData) {
      setGuardId(guardData.id);

      const { data: sessions } = await supabase
        .from('lone_worker_sessions')
        .select('id')
        .eq('guard_id', guardData.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (sessions && sessions.length > 0) {
        setSessionId(sessions[0].id);
      }

      const { data: history } = await supabase
        .from('lone_worker_checkins')
        .select('*')
        .eq('guard_id', guardData.id)
        .order('checked_in_at', { ascending: false })
        .limit(20);
      setCheckins(history || []);
    }
    setLoading(false);
  };

  const handleCheckIn = async () => {
    if (!guardId || !company?.id) return;
    setSubmitting(true);

    let loc: { lat: number; lng: number } | null = null;
    try {
      const pos: GeolocationPosition = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000 });
      });
      loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch {}

    const { error } = await supabase.from('lone_worker_checkins').insert({
      session_id: sessionId || null,
      guard_id: guardId,
      checked_in_at: new Date().toISOString(),
      method,
      lat: loc?.lat ?? null,
      lng: loc?.lng ?? null,
      note: note.trim() || null,
    });

    if (!error) {
      setToast(method === 'emergency' ? 'Escalation logged — supervisor notified' : method === 'support' ? 'Support request logged' : 'Check-in confirmed — you are safe');
      setNote('');
      if (guardId) {
        const { data: updated } = await supabase
          .from('lone_worker_checkins')
          .select('*')
          .eq('guard_id', guardId)
          .order('checked_in_at', { ascending: false })
          .limit(20);
        setCheckins(updated || []);
      }
      if (navigator.vibrate) navigator.vibrate(100);
    } else {
      setToast('Failed to log check-in');
    }
    setSubmitting(false);
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex items-center px-4 h-14 border-b border-white/5">
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer">
          <i className="ri-arrow-left-line"></i>
        </button>
        <h1 className="text-base font-semibold ml-2">Lone Worker Check-In</h1>
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
          <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 space-y-5">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <i className="ri-shield-user-line text-blue-400 text-2xl"></i>
              </div>
              <h2 className="text-lg font-bold text-white">Lone Worker Check-In</h2>
              <p className="text-sm text-gray-400 mt-1">Confirm your safety or request assistance</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => setMethod('safe')}
                className={`p-5 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                  method === 'safe' ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/[0.02] border-white/5'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                  <i className="ri-shield-check-line text-emerald-400 text-xl"></i>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white whitespace-nowrap">I am Safe</p>
                  <p className="text-xs text-gray-400">Routine check-in — everything is fine</p>
                </div>
              </button>

              <button
                onClick={() => setMethod('support')}
                className={`p-5 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                  method === 'support' ? 'bg-amber-500/10 border-amber-500/40' : 'bg-white/[0.02] border-white/5'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center">
                  <i className="ri-question-line text-amber-400 text-xl"></i>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white whitespace-nowrap">Need Support</p>
                  <p className="text-xs text-gray-400">Non-urgent assistance required</p>
                </div>
              </button>

              <button
                onClick={() => setMethod('emergency')}
                className={`p-5 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                  method === 'emergency' ? 'bg-red-500/10 border-red-500/40' : 'bg-white/[0.02] border-white/5'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-red-500/15 flex items-center justify-center">
                  <i className="ri-alarm-warning-line text-red-400 text-xl"></i>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white whitespace-nowrap">Emergency</p>
                  <p className="text-xs text-gray-400">Immediate escalation to supervisor</p>
                </div>
              </button>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Additional Notes (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/40 resize-none"
                rows={3}
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
                  {method === 'emergency' ? 'Send Emergency Alert' : method === 'support' ? 'Request Support' : 'Confirm I am Safe'}
                </>
              )}
            </button>
          </div>

          {checkins.length > 0 && (
            <div>
              <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-3 px-1">Recent Check-Ins</h4>
              <div className="space-y-2">
                {checkins.slice(0, 8).map((c) => (
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