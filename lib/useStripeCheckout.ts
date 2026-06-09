import { useState } from 'react';
import { supabase } from './supabase';
import { useRouter } from 'next/navigation';

export function useStripeCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const checkout = async (plan: 'sentinel' | 'command', billing: 'monthly' | 'yearly') => {
    setLoading(true);
    setError(null);

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        setError('Please log in to choose a plan');
        router.push('/login?next=/pricing');
        return;
      }

      if (!['sentinel', 'command'].includes(plan)) {
        setError('Invalid plan selected');
        return;
      }

      const returnUrl = typeof window !== 'undefined' ? window.location.origin : '';

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
        window.location.href = data.url;
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