'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { OB_ENTRY_TYPES, OB_ENTRY_TYPE_LABELS, OB_TYPE_ICON, OB_VISIBILITY_OPTIONS } from '@/lib/useOccurrenceBook';
import type { GuardShift } from '@/lib/useGuardPortal';

interface OBEntryFlowProps {
  todayShift: GuardShift | null;
  guardId: string | null;
  companyId: string | null;
  guardName: string;
  activeAttendanceId?: string | null;
  onSubmitted: () => void;
}

const QUICK_TYPES = ['general_note', 'patrol_note', 'visitor_note', 'incident_note', 'maintenance_issue', 'handover'];

export default function OBEntryFlow({ todayShift, guardId, companyId, guardName, activeAttendanceId, onSubmitted }: OBEntryFlowProps) {
  const router = useRouter();
  const [entryType, setEntryType] = useState('general_note');
  const [entry, setEntry] = useState('');
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState<'internal' | 'client_visible' | 'handover'>('internal');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [listening, setListening] = useState(false);
  const [listenError, setListenError] = useState<string | null>(null);
  const [showAllTypes, setShowAllTypes] = useState(false);
  const recognitionRef = useRef<any>(null);

  const displayedTypes = showAllTypes ? OB_ENTRY_TYPES : QUICK_TYPES;

  const getLocation = useCallback((): Promise<{ lat: number | null; lng: number | null }> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { resolve({ lat: null, lng: null }); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({ lat: null, lng: null }),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });
  }, []);

  function startVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setListenError('Voice input not supported on this device');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-GB';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onstart = () => { setListening(true); setListenError(null); };
    recognition.onresult = (event: any) => {
      let final = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      setEntry((prev) => {
        const base = prev.replace(/\s*\[listening\.\.\.\]\s*/, '');
        return base + (base && !base.endsWith(' ') ? ' ' : '') + final + (interim ? ` [listening...] ${interim}` : '');
      });
    };
    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech') setListenError('Could not hear clearly. Try again.');
      setListening(false);
    };
    recognition.onend = () => {
      setEntry((prev) => prev.replace(/\s*\[listening\.\.\.\]\s*.*$/, '').trim());
      setListening(false);
    };
    recognition.start();
  }

  function stopVoiceInput() {
    if (recognitionRef.current) recognitionRef.current.stop();
  }

  async function handleSubmit() {
    if (!entry.trim() || !companyId || !todayShift || !guardId) return;
    setSubmitting(true);

    const payload: any = {
      company_id: companyId,
      site_id: todayShift.site_id,
      guard_id: guardId,
      entry_type: entryType,
      entry: entry.trim(),
      occurred_at: new Date().toISOString(),
      shift_id: todayShift.id,
      client_visible: visibility === 'client_visible',
      visibility: visibility,
    };

    if (title.trim()) payload.title = title.trim();
    if (activeAttendanceId) payload.attendance_log_id = activeAttendanceId;

    await supabase.from('occurrence_books').insert(payload);

    if (navigator.vibrate) navigator.vibrate(100);
    setSubmitting(false);
    setSuccess(true);
    onSubmitted();
    setTimeout(() => {
      setSuccess(false);
      setEntry('');
      setTitle('');
      setEntryType('general_note');
      setVisibility('internal');
      router.push('/guard');
    }, 1500);
  }

  if (!todayShift || !guardId || !companyId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-4 pb-24">
        <div className="w-20 h-20 bg-amber-500/5 rounded-2xl flex items-center justify-center mb-4">
          <i className="ri-book-line text-amber-400/50 text-3xl"></i>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Occurrence Book</h2>
        <p className="text-sm text-gray-400 text-center">Clock in to your shift first to log entries.</p>
        <button onClick={() => router.push('/guard')} className="mt-6 h-14 px-8 bg-[#3b82f6] hover:bg-blue-500 text-white font-semibold rounded-xl cursor-pointer transition-colors whitespace-nowrap">
          Go to Clock In
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-4 pb-24">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4">
          <i className="ri-check-line text-emerald-400 text-3xl"></i>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Entry Logged</h2>
        <p className="text-sm text-gray-400 text-center">Your occurrence book entry has been saved.</p>
        {visibility === 'handover' && (
          <div className="mt-3 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-400">Handover note will be visible to the next shift.</p>
          </div>
        )}
      </div>
    );
  }

  const displayEntry = entry.replace(/\s*\[listening\.\.\.\]\s*.*$/, '').trim();
  const selectedVisibilityOpt = OB_VISIBILITY_OPTIONS.find((v) => v.value === visibility);

  return (
    <div className="flex flex-col min-h-full px-4 pb-24">
      <div className="pt-4 pb-2">
        <p className="text-gray-400 text-sm">At {todayShift.site?.site_name || 'Site'}</p>
        <h2 className="text-2xl font-bold text-white mt-0.5">New OB Entry</h2>
      </div>

      <div className="pt-2">
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Entry Type</label>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {displayedTypes.map((et) => (
            <button
              key={et}
              onClick={() => setEntryType(et)}
              className={`flex-shrink-0 h-12 px-5 rounded-full text-sm font-medium border transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                entryType === et
                  ? 'bg-[#3b82f6]/20 border-[#3b82f6]/40 text-[#3b82f6]'
                  : 'bg-[#1a1a1a] border-white/5 text-gray-400 hover:border-white/10'
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={OB_TYPE_ICON[et] || 'ri-sticky-note-line'}></i>
              </div>
              {OB_ENTRY_TYPE_LABELS[et] || et}
            </button>
          ))}
          <button
            onClick={() => setShowAllTypes(!showAllTypes)}
            className="flex-shrink-0 h-12 w-12 rounded-full bg-[#1a1a1a] border border-white/5 text-gray-400 hover:border-white/10 flex items-center justify-center cursor-pointer transition-all"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className={showAllTypes ? 'ri-arrow-left-s-line' : 'ri-more-line'}></i>
            </div>
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="pt-3">
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Title (optional)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Short summary of this entry..."
          className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#3b82f6]/40 transition-colors"
        />
      </div>

      {/* Entry body */}
      <div className="pt-3 flex-1 flex flex-col">
        <div className="relative flex-1">
          <textarea
            value={displayEntry}
            onChange={(e) => setEntry(e.target.value)}
            rows={6}
            maxLength={500}
            placeholder="What happened? Describe the event or situation..."
            className="w-full h-full bg-[#1a1a1a] border border-white/10 rounded-2xl px-4 py-4 text-white text-base placeholder-gray-500 focus:outline-none focus:border-[#3b82f6]/40 transition-colors resize-none"
          />
          <button
            onClick={listening ? stopVoiceInput : startVoiceInput}
            className={`absolute bottom-3 right-3 w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              listening ? 'bg-red-500/20 border border-red-500/30' : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
          >
            {listening ? (
              <span className="relative flex items-center justify-center w-full h-full">
                <span className="absolute w-3 h-3 bg-red-400 rounded-full animate-ping"></span>
                <span className="relative w-3 h-3 bg-red-400 rounded-full"></span>
              </span>
            ) : (
              <div className="w-5 h-5 flex items-center justify-center text-gray-400">
                <i className="ri-mic-line text-lg"></i>
              </div>
            )}
          </button>
        </div>
        <div className="flex items-center justify-between mt-1">
          {listening ? (
            <p className="text-sm text-red-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
              Listening...
            </p>
          ) : (
            <p className="text-xs text-gray-500">{displayEntry.length}/500</p>
          )}
          {listenError && <p className="text-sm text-amber-400">{listenError}</p>}
        </div>
      </div>

      {/* Visibility selector */}
      <div className="pt-3">
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Visibility</label>
        <div className="flex gap-2">
          {OB_VISIBILITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setVisibility(opt.value as 'internal' | 'client_visible' | 'handover')}
              className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all cursor-pointer ${
                visibility === opt.value
                  ? 'bg-[#3b82f6]/10 border-[#3b82f6]/30 text-white'
                  : 'bg-[#1a1a1a] border-white/5 text-gray-400 hover:border-white/10'
              }`}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className={opt.icon}></i>
              </div>
              <span className="text-xs font-medium whitespace-nowrap">{opt.label}</span>
            </button>
          ))}
        </div>
        {selectedVisibilityOpt && (
          <p className="text-[11px] text-gray-500 mt-1.5">{selectedVisibilityOpt.desc}</p>
        )}
      </div>

      {/* Submit */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-time-line"></i>
          </div>
          {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · {guardName} · {todayShift.site?.site_name || 'Site'}
        </div>
        <button
          onClick={handleSubmit}
          disabled={!displayEntry.trim() || submitting}
          className="w-full h-14 bg-[#3b82f6] hover:bg-blue-500 disabled:opacity-30 text-white font-semibold rounded-xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
        >
          {submitting ? (
            <i className="ri-loader-4-line animate-spin text-lg"></i>
          ) : (
            <>
              <div className="w-5 h-5 flex items-center justify-center">
                <i className="ri-save-line"></i>
              </div>
              Save Entry
            </>
          )}
        </button>
        <button
          onClick={() => router.push('/guard')}
          className="w-full h-12 text-gray-400 font-medium cursor-pointer whitespace-nowrap"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}