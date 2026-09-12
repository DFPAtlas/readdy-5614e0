import { useState } from 'react';
import { supabase } from './supabase';
import { useRouter } from 'next/navigation';
import { getAppBaseUrl } from './getAppBaseUrl';

export function useStripeCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const checkout = async (plan: 'sentinel-starter' | 'sentinel' | 'command', billing: 'monthly' | 'yearly' = 'monthly', onSuccess?: () => void) => {
    setLoading(true);
    setError(null);

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        setError('Please log in to choose a plan');
        try { router.push('/login?next=/pricing'); } catch { window.location.href = '/login?next=/pricing'; }
        return;
      }

      if (!['sentinel-starter', 'sentinel', 'command'].includes(plan)) {
        setError('Invalid plan selected');
        return;
      }

      const returnUrl = getAppBaseUrl();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({ plan, billing, returnUrl }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      if (data.url) {
        if (onSuccess) onSuccess();
        try {
          window.open(data.url, '_top');
        } catch {
          window.location.href = data.url;
        }
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return { checkout, loading, error };
}