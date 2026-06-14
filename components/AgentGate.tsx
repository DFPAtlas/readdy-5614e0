'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { callAgent, logWebhookEvent } from '@/lib/guardianhubAgents';
import Link from 'next/link';

interface AgentGateProps {
  pagePath: string;
  featureName?: string;
  children: React.ReactNode;
}

export default function AgentGate({ pagePath, featureName, children }: AgentGateProps) {
  const { profile, companyId } = useAuth();
  const [status, setStatus] = useState<'loading' | 'allowed' | 'blocked' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!profile?.id) return;

    let cancelled = false;

    async function check() {
      setStatus('loading');
      const result = await callAgent(
        'entitlement',
        {
          page: pagePath,
          feature_name: featureName || pagePath,
          company_id: companyId,
          plan_slug: profile?.role || '',
        },
        {
          clientId: companyId,
          userId: profile?.id,
          requestedPage: pagePath,
          requestedFeature: featureName || pagePath,
        }
      );

      if (cancelled) return;

      logWebhookEvent('entitlement', 'entitlement_checked', {
        page: pagePath,
        result: result.success ? 'checked' : 'error',
        allowed: result.data?.access_allowed,
      }, companyId);

      if (!result.success) {
        setStatus('error');
        setErrorMessage(result.error || 'Entitlement check failed');
        return;
      }

      const allowed = result.data?.access_allowed !== false;

      if (allowed) {
        setStatus('allowed');
      } else {
        setStatus('blocked');
      }
    }

    check();
    return () => { cancelled = true; };
  }, [profile?.id, companyId, pagePath, featureName]);

  if (status === 'loading') {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex h-8 w-8">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-8 w-8 bg-blue-500"></span>
          </div>
          <p className="text-sm text-gray-500">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-red-500/10 border border-red-500/20 mx-auto mb-4">
            <i className="ri-error-warning-line text-2xl text-red-400"></i>
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Agent Unavailable</h2>
          <p className="text-sm text-gray-400 mb-1">{errorMessage}</p>
          <p className="text-xs text-gray-500 mb-5">The entitlement service is not responding. You can still access this page.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setStatus('loading'); setTimeout(() => window.location.reload(), 100); }}
              className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Retry
            </button>
            <button
              onClick={() => setStatus('allowed')}
              className="px-5 py-2.5 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/15 text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Continue Anyway
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'blocked') {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-4">
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-amber-500/20 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 mx-auto mb-5">
            <i className="ri-lock-line text-3xl text-amber-400"></i>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Upgrade Required</h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-2">
            {featureName
              ? `"${featureName}" is not available on your current plan.`
              : 'This feature requires a higher subscription plan.'}
          </p>
          <p className="text-xs text-gray-500 mb-6">
            {pagePath} — locked by entitlement agent
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/pricing"
              className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              View Plans
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/15 text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}