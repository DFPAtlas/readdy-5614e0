'use client';

import { useEffect } from 'react';
import { captureException } from '@/lib/monitoring';

export default function ErrorMonitor() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      const err = event.error || new Error(event.message || 'Unknown error');
      captureException(err, { source: 'window', severity: 'P3' });
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const err = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      captureException(err, { source: 'window', severity: 'P3' });
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  return null;
}