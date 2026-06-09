'use client';

import Link from 'next/link';
import { useClientPortal } from '@/lib/useClientPortal';

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatDuration(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

export default function ClientClockingPage() {
  const { sites, clocking, isLoading } = useClientPortal();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const clockedIn = clocking.filter((c) => c.is_clocked_in);
  const notClockedIn = clocking.filter((c) => !c.is_clocked_in);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
        <Link href="/client" className="hover:text-white cursor-pointer">Overview</Link>
        <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-right-s-line"></i></div>
        <span className="text-white font-medium">Officer Clocking</span>
      </div>

      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-white">Officer Clocking</h1>
        <p className="text-gray-400 mt-1">Real-time attendance across all your sites.</p>
        <div className="flex gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            <span className="text-sm text-gray-300">{clockedIn.length} clocked in</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
            <span className="text-sm text-gray-300">{notClockedIn.length} not yet clocked in</span>
          </div>
        </div>
      </div>

      {/* Currently on site */}
      {clockedIn.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Currently on site</h2>
          <div className="grid gap-3">
            {clockedIn.map((c) => {
              const site = sites.find((s) => s.id === c.site_id);
              const elapsed = c.clocked_in_at ? Date.now() - new Date(c.clocked_in_at).getTime() : 0;
              return (
                <div key={c.shift_id} className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex items-center justify-center bg-emerald-500/10 rounded-lg">
                        <i className="ri-shield-user-line text-emerald-400 text-lg"></i>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{c.guard_name}</p>
                        <p className="text-xs text-gray-500">{site?.site_name || 'Unknown site'}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      On duty
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Shift</p>
                      <p className="text-sm text-gray-300 mt-0.5">{formatTime(c.start_time)} — {formatTime(c.end_time)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Clocked in at</p>
                      <p className="text-sm text-gray-300 mt-0.5">{formatTime(c.clocked_in_at || c.start_time)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Elapsed</p>
                      <p className="text-sm text-gray-300 mt-0.5">{formatDuration(elapsed)}</p>
                    </div>
                  </div>
                  {c.clock_in_location && (
                    <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                      <i className="ri-map-pin-line"></i>
                      GPS verified at clock-in
                    </div>
                  )}
                  <div className="mt-3 flex gap-2">
                    <a
                      href={`tel:${c.guard_phone || ''}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-phone-line"></i></div>
                      Call officer
                    </a>
                    <Link
                      href={`/client/sites/${c.site_id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-300 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-building-line"></i></div>
                      View site
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Assigned but not clocked in */}
      {notClockedIn.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Assigned but not clocked in</h2>
          <div className="grid gap-3">
            {notClockedIn.map((c) => {
              const site = sites.find((s) => s.id === c.site_id);
              return (
                <div key={c.shift_id} className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex items-center justify-center bg-amber-500/10 rounded-lg">
                        <i className="ri-shield-user-line text-amber-400 text-lg"></i>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{c.guard_name}</p>
                        <p className="text-xs text-gray-500">{site?.site_name || 'Unknown site'}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                      Not clocked in
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Shift</p>
                      <p className="text-sm text-gray-300 mt-0.5">{formatTime(c.start_time)} — {formatTime(c.end_time)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Scheduled start</p>
                      <p className="text-sm text-gray-300 mt-0.5">{formatTime(c.start_time)}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Link
                      href={`/client/sites/${c.site_id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-300 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-building-line"></i></div>
                      View site
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {clocking.length === 0 && (
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
          <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full mx-auto mb-3">
            <i className="ri-time-line text-gray-500 text-xl"></i>
          </div>
          <p className="text-sm text-gray-400 font-medium">No shift data available</p>
          <p className="text-xs text-gray-500 mt-1">Clocking records will appear once officers are scheduled.</p>
        </div>
      )}
    </div>
  );
}