'use client';

import Link from 'next/link';
import AgentStatusBar from '@/components/AgentStatusBar';
import type { AgentHealth } from '@/lib/useCommandCentreExtended';

interface AIOperationsAssistantSectionProps {
  agentHealth: AgentHealth | null;
  loading: boolean;
  onRefresh: () => void;
}

export default function AIOperationsAssistantSection({ agentHealth, loading, onRefresh }: AIOperationsAssistantSectionProps) {
  const registered = agentHealth?.registered_agents ?? 0;
  const failed24h = agentHealth?.failed_executions_24h ?? 0;
  const pendingEvents = agentHealth?.pending_webhook_events ?? 0;
  const available = !loading && registered > 0;

  return (
    <section className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
            <div className="w-4 h-4 flex items-center justify-center">
              <i className="ri-sparkling-line text-violet-400"></i>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">AI Operations Assistant</h2>
            <p className="text-[11px] text-gray-500">Automation, agents and operational interpretation</p>
          </div>
        </div>
        {available ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20 whitespace-nowrap shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            AI Assistant online
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 text-gray-400 text-[11px] font-semibold border border-white/10 whitespace-nowrap shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
            AI Assistant unavailable
          </span>
        )}
      </div>

      <div className="px-5 py-4 space-y-3">
        <AgentStatusBar
          agentKey="command_centre"
          loading={loading}
          error={null}
          data={available ? agentHealth : null}
          onRetry={onRefresh}
        />

        {available ? (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300">
              {registered} agent{registered === 1 ? '' : 's'} registered
            </span>
            <span className={`px-2.5 py-1 rounded-lg border ${failed24h > 0 ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
              {failed24h} failed in 24h
            </span>
            <span className={`px-2.5 py-1 rounded-lg border ${pendingEvents > 0 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-white/5 border-white/10 text-gray-300'}`}>
              {pendingEvents} pending event{pendingEvents === 1 ? '' : 's'}
            </span>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 text-sm">
            <div className="w-4 h-4 flex items-center justify-center text-amber-400 mt-0.5 shrink-0">
              <i className="ri-information-line text-sm"></i>
            </div>
            <p className="text-gray-400">
              AI automation is not currently connected. The AI Operations Copilot and automated
              agents remain available in the interface but will only activate once providers and
              agents are configured.
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href="/dashboard/ai-automation"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium hover:bg-violet-500/20 transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-3.5 h-3.5 flex items-center justify-center">
              <i className="ri-robot-2-line"></i>
            </div>
            AI Automation Hub
          </Link>
          <Link
            href="/dashboard/ai-assistant"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-xs font-medium hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-3.5 h-3.5 flex items-center justify-center">
              <i className="ri-chat-3-line"></i>
            </div>
            Open AI Assistant
          </Link>
        </div>
      </div>
    </section>
  );
}