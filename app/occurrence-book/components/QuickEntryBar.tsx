'use client';

import { useState } from 'react';
import { OBEntry } from '@/lib/useOccurrenceBook';

interface Props {
  siteId: string | null;
  onAdd: (entry: string) => void;
  onOpenModal: () => void;
  saving: boolean;
}

export default function QuickEntryBar({ siteId, onAdd, onOpenModal, saving }: Props) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !siteId) return;
    onAdd(text.trim());
    setText('');
  };

  return (
    <div className="sticky bottom-0 bg-[#0b0f19]/80 backdrop-blur-md border-t border-gray-800 py-3 px-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-500/10 border border-gray-700 text-[11px] font-medium text-gray-400 flex-shrink-0">
          <div className="w-3 h-3 flex items-center justify-center"><i className="ri-sticky-note-line"></i></div>
          Note
        </span>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={siteId ? 'Quick log a note...' : 'Select a site first'}
          disabled={!siteId || saving}
          className="flex-1 bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={!text.trim() || !siteId || saving}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition-colors cursor-pointer flex-shrink-0"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <i className="ri-send-plane-fill"></i>
            )}
          </div>
        </button>
        <button
          type="button"
          onClick={onOpenModal}
          disabled={!siteId}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors cursor-pointer flex-shrink-0"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <i className="ri-expand-diagonal-line"></i>
          </div>
        </button>
      </form>
    </div>
  );
}