'use client';

import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [hasPendingActions, setHasPendingActions] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const checkPending = () => {
      const pending = localStorage.getItem('guard_pending_actions');
      setHasPendingActions(!!pending && pending !== '[]');
    };
    checkPending();
    const interval = setInterval(checkPending, 2000);
    return () => clearInterval(interval);
  }, []);

  return { isOnline, hasPendingActions };
}

export function queuePendingAction(action: { type: string; payload: any }) {
  const existing = JSON.parse(localStorage.getItem('guard_pending_actions') || '[]');
  existing.push({ ...action, timestamp: Date.now() });
  localStorage.setItem('guard_pending_actions', JSON.stringify(existing));
}

export function getPendingActions(): any[] {
  return JSON.parse(localStorage.getItem('guard_pending_actions') || '[]');
}

export function clearPendingActions() {
  localStorage.setItem('guard_pending_actions', '[]');
}

export function removePendingAction(timestamp: number) {
  const existing = getPendingActions();
  const filtered = existing.filter((a) => a.timestamp !== timestamp);
  localStorage.setItem('guard_pending_actions', JSON.stringify(filtered));
}