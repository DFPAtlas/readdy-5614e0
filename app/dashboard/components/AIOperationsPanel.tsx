'use client';

import Link from 'next/link';
import type { AIAlert } from '@/lib/dashboardFetch';

interface AIOperationsPanelProps {
  aiAlerts: AIAlert[];
}

function formatAction(action: string): string {
  return action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AIOperationsPanel({ aiAlerts }: AIOperationsPanelProps) {
  const critical = aiAlerts.filter((a) => a.severity === 'critical').length;
  const high = aiAlerts.filter((a) => a.severity === 'high').length;
  const latest = aiAlerts[0];

  let healthLabel = 'No recent automation activity recorded';
  let healthColor = 'text-gray-500';
  let healthDot = 'bg-gray-600';
  if (critical > 0) {
    healthLabel = 'Degraded — review required';
    healthColor = 'text-red-400';
    healthDot = 'bg-red-500';
  } else if (high > 0) {
    healthLabel = 'Attention needed';
    healthColor = 'text-amber-400';
    healthDot = 'bg-amber-500';
  } else if (aiAlerts.length > 0) {
    healthLabel = 'Automation activity nominal';
    healthColor = 'text-emerald-400';
    healthDot = 'bg-emerald-500';
  }

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-robot-2-line text-blue-400 text-sm"></i>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-white">GuardianHub AI</h2>
          <p className="text-[11px] text-gray-500">Automation operations</p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] border border-white/5 rounded-lg mb-3">
        <span className={`w-2 h-2 rounded-full ${healthDot}`}></span>
        <span className={`text-xs font-medium ${healthColor}`}>{healthLabel}</span>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">Active alerts</span>
        <span className="text-sm font-bold text-white">{aiAlerts.length}</span>
      </div>
      <div className="flex items-center gap-3 mb-3 text-xs">
        <span className="text-red-400">{critical} critical</span>
        <span className="text-amber-400">{high} high</span>
        <span className="text-gray-500">{Math.max(0, aiAlerts.length - critical - high)} other</span>
      </div>

      {latest && (
        <div className="border-t border-white/5 pt-3 mb-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-600 mb-1">Latest observation</p>
          <p className="text-xs text-gray-300">{formatAction(latest.action_type)}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">{timeAgo(latest.created_at)}</p>
        </div>
      )}

      <Link
        href="/dashboard/ai-automation"
        className="flex items-center justify-center gap-1.5 w-full py-2 bg-white/5 hover:bg-white/8 border border-white/10 rounded-lg text-xs font-medium text-gray-300 hover:text-white transition-all cursor-pointer whitespace-nowrap"
      >
        <span>Open AI Automation Hub</span>
        <span className="w-4 h-4 flex items-center justify-center">
          <i className="ri-arrow-right-line"></i>
        </span>
      </Link>
    </div>
  );
}