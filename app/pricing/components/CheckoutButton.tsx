'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { startSubscriptionCheckout, type SubscriptionPlanKey, type BillingInterval } from '../../../lib/stripeSubscriptionCheckout';

interface CheckoutButtonProps {
  plan: 'sentinel-starter' | 'sentinel' | 'command';
  children: React.ReactNode;
  className?: string;
  billing: 'monthly' | 'yearly';
}

const ERROR_ACTIONS: Record<string, { label: string; href: string }> = {
  AUTH_REQUIRED: { label: 'Sign In', href: '/login' },
  CLIENT_MISSING: { label: 'Contact Support', href: '/contact' },
};

export default function CheckoutButton({ plan, children, billing, className = '' }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const router = useRouter();

  const handleCheckout = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setErrorCode(null);

    const planKey: SubscriptionPlanKey = plan;
    const billingInterval: BillingInterval = billing;

    const result = await startSubscriptionCheckout(planKey, billingInterval);

    if (result.success && result.url) {
      try {
        window.open(result.url, '_top');
      } catch {
        window.location.href = result.url;
      }
      return;
    }

    setError(result.error || 'Something went wrong');
    setErrorCode(result.code || null);

    if (result.code === 'AUTH_REQUIRED') {
      const nextUrl = encodeURIComponent('/pricing');
      try { router.push(`/login?next=${nextUrl}`); } catch { window.location.href = `/login?next=${nextUrl}`; }
    }

    setLoading(false);
  };

  const errorAction = errorCode ? ERROR_ACTIONS[errorCode] : null;

  return (
    <div>
      <button
        onClick={handleCheckout}
        disabled={loading}
        aria-busy={loading}
        className={`block w-full text-center py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="w-4 h-4 flex items-center justify-center">
              <i className="ri-loader-4-line animate-spin" />
            </span>
            Opening secure checkout…
          </span>
        ) : (
          children
        )}
      </button>

      {error && (
        <div className="mt-2 text-center">
          <p className="text-red-400 text-xs">{error}</p>
          {errorAction && !loading && (
            <a
              href={errorAction.href}
              className="inline-flex items-center gap-1 mt-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
            >
              <span className="w-3.5 h-3.5 flex items-center justify-center">
                <i className="ri-arrow-right-line text-xs" />
              </span>
              {errorAction.label}
            </a>
          )}
          {!errorAction && !loading && (
            <button
              onClick={handleCheckout}
              className="inline-flex items-center gap-1 mt-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
            >
              <span className="w-3.5 h-3.5 flex items-center justify-center">
                <i className="ri-refresh-line text-xs" />
              </span>
              Try again
            </button>
          )}
        </div>
      )}
    </div>
  );
}