'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { GuardShift } from '@/lib/useGuardPortal';

interface OBEntryFlowProps {
  todayShift: GuardShift | null;
  guardId: string | null;
  companyId: string | null;
  guardName: string;
  onSubmitted: () => void;
}

const entryTypes = [
  { value: 'Note', icon: 'ri-file-list-line' },
  { value: 'Visitor', icon: 'ri-user-line' },
  { value: 'Patrol Check', icon: 'ri-walk-line' },
  { value: 'Communication', icon: 'ri-chat-3-line' },
  { value: 'Maintenance', icon: 'ri-tools-line' },
  { value: 'Other', icon: 'ri-more-line' },
];

export default function OBEntryFlow({ todayShift, guardId, companyId, guardName, onSubmitted }: OBEntryFlowProps) {
  const router = useRouter();
  const [entryType, setEntryType] = useState('Note');
  const [entry, setEntry] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [listening, setListening] = useState(false);
  const [listenError, setListenError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

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
      setListenError('Voice input not supported');
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

    const location = await getLocation();

    await supabase.from('occurrence_books').insert({
      company_id: companyId,
      site_id: todayShift.site_id,
      guard_id: guardId,
      entry_type: entryType,
      entry: entry.trim(),
      occurred_at: new Date().toISOString(),
    });

    if (navigator.vibrate) navigator.vibrate(100);
    setSubmitting(false);
    setEntry('');
    setEntryType('Note');
    onSubmitted();
    router.push('/guard');
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

  const displayEntry = entry.replace(/\s*\[listening\.\.\.\]\s*.*$/, '').trim();

  return (
    <div className="flex flex-col min-h-full px-4 pb-24">
      <div className="pt-4 pb-2">
        <p className="text-gray-400 text-sm">At {todayShift.site?.site_name || 'Site'}</p>
        <h2 className="text-2xl font-bold text-white mt-0.5">New OB Entry</h2>
      </div>

      <div className="pt-2">
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {entryTypes.map((et) => (
            <button
              key={et.value}
              onClick={() => setEntryType(et.value)}
              className={`flex-shrink-0 h-12 px-5 rounded-full text-sm font-medium border transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                entryType === et.value
                  ? 'bg-[#3b82f6]/20 border-[#3b82f6]/40 text-[#3b82f6]'
                  : 'bg-[#1a1a1a] border-white/5 text-gray-400 hover:border-white/10'
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={et.icon}></i>
              </div>
              {et.value}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2 flex-1 flex flex-col">
        <div className="relative flex-1">
          <textarea
            value={displayEntry}
            onChange={(e) => setEntry(e.target.value)}
            rows={6}
            placeholder="What just happened?"
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

        {listening && (
          <p className="text-sm text-red-400 mt-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
            Listening...
          </p>
        )}
        {listenError && (
          <p className="text-sm text-amber-400 mt-2">{listenError}</p>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-time-line"></i>
          </div>
          {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · {guardName}
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