'use client';

import { useState } from 'react';

interface Props {
  gapQuestions: { text: string; count: number }[];
  onAcknowledge: (text: string) => Promise<void>;
}

export default function GapQuestionsWidget({ gapQuestions, onAcknowledge }: Props) {
  const [acked, setAcked] = useState<Set<string>>(new Set());
  const [hovered, setHovered] = useState<string | null>(null);

  if (gapQuestions.length === 0) {
    return (
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-check-line text-emerald-400 text-sm"></i>
            </div>
          </div>
          <h3 className="text-sm font-semibold text-white">SOP Coverage</h3>
        </div>
        <p className="text-sm text-gray-400">No gaps detected. Your SOPs are covering everything staff ask about.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-error-warning-line text-red-400 text-sm"></i>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">SOPs Your Staff Want But Don't Have</h3>
          <p className="text-xs text-gray-500">Questions the AI couldn't answer — add these to your SOPs</p>
        </div>
      </div>

      <div className="space-y-1">
        {gapQuestions.map((q) => {
          const isAcked = acked.has(q.text);
          return (
            <div
              key={q.text}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                isAcked
                  ? 'bg-gray-800/30 opacity-40'
                  : hovered === q.text
                    ? 'bg-red-500/5 border border-red-500/10'
                    : 'hover:bg-gray-800/30'
              }`}
              onMouseEnter={() => setHovered(q.text)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="min-w-0 mr-3">
                <p className={`text-sm truncate ${isAcked ? 'text-gray-600 line-through' : 'text-gray-300'}`}>
                  {q.text}
                </p>
                <p className="text-xs text-red-400 mt-0.5">
                  {q.count} {q.count === 1 ? 'time' : 'times'} asked this month
                </p>
              </div>
              <button
                onClick={() => {
                  onAcknowledge(q.text);
                  setAcked((prev) => new Set([...prev, q.text]));
                }}
                disabled={isAcked}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isAcked
                    ? 'bg-gray-800 text-gray-500'
                    : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                }`}
              >
                {isAcked ? 'Acknowledged' : 'Mark as added'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}