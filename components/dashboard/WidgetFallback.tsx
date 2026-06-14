'use client';

interface WidgetFallbackProps {
  state: 'loading' | 'empty' | 'error' | 'locked' | 'agent_unavailable';
  title?: string;
  message?: string;
  onRetry?: () => void;
  lockedFeature?: string;
}

export default function WidgetFallback({
  state,
  title,
  message,
  onRetry,
  lockedFeature,
}: WidgetFallbackProps) {
  const containerClasses =
    'bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[160px]';

  if (state === 'loading') {
    return (
      <div className={containerClasses}>
        <div className="w-6 h-6 mb-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
        </div>
        <p className="text-sm text-gray-400">
          {title ? `Loading ${title}...` : 'Loading...'}
        </p>
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div className={containerClasses}>
        <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full mb-3">
          <i className="ri-inbox-line text-gray-500 text-lg"></i>
        </div>
        <p className="text-sm font-medium text-gray-400">{title || 'No data'}</p>
        {message && <p className="text-xs text-gray-500 mt-1">{message}</p>}
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className={`${containerClasses} border-red-500/20 bg-red-500/[0.03]`}>
        <div className="w-10 h-10 flex items-center justify-center bg-red-500/10 rounded-full mb-3">
          <i className="ri-error-warning-line text-red-400 text-lg"></i>
        </div>
        <p className="text-sm font-medium text-red-400">
          {title ? `${title} unavailable` : 'Widget unavailable'}
        </p>
        {message && (
          <p className="text-xs text-red-400/70 mt-1 max-w-xs break-words">{message}</p>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-3.5 h-3.5 flex items-center justify-center">
              <i className="ri-refresh-line"></i>
            </div>
            Retry
          </button>
        )}
      </div>
    );
  }

  if (state === 'locked') {
    return (
      <div className={`${containerClasses} border-amber-500/20 bg-amber-500/[0.03]`}>
        <div className="w-10 h-10 flex items-center justify-center bg-amber-500/10 rounded-full mb-3">
          <i className="ri-lock-line text-amber-400 text-lg"></i>
        </div>
        <p className="text-sm font-medium text-amber-400">
          {lockedFeature ? `${lockedFeature} locked` : 'Feature locked'}
        </p>
        <p className="text-xs text-amber-400/70 mt-1">
          This feature is not available on your current plan.
        </p>
        <a
          href="/pricing"
          className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-colors cursor-pointer whitespace-nowrap"
        >
          <div className="w-3.5 h-3.5 flex items-center justify-center">
            <i className="ri-arrow-up-line"></i>
          </div>
          Upgrade
        </a>
      </div>
    );
  }

  if (state === 'agent_unavailable') {
    return (
      <div className={`${containerClasses} border-blue-500/20 bg-blue-500/[0.03]`}>
        <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 rounded-full mb-3">
          <i className="ri-cloud-off-line text-blue-400 text-lg"></i>
        </div>
        <p className="text-sm font-medium text-blue-400">Agent unavailable</p>
        {message && <p className="text-xs text-blue-400/70 mt-1">{message}</p>}
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-3.5 h-3.5 flex items-center justify-center">
              <i className="ri-refresh-line"></i>
            </div>
            Retry
          </button>
        )}
      </div>
    );
  }

  return null;
}