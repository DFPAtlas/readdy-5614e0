'use client';

import Link from 'next/link';
import { useAuth } from '../../../lib/auth';

export default function SubscriptionBanner() {
  const { profile, company } = useAuth();

  if (!profile || !company) return null;

  if (profile.role === 'super_admin') return null;

  if (profile.role === 'guard' || profile.role === 'client') return null;

  const status = company.subscription_status;
  const isActive = status === 'active' || status === 'trialing';

  if (isActive) return null;

  const hasStripeCustomer = !!company.stripe_customer_id;

  const statusLabels: Record<string, string> = {
    past_due: 'Payment overdue',
    unpaid: 'Payment failed',
    incomplete: 'Setup incomplete',
    canceled: 'Subscription cancelled',
  };

  const label = status ? statusLabels[status] || `Status: ${status}` : 'No active subscription';

  return (
    <div className="mb-5 p-4 bg-amber-500/8 border border-amber-500/25 rounded-lg flex items-start gap-3"
    >
      <div className="w-9 h-9 shrink-0 rounded-lg bg-amber-500/15 flex items-center justify-center"
      >
        <i className="ri-error-warning-line text-amber-400" />
      </div>
      <div className="flex-1 min-w-0"
      >
        <p className="text-sm font-medium text-amber-300"
        >
          {label}
        </p>
        <p className="text-xs text-amber-400/60 mt-0.5"
        >
          Some features may be restricted. Please update your billing to restore full access.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0"
      >
        <Link
          href="/pricing"
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
        >
          Choose a plan
        </Link>
        {hasStripeCustomer && (
          <Link
            href="/dashboard/settings"
            className="bg-white/5 hover:bg-white/10 text-white text-xs font-medium px-4 py-2 rounded-lg border border-white/10 transition-colors whitespace-nowrap cursor-pointer"
          >
            Billing settings
          </Link>
        )}
      </div>
    </div>
  );
}