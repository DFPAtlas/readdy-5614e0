'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  company_id: string | null;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  related_id: string | null;
  related_type: string | null;
  severity: 'info' | 'warning' | 'critical';
  read_at: string | null;
  created_at: string;
}

function playAlertSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // ignore audio errors
  }
}

function doVibrate() {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  } catch {
    // ignore
  }
}

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [criticalAlert, setCriticalAlert] = useState<Notification | null>(null);
  const pendingCriticals = useRef<Notification[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setNotifications(data as Notification[]);
      setUnreadCount(data.filter((n: any) => !n.read_at).length);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
    if (!userId) return;

    const channelName = `notifications-${userId}-${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev].slice(0, 50));
          setUnreadCount((c) => c + 1);

          setCriticalAlert((current) => {
            if (newNotif.severity === 'critical' && !newNotif.read_at) {
              if (!current) {
                playAlertSound();
                doVibrate();
                return newNotif;
              }
              pendingCriticals.current.push(newNotif);
            }
            return current;
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [userId, fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
      setUnreadCount(0);
    }
  }, [userId]);

  const deleteNotification = useCallback(async (id: string) => {
    if (!userId) return;
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (!error) {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((c) => {
        const wasUnread = notifications.find((n) => n.id === id)?.read_at === null;
        return wasUnread ? Math.max(0, c - 1) : c;
      });
    }
  }, [userId, notifications]);

  const clearAllRead = useCallback(async () => {
    if (!userId) return;
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .not('read_at', 'is', null);

    if (!error) {
      setNotifications((prev) => prev.filter((n) => !n.read_at));
    }
  }, [userId]);

  const dismissCritical = useCallback(async () => {
    if (criticalAlert) {
      await markAsRead(criticalAlert.id);
    }
    const next = pendingCriticals.current.shift();
    if (next) {
      setCriticalAlert(next);
      playAlertSound();
      doVibrate();
    } else {
      setCriticalAlert(null);
    }
  }, [criticalAlert, markAsRead]);

  return {
    notifications,
    unreadCount,
    loading,
    criticalAlert,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllRead,
    dismissCritical,
    refetch: fetchNotifications,
  };
}