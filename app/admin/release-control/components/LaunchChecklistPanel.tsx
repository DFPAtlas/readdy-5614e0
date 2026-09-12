'use client';

import { ReleaseChecklistItem } from '@/lib/useReleaseControl';
import { Badge, Dot, PanelCard, checklistTone } from './ui';

const STATUSES = ['not_started', 'in_progress', 'passed', 'failed', 'blocked', 'not_applicable'];

export default function LaunchChecklistPanel({
  checklists,
  items,
  updateChecklistItem,
  canEdit,
}: {
  checklists: { id: string; name: string }[];
  items: ReleaseChecklistItem[];
  updateChecklistItem: (id: string, updates: Partial<ReleaseChecklistItem>) => Promise<any>;
  canEdit: boolean;
}) {
  return (
    <div className="space-y-4">
      {checklists.map((group) => {
        const groupItems = items.filter((i) => i.checklist_id === group.id);
        if (groupItems.length === 0) return null;
        const blockers = groupItems.filter((i) => i.is_blocker && i.status !== 'passed');
        return (
          <PanelCard key={group.id} title={group.name} right={blockers.length > 0 ? <Badge tone="amber">{blockers.length} blocker(s)</Badge> : <Badge tone="green">clear</Badge>}>
            <div className="divide-y divide-gray-800/60">
              {groupItems.map((item) => (
                <div key={item.id} className="px-5 py-3 flex items-center gap-3">
                  <Dot tone={checklistTone(item.status)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white">{item.title}</span>
                      {item.is_blocker && <Badge tone="red">blocker</Badge>}
                    </div>
                    {item.evidence && <div className="text-[11px] text-gray-500 truncate" title={item.evidence}>{item.evidence}</div>}
                  </div>
                  <Badge tone={checklistTone(item.status)}>{item.status.replace(/_/g, ' ')}</Badge>
                  {canEdit && (
                    <button
                      onClick={() => {
                        const idx = STATUSES.indexOf(item.status);
                        const next = STATUSES[(idx + 1) % STATUSES.length];
                        updateChecklistItem(item.id, { status: next, verification_date: next === 'passed' ? new Date().toISOString() : item.verification_date });
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer whitespace-nowrap"
                      title="Cycle status"
                    >
                      Cycle
                    </button>
                  )}
                </div>
              ))}
            </div>
          </PanelCard>
        );
      })}
    </div>
  );
}