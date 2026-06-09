'use client';

import { useState, useCallback } from 'react';

interface AIAction {
  key: string;
  label: string;
  description: string;
  icon: string;
  color: string;
}

const AI_ACTIONS: AIAction[] = [
  {
    key: 'autofill',
    label: 'Auto-fill gaps',
    description: 'Assign guards to all open shifts automatically',
    icon: 'ri-magic-line',
    color: 'bg-violet-600 hover:bg-violet-500 border-violet-500/30',
  },
  {
    key: 'cover',
    label: 'Find best cover',
    description: 'Find the most suitable guard for each open shift',
    icon: 'ri-shield-star-line',
    color: 'bg-blue-600 hover:bg-blue-500 border-blue-500/30',
  },
  {
    key: 'sick',
    label: 'Cover sick leave',
    description: 'Find replacements for guards on sick leave',
    icon: 'ri-first-aid-kit-line',
    color: 'bg-red-600 hover:bg-red-500 border-red-500/30',
  },
  {
    key: 'travel',
    label: 'Optimise travel',
    description: 'Reduce guard travel time between consecutive shifts',
    icon: 'ri-route-line',
    color: 'bg-sky-600 hover:bg-sky-500 border-sky-500/30',
  },
  {
    key: 'balance',
    label: 'Balance overtime',
    description: 'Redistribute hours to avoid overtime across the team',
    icon: 'ri-scales-3-line',
    color: 'bg-amber-600 hover:bg-amber-500 border-amber-500/30',
  },
  {
    key: 'predict',
    label: 'Predict shortages',
    description: 'Identify upcoming staffing gaps and recommend action',
    icon: 'ri-bar-chart-grouped-line',
    color: 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500/30',
  },
];

interface AIToolbarProps {
  onAction: (key: string) => Promise<string | void>;
  onOpenModal?: (key: string) => void;
  openShiftCount: number;
}

export default function AIToolbar({ onAction, onOpenModal, openShiftCount }: AIToolbarProps) {
  const [running, setRunning] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handleClick = useCallback(
    async (action: AIAction) => {
      if (action.key === 'autofill' || action.key === 'cover') {
        onOpenModal?.(action.key);
        return;
      }
      if (action.key === 'sick') {
        onAction(action.key);
        return;
      }
      setRunning(action.key);
      setLastResult(null);
      try {
        const result = await onAction(action.key);
        setLastResult(result || 'Done');
      } catch (err: any) {
        setLastResult(err?.message || 'Failed');
      }
      setRunning(null);
    },
    [onAction, onOpenModal]
  );

  if (!expanded) {
    return (
      <div className="flex items-center gap-3">
        {lastResult && (
          <span className="text-xs text-gray-400">{lastResult}</span>
        )}
        <button
          onClick={() => setExpanded(true)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-violet-500/20 bg-violet-600/10 text-violet-300 text-sm font-medium hover:bg-violet-600/20 transition-colors cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-bard-line"></i>
          </div>
          AI Tools
          {openShiftCount > 0 && (
            <span className="text-[10px] bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded">{openShiftCount}</span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#151b27] border border-gray-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
            <div className="w-5 h-5 flex items-center justify-center text-violet-400">
              <i className="ri-bard-line text-sm"></i>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Rota Assistant</h3>
            <p className="text-xs text-gray-500">Smart scheduling tools to speed up your rota building</p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(false)}
          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-close-line"></i>
          </div>
        </button>
      </div>

      {lastResult && (
        <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-check-line"></i>
          </div>
          {lastResult}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
        {AI_ACTIONS.map((action) => {
          const isRunning = running === action.key;
          return (
            <button
              key={action.key}
              onClick={() => handleClick(action)}
              disabled={!!running || (action.key === 'autofill' && openShiftCount === 0)}
              className={`flex flex-col items-start gap-2 p-3 rounded-lg border text-left transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${action.color} text-white`}
            >
              <div className="w-7 h-7 flex items-center justify-center rounded-md bg-white/10">
                <i className={action.icon}></i>
              </div>
              <div>
                <div className="text-xs font-semibold whitespace-nowrap">{action.label}</div>
                <div className="text-[10px] text-white/60 leading-tight mt-0.5">{action.description}</div>
              </div>
              {isRunning && (
                <div className="w-full flex items-center justify-center py-1">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}