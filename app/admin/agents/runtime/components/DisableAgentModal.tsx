'use client';

import { useState } from 'react';

export default function DisableAgentModal({
  agent,
  onConfirm,
  onClose,
}: {
  agent: { agent_name: string; risk_level: string | null };
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState('');
  const isCritical = agent.risk_level === 'critical' || agent.risk_level === 'high';

  const handleSubmit = () => {
    if (isCritical && !reason.trim()) return;
    onConfirm(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#111827] border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-white font-semibold text-sm">Disable agent</h3>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-white cursor-pointer">
            <i className="ri-close-line"></i>
          </button>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm text-gray-400 mb-3">
            You are about to disable <span className="text-white font-medium">{agent.agent_name}</span>.
          </p>
          {isCritical && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              This is a {agent.risk_level}-risk agent. An audit reason is required before disabling.
            </div>
          )}
          <label className="block text-xs text-gray-500 mb-1.5">Audit reason{isCritical ? ' (required)' : ' (optional)'}</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Why is this agent being disabled?"
            className="w-full bg-gray-900/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none"
          />
        </div>
        <div className="px-5 py-4 border-t border-gray-800 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-gray-800/40 transition-colors cursor-pointer whitespace-nowrap">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isCritical && !reason.trim()}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm disable
          </button>
        </div>
      </div>
    </div>
  );
}