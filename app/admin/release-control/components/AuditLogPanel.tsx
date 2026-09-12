'use client';

import { ReleaseAuditEvent } from '@/lib/useReleaseControl';
import { PanelCard, EmptyState } from './ui';

export default function AuditLogPanel({ auditEvents }: { auditEvents: ReleaseAuditEvent[] }) {
  return (
    <PanelCard title="Release audit log" subtitle="All release-management actions are recorded">
      {auditEvents.length === 0 ? (
        <EmptyState text="No release audit events yet" />
      ) : (
        <div className="divide-y divide-gray-800/60 max-h-[560px] overflow-y-auto">
          {auditEvents.map((e) => (
            <div key={e.id} className="px-5 py-3 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                <div className="w-4 h-4 flex items-center justify-center text-gray-400">
                  <i className="ri-file-list-3-line"></i>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-white">{e.action}</div>
                <div className="text-[11px] text-gray-500">
                  {e.resource_type}{e.resource_id ? ` · ${e.resource_id.slice(0, 8)}` : ''}
                </div>
              </div>
              <span className="text-[10px] text-gray-600 whitespace-nowrap flex-shrink-0">
                {new Date(e.created_at).toLocaleString('en-GB')}
              </span>
            </div>
          ))}
        </div>
      )}
    </PanelCard>
  );
}