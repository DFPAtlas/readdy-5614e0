'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { GuardShift } from '@/lib/useGuardPortal';

interface OBTabProps {
  todayShift: GuardShift | null;
  guardId: string | null;
  companyId: string | null;
  onSubmitted: () => void;
}

const entryTypes = [
  { value: 'General', icon: 'ri-file-list-line' },
  { value: 'Incident', icon: 'ri-alert-line' },
  { value: 'Maintenance', icon: 'ri-tools-line' },
  { value: 'Communication', icon: 'ri-chat-3-line' },
  { value: 'Health & Safety', icon: 'ri-first-aid-kit-line' },
  { value: 'Visitor', icon: 'ri-user-line' },
];

export default function OBTab({ todayShift, guardId, companyId, onSubmitted }: OBTabProps) {
  const router = useRouter();
  const [entryType, setEntryType] = useState('General');
  const [entry, setEntry] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!todayShift || !guardId || !companyId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-4 pb-24">
        <div className="w-20 h-20 bg-amber-500/5 rounded-2xl flex items-center justify-center mb-4">
          <i className="ri-book-line text-amber-400/50 text-3xl"></i>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Occurrence Book</h2>
        <p className="text-sm text-gray-400 text-center">Clock in to your shift first to log entries.</p>
        <button
          onClick={() => router.push('/guard')}
          className="mt-6 h-14 px-8 bg-[#3b82f6] hover:bg-blue-500 text-white font-semibold rounded-xl cursor-pointer transition-colors"
        >
          Go to Clock In
        </button>
      </div>
    );
  }

  async function handleSubmit() {
    if (!entry.trim()) return;
    setSubmitting(true);

    await supabase.from('occurrence_books').insert({
      company_id: companyId,
      site_id: todayShift.site_id,
      guard_id: guardId,
      entry_type: entryType,
      entry: entry.trim(),
    });

    if (navigator.vibrate) navigator.vibrate(100);
    setSubmitting(false);
    setSuccess(true);
    onSubmitted();
    setTimeout(() => {
      setSuccess(false);
      setEntry('');
      setEntryType('General');
      router.push('/guard');
    }, 1500);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full px-4 pb-24">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4">
          <i className="ri-check-line text-emerald-400 text-3xl"></i>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Entry Logged</h2>
        <p className="text-sm text-gray-400 text-center">Occurrence book updated.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-24">
      <div className="px-4 pt-4 pb-2">
        <p className="text-gray-400 text-sm">At {todayShift.site?.site_name || 'Site'}</p>
        <h2 className="text-2xl font-bold text-white mt-0.5">New OB Entry</h2>
      </div>

      <div className="px-4 py-2">
        <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Entry Type</label>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {entryTypes.map((et) => (
            <button
              key={et.value}
              onClick={() => setEntryType(et.value)}
              className={`flex-shrink-0 h-10 px-4 rounded-full text-sm font-medium border transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
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

      <div className="px-4 py-2 flex-1">
        <textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          rows={8}
          placeholder="What is happening? Be concise..."
          className="w-full h-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-base placeholder-gray-500 focus:outline-none focus:border-[#3b82f6]/40 transition-colors"
        />
      </div>

      <div className="mt-auto px-4 pb-6">
        <button
          onClick={handleSubmit}
          disabled={!entry.trim() || submitting}
          className="w-full h-14 bg-[#3b82f6] hover:bg-blue-500 disabled:opacity-30 text-white font-semibold rounded-xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
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
      </div>
    </div>
  );
}