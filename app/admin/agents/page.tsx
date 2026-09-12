'use client';

import { useState } from 'react';
import { useAdminAgents, useAdminAgentExecutions, useAdminAgentWebhooks, runAgentTest } from '@/lib/useAdminAgents';

const healthConfig: Record<string, { color: string; bg: string; label: string; icon: string }> = {
  healthy: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Healthy', icon: 'ri-checkbox-circle-fill' },
  warning: { color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Warning', icon: 'ri-error-warning-fill' },
  failed: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'Failed', icon: 'ri-close-circle-fill' },
  not_connected: { color: 'text-gray-500', bg: 'bg-gray-500/10', label: 'Not Connected', icon: 'ri-contrast-drop-2-fill' },
  unknown: { color: 'text-gray-400', bg: 'bg-gray-500/10', label: 'Unknown', icon: 'ri-question-fill' },
};

const statusBadge: Record<string, string> = {
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  skipped: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  pending: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  running: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
};

function timeAgo(iso: string | null): string {
  if (!iso) return 'Never';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatMs(ms: number | null): string {
  if (ms == null) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function AdminAgentsPage() {
  const { agents, loading } = useAdminAgents();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { running: boolean; result: { success: boolean; message: string } | null }>>({});
  const { executions, loading: execLoading } = useAdminAgentExecutions(selectedAgent);
  const { webhooks, loading: whLoading } = useAdminAgentWebhooks(selectedAgent);

  const handleTest = async (agentKey: string) => {
    setTestResults(prev => ({ ...prev, [agentKey]: { running: true, result: null } }));
    const result = await runAgentTest(agentKey);
    setTestResults(prev => ({ ...prev, [agentKey]: { running: false, result } }));
  };

  const totalRegistered = agents.length;
  const totalEnabled = agents.filter(a => a.is_active).length;
  const totalFailed24h = agents.filter(a => a.failed_24h > 0).length;
  const totalPendingWh = agents.reduce((s, a) => s + a.pending_webhooks, 0);
  const criticalAgents = agents.filter(a => a.health === 'failed' || a.health === 'warning');

  const selectedAgentData = agents.find(a => a.agent_key === selectedAgent);

  if (loading) {
    return (
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-56 bg-gray-800 rounded" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-[#111827] border border-gray-800 rounded-xl" />)}
          </div>
          <div className="h-96 bg-[#111827] border border-gray-800 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Agent Monitoring</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalRegistered} agents registered, {totalEnabled} enabled
            {totalFailed24h > 0 && <span className="text-red-400">, {totalFailed24h} with failures</span>}
          </p>
        </div>
        {criticalAgents.length > 0 && (
          <div className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {criticalAgents.length} agent{criticalAgents.length > 1 ? 's' : ''} need attention
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Registered</div>
          <div className="text-2xl font-bold text-white">{totalRegistered}</div>
        </div>
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Enabled</div>
          <div className="text-2xl font-bold text-emerald-400">{totalEnabled}</div>
        </div>
        <div className={`bg-[#111827] border rounded-xl p-4 ${totalFailed24h > 0 ? 'border-red-600/20' : 'border-gray-800'}`}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Failed (24h)</div>
          <div className={`text-2xl font-bold ${totalFailed24h > 0 ? 'text-red-400' : 'text-gray-400'}`}>{totalFailed24h}</div>
        </div>
        <div className={`bg-[#111827] border rounded-xl p-4 ${totalPendingWh > 0 ? 'border-amber-600/20' : 'border-gray-800'}`}>
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Pending Webhooks</div>
          <div className={`text-2xl font-bold ${totalPendingWh > 0 ? 'text-amber-400' : 'text-gray-400'}`}>{totalPendingWh}</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-white font-semibold text-sm">Registered Agents</h3>
          </div>
          <div className="divide-y divide-gray-800/50 max-h-[600px] overflow-y-auto">
            {agents.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">No agents registered.</div>
            ) : (
              agents.map((a) => {
                const h = healthConfig[a.health];
                const isSelected = selectedAgent === a.agent_key;
                return (
                  <button
                    key={a.agent_key}
                    onClick={() => setSelectedAgent(isSelected ? null : a.agent_key)}
                    className={`w-full text-left px-4 py-3 transition-colors cursor-pointer group ${isSelected ? 'bg-indigo-600/10 border-l-2 border-l-indigo-500' : 'hover:bg-white/[0.02] border-l-2 border-l-transparent'}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${a.is_active ? 'bg-emerald-500' : 'bg-gray-600'}`} />
                      <span className="text-sm text-white font-medium truncate flex-1">{a.agent_name}</span>
                      <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${h.bg} ${h.color}`}>
                        <i className={`${h.icon} text-[8px]`}></i>
                        {h.label}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 ml-4">
                      <span className="text-[10px] text-gray-600 font-mono">{a.agent_key}</span>
                      {a.failed_24h > 0 && <span className="text-[10px] text-red-400">{a.failed_24h} failed</span>}
                      {a.pending_webhooks > 0 && <span className="text-[10px] text-amber-400">{a.pending_webhooks} pending</span>}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selectedAgentData ? (
            <>
              <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedAgentData.agent_name}</h3>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{selectedAgentData.agent_key}</p>
                    {selectedAgentData.description && (
                      <p className="text-sm text-gray-400 mt-2">{selectedAgentData.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${selectedAgentData.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'}`}>
                      {selectedAgentData.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => handleTest(selectedAgentData.agent_key)}
                      disabled={testResults[selectedAgentData.agent_key]?.running}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                    >
                      {testResults[selectedAgentData.agent_key]?.running ? (
                        <span className="flex items-center gap-1"><i className="ri-loader-4-line animate-spin"></i> Testing</span>
                      ) : 'Test Agent'}
                    </button>
                  </div>
                </div>

                {testResults[selectedAgentData.agent_key]?.result && (
                  <div className={`mb-4 p-3 rounded-lg text-xs ${testResults[selectedAgentData.agent_key].result!.success ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
                    {testResults[selectedAgentData.agent_key].result!.message}
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-800/50">
                    <div className="text-[10px] text-gray-500 uppercase">Health</div>
                    <div className={`flex items-center gap-1.5 mt-1 ${healthConfig[selectedAgentData.health].color}`}>
                      <i className={`${healthConfig[selectedAgentData.health].icon} text-xs`}></i>
                      <span className="text-sm font-semibold">{healthConfig[selectedAgentData.health].label}</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-800/50">
                    <div className="text-[10px] text-gray-500 uppercase">Last Run</div>
                    <div className="text-sm font-semibold text-white mt-1">{timeAgo(selectedAgentData.last_run_at)}</div>
                    {selectedAgentData.last_status && (
                      <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] border ${statusBadge[selectedAgentData.last_status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                        {selectedAgentData.last_status}
                      </span>
                    )}
                  </div>
                  <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-800/50">
                    <div className="text-[10px] text-gray-500 uppercase">Failed (24h)</div>
                    <div className={`text-sm font-semibold mt-1 ${selectedAgentData.failed_24h > 0 ? 'text-red-400' : 'text-white'}`}>{selectedAgentData.failed_24h}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-800/50">
                    <div className="text-[10px] text-gray-500 uppercase">Avg Runtime</div>
                    <div className="text-sm font-semibold text-white mt-1">{formatMs(selectedAgentData.avg_duration_ms)}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-800/50">
                    <div className="text-[10px] text-gray-500 uppercase">Total Runs</div>
                    <div className="text-sm font-semibold text-white mt-1">{selectedAgentData.total_runs}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-800/50">
                    <div className="text-[10px] text-gray-500 uppercase">Pending Webhooks</div>
                    <div className={`text-sm font-semibold mt-1 ${selectedAgentData.pending_webhooks > 0 ? 'text-amber-400' : 'text-white'}`}>{selectedAgentData.pending_webhooks}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-800/50">
                    <div className="text-[10px] text-gray-500 uppercase">Webhook Path</div>
                    <div className="text-xs text-gray-400 mt-1 font-mono truncate">{selectedAgentData.webhook_path}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-800/50">
                    <div className="text-[10px] text-gray-500 uppercase">Last Error</div>
                    <div className={`text-xs mt-1 truncate ${selectedAgentData.last_error ? 'text-red-400' : 'text-gray-600'}`}>
                      {selectedAgentData.last_error || 'None'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-[#111827] border border-gray-800 rounded-xl">
                  <div className="px-5 py-4 border-b border-gray-800">
                    <h3 className="text-white font-semibold text-sm">Execution Logs</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {execLoading ? (
                      <div className="p-8 text-center"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500 mx-auto" /></div>
                    ) : executions.length === 0 ? (
                      <div className="p-8 text-center text-sm text-gray-500">No execution logs.</div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-800 text-left">
                            <th className="px-4 py-2 text-[10px] text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-2 text-[10px] text-gray-500 uppercase">Duration</th>
                            <th className="px-4 py-2 text-[10px] text-gray-500 uppercase">Error</th>
                            <th className="px-4 py-2 text-[10px] text-gray-500 uppercase">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                          {executions.map((e) => (
                            <tr key={e.id} className="group">
                              <td className="px-4 py-2.5">
                                <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] border ${statusBadge[e.status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                                  {e.status}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-[10px] text-gray-500">{formatMs(e.duration_ms)}</td>
                              <td className="px-4 py-2.5 text-[10px] text-red-400 max-w-[120px] truncate">{e.error_message || '—'}</td>
                              <td className="px-4 py-2.5 text-[10px] text-gray-500 whitespace-nowrap">{timeAgo(e.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                <div className="bg-[#111827] border border-gray-800 rounded-xl">
                  <div className="px-5 py-4 border-b border-gray-800">
                    <h3 className="text-white font-semibold text-sm">Webhook Events</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {whLoading ? (
                      <div className="p-8 text-center"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500 mx-auto" /></div>
                    ) : webhooks.length === 0 ? (
                      <div className="p-8 text-center text-sm text-gray-500">No webhook events.</div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-800 text-left">
                            <th className="px-4 py-2 text-[10px] text-gray-500 uppercase">Event</th>
                            <th className="px-4 py-2 text-[10px] text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-2 text-[10px] text-gray-500 uppercase">Retries</th>
                            <th className="px-4 py-2 text-[10px] text-gray-500 uppercase">Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                          {webhooks.map((w) => (
                            <tr key={w.id} className="group">
                              <td className="px-4 py-2.5 text-xs text-gray-400 max-w-[120px] truncate">{w.event_type}</td>
                              <td className="px-4 py-2.5">
                                <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${w.processed ? 'bg-emerald-500/10 text-emerald-400' : w.status === 'failed' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                  {w.processed ? 'Done' : w.status || 'pending'}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-[10px] text-gray-500">{w.retry_count || 0}</td>
                              <td className="px-4 py-2.5 text-[10px] text-gray-500 whitespace-nowrap">{timeAgo(w.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-[#111827] border border-gray-800 rounded-xl p-12 text-center">
              <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-800/50 mx-auto mb-4">
                <i className="ri-robot-2-line text-2xl text-gray-600"></i>
              </div>
              <h3 className="text-white font-semibold mb-1">Select an Agent</h3>
              <p className="text-sm text-gray-500">Choose an agent from the list to view its details, execution logs, and webhook events.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}