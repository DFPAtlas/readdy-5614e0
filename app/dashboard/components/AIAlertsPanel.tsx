'use client';

import { useState } from 'react';

interface AIAlert {
  id: string;
  icon: string;
  title: string;
  detail: string;
  color: string;
  bg: string;
}

const mockAlerts: AIAlert[] = [
  {
    id: '1',
    icon: 'ri-user-3-line',
    title: 'Staffing Risk',
    detail: 'Saturday night at One Canada Square — 2 guards on holiday',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    id: '2',
    icon: 'ri-alert-line',
    title: 'Pattern Detected',
    detail: '3 trespass incidents at Riverside Plaza this week',
    color: 'text-red-600',
    bg: 'bg-red-50',
  },
  {
    id: '3',
    icon: 'ri-id-card-line',
    title: 'SIA Expiring',
    detail: "J. Patel's licence expires in 14 days",
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
];

export default function AIAlertsPanel() {
  const [alerts, setAlerts] = useState<AIAlert[]>(mockAlerts);

  const dismiss = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-bold text-white">AI Alerts</h2>
        <div className="w-5 h-5 flex items-center justify-center text-blue-400">
          <i className="ri-sparkling-line text-sm"></i>
        </div>
      </div>

      {alerts.length === 0 ? (
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
                <span className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer font-medium">
                  View
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}