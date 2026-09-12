import { useState } from 'react';
import { supabase } from './supabase';
import { useRouter } from 'next/navigation';
import { getAppBaseUrl } from './getAppBaseUrl';

export function useStripePortal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const openPortal = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        setError('Please log in to manage billing');
        try { router.push('/login?next=/dashboard/settings'); } catch { window.location.href = '/login?next=/dashboard/settings'; }
        return;
      }

      const returnUrl = `${getAppBaseUrl()}/dashboard/settings`;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-portal-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({ returnUrl }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal');
      }

      if (data.url) {
        try {
          window.open(data.url, '_top');
        } catch {
          window.location.href = data.url;
        }
      } else {
        throw new Error('No portal URL returned');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return { openPortal, loading, error };
}