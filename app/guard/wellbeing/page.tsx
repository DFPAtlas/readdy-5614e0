'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useGuardAuth } from '@/lib/useGuardAuth';

const MOODS = [
  { value: 'good', label: 'Good', emoji: 'ri-emotion-happy-line', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25' },
  { value: 'tired', label: 'Tired', emoji: 'ri-emotion-sad-line', color: 'bg-amber-500/15 text-amber-400 border-amber-500/25' },
  { value: 'stressed', label: 'Stressed', emoji: 'ri-emotion-unhappy-line', color: 'bg-orange-500/15 text-orange-400 border-orange-500/25' },
  { value: 'need_support', label: 'Need Support', emoji: 'ri-emotion-line', color: 'bg-red-500/15 text-red-400 border-red-500/25' },
];

export default function WellbeingPage() {
  const g = useGuardAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [mood, setMood] = useState('good');
  const [concerns, setConcerns] = useState('');
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!g.guardId) return;
    loadHistory();
  }, [g.guardId]);

  const loadHistory = async () => {
    if (!g.guardId) return;
    const { data } = await supabase
      .from('guard_wellbeing_checkins')
      .select('*')
      .eq('guard_id', g.guardId)
      .order('created_at', { ascending: false })
      .limit(15);
    setHistory(data || []);
  };

  const handleSubmit = async () => {
    if (!g.guardId || !g.companyId) return;
    setSubmitting(true);

    const stressMap: Record<string, number> = { good: 1, tired: 5, stressed: 8, need_support: 9 };
    const fatigueMap: Record<string, number> = { good: 1, tired: 8, stressed: 5, need_support: 5 };
    const safetyMap: Record<string, number> = { good: 9, tired: 8, stressed: 6, need_support: 3 };
    const average = ((stressMap[mood] || 5) + (fatigueMap[mood] || 5) + (safetyMap[mood] || 5)) / 3;

    const { error } = await supabase.from('guard_wellbeing_checkins').insert({
      guard_id: g.guardId,
      company_id: g.companyId,
      shift_id: g.todayShift?.id || null,
      site_id: g.todayShift?.site_id || null,
      stress_score: stressMap[mood] || 5,
      fatigue_score: fatigueMap[mood] || 5,
      safety_score: safetyMap[mood] || 5,
      overall_score: Math.round(average * 10) / 10,
      concerns: concerns.trim() || null,
      flagged_for_review: mood === 'need_support' || mood === 'stressed',
    });

    if (!error) {
      setToast(mood === 'need_support' ? 'Check-in logged — your supervisor will be notified' : 'Wellbeing check-in recorded');
      setConcerns('');
      if (navigator.vibrate) navigator.vibrate(100);
      loadHistory();
    } else {
      setToast('Failed to log check-in');
    }
    setSubmitting(false);
    setTimeout(() => setToast(null), 3000);
  };

  if (g.loading) {
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
        <h1 className="text-base font-semibold ml-2">Wellbeing Check-In</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {toast && (
          <div className="px-4 pt-3">
            <div className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${
              mood === 'need_support' ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                : mood === 'stressed' ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400'
                : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
            }`}>
              <div className="w-5 h-5 flex items-center justify-center">
                <i className={mood === 'need_support' ? 'ri-error-warning-line' : mood === 'stressed' ? 'ri-emotion-unhappy-line' : 'ri-check-line'}></i>
              </div>
              {toast}
            </div>
          </div>
        )}

        <div className="px-4 pt-6 space-y-4">
          <div className="bg-[#1a1a1a] border border-white/5 rounded-2xl p-5 space-y-5">
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <i className="ri-heart-pulse-line text-violet-400 text-2xl"></i>
              </div>
              <h2 className="text-lg font-bold text-white">How are you feeling?</h2>
              <p className="text-sm text-gray-400 mt-1">Your wellbeing matters. This check-in is confidential.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(m.value)}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center gap-2 ${
                    mood === m.value ? m.color + ' border-current' : 'bg-white/[0.02] border-white/5'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl ${mood === m.value ? m.color.split(' ')[0] : 'bg-white/5'} flex items-center justify-center`}>
                    <i className={`${m.emoji} text-lg ${mood === m.value ? m.color.split(' ')[1] : 'text-gray-400'}`}></i>
                  </div>
                  <span className={`text-sm font-medium whitespace-nowrap ${mood === m.value ? m.color.split(' ')[1] : 'text-gray-400'}`}>{m.label}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Anything you want to share? (optional)</label>
              <textarea
                value={concerns}
                onChange={(e) => setConcerns(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/40 resize-none"
                rows={3}
                placeholder="Any concerns, feedback, or things your supervisor should know..."
                maxLength={500}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full h-14 bg-violet-600 hover:bg-violet-500 disabled:opacity-30 text-white font-semibold rounded-xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? (
                <i className="ri-loader-4-line animate-spin text-lg"></i>
              ) : (
                <>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className="ri-heart-line"></i>
                  </div>
                  Submit Check-In
                </>
              )}
            </button>
          </div>

          {history.length > 0 && (
            <div>
              <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-3 px-1">Recent Check-Ins</h4>
              <div className="space-y-2">
                {history.slice(0, 8).map((h) => {
                  const moodInfo = h.overall_score >= 7 ? MOODS[0] : h.overall_score >= 5 ? MOODS[1] : h.overall_score >= 3 ? MOODS[2] : MOODS[3];
                  return (
                    <div key={h.id} className="bg-[#1a1a1a] border border-white/5 rounded-xl p-3 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${moodInfo.color.split(' ')[0]} flex items-center justify-center`}>
                        <i className={`${moodInfo.emoji} ${moodInfo.color.split(' ')[1]} text-sm`}></i>
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs font-medium ${moodInfo.color.split(' ')[1]}`}>{moodInfo.label}</p>
                        <p className="text-[11px] text-gray-500">
                          {h.created_at ? new Date(h.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                        </p>
                      </div>
                      {h.flagged_for_review && (
                        <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-medium">Flagged</span>
                      )}
                    </div>
                  );
                })}
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