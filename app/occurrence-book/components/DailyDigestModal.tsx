'use client';

import { useState } from 'react';

interface Props {
  summary: string;
  siteName: string;
  date: string;
  onClose: () => void;
}

export default function DailyDigestModal({ summary, siteName, date, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `${siteName} \u2014 ${date}\n\n${summary}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#151b27] border border-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 flex items-center justify-center text-blue-400">
              <i className="ri-sparkling-line"></i>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Daily Operations Digest</h2>
              <p className="text-xs text-gray-400">{siteName} · {date}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer">
            <div className="w-5 h-5 flex items-center justify-center"><i className="ri-close-line"></i></div>
          </button>
        </div>

        <div className="px-6 py-5 space-y-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 flex items-center justify-center text-blue-400"><i className="ri-sparkling-line text-xs"></i></div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">AI-generated summary</span>
          </div>
          <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg p-4 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
            {summary}
          </div>
          <p className="text-[11px] text-gray-500">This digest is an AI-generated summary of the day's occurrence entries and is not a replacement for the official occurrence record.</p>
        </div>

        <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            Close
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className={copied ? 'ri-check-line' : 'ri-file-copy-line'}></i>
            </div>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}