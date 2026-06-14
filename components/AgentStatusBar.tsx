'use client';

interface AgentStatusBarProps {
  agentKey: string;
  loading: boolean;
  error: string | null;
  data: any;
  onRetry: () => void;
}

export default function AgentStatusBar({ agentKey, loading, error, data, onRetry }: AgentStatusBarProps) {
  if (loading) {
    return (
      <div className="mb-4 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg flex items-center gap-3">
        <div className="w-4 h-4 flex items-center justify-center">
          <i className="ri-loader-4-line animate-spin text-blue-400 text-sm"></i>
        </div>
        <span className="text-sm text-blue-400">Loading {agentKey} data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4 p-3 bg-red-500/5 border border-red-500/20 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 flex items-center justify-center">
            <i className="ri-error-warning-line text-red-400 text-sm"></i>
          </div>
          <span className="text-sm text-red-400">{error}</span>
        </div>
        <button
          onClick={onRetry}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer whitespace-nowrap"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mb-4 p-3 bg-gray-500/5 border border-gray-500/10 rounded-lg flex items-center gap-3">
        <div className="w-4 h-4 flex items-center justify-center">
          <i className="ri-information-line text-gray-500 text-sm"></i>
        </div>
        <span className="text-sm text-gray-500">No live data yet</span>
      </div>
    );
  }

  return null;
}