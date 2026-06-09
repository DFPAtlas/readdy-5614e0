'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { GuardShift } from '@/lib/useGuardPortal';

interface QuickNoteBarProps {
  todayShift: GuardShift | null;
  guardId: string | null;
  companyId: string | null;
  guardName: string;
  onSubmitted: () => void;
}

export default function QuickNoteBar({ todayShift, guardId, companyId, guardName, onSubmitted }: QuickNoteBarProps) {
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);

  const getLocation = useCallback((): Promise<{ lat: number | null; lng: number | null }> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { resolve({ lat: null, lng: null }); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve({ lat: null, lng: null }),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  }, []);

  async function handleSubmit() {
    if (!note.trim() || !companyId || !todayShift || !guardId) return;
    setSending(true);
    await getLocation();
    await supabase.from('occurrence_books').insert({
      company_id: companyId,
      site_id: todayShift.site_id,
      guard_id: guardId,
      entry_type: 'Note',
      entry: note.trim(),
      occurred_at: new Date().toISOString(),
    });
    if (navigator.vibrate) navigator.vibrate(50);
    setNote('');
    setSending(false);
    onSubmitted();
  }

  if (!todayShift || !guardId || !companyId) return null;

  return (
    <div className="px-4 py-2">
      <div className="bg-[#1a1a1a] border border-white/5 rounded-xl flex items-center gap-2 px-3 py-2">
        <div className="w-5 h-5 flex items-center justify-center text-gray-500 flex-shrink-0">
          <i className="ri-edit-line text-sm"></i>
        </div>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Quick note..."
          className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 focus:outline-none"
          onKeyDown={(e) => { if (e.key === 'Enter' && note.trim()) handleSubmit(); }}
        />
        <button
          onClick={handleSubmit}
          disabled={!note.trim() || sending}
          className="w-9 h-9 rounded-lg bg-[#3b82f6]/20 text-[#3b82f6] flex items-center justify-center transition-all active:scale-95 cursor-pointer disabled:opacity-30"
        >
          {sending ? (
            <i className="ri-loader-4-line animate-spin text-sm"></i>
          ) : (
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-send-plane-fill text-sm"></i>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}