'use client';

import { ReactNode } from 'react';

export type Tone = 'green' | 'amber' | 'red' | 'grey' | 'indigo';

const toneText: Record<Tone, string> = {
  green: 'text-emerald-400',
  amber: 'text-amber-400',
  red: 'text-red-400',
  grey: 'text-gray-400',
  indigo: 'text-indigo-400',
};

const toneBg: Record<Tone, string> = {
  green: 'bg-emerald-500/10 border-emerald-500/20',
  amber: 'bg-amber-500/10 border-amber-500/20',
  red: 'bg-red-500/10 border-red-500/20',
  grey: 'bg-gray-500/10 border-gray-500/20',
  indigo: 'bg-indigo-500/10 border-indigo-500/20',
};

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border whitespace-nowrap ${toneBg[tone]} ${toneText[tone]}`}>
      {children}
    </span>
  );
}

export function Dot({ tone }: { tone: Tone }) {
  const color: Record<Tone, string> = {
    green: 'bg-emerald-400',
    amber: 'bg-amber-400',
    red: 'bg-red-400',
    grey: 'bg-gray-500',
    indigo: 'bg-indigo-400',
  };
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${color[tone]}`} />;
}

export function PanelCard({ title, subtitle, right, children }: { title: string; subtitle?: string; right?: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl">
      <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-white font-semibold text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

export function EmptyState({ text }: { text: string }) {
  return <div className="p-8 text-center text-sm text-gray-500">{text}</div>;
}

export function StatCard({ label, value, tone, sub }: { label: string; value: ReactNode; tone: Tone; sub?: string }) {
  const border: Record<Tone, string> = {
    green: 'border-emerald-600/20 bg-emerald-600/5',
    amber: 'border-amber-600/20 bg-amber-600/5',
    red: 'border-red-600/20 bg-red-600/5',
    grey: 'border-gray-600/20 bg-gray-600/5',
    indigo: 'border-indigo-600/20 bg-indigo-600/5',
  };
  return (
    <div className={`border rounded-xl p-4 ${border[tone]}`}>
      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-xl font-bold text-white">{value}</div>
      {sub && <div className="text-[11px] text-gray-500 mt-0.5">{sub}</div>}
    </div>
  );
}

export function severityTone(severity: string): Tone {
  if (severity === 'critical') return 'red';
  if (severity === 'high') return 'amber';
  if (severity === 'medium') return 'indigo';
  return 'grey';
}

export function resultTone(result: string): Tone {
  if (result === 'passed') return 'green';
  if (result === 'failed') return 'red';
  if (result === 'blocked') return 'amber';
  if (result === 'running') return 'indigo';
  return 'grey';
}

export function checklistTone(status: string): Tone {
  if (status === 'passed' || status === 'verified') return 'green';
  if (status === 'failed') return 'red';
  if (status === 'in_progress') return 'indigo';
  if (status === 'blocked') return 'amber';
  return 'grey';
}