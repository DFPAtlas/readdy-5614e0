'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { widgetErrorLogger } from '@/lib/widgetErrorLogger';

interface SafeWidgetConfig {
  widgetName: string;
  pagePath: string;
  clientId?: string | null;
  userId?: string | null;
  timeoutMs?: number;
}

interface SafeWidgetResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  retry: () => void;
}

export function useSafeWidgetData<T>(
  fetchFn: () => Promise<T>,
  isEmptyFn: (data: T | null) => boolean,
  config: SafeWidgetConfig
): SafeWidgetResult<T> {
  const { widgetName, pagePath, clientId, userId, timeoutMs = 15000 } = config;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const mountedRef = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doFetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutRef.current = setTimeout(() => {
        reject(new Error(`Request timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([fetchFn(), timeoutPromise]);
      if (mountedRef.current) {
        setData(result);
        setError(null);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        const message = err?.message || 'Unknown fetch error';
        setError(message);
        widgetErrorLogger({
          widget_name: widgetName,
          page_path: pagePath,
          client_id: clientId || null,
          user_id: userId || null,
          error_message: message,
          stack: err?.stack || null,
          timestamp: new Date().toISOString(),
        });
      }
    } finally {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchFn, timeoutMs, retryCount, widgetName, pagePath, clientId, userId]);

  useEffect(() => {
    mountedRef.current = true;
    doFetch();
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [doFetch]);

  const retry = useCallback(() => {
    setRetryCount((c) => c + 1);
  }, []);

  const isEmpty = loading ? false : isEmptyFn(data);

  return { data, loading, error, isEmpty, retry };
}