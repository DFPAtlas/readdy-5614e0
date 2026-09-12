'use client';

import { LaunchMetric } from '@/lib/useReleaseControl';
import { Badge, PanelCard, EmptyState, Tone } from './ui';

const WINDOWS = ['1h', '24h', '72h', '7d', '30d'];

function metricTone(s: string): Tone {
  if (s === 'ok') return 'green';
  if (s === 'warning') return 'amber';
  if (s === 'breached') return 'red';
  return 'grey';
}

export default function PostLaunchWatchPanel({
  metrics,
  updateMetric,
  canEdit,
}: {
  metrics: LaunchMetric[];
  updateMetric: (id: string, updates: Partial<LaunchMetric>) => Promise<any>;
  canEdit: boolean;
}) {
  return (
    <div className="space-y-4">
      {metrics.length === 0 ? (
        <EmptyState text="No launch monitoring metrics configured" />
      ) : (
        WINDOWS.map((w) => {
          const windowMetrics = metrics.filter((m) => m.watch_window === w);
          if (windowMetrics.length === 0) return null;
          return (
            <PanelCard key={w} title={`${w} window`} subtitle={`${windowMetrics.length} tracked metrics`}>
              <div className="divide-y divide-gray-800/60">
                {windowMetrics.map((m) => (
                  <div key={m.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-white">{m.metric_name}</div>
                      {m.escalation_threshold && <div className="text-[10px] text-gray-500">Threshold: {m.escalation_threshold}</div>}
                    </div>
                    <div className="text-sm font-semibold text-white flex-shrink-0">{m.current_value ?? '—'}</div>
                    <Badge tone={metricTone(m.status)}>{m.status}</Badge>
                    {canEdit && (
                      <button
                        onClick={() => {
                          const order = ['not_started', 'ok', 'warning', 'breached'];
                          const idx = order.indexOf(m.status);
                          updateMetric(m.id, { status: order[(idx + 1) % order.length] });
                        }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer whitespace-nowrap"
                      >
                        Cycle
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </PanelCard>
          );
        })
      )}
    </div>
  );
}