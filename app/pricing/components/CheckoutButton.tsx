'use client';

import { useStripeCheckout } from '../../../lib/useStripeCheckout';

interface CheckoutButtonProps {
  plan: 'sentinel' | 'command';
  billing: 'monthly' | 'yearly';
  children: React.ReactNode;
  className?: string;
}

export default function CheckoutButton({ plan, billing, children, className = '' }: CheckoutButtonProps) {
  const { checkout, loading, error } = useStripeCheckout();

  return (
    <div>
      <button
        onClick={() => checkout(plan, billing)}
        disabled={loading}
        className={`block w-full text-center py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <i className="ri-loader-4-line animate-spin" />
            Redirecting to Stripe...
          </span>
        ) : (
          children
        )}
      </button>
      {error && (
        <p className="text-red-400 text-xs mt-2 text-center">{error}</p>
      )}
    </div>
  );
}