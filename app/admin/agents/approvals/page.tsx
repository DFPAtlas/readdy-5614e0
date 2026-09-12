'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAgentRuntime } from '@/lib/useAgentRuntime';

const riskStyle: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export default function AgentApprovalsPage() {
  const { pendingApprovals, load, loading } = useAgentRuntime();
  const [note, setNote] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const decide = async (approvalId: string, decision: 'approve' | 'reject' | 'request_changes') => {
    setBusy((p) => ({ ...p, [approvalId]: decision }));
    setFeedback(null);
    const { data, error } = await supabase.functions.invoke('agent-approval-action', {
      body: { approval_id: approvalId, decision, note: note[approvalId] || '' },
    });
    if (error || data?.error) {
      setFeedback({ type: 'error', text: error?.message || data?.error || 'Action failed' });
    } else {
      setFeedback({ type: 'success', text: `Approval ${data?.status || decision} recorded.` });
      await load();
    }
    setBusy((p) => ({ ...p, [approvalId]: '' }));
  };

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Human Approval Centre</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Approve, reject or request changes for high-risk agent actions. Self-approval is blocked.
          </p>
        </div>
        <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${pendingApprovals.length > 0 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
          {pendingApprovals.length} pending
        </span>
      </div>

      {feedback && (
        <div className={`mb-4 p-3 rounded-lg text-xs border ${feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
          {feedback.text}
        </div>
      )}

      {loading ? (
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-12 flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
        </div>
      ) : pendingApprovals.length === 0 ? (
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-12 text-center">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gray-800/50 mx-auto mb-4">
            <i className="ri-check-double-line text-2xl text-gray-600"></i>
          </div>
          <h3 className="text-white font-semibold mb-1">No pending approvals</h3>
          <p className="text-sm text-gray-500">Approval-required agent actions will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingApprovals.map((a) => (
            <div key={a.id} className="bg-[#111827] border border-gray-800 rounded-xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-semibold text-sm">{a.requested_action}</span>
                    {a.risk_level && (
                      <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium border ${riskStyle[a.risk_level] || riskStyle.low}`}>
                        {a.risk_level}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 font-mono">{a.agent_key}</p>
                </div>
                <span className="text-xs text-gray-500">
                  Expires {a.expiry ? new Date(a.expiry).toLocaleString() : '—'}
                </span>
              </div>

              <textarea
                value={note[a.id] || ''}
                onChange={(e) => setNote((p) => ({ ...p, [a.id]: e.target.value }))}
                maxLength={500}
                rows={2}
                placeholder="Optional decision note"
                className="w-full bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none mb-3"
              />

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => decide(a.id, 'approve')}
                  disabled={!!busy[a.id]}
                  className="px-3 py-2 rounded-lg text-xs font-medium bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                >
                  {busy[a.id] === 'approve' ? 'Approving…' : 'Approve'}
                </button>
                <button
                  onClick={() => decide(a.id, 'request_changes')}
                  disabled={!!busy[a.id]}
                  className="px-3 py-2 rounded-lg text-xs font-medium bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                >
                  Request changes
                </button>
                <button
                  onClick={() => decide(a.id, 'reject')}
                  disabled={!!busy[a.id]}
                  className="px-3 py-2 rounded-lg text-xs font-medium bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                >
                  {busy[a.id] === 'reject' ? 'Rejecting…' : 'Reject'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}