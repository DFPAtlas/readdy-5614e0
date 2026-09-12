'use client';

const riskStyle: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export function RiskBadge({ level }: { level: string | null }) {
  const lvl = level || 'low';
  const style = riskStyle[lvl] || riskStyle.low;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${style}`}>
      {lvl}
    </span>
  );
}

export function HealthPill({ lastStatus }: { lastStatus: string | null }) {
  if (!lastStatus) {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">never run</span>;
  }
  if (lastStatus === 'succeeded' || lastStatus === 'completed') {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><i className="ri-checkbox-circle-fill text-[11px]"></i> healthy</span>;
  }
  if (lastStatus === 'failed' || lastStatus === 'dead_lettered') {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20"><i className="ri-close-circle-fill text-[11px]"></i> failed</span>;
  }
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">{lastStatus}</span>;
}

export function EnabledPill({ active, paused }: { active: boolean; paused: boolean }) {
  if (!active) {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">disabled</span>;
  }
  if (paused) {
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"><i className="ri-pause-circle-fill text-[11px]"></i> paused</span>;
  }
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><i className="ri-play-circle-fill text-[11px]"></i> enabled</span>;
}

export function timeAgo(iso: string | null): string {
  if (!iso) return '—';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export function formatMs(ms: number | null): string {
  if (ms == null) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}