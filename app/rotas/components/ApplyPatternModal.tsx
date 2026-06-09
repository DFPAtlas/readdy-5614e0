'use client';

import { useState, useCallback } from 'react';
import type { PatternDay, RotaPattern } from '@/lib/useRotaPatterns';
import type { ShiftType } from '@/lib/useShiftTypes';

interface Props {
  isOpen: boolean;
  pattern: RotaPattern | null;
  sites: { id: string; site_name: string }[];
  onApply: (params: {
    pattern: RotaPattern;
    siteId: string;
    guardId: string | null;
    startDate: string;
    weekCount: number;
    publish: boolean;
  }) => void;
  onClose: () => void;
}

export default function ApplyPatternModal({ isOpen, pattern, sites, onApply, onClose }: Props) {
  const [siteId, setSiteId] = useState('');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [weekCount, setWeekCount] = useState(1);
  const [publish, setPublish] = useState(false);
  const [siteOpen, setSiteOpen] = useState(false);
  const [step, setStep] = useState(1);

  const totalShifts = pattern
    ? pattern.days.filter((d) => d.shift_type !== 'off' && d.shift_type !== 'holiday' && d.shift_type !== 'sick').length * weekCount
    : 0;

  const handleApply = () => {
    if (!pattern || !siteId) return;
    onApply({ pattern, siteId, guardId: null, startDate, weekCount, publish });
    setStep(1);
    setSiteId('');
    setPublish(false);
  };

  const selectedSite = sites.find((s) => s.id === siteId);

  if (!isOpen || !pattern) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#111827] border border-gray-800 rounded-xl w-full max-w-md shadow-2xl">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Apply Pattern</h2>
            <p className="text-xs text-gray-500 mt-0.5">{pattern.name} — {pattern.cycle_length} day cycle</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-close-line"></i></div>
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {step === 1 && (
            <>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-1">Site *</label>
                <button
                  onClick={() => setSiteOpen(!siteOpen)}
                  className="w-full text-left bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white flex items-center justify-between"
                >
                  <span className={selectedSite ? 'text-white' : 'text-gray-500'}>
                    {selectedSite ? selectedSite.site_name : 'Select site...'}
                  </span>
                  <div className="w-4 h-4 flex items-center justify-center">
                    <i className={`ri-arrow-down-s-line text-gray-500 transition-transform ${siteOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                {siteOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-[#1f2937] border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {sites.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => { setSiteId(s.id); setSiteOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-800/50 transition-colors cursor-pointer ${siteId === s.id ? 'bg-blue-600/15 text-blue-300' : 'text-gray-300'}`}
                      >
                        {s.site_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Start Date *</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Repeat for (weeks)</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setWeekCount(Math.max(1, weekCount - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 text-gray-400 hover:text-white cursor-pointer">
                    <div className="w-4 h-4 flex items-center justify-center"><i className="ri-subtract-line"></i></div>
                  </button>
                  <span className="text-sm text-white font-medium w-8 text-center">{weekCount}</span>
                  <button onClick={() => setWeekCount(Math.min(52, weekCount + 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-800 text-gray-400 hover:text-white cursor-pointer">
                    <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-800/40 rounded-lg p-3">
                <button
                  onClick={() => setPublish(!publish)}
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${publish ? 'bg-blue-500 border-blue-500' : 'border-gray-600'}`}
                >
                  {publish && <i className="ri-check-line text-white text-xs"></i>}
                </button>
                <div>
                  <p className="text-sm text-white">Publish immediately</p>
                  <p className="text-xs text-gray-500">Guards will see published shifts in their portal</p>
                </div>
              </div>

              <div className="bg-gray-800/30 rounded-lg p-3 flex items-center justify-between">
                <span className="text-xs text-gray-500">Estimated shifts to create</span>
                <span className="text-sm font-semibold text-white">{totalShifts}</span>
              </div>
            </>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-800 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap">
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!siteId}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            Apply Pattern
          </button>
        </div>
      </div>
    </div>
  );
}