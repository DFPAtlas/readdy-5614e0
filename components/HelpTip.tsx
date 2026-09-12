'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HelpTip({ text, learnMoreHref, learnMoreLabel = 'Learn more' }: { text: string; learnMoreHref?: string; learnMoreLabel?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex items-center align-middle">
      <button
        type="button"
        aria-label="Help"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="w-5 h-5 flex items-center justify-center rounded-full bg-white/10 text-gray-400 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
      >
        <i className="ri-question-line text-xs"></i>
      </button>
      {open && (
        <span className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 z-30 w-64 rounded-lg bg-[#1f2937] border border-gray-700 p-3 text-left shadow-xl">
          <span className="block text-xs text-gray-200 leading-relaxed">{text}</span>
          {learnMoreHref && (
            <Link href={learnMoreHref} className="mt-2 inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 cursor-pointer">
              {learnMoreLabel} <i className="ri-arrow-right-line"></i>
            </Link>
          )}
        </span>
      )}
    </span>
  );
}