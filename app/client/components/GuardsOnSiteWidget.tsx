'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useClientPortal } from '@/lib/useClientPortal';
import WidgetBoundary from '@/components/dashboard/WidgetBoundary';
import WidgetFallback from '@/components/dashboard/WidgetFallback';

function formatTimeOnSite(clockedInAt: string | null) {
  if (!clockedInAt) return 'Not clocked in';
  const diff = Date.now() - new Date(clockedInAt).getTime();
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${mins}m on site`;
  return `${mins}m on site`;
}

export default function GuardsOnSiteWidget() {
  const { currentShifts, clocking, sites } = useClientPortal();
  const [expanded, setExpanded] = useState(false);

  const guards = currentShifts.map((shift) => {
    const log = clocking.find((c) => c.shift_id === shift.id);
    const site = sites.find((s) => s.id === shift.site_id);
    return {
      id: shift.id,
      name: shift.guard_name || 'Officer',
      phone: shift.guard_phone || null,
      siteName: site?.site_name || 'Unknown site',
      siteId: shift.site_id,
      isClockedIn: log?.is_clocked_in || false,
      clockedInAt: log?.clocked_in_at || null,
      shiftStart: shift.start_time,
      shiftEnd: shift.end_time,
    };
  });

  const displayed = expanded ? guards : guards.slice(0, 4);
  const clockedInCount = guards.filter((g) => g.isClockedIn).length;

  if (guards.length === 0) {
    return (
      <WidgetFallback state="empty" title="No officers" message="No officers currently assigned" />
    );
  }

  return (
    <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 flex items-center justify-center">
            <i className="ri-shield-user-line text-emerald-400"></i>
          </div>
          <h3 className="text-sm font-semibold text-white">Guards on Site</h3>
        </div>
        <span className="text-[11px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full font-medium">
          {clockedInCount}/{guards.length} active
        </span>
      </div>

      <div className="space-y-2.5">
        {displayed.map((guard) => (
          <div
            key={guard.id}
            className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.03] border border-white/5"
          >
            <div
              className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                guard.isClockedIn ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-medium text-white truncate">{guard.name}</p>
                {guard.isClockedIn && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded font-medium flex-shrink-0">
                    On Site
                  </span>
                )}
                {!guard.isClockedIn && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 rounded font-medium flex-shrink-0">
                    Assigned
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">{guard.siteName}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">
                {formatTimeOnSite(guard.clockedInAt)}
              </p>
            </div>
            <Link
              href={`/client/sites/${guard.siteId}`}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex-shrink-0 cursor-pointer mt-0.5"
            >
              View
            </Link>
          </div>
        ))}
      </div>

      {guards.length > 4 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 text-xs text-gray-400 hover:text-white font-medium py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
        >
          {expanded ? (
            <span className="flex items-center justify-center gap-1">
              <div className="w-3 h-3 flex items-center justify-center">
                <i className="ri-arrow-up-s-line"></i>
              </div>
              Show less
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1">
              <div className="w-3 h-3 flex items-center justify-center">
                <i className="ri-arrow-down-s-line"></i>
              </div>
              Show {guards.length - 4} more
            </span>
          )}
        </button>
      )}
    </div>
  );
}