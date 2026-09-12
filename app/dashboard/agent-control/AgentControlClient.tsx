'use client';

import { useState } from 'react';
import type { AutomationRule, AutomationApproval, AutomationAuditEntry, AutomationStats } from '@/lib/useAutomationControl';

interface Props {
  rules: AutomationRule[];
  approvals: AutomationApproval[];
  auditLog: AutomationAuditEntry[];
  stats: AutomationStats;
  agents: any[];
  loading: boolean;
  isSuperAdmin: boolean;
  companyName: string;
  approveAction: (id: string, note?: string) => Promise<{ success: boolean; error?: string }>;
  rejectAction: (id: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  toggleRule: (id: string, enabled: boolean) => Promise<{ success: boolean; error?: string }>;
  retryFailedRun: (id: string) => Promise<{ success: boolean; error?: string }>;
  replayDeadLetter: (id: string) => Promise<{ success: boolean; error?: string }>;
  refresh: () => void;
}

type Tab = 'overview' | 'agents' | 'rules' | 'approvals' | 'runs' | 'audit';

const riskColors: Record<string, string> = {
  low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const approvalStatusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
  expired: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

function timeAgo(iso: string | null): string {
  if (!iso) return '—';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AgentControlClient(props: Props) {
  const {
    rules, approvals, auditLog, stats, agents, isSuperAdmin, companyName,
    approveAction, rejectAction, toggleRule, retryFailedRun, replayDeadLetter, refresh,
  } = props;

  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [rejectModal, setRejectModal] = useState<{ open: boolean; approvalId: string; reason: string }>({ open: false, approvalId: '', reason: '' });
  const [approveNote, setApproveNote] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 4000);
  };

  const handleApprove = async (id: string) => {
    const result = await approveAction(id, approveNote);
    showMsg(result.success ? 'success' : 'error', result.success ? 'Approved successfully' : (result.error || 'Failed'));
    setApprovingId(null);
    setApproveNote('');
  };

  const handleReject = async () => {
    if (!rejectModal.reason.trim()) return;
    const result = await rejectAction(rejectModal.approvalId, rejectModal.reason);
    showMsg(result.success ? 'success' : 'error', result.success ? 'Rejected' : (result.error || 'Failed'));
    setRejectModal({ open: false, approvalId: '', reason: '' });
  };

  const tabs: { key: Tab; label: string; icon: string; count?: number }[] = [
    { key: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
    { key: 'agents', label: 'Agents', icon: 'ri-robot-2-line', count: agents.length },
    { key: 'rules', label: 'Rules', icon: 'ri-list-settings-line', count: rules.length },
    { key: 'approvals', label: 'Approvals', icon: 'ri-shield-check-line', count: approvals.filter(a => a.status === 'pending').length },
    { key: 'runs', label: 'Runs', icon: 'ri-history-line' },
    { key: 'audit', label: 'Audit Log', icon: 'ri-file-list-3-line', count: auditLog.length },
  ];

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Agent Control Centre</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isSuperAdmin ? 'Platform-wide automation oversight' : `${companyName} — Automation management`}
          </p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-700/60 transition-colors cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-refresh-line"></i>
          </div>
          Refresh
        </button>
      </div>

      {actionMsg && (
        <div className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 ${actionMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          <div className="w-4 h-4 flex items-center justify-center">
            <i className={actionMsg.type === 'success' ? 'ri-check-line' : 'ri-close-line'}></i>
          </div>
          {actionMsg.text}
        </div>
      )}

      <div className="flex items-center gap-1 mb-6 bg-[#111827] border border-gray-800 rounded-xl p-1 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.key
                ? 'bg-indigo-600/20 text-indigo-400'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className={tab.icon}></i>
            </div>
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${activeTab === tab.key ? 'bg-indigo-500/20 text-indigo-400' : 'bg-gray-700/50 text-gray-400'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Agents Active', value: `${stats.agents_active}/${stats.agents_registered}`, color: 'text-emerald-400', icon: 'ri-robot-2-line' },
              { label: 'Active Rules', value: stats.active_rules, color: 'text-blue-400', icon: 'ri-list-settings-line' },
              { label: 'Pending Approvals', value: stats.pending_approvals, color: stats.pending_approvals > 0 ? 'text-amber-400' : 'text-gray-400', icon: 'ri-shield-check-line' },
              { label: 'Failed Runs', value: stats.failed_runs, color: stats.failed_runs > 0 ? 'text-red-400' : 'text-gray-400', icon: 'ri-close-circle-line' },
              { label: 'Total Runs', value: stats.total_runs, color: 'text-white', icon: 'ri-history-line' },
              { label: 'Dead Letters', value: stats.dead_letter_events, color: stats.dead_letter_events > 0 ? 'text-orange-400' : 'text-gray-400', icon: 'ri-mail-close-line' },
            ].map(item => (
              <div key={item.label} className="bg-[#111827] border border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-5 h-5 flex items-center justify-center ${item.color}`}>
                    <i className={item.icon}></i>
                  </div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">{item.label}</span>
                </div>
                <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
              </div>
            ))}
          </div>

          {agents.length > 0 && (
            <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800">
                <h3 className="text-white font-semibold text-sm">Agent Health Overview</h3>
              </div>
              <div className="divide-y divide-gray-800/50">
                {agents.map((a: any) => (
                  <div key={a.agent_key} className="flex items-center gap-4 px-5 py-3">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${a.is_active ? 'bg-emerald-500' : 'bg-gray-600'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">{a.agent_name}</p>
                      <p className="text-[10px] text-gray-500 font-mono">{a.agent_key}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${riskColors[a.risk_level] || riskColors.low}`}>
                      {a.risk_level || 'low'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${a.requires_approval ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                      {a.requires_approval ? 'Approval' : 'Auto'}
                    </span>
                    <span className={`text-[10px] ${a.is_active ? 'text-emerald-400' : 'text-gray-600'}`}>
                      {a.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'agents' && (
        <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-white font-semibold text-sm">Registered Agents</h3>
          </div>
          {agents.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-800/50 mx-auto mb-3">
                <i className="ri-robot-2-line text-xl text-gray-600"></i>
              </div>
              <p className="text-sm text-gray-500">No agents registered yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800/50">
              {agents.map((a: any) => (
                <div key={a.agent_key} className="px-5 py-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm text-white font-medium">{a.agent_name}</p>
                      <p className="text-[10px] text-gray-500 font-mono">{a.agent_key}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${riskColors[a.risk_level] || riskColors.low}`}>
                        {a.risk_level || 'low'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${a.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'}`}>
                        {a.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  {a.description && <p className="text-xs text-gray-400 mb-2">{a.description}</p>}
                  <div className="flex items-center gap-4 text-[10px] text-gray-500">
                    <span>Category: {a.category || 'operational'}</span>
                    <span>Version: {a.version || '1.0.0'}</span>
                    <span>Requires Approval: {a.requires_approval ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">Automation Rules</h3>
          </div>
          {rules.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-800/50 mx-auto mb-3">
                <i className="ri-list-settings-line text-xl text-gray-600"></i>
              </div>
              <p className="text-sm text-gray-500">No rules configured yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800/50">
              {rules.map(rule => (
                <div key={rule.id} className="px-5 py-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-white font-medium">{rule.agent_name || rule.agent_key || 'Unknown'}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{rule.trigger_type}</span>
                    </div>
                    <p className="text-[10px] text-gray-500">Created {timeAgo(rule.created_at)}</p>
                  </div>
                  <button
                    onClick={() => toggleRule(rule.id, !rule.enabled)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      rule.enabled
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                        : 'bg-gray-500/10 text-gray-400 border border-gray-500/20 hover:bg-gray-500/20'
                    }`}
                  >
                    {rule.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'approvals' && (
        <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-white font-semibold text-sm">Pending Approvals</h3>
          </div>
          {approvals.filter(a => a.status === 'pending').length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-800/50 mx-auto mb-3">
                <i className="ri-shield-check-line text-xl text-gray-600"></i>
              </div>
              <p className="text-sm text-gray-500">No pending approvals.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800/50">
              {approvals.filter(a => a.status === 'pending').map(approval => (
                <div key={approval.id} className="px-5 py-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm text-white font-medium">{approval.requested_action}</p>
                      <p className="text-[10px] text-gray-500">Requested {timeAgo(approval.created_at)} · Expires {timeAgo(approval.expiry)}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${approvalStatusColors[approval.status]}`}>
                      {approval.status}
                    </span>
                  </div>
                  {approval.safe_preview && (
                    <div className="mb-3 p-3 rounded-lg bg-gray-900/40 border border-gray-800/50">
                      <pre className="text-[10px] text-gray-400 font-mono whitespace-pre-wrap">{JSON.stringify(approval.safe_preview, null, 2)}</pre>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {approvingId === approval.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={approveNote}
                          onChange={(e) => setApproveNote(e.target.value)}
                          placeholder="Optional note..."
                          className="bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 flex-1"
                        />
                        <button onClick={() => handleApprove(approval.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-colors cursor-pointer whitespace-nowrap">
                          Confirm
                        </button>
                        <button onClick={() => { setApprovingId(null); setApproveNote(''); }} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-600/20 text-gray-400 hover:bg-gray-600/30 transition-colors cursor-pointer whitespace-nowrap">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setApprovingId(approval.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectModal({ open: true, approvalId: approval.id, reason: '' })}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'runs' && (
        <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-white font-semibold text-sm">Execution Runs</h3>
          </div>
          <div className="p-12 text-center">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-800/50 mx-auto mb-3">
              <i className="ri-history-line text-xl text-gray-600"></i>
            </div>
            <p className="text-sm text-gray-500">Run details are available in the Admin Agents panel.</p>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h3 className="text-white font-semibold text-sm">Audit Log</h3>
          </div>
          {auditLog.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-800/50 mx-auto mb-3">
                <i className="ri-file-list-3-line text-xl text-gray-600"></i>
              </div>
              <p className="text-sm text-gray-500">No audit entries yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800/50 max-h-[600px] overflow-y-auto">
              {auditLog.map(entry => (
                <div key={entry.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center rounded bg-gray-800/50 shrink-0">
                    <i className={`text-xs ${entry.action.includes('reject') ? 'text-red-400 ri-close-circle-line' : entry.action.includes('approve') ? 'text-emerald-400 ri-checkbox-circle-line' : 'text-blue-400 ri-information-line'}`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate">{entry.action.replace(/_/g, ' ')}</p>
                    {entry.agent_key && <p className="text-[10px] text-gray-500">{entry.agent_key}</p>}
                  </div>
                  <span className="text-[10px] text-gray-600 whitespace-nowrap">{timeAgo(entry.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1f2e] border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-white font-semibold mb-3">Reject Approval</h3>
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Provide a reason for rejection..."
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 resize-none h-24 mb-4"
              maxLength={500}
            />
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setRejectModal({ open: false, approvalId: '', reason: '' })}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-700/50 text-gray-400 hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectModal.reason.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}