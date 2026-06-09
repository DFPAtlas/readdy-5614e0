import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type APIProvider = 'openai' | 'anthropic' | 'google' | 'deepseek' | 'groq';

export interface APIKeyStatus {
  provider: APIProvider;
  configured: boolean;
  working: boolean;
  error?: string;
}

const EDGE_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1`
  : '';

export function useAPIKeysConfig() {
  const [statuses, setStatuses] = useState<Record<APIProvider, APIKeyStatus | null>>({
    openai: null,
    anthropic: null,
    google: null,
    deepseek: null,
    groq: null,
  });
  const [loadingProvider, setLoadingProvider] = useState<APIProvider | null>(null);
  const [savingProvider, setSavingProvider] = useState<APIProvider | null>(null);

  const testKey = useCallback(async (provider: APIProvider) => {
    setLoadingProvider(provider);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(`${EDGE_BASE}/test-api-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ provider }),
      });
      const data = await resp.json();
      setStatuses(prev => ({
        ...prev,
        [provider]: {
          provider,
          configured: data.configured ?? false,
          working: data.working ?? false,
          error: data.error,
        },
      }));
      return data;
    } catch {
      setStatuses(prev => ({
        ...prev,
        [provider]: {
          provider,
          configured: false,
          working: false,
          error: 'Failed to reach test endpoint',
        },
      }));
      return { configured: false, working: false, error: 'Failed to reach test endpoint' };
    } finally {
      setLoadingProvider(null);
    }
  }, []);

  const saveKey = useCallback(async (provider: APIProvider, apiKey: string) => {
    setSavingProvider(provider);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const resp = await fetch(`${EDGE_BASE}/save-api-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ provider, api_key: apiKey }),
      });
      const data = await resp.json();
      if (data.saved) {
        setStatuses(prev => ({
          ...prev,
          [provider]: {
            provider,
            configured: true,
            working: data.verified ?? false,
            error: data.error,
          },
        }));
      }
      return data;
    } catch {
      return { error: 'Failed to save key' };
    } finally {
      setSavingProvider(null);
    }
  }, []);

  return { statuses, loadingProvider, savingProvider, testKey, saveKey };
}