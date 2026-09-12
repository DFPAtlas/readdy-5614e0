'use client';

import type { AgentHealth } from '@/lib/useCommandCentreExtended';

function timeAgo(iso: string | null): string {
  if (!iso) return 'Never';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

interface Props {
  agentHealth: AgentHealth | null;
}

export default function AgentHealthWidget({ agentHealth }: Props) {
  if (!agentHealth) {
    return (
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4 h-full flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 flex items-center justify-center text-violet-400">
            <i className="ri-robot-2-line text-sm"></i>
          </div>
          <h3 className="text-sm font-semibold text-white">Agent Health</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-gray-500">No agent data available</p>
        </div>
      </div>
    );
  }

  const hasIssues = agentHealth.failed_executions_24h > 0 || agentHealth.pending_webhook_events > 0;
  const lastStatus = agentHealth.last_execution_status;

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 flex items-center justify-center text-violet-400">
          <i className="ri-robot-2-line text-sm"></i>
        </div>
        <h3 className="text-sm font-semibold text-white">Agent Health</h3>
        {hasIssues ? (
          <span className="ml-auto px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px] font-semibold">Issues</span>
        ) : (
          <span className="ml-auto px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">Healthy</span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2 rounded-lg bg-gray-900/40 border border-gray-800/50">
          <p className="text-[10px] text-gray-500">Registered</p>
          <p className="text-lg font-bold text-white">{agentHealth.registered_agents}</p>
        </div>
        <div className="p-2 rounded-lg bg-gray-900/40 border border-gray-800/50">
          <p className="text-[10px] text-gray-500">Last Exec</p>
          <p className={`text-xs font-medium ${lastStatus === 'failed' ? 'text-red-400' : lastStatus === 'completed' ? 'text-emerald-400' : 'text-gray-400'}`}>
            {lastStatus || 'None'}
          </p>
        </div>
        <div className="p-2 rounded-lg bg-gray-900/40 border border-gray-800/50">
          <p className="text-[10px] text-gray-500">Failed (24h)</p>
          <p className={`text-lg font-bold ${agentHealth.failed_executions_24h > 0 ? 'text-red-400' : 'text-white'}`}>{agentHealth.failed_executions_24h}</p>
        </div>
        <div className="p-2 rounded-lg bg-gray-900/40 border border-gray-800/50">
          <p className="text-[10px] text-gray-500">Pending Events</p>
          <p className={`text-lg font-bold ${agentHealth.pending_webhook_events > 0 ? 'text-amber-400' : 'text-white'}`}>{agentHealth.pending_webhook_events}</p>
        </div>
      </div>

      {agentHealth.agents.length > 0 && (
        <div className="flex-1 overflow-y-auto space-y-1">
          {agentHealth.agents.map(a => (
            <div key={a.agent_key} className="flex items-center gap-2 py-1">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${a.is_active ? 'bg-emerald-500' : 'bg-gray-600'}`}></span>
              <span className="text-[10px] text-gray-400 truncate flex-1">{a.agent_name || a.agent_key}</span>
              <span className={`text-[10px] ${a.is_active ? 'text-emerald-400' : 'text-gray-600'}`}>{a.is_active ? 'Active' : 'Inactive'}</span>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-gray-600 mt-2">Last run: {timeAgo(agentHealth.last_execution_at)}</p>
    </div>
  );
}