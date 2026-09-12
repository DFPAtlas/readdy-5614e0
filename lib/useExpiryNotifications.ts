'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface UseExpiryNotificationsResult {
  loading: boolean;
  error: string | null;
  sendExpiryNotifications: () => Promise<void>;
}

export function useExpiryNotifications(): UseExpiryNotificationsResult {
  const { companyId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendExpiryNotifications = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const funcUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/compliance-expiry-check`;

      const res = await fetch(funcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ company_id: companyId }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || 'Notification check failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check expiry notifications');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (companyId) sendExpiryNotifications();
  }, [companyId]);

  return { loading, error, sendExpiryNotifications };
}