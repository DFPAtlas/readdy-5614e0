'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface AIAlert {
  id: string;
  icon: string;
  title: string;
  detail: string;
  color: string;
  bg: string;
}

export default function AIAlertsPanel() {
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('ai_activity_logs')
      .select('id, title, detail, icon, color, bg, dismissed')
      .eq('dismissed', false)
      .order('created_at', { ascending: false })
      .limit(8)
      .then(({ data, error }) => {
        if (!error && data) {
          const mapped: AIAlert[] = data.map((row: any) => ({
            id: row.id,
            icon: row.icon || 'ri-sparkling-line',
            title: row.title,
            detail: row.detail,
            color: row.color || 'text-amber-400',
            bg: row.bg || 'bg-amber-500/10',
          }));
          setAlerts(mapped);
        }
        setLoading(false);
      });
  }, []);

  const dismiss = async (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    supabase
      .from('ai_activity_logs')
      .update({ dismissed: true })
      .eq('id', id)
      .then(({ error }) => {
        if (error && process.env.NODE_ENV === 'development') {
          console.error('Dismiss failed:', error.message);
        }
      });
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-bold text-white">AI Alerts</h2>
        <div className="w-5 h-5 flex items-center justify-center text-blue-400">
          <i className="ri-sparkling-line text-sm"></i>
        </div>
      </div>

      {loading ? (
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl p-8 flex items-center justify-center">
          <div className="relative flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-500"></span>
          </div>
          <span className="ml-3 text-xs text-gray-500">Scanning for alerts...</span>
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl p-6 text-center text-gray-500 text-sm">
          No active alerts — all clear.
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 shadow-sm rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${alert.bg}`}>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <i className={`${alert.icon} ${alert.color}`}></i>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white">{alert.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{alert.detail}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3 pl-12">
                <button
                  onClick={() => dismiss(alert.id)}
                  className="text-xs text-gray-500 hover:text-gray-300 cursor-pointer"
                >
                  Dismiss
                </button>
                <Link href="/dashboard/ai-automation" className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer font-medium">
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}