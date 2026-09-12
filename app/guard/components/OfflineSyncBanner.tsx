'use client';

import { useEffect, useState } from 'react';
import { getUnsyncedActions, updateActionStatus, markActionSynced, type QueuedAction } from '@/lib/useNetworkStatus';

interface OfflineSyncBannerProps {
  isOnline: boolean;
}

export default function OfflineSyncBanner({ isOnline }: OfflineSyncBannerProps) {
  const [actions, setActions] = useState<QueuedAction[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const refresh = () => setActions(getUnsyncedActions());
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isOnline || actions.length === 0) return;
    const pending = actions.filter((a) => a.syncStatus === 'queued' || a.syncStatus === 'failed');
    if (pending.length === 0) return;
    attemptSync(pending[0]);
  }, [isOnline, actions.length]);

  async function attemptSync(action: QueuedAction) {
    setSyncing(true);
    updateActionStatus(action.id, 'syncing');

    try {
      const { supabase } = await import('@/lib/supabase');

      if (action.type === 'clock_in') {
        const p = action.payload;
        const { error } = await supabase.from('attendance_logs').insert({
          company_id: p.company_id,
          shift_id: p.shift_id,
          guard_id: p.guard_id,
          clock_in: p.clock_in || new Date().toISOString(),
          clock_in_lat: p.clock_in_lat ?? null,
          clock_in_lng: p.clock_in_lng ?? null,
        });
        if (!error) markActionSynced(action.id);
        else updateActionStatus(action.id, 'failed');
      } else if (action.type === 'clock_out') {
        const p = action.payload;
        const { error } = await supabase.from('attendance_logs').update({
          clock_out: p.clock_out || new Date().toISOString(),
          clock_out_lat: p.lat ?? null,
          clock_out_lng: p.lng ?? null,
        }).eq('id', p.id);
        if (!error) markActionSynced(action.id);
        else updateActionStatus(action.id, 'failed');
      } else if (action.type === 'ob_entry') {
        const p = action.payload;
        const { error } = await supabase.from('occurrence_books').insert({
          company_id: p.company_id,
          site_id: p.site_id,
          guard_id: p.guard_id,
          entry_type: p.entry_type || 'Note',
          entry: p.entry,
          occurred_at: p.occurred_at || new Date().toISOString(),
          shift_id: p.shift_id,
          client_visible: p.client_visible ?? false,
          visibility: p.visibility ?? 'internal',
        });
        if (!error) markActionSynced(action.id);
        else updateActionStatus(action.id, 'failed');
      } else {
        updateActionStatus(action.id, 'failed');
      }
    } catch {
      updateActionStatus(action.id, 'failed');
    }

    setSyncing(false);
    setActions(getUnsyncedActions());
  }

  if (actions.length === 0 && isOnline) return null;

  const failedCount = actions.filter((a) => a.syncStatus === 'failed').length;
  const queuedCount = actions.filter((a) => a.syncStatus === 'queued').length;
  const total = failedCount + queuedCount + (syncing ? 1 : 0);

  return (
    <>
      <button
        onClick={() => setShowDetail(!showDetail)}
        className={`fixed top-16 left-4 right-4 z-40 rounded-xl p-3 flex items-center gap-3 cursor-pointer shadow-lg border max-w-lg mx-auto transition-all ${
          !isOnline
            ? 'bg-amber-500/10 border-amber-500/20'
            : syncing
            ? 'bg-[#3b82f6]/10 border-[#3b82f6]/20'
            : total > 0
            ? 'bg-amber-500/10 border-amber-500/20'
            : 'hidden'
        }`}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          !isOnline ? 'bg-amber-500/20' : syncing ? 'bg-[#3b82f6]/20' : 'bg-amber-500/20'
        }`}>
          <i className={`${
            !isOnline ? 'ri-wifi-off-line text-amber-400' : syncing ? 'ri-loader-4-line animate-spin text-[#3b82f6]' : 'ri-cloud-off-line text-amber-400'
          } text-sm`}></i>
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-xs font-semibold text-white">
            {!isOnline ? 'You are offline' : syncing ? 'Syncing...' : `${total} action${total > 1 ? 's' : ''} pending`}
          </p>
          <p className="text-[11px] text-gray-400">
            {!isOnline
              ? 'Actions will sync when connection returns'
              : failedCount > 0
              ? `${failedCount} failed. Tap to view.`
              : 'Tap to view queued actions'}
          </p>
        </div>
        {!isOnline && (
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
        )}
      </button>

      {showDetail && actions.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end justify-center">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-t-3xl w-full max-w-lg mx-auto p-6 animate-in slide-in-from-bottom duration-200 max-h-[60vh] overflow-y-auto">
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-5" />
            <h3 className="text-lg font-bold text-white mb-1">Pending Actions</h3>
            <p className="text-xs text-gray-400 mb-4">
              {!isOnline ? 'You are offline. Actions will sync when your connection returns.' : 'These actions are waiting to sync.'}
            </p>

            <div className="space-y-2 mb-4">
              {actions.map((a) => (
                <div key={a.id} className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    a.syncStatus === 'failed' ? 'bg-red-500/15' : a.syncStatus === 'syncing' ? 'bg-[#3b82f6]/15' : 'bg-amber-500/15'
                  }`}>
                    <i className={`${
                      a.syncStatus === 'failed' ? 'ri-close-line text-red-400' : a.syncStatus === 'syncing' ? 'ri-loader-4-line animate-spin text-[#3b82f6]' : 'ri-time-line text-amber-400'
                    } text-sm`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white capitalize">
                      {a.type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {new Date(a.deviceTimestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      {a.retryCount > 0 ? ` · ${a.retryCount} retr${a.retryCount === 1 ? 'y' : 'ies'}` : ''}
                    </p>
                  </div>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    a.syncStatus === 'failed' ? 'bg-red-500/10 text-red-400' : a.syncStatus === 'syncing' ? 'bg-[#3b82f6]/10 text-[#3b82f6]' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {a.syncStatus}
                  </span>
                  {a.syncStatus === 'failed' && (
                    <button
                      onClick={() => { updateActionStatus(a.id, 'queued'); setActions(getUnsyncedActions()); }}
                      className="w-7 h-7 rounded-lg bg-[#3b82f6]/15 flex items-center justify-center cursor-pointer shrink-0"
                    >
                      <i className="ri-refresh-line text-[#3b82f6] text-xs"></i>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                actions.forEach((a) => {
                  if (a.syncStatus === 'failed') markActionSynced(a.id);
                });
                setShowDetail(false);
              }}
              className="w-full h-12 bg-white/5 hover:bg-white/10 text-gray-400 font-medium rounded-xl cursor-pointer transition-colors whitespace-nowrap"
            >
              Dismiss All
            </button>
          </div>
        </div>
      )}
    </>
  );
}