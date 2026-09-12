'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAgentRuntime, type RuntimeAgent } from '@/lib/useAgentRuntime';
import { RiskBadge, HealthPill, EnabledPill, timeAgo, formatMs } from './components/badges';
import DisableAgentModal from './components/DisableAgentModal';

const PRODUCTION_CATEGORIES = new Set(['scheduling', 'operations', 'safety', 'compliance', 'finance', 'payments', 'reliability', 'reporting', 'governance']);

export default function AgentRuntimePage() {
  const { agents, deadLetters, credentials, pendingApprovals, stats, loading, error, toggleEnabled, togglePaused, runTest, replayDeadLetter, markResolved } = useAgentRuntime();
  const [disableTarget, setDisableTarget] = useState<RuntimeAgent | null>(null);
  const [testState, setTestState] = useState<Record<string, { running: boolean; result: string }>>({});
  const [actionBusy, setActionBusy] = useState<Record<string, string>>({});

  const productionAgents = useMemo(() => agents.filter((a) => PRODUCTION_CATEGORIES.has(a.category || '')), [agents]);

  const totalEnabled = agents.filter((a) => a.is_active && !a.paused).length;
  const totalPaused = agents.filter((a) => a.paused).length;
  const deadLetterCount = deadLetters.length;
  const approvalCount = pendingApprovals.length;

  const handleTogglePause = async (a: RuntimeAgent) => {
    setActionBusy((p) => ({ ...p, [a.agent_key]: 'pause' }));
    await togglePaused(a.agent_key, !a.paused, 'toggled from operations console');
    setActionBusy((p) => ({ ...p, [a.agent_key]: '' }));
  };

  const handleEnable = async (a: RuntimeAgent) => {
    setActionBusy((p) => ({ ...p, [a.agent_key]: 'enable' }));
    await toggleEnabled(a.agent_key, true, 'enabled from operations console');
    setActionBusy((p) => ({ ...p, [a.agent_key]: '' }));
  };

  const handleDisableConfirm = async (reason: string) => {
    if (!disableTarget) return;
    await toggleEnabled(disableTarget.agent_key, false, reason);
    setDisableTarget(null);
  };

  const handleTest = async (a: RuntimeAgent) => {
    setTestState((p) => ({ ...p, [a.agent_key]: { running: true, result: '' } }));
    const res = await runTest(a.agent_key);
    setTestState((p) => ({
      ...p,
      [a.agent_key]: {
        running: false,
        result: res.success ? 'Test dispatched successfully.' : (res.error || 'Test failed'),
      },
    }));
  };

  const handleReplay = async (id: string) => {
    const dl = deadLetters.find((d) => d.id === id);
    if (!dl) return;
    setActionBusy((p) => ({ ...p, [id]: 'replay' }));
    const res = await replayDeadLetter(dl);
    setActionBusy((p) => ({ ...p, [id]: '' }));
    if (!res.success) alert(`Replay failed: ${res.error || 'unknown error'}`);
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-gray-800 rounded" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-[#111827] border border-gray-800 rounded-xl" />)}
          </div>
          <div className="h-96 bg-[#111827] border border-gray-800 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Agent Operations Console</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Production agent runtime — inventory, health, schedules, retries and dead-letter queue.
          </p>
        </div>
        <Link href="/admin/agents/approvals" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 transition-colors cursor-pointer whitespace-nowrap">
          <i className="ri-shield-check-line"></i>
          {approvalCount} awaiting approval
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg text-xs bg-red-500/10 border border-red-500/20 text-red-400">{error}</div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total agents</div>
          <div className="text-2xl font-bold text-white">{agents.length}</div>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Enabled</div>
          <div className="text-2xl font-bold text-emerald-400">{totalEnabled}</div>
        </div>
        <div className={`bg-[#111827] border rounded-xl p-4 ${totalPaused > 0 ? 'border-amber-600/20' : 'border-gray-800'}`}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Paused</div>
          <div className={`text-2xl font-bold ${totalPaused > 0 ? 'text-amber-400' : 'text-gray-400'}`}>{totalPaused}</div>
        </div>
        <div className={`bg-[#111827] border rounded-xl p-4 ${deadLetterCount > 0 ? 'border-red-600/20' : 'border-gray-800'}`}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Dead-lettered</div>
          <div className={`text-2xl font-bold ${deadLetterCount > 0 ? 'text-red-400' : 'text-gray-400'}`}>{deadLetterCount}</div>
        </div>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm">Agent inventory</h3>
          <span className="text-xs text-gray-500">{productionAgents.length} production agents</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-4 py-3 text-[10px] text-gray-500 uppercase font-medium">Agent</th>
                <th className="px-4 py-3 text-[10px] text-gray-500 uppercase font-medium">Status</th>
                <th className="px-4 py-3 text-[10px] text-gray-500 uppercase font-medium">Risk</th>
                <th className="px-4 py-3 text-[10px] text-gray-500 uppercase font-medium">Schedule</th>
                <th className="px-4 py-3 text-[10px] text-gray-500 uppercase font-medium">Health</th>
                <th className="px-4 py-3 text-[10px] text-gray-500 uppercase font-medium">Credentials</th>
                <th className="px-4 py-3 text-[10px] text-gray-500 uppercase font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {productionAgents.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">No production agents registered.</td></tr>
              ) : (
                productionAgents.map((a) => {
                  const s = stats[a.agent_key];
                  const successRate = s && s.total > 0 ? Math.round((s.succeeded / s.total) * 100) : null;
                  const agentCreds = credentials.filter((c) => c.agent_key === a.agent_key);
                  const missingCreds = agentCreds.filter((c) => c.status === 'not_configured').length;
                  const test = testState[a.agent_key];
                  return (
                    <tr key={a.agent_key} className="group hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <div className="text-white font-medium">{a.agent_name}</div>
                        <div className="text-[11px] text-gray-600 font-mono">{a.agent_key}</div>
                      </td>
                      <td className="px-4 py-3"><EnabledPill active={a.is_active} paused={a.paused} /></td>
                      <td className="px-4 py-3"><RiskBadge level={a.risk_level} /></td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{a.schedule || '—'}</td>
                      <td className="px-4 py-3">
                        <HealthPill lastStatus={s?.last_status || a.last_status} />
                        <div className="text-[10px] text-gray-600 mt-0.5">{s?.total ? `${successRate}% · ${timeAgo(s.last_run_at)}` : '—'}</div>
                      </td>
                      <td className="px-4 py-3">
                        {missingCreds > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                            <i className="ri-alert-line text-[11px]"></i> {missingCreds} missing
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">configured</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => handleTest(a)} disabled={test?.running} className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:text-indigo-400 hover:bg-indigo-600/10 transition-colors cursor-pointer disabled:opacity-50" title="Run test">
                            <i className={`${test?.running ? 'ri-loader-4-line animate-spin' : 'ri-flashlight-line'} text-sm`}></i>
                          </button>
                          {a.is_active ? (
                            <>
                              <button onClick={() => handleTogglePause(a)} disabled={!!actionBusy[a.agent_key]} className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:text-amber-400 hover:bg-amber-600/10 transition-colors cursor-pointer disabled:opacity-50" title={a.paused ? 'Resume schedule' : 'Pause schedule'}>
                                <i className={`${a.paused ? 'ri-play-fill' : 'ri-pause-fill'} text-sm`}></i>
                              </button>
                              <button onClick={() => setDisableTarget(a)} className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:text-red-400 hover:bg-red-600/10 transition-colors cursor-pointer" title="Disable">
                                <i className="ri-stop-circle-line text-sm"></i>
                              </button>
                            </>
                          ) : (
                            <button onClick={() => handleEnable(a)} disabled={!!actionBusy[a.agent_key]} className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50" title="Enable">
                              Enable
                            </button>
                          )}
                        </div>
                        {test?.result && <div className="text-[10px] text-right mt-1 text-gray-500">{test.result}</div>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm">Dead-letter queue</h3>
          <span className="text-xs text-gray-500">{deadLetterCount} unresolved</span>
        </div>
        {deadLetters.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-500">No dead-lettered events.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-4 py-3 text-[10px] text-gray-500 uppercase font-medium">Agent</th>
                  <th className="px-4 py-3 text-[10px] text-gray-500 uppercase font-medium">Event</th>
                  <th className="px-4 py-3 text-[10px] text-gray-500 uppercase font-medium">Error</th>
                  <th className="px-4 py-3 text-[10px] text-gray-500 uppercase font-medium">Attempts</th>
                  <th className="px-4 py-3 text-[10px] text-gray-500 uppercase font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {deadLetters.map((dl) => (
                  <tr key={dl.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-xs text-white font-medium">{dl.agent_key}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{dl.event_type || '—'}</td>
                    <td className="px-4 py-3 text-xs text-red-400 max-w-[280px] truncate">{dl.error_message || dl.error_code || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{dl.attempt_count}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handleReplay(dl.id)} disabled={!!actionBusy[dl.id]} className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50">
                          {actionBusy[dl.id] === 'replay' ? 'Replaying…' : 'Replay'}
                        </button>
                        <button onClick={() => markResolved(dl.id, 'marked resolved from console')} className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 transition-colors cursor-pointer whitespace-nowrap">
                          Resolve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {disableTarget && (
        <DisableAgentModal
          agent={disableTarget}
          onClose={() => setDisableTarget(null)}
          onConfirm={handleDisableConfirm}
        />
      )}
    </div>
  );
}