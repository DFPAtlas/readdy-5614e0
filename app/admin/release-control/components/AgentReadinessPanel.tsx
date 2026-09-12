'use client';

import { ReleaseAgent } from '@/lib/useReleaseControl';
import { Badge, PanelCard, EmptyState, Tone } from './ui';

const READINESS: Record<string, string> = {
  ready: 'ready',
  blocked: 'blocked',
  failed: 'failed',
  not_started: 'not started',
};

function readyTone(s: string): Tone {
  if (s === 'ready') return 'green';
  if (s === 'blocked') return 'amber';
  if (s === 'failed') return 'red';
  return 'grey';
}

export default function AgentReadinessPanel({
  agents,
  updateAgent,
  canEdit,
}: {
  agents: ReleaseAgent[];
  updateAgent: (id: string, updates: Partial<ReleaseAgent>) => Promise<any>;
  canEdit: boolean;
}) {
  const required = agents.filter((a) => a.required_in_production);
  const readyCount = required.filter((a) => a.readiness_status === 'ready').length;

  return (
    <PanelCard
      title="Agent readiness register"
      subtitle={`${readyCount} of ${required.length} required production agents ready`}
      right={<Badge tone={readyCount === required.length ? 'green' : 'amber'}>{readyCount}/{required.length}</Badge>}
    >
      {agents.length === 0 ? (
        <EmptyState text="No agents registered" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] uppercase text-gray-500 border-b border-gray-800">
                <th className="px-5 py-3 font-medium">Agent</th>
                <th className="px-3 py-3 font-medium">Trigger</th>
                <th className="px-3 py-3 font-medium">Credentials</th>
                <th className="px-3 py-3 font-medium">Last success</th>
                <th className="px-3 py-3 font-medium">Readiness</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {agents.map((a) => (
                <tr key={a.id} className="hover:bg-white/[0.02]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {a.required_in_production && <Badge tone="red">req</Badge>}
                      <span className="text-white font-medium">{a.name}</span>
                    </div>
                    <div className="text-[10px] text-gray-500">{a.purpose}</div>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-400 whitespace-nowrap">
                    <div>{a.trigger_type}</div>
                    {a.schedule && <div className="text-[10px] text-gray-500">{a.schedule}</div>}
                  </td>
                  <td className="px-3 py-3">
                    <Badge tone={a.credentials_configured ? 'green' : 'amber'}>{a.credentials_configured ? 'configured' : 'missing'}</Badge>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {a.last_success ? new Date(a.last_success).toLocaleDateString('en-GB') : '—'}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Badge tone={readyTone(a.readiness_status)}>{READINESS[a.readiness_status] || a.readiness_status}</Badge>
                      {canEdit && (
                        <button
                          onClick={() => updateAgent(a.id, { readiness_status: a.readiness_status === 'ready' ? 'not_started' : 'ready' })}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 cursor-pointer whitespace-nowrap"
                        >
                          {a.readiness_status === 'ready' ? 'unmark' : 'mark ready'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PanelCard>
  );
}