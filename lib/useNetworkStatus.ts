'use client';

import { useState, useEffect, useCallback } from 'react';

const QUEUE_KEY = 'guard_pending_actions';

interface QueuedAction {
  id: string;
  type: string;
  payload: any;
  deviceTimestamp: number;
  retryCount: number;
  createdAt: number;
  lastAttempt: number | null;
  syncStatus: 'queued' | 'syncing' | 'synced' | 'failed';
}

function generateIdempotencyKey(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${ts}-${rand}`;
}

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [hasPendingActions, setHasPendingActions] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

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
      const pending = getPendingActions();
      const count = pending.filter((a) => a.syncStatus !== 'synced').length;
      setHasPendingActions(count > 0);
      setPendingCount(count);
    };
    checkPending();
    const interval = setInterval(checkPending, 2000);
    return () => clearInterval(interval);
  }, []);

  return { isOnline, hasPendingActions, pendingCount };
}

export function queuePendingAction(action: { type: string; payload: any }): string {
  const id = generateIdempotencyKey();
  const queued: QueuedAction = {
    id,
    type: action.type,
    payload: { ...action.payload, _idempotency_key: id },
    deviceTimestamp: Date.now(),
    retryCount: 0,
    createdAt: Date.now(),
    lastAttempt: null,
    syncStatus: 'queued',
  };
  const existing = getPendingActions();
  existing.push(queued);
  persistQueue(existing);
  return id;
}

export function getPendingActions(): QueuedAction[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getUnsyncedActions(): QueuedAction[] {
  return getPendingActions().filter((a) => a.syncStatus !== 'synced');
}

export function updateActionStatus(id: string, status: QueuedAction['syncStatus']) {
  const queue = getPendingActions();
  const found = queue.find((a) => a.id === id);
  if (found) {
    found.syncStatus = status;
    found.lastAttempt = Date.now();
    if (status !== 'synced') found.retryCount += 1;
    persistQueue(queue);
  }
}

export function markActionSynced(id: string) {
  const queue = getPendingActions();
  const filtered = queue.filter((a) => a.id !== id);
  persistQueue(filtered);
}

export function clearPendingActions() {
  localStorage.setItem(QUEUE_KEY, '[]');
}

export function clearUserCache() {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage('CLEAR_USER_CACHE');
  }
  clearPendingActions();
}

function persistQueue(queue: QueuedAction[]) {
  const trimmed = queue.slice(-50);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(trimmed));
}

export function usePendingActions() {
  const [actions, setActions] = useState<QueuedAction[]>([]);

  const refresh = useCallback(() => {
    setActions(getUnsyncedActions());
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [refresh]);

  const retryAction = useCallback(async (action: QueuedAction) => {
    updateActionStatus(action.id, 'syncing');
    refresh();
    return action;
  }, [refresh]);

  const dismissAction = useCallback((id: string) => {
    markActionSynced(id);
    refresh();
  }, [refresh]);

  return { actions, retryAction, dismissAction, refresh };
}