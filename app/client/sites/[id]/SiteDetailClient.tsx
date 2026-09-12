'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuthorizedClientSite } from '@/lib/useAuthorizedClientSite';
import { useSiteShifts } from '@/lib/useSiteShifts';
import { useSitePatrols } from '@/lib/useSitePatrols';
import { useSiteIncidents } from '@/lib/useSiteIncidents';
import { useSiteOB } from '@/lib/useSiteOB';
import { useSiteReports } from '@/lib/useSiteReports';
import SOPManager from '@/app/components/SOPManager';
import NoticeWidget from '@/app/dashboard/sites/[id]/notices/components/NoticeWidget';
import ContactsWidget from './ContactsWidget';
import DocumentsWidget from './DocumentsWidget';
import ComplianceWidget from './ComplianceWidget';
import SiteTopBar from './SiteTopBar';
import InlineSiteSettings from './InlineSiteSettings';
import WidgetErrorBoundary from '@/components/WidgetErrorBoundary';

function formatClockTime(dateStr: string | null) {
  if (!dateStr) return '--:--';
  return new Date(dateStr).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatTimeRange(start: string, end: string) {
  return `${formatClockTime(start)} \u2013 ${formatClockTime(end)}`;
}

function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'bg-red-500/10 border-red-500/20 text-red-400',
  high: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
  medium: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  low: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
};

const RISK_STYLES: Record<string, string> = {
  high: 'bg-red-500/10 border-red-500/20 text-red-400',
  medium: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  low: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
};

function ManageParamWatcher({ onOpen }: { onOpen: () => void }) {
  const params = useSearchParams();
  useEffect(() => {
    if (params.get('manage') === '1') onOpen();
  }, [params, onOpen]);
  return null;
}

function scrollToSettings() {
  const el = document.getElementById('site-settings');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function MiniSpinner() {
  return <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>;
}

export default function ClientSiteDetailPage({ siteId }: { siteId: string }) {
  const auth = useAuthorizedClientSite(siteId);

  const dataEnabled = !!(auth.site && auth.companyId);

  const shifts = useSiteShifts(siteId, auth.companyId, dataEnabled);
  const patrols = useSitePatrols(siteId, auth.companyId, dataEnabled);
  const incidents = useSiteIncidents(siteId, auth.companyId, dataEnabled);
  const ob = useSiteOB(siteId, auth.companyId, dataEnabled);
  const reports = useSiteReports(siteId, auth.companyId, dataEnabled);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    patrol: true,
    incidents: true,
    ob: true,
    reports: true,
    rota: true,
    patterns: false,
    upcoming: false,
    sops: false,
  });
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleManualRefresh = () => {
    shifts.refresh();
    patrols.refresh();
    incidents.refresh();
    ob.refresh();
    reports.refresh();
    auth.refresh();
    setLastRefresh(new Date());
  };

  if (auth.loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="bg-red-500/[0.06] backdrop-blur-sm border border-red-500/20 rounded-xl p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-2xl text-red-400"></i>
          </div>
          <h2 className="text-lg font-semibold text-white mb-1">Something went wrong</h2>
          <p className="text-sm text-gray-400">{auth.error}</p>
          <Link href="/client/sites" className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap mt-4">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
            Back to your sites
          </Link>
        </div>
      </div>
    );
  }

  if (auth.accessDenied) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="bg-red-500/[0.06] backdrop-blur-sm border border-red-500/20 rounded-xl p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <i className="ri-shield-keyhole-line text-2xl text-red-400"></i>
          </div>
          <h2 className="text-lg font-semibold text-white mb-1">Access Denied</h2>
          <p className="text-sm text-gray-400 mb-6">This site is not assigned to your account.</p>
          <Link href="/client/sites" className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
            Back to your sites
          </Link>
        </div>
      </div>
    );
  }

  if (auth.notFound) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <i className="ri-building-line text-2xl text-gray-400"></i>
          </div>
          <h2 className="text-lg font-semibold text-white mb-1">Site Not Found</h2>
          <p className="text-sm text-gray-400 mb-6">The site you are looking for does not exist or has been removed.</p>
          <Link href="/client/sites" className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
            Back to your sites
          </Link>
        </div>
      </div>
    );
  }

  if (!auth.site) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <i className="ri-inbox-line text-2xl text-gray-400"></i>
          </div>
          <h2 className="text-lg font-semibold text-white mb-1">No Sites Assigned</h2>
          <p className="text-sm text-gray-400 mb-6">No sites assigned to your account yet.</p>
          <Link href="/client" className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
            Back to overview
          </Link>
        </div>
      </div>
    );
  }

  const { site } = auth;
  const riskStyle = RISK_STYLES[site.risk_level || 'low'] || RISK_STYLES.low;
  const mapUrl = site.latitude && site.longitude
    ? `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5000!2d${site.longitude}!3d${site.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzk!5e0!3m2!1sen!2suk!4v1`
    : null;

  const officersOnSite = shifts.currentShifts.length;
  const clockedInCount = shifts.clocking.filter((c) => c.is_clocked_in).length;
  const lateCount = shifts.currentShifts.filter((s) => {
    const shiftStarted = new Date(s.start_time).getTime() < Date.now();
    const clk = shifts.clocking.find((c) => c.shift_id === s.id);
    return shiftStarted && !clk?.is_clocked_in;
  }).length;
  const uncoveredCount = shifts.todayShifts.filter((s) => !s.guard_id).length;
  const openIncidentsCount = incidents.openIncidents.length;

  const isCountyHall = (site.site_name?.toLowerCase() ?? '').includes('county hall');

  return (
    <>
      <SiteTopBar
        siteName={site.site_name}
        status={site.status}
        riskLevel={site.risk_level}
        onRefresh={handleManualRefresh}
        onScrollToSettings={scrollToSettings}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <Suspense fallback={null}>
        <ManageParamWatcher onOpen={scrollToSettings} />
      </Suspense>

      {/* Site Header Card */}
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl sm:text-2xl font-semibold text-white">{site.site_name}</h1>
                {isCountyHall && (
                  <span className="text-xs px-2.5 py-1 bg-blue-500/15 border border-blue-500/30 text-blue-300 rounded-full font-medium whitespace-nowrap">
                    Live Dashboard
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-400">{site.address}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${riskStyle}`}>
                  {site.risk_level ? site.risk_level.charAt(0).toUpperCase() + site.risk_level.slice(1) : 'Standard'} risk
                </span>
                {officersOnSite > 0 && (
                  <span className="text-xs px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1.5 align-middle"></span>
                    {officersOnSite} officer{officersOnSite !== 1 ? 's' : ''} on site
                  </span>
                )}
                {officersOnSite === 0 && (
                  <span className="text-xs px-2.5 py-0.5 bg-gray-500/10 border border-gray-500/20 text-gray-400 rounded-full font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500 inline-block mr-1.5 align-middle"></span>
                    No officers on site
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={scrollToSettings}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap border border-blue-500/20"
            >
              <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-edit-line"></i></div>
              Enter / Edit Site Data
            </button>
          </div>
        </div>
        {mapUrl && (
          <div className="h-40 w-full">
            <iframe src={mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="grayscale-[30%]" />
          </div>
        )}
      </div>

      {/* KPI Cards - independent loading per card */}
      <WidgetErrorBoundary>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
            <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-shield-user-line"></i></div>
            Officers
          </div>
          {shifts.loading ? <MiniSpinner /> : (
            <>
              <div className="text-2xl font-bold text-white">{officersOnSite}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{clockedInCount} clocked in</div>
            </>
          )}
        </div>
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
            <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-calendar-check-line"></i></div>
            Today&apos;s shifts
          </div>
          {shifts.loading ? <MiniSpinner /> : (
            <>
              <div className="text-2xl font-bold text-white">{shifts.todayShifts.length}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{uncoveredCount} uncovered</div>
            </>
          )}
        </div>
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
            <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-route-line"></i></div>
            Patrol
          </div>
          {patrols.loading ? <MiniSpinner /> : (
            <>
              <div className="text-2xl font-bold text-white">{patrols.completionPct}%</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{patrols.activeCheckpointsCount} checkpoints</div>
            </>
          )}
        </div>
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
            <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-alarm-warning-line"></i></div>
            Incidents
          </div>
          {incidents.loading ? <MiniSpinner /> : (
            <>
              <div className="text-2xl font-bold text-white">{openIncidentsCount}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">open</div>
            </>
          )}
        </div>
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
            <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-book-open-line"></i></div>
            OB Entries
          </div>
          {ob.loading ? <MiniSpinner /> : (
            <>
              <div className="text-2xl font-bold text-white">{ob.entries.length}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">recent</div>
            </>
          )}
        </div>
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
            <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-file-list-3-line"></i></div>
            Reports
          </div>
          {reports.loading ? <MiniSpinner /> : (
            <>
              <div className="text-2xl font-bold text-white">{reports.reports.length}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">published</div>
            </>
          )}
        </div>
      </div>
      </WidgetErrorBoundary>

      {/* Late warning banner */}
      {lateCount > 0 && (
        <div className="bg-red-500/[0.08] border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-red-500/10 rounded-lg flex-shrink-0">
            <i className="ri-time-line text-red-400 text-lg"></i>
          </div>
          <div>
            <p className="text-sm font-medium text-red-300">{lateCount} officer{lateCount > 1 ? 's' : ''} late for shift</p>
            <p className="text-xs text-red-400/70">Shift started but officer has not clocked in</p>
          </div>
        </div>
      )}

      {/* Main Grid: Current Cover + Today's Rota */}
      <WidgetErrorBoundary>
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Current Cover */}
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 flex items-center justify-center bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <i className="ri-user-star-line text-emerald-400 text-sm"></i>
              </div>
              <h3 className="text-sm font-semibold text-white">Current Cover</h3>
            </div>
            {shifts.loading && <MiniSpinner />}
          </div>
          <div className="p-4">
            {shifts.loading ? (
              <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-500"></div></div>
            ) : shifts.error ? (
              <div className="text-center py-6"><p className="text-xs text-gray-500">Could not load cover data</p></div>
            ) : shifts.currentShifts.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full mx-auto mb-2">
                  <i className="ri-user-unfollow-line text-gray-500"></i>
                </div>
                <p className="text-sm text-gray-400 font-medium">No officer currently on site</p>
                <p className="text-xs text-gray-500 mt-1">No active shift covers this site right now.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {shifts.currentShifts.map((shift) => {
                  const clk = shifts.clocking.find((c) => c.shift_id === shift.id);
                  const isLate = new Date(shift.start_time).getTime() < Date.now() && !clk?.is_clocked_in;
                  return (
                    <div key={shift.id} className={`p-4 rounded-lg border ${isLate ? 'bg-red-500/[0.06] border-red-500/20' : 'bg-white/5 border-white/5'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${clk?.is_clocked_in ? 'bg-emerald-500' : isLate ? 'bg-red-500' : 'bg-amber-400'}`}></div>
                          <span className="text-sm font-medium text-white">{shift.guard_name}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded border font-medium ${clk?.is_clocked_in ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : isLate ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                          {clk?.is_clocked_in ? 'On site' : isLate ? 'Late' : 'Scheduled'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-gray-500 uppercase tracking-wider text-[10px]">Shift</span>
                          <p className="text-gray-300 mt-0.5">{formatTimeRange(shift.start_time, shift.end_time)}</p>
                        </div>
                        {clk?.clocked_in_at && (
                          <div>
                            <span className="text-gray-500 uppercase tracking-wider text-[10px]">Clocked in</span>
                            <p className="text-emerald-400 mt-0.5">{formatClockTime(clk.clocked_in_at)}</p>
                          </div>
                        )}
                      </div>
                      {clk?.clock_in_lat && clk?.clock_in_lng && (
                        <div className="mt-2 text-[10px] text-gray-500 flex items-center gap-1">
                          <i className="ri-map-pin-line"></i>
                          GPS verified at clock-in
                        </div>
                      )}
                      {shift.shift_type && (
                        <span className="inline-block mt-2 text-[10px] px-1.5 py-0.5 bg-white/5 rounded border border-white/10 text-gray-500">{shift.shift_type}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Today's Rota */}
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 flex items-center justify-center bg-blue-500/10 rounded-lg border border-blue-500/20">
                <i className="ri-calendar-todo-line text-blue-400 text-sm"></i>
              </div>
              <h3 className="text-sm font-semibold text-white">Today&apos;s Rota</h3>
            </div>
            <span className="text-xs text-gray-500">{shifts.todayShifts.length} shifts</span>
          </div>
          <div className="p-4">
            {shifts.loading ? (
              <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div></div>
            ) : shifts.error ? (
              <div className="text-center py-6"><p className="text-xs text-gray-500">Could not load rota</p></div>
            ) : shifts.todayShifts.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full mx-auto mb-2">
                  <i className="ri-calendar-line text-gray-500"></i>
                </div>
                <p className="text-sm text-gray-400 font-medium">No shifts scheduled today</p>
                <p className="text-xs text-gray-500 mt-1">No rota entries for today at this site.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {shifts.todayShifts.map((shift) => (
                  <div key={shift.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${shift.guard_id ? 'bg-blue-400' : 'bg-gray-600'}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{shift.guard_name}</p>
                      <p className="text-xs text-gray-400">{formatTimeRange(shift.start_time, shift.end_time)}{shift.shift_type ? ` \u00B7 ${shift.shift_type}` : ''}</p>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium flex-shrink-0 ${shift.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : shift.status === 'cancelled' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                      {shift.status || 'scheduled'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      </WidgetErrorBoundary>

      {/* Patrol Status */}
      <WidgetErrorBoundary>
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center bg-violet-500/10 rounded-lg border border-violet-500/20">
              <i className="ri-route-line text-violet-400 text-sm"></i>
            </div>
            <h3 className="text-sm font-semibold text-white">Patrol Status</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">{patrols.activeCheckpointsCount} checkpoints</span>
            <span className="text-xs font-medium text-white">{patrols.completionPct}% complete</span>
            {patrols.loading && <MiniSpinner />}
          </div>
        </div>
        <div className="p-4">
          {patrols.loading ? (
            <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-violet-500"></div></div>
          ) : patrols.error ? (
            <div className="text-center py-6"><p className="text-xs text-gray-500">Could not load patrol data</p></div>
          ) : patrols.checkpoints.length === 0 ? (
            <div className="text-center py-6">
              <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full mx-auto mb-2">
                <i className="ri-map-pin-line text-gray-500"></i>
              </div>
              <p className="text-sm text-gray-400 font-medium">No patrol checkpoints configured</p>
              <p className="text-xs text-gray-500 mt-1">Checkpoints will appear once configured by your security provider.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {patrols.logs.length > 0 && (
                <div className="mb-3">
                  <div className="w-full bg-white/5 rounded-full h-2.5">
                    <div
                      className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${patrols.completionPct}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">{patrols.logs.length} patrol{patrols.logs.length !== 1 ? 's' : ''} logged today</p>
                </div>
              )}

              {patrols.logs.filter((l) => l.status === 'in_progress' || l.status === 'active').length > 0 && (
                <div className="space-y-2 mb-4">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Active patrols</p>
                  {patrols.logs.filter((l) => l.status === 'in_progress' || l.status === 'active').map((log) => (
                    <div key={log.id} className="p-3 bg-violet-500/[0.06] border border-violet-500/20 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">{log.guard_name}</span>
                        <span className="text-xs text-emerald-400 font-medium">{log.checkpoints_completed}/{log.checkpoints_total} done</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-gray-500">
                        {log.gps_verified_count > 0 && <span><i className="ri-gps-line text-emerald-400 mr-0.5"></i>{log.gps_verified_count} GPS verified</span>}
                        {log.out_of_radius_count > 0 && <span className="text-amber-400"><i className="ri-alert-line mr-0.5"></i>{log.out_of_radius_count} out of radius</span>}
                        {log.needs_review_count > 0 && <span className="text-red-400"><i className="ri-error-warning-line mr-0.5"></i>{log.needs_review_count} need review</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {patrols.scans.length === 0 && patrols.logs.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-gray-500">No patrol scans yet today</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Latest scans</p>
                  {patrols.scans.slice(0, 15).map((scan) => (
                    <div key={scan.id} className="flex items-center gap-3 p-2.5 bg-white/5 rounded-lg">
                      <div className={`w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 ${scan.gps_verified ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                        <i className={`text-sm ${scan.gps_verified ? 'ri-checkbox-circle-line text-emerald-400' : 'ri-map-pin-line text-amber-400'}`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white">{scan.checkpoint_name}</p>
                        <p className="text-[10px] text-gray-400">{scan.guard_name} {scan.distance_from_checkpoint != null ? `\u00B7 ${Math.round(scan.distance_from_checkpoint)}m` : ''}</p>
                      </div>
                      <span className="text-[10px] text-gray-500 flex-shrink-0">{timeAgo(scan.scanned_at)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </WidgetErrorBoundary>

      {/* Incidents + OB + Reports */}
      <WidgetErrorBoundary>
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Incidents */}
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 flex items-center justify-center bg-red-500/10 rounded-lg border border-red-500/20">
                <i className="ri-alarm-warning-line text-red-400 text-sm"></i>
              </div>
              <h3 className="text-sm font-semibold text-white">Incidents</h3>
            </div>
            <span className="text-xs text-gray-500">{openIncidentsCount} open</span>
          </div>
          <div className="p-4">
            {incidents.loading ? (
              <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500"></div></div>
            ) : incidents.error ? (
              <div className="text-center py-6"><p className="text-xs text-gray-500">Could not load incidents</p></div>
            ) : incidents.incidents.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-10 h-10 flex items-center justify-center bg-emerald-500/10 rounded-full mx-auto mb-2">
                  <i className="ri-shield-check-line text-emerald-400"></i>
                </div>
                <p className="text-sm text-gray-400 font-medium">No incidents reported</p>
                <p className="text-xs text-gray-500 mt-1">All quiet at this site.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {incidents.incidents.slice(0, 10).map((inc) => (
                  <Link key={inc.id} href={`/client/incidents/${inc.id}`} className="block p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-white">{inc.incident_type}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${SEVERITY_STYLES[inc.severity || 'low'] || SEVERITY_STYLES.low}`}>
                        {inc.severity}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 line-clamp-2">{(inc.ai_rewritten_report || inc.description || '').slice(0, 100)}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{formatDateShort(inc.created_at)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* OB Entries */}
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 flex items-center justify-center bg-blue-500/10 rounded-lg border border-blue-500/20">
                <i className="ri-book-open-line text-blue-400 text-sm"></i>
              </div>
              <h3 className="text-sm font-semibold text-white">Occurrence Book</h3>
            </div>
          </div>
          <div className="p-4">
            {ob.loading ? (
              <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div></div>
            ) : ob.error ? (
              <div className="text-center py-6"><p className="text-xs text-gray-500">Could not load OB entries</p></div>
            ) : ob.entries.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full mx-auto mb-2">
                  <i className="ri-book-line text-gray-500"></i>
                </div>
                <p className="text-sm text-gray-400 font-medium">No entries visible yet</p>
                <p className="text-xs text-gray-500 mt-1">Client-visible entries will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {ob.entries.slice(0, 10).map((entry) => (
                  <div key={entry.id} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-medium text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">{entry.entry_type}</span>
                      <span className="text-[10px] text-gray-500">{formatDateTime(entry.occurred_at || entry.created_at)}</span>
                    </div>
                    {entry.title && <p className="text-xs font-medium text-white mb-0.5">{entry.title}</p>}
                    <p className="text-[11px] text-gray-300 line-clamp-3">{entry.entry}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{entry.guard_name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reports */}
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 flex items-center justify-center bg-purple-500/10 rounded-lg border border-purple-500/20">
                <i className="ri-file-list-3-line text-purple-400 text-sm"></i>
              </div>
              <h3 className="text-sm font-semibold text-white">Reports</h3>
            </div>
          </div>
          <div className="p-4">
            {reports.loading ? (
              <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div></div>
            ) : reports.error ? (
              <div className="text-center py-6"><p className="text-xs text-gray-500">Could not load reports</p></div>
            ) : reports.reports.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full mx-auto mb-2">
                  <i className="ri-file-text-line text-gray-500"></i>
                </div>
                <p className="text-sm text-gray-400 font-medium">No reports published</p>
                <p className="text-xs text-gray-500 mt-1">Reports will appear once generated by your security provider.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {reports.reports.slice(0, 10).map((r) => (
                  <div key={r.id} className="p-3 bg-white/5 rounded-lg">
                    <p className="text-xs font-medium text-white">{r.title || r.report_type?.replace(/_/g, ' ') || 'Report'}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {r.period_start ? `${formatDateShort(r.period_start)} \u2014 ${formatDateShort(r.period_end || r.generated_at)}` : formatDateShort(r.generated_at)}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 bg-white/5 rounded border border-white/10 text-gray-500 capitalize">{r.report_type?.replace(/_/g, ' ')}</span>
                      {r.file_url && (
                        <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 cursor-pointer">
                          <div className="w-3 h-3 flex items-center justify-center"><i className="ri-download-line"></i></div>
                          PDF
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      </WidgetErrorBoundary>

      {/* Shift Patterns */}
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('patterns')}
          className="w-full px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center bg-teal-500/10 rounded-lg border border-teal-500/20">
              <i className="ri-repeat-line text-teal-400 text-sm"></i>
            </div>
            <h3 className="text-sm font-semibold text-white">Shift Patterns</h3>
          </div>
          <div className="w-5 h-5 flex items-center justify-center text-gray-400">
            {expandedSections.patterns ? <i className="ri-arrow-up-s-line"></i> : <i className="ri-arrow-down-s-line"></i>}
          </div>
        </button>
        {expandedSections.patterns && (
          <div className="px-5 pb-4">
            {shifts.loading ? (
              <div className="flex items-center justify-center py-6"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-500"></div></div>
            ) : shifts.shiftPatterns.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-xs text-gray-500">No shift patterns configured for this site.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {shifts.shiftPatterns.map((p) => (
                  <div key={p.id} className="bg-white/5 rounded-lg p-3 border border-white/5">
                    <p className="text-xs font-medium text-white">{(p as any).day_name || DAY_NAMES[p.day_of_week] || `Day ${p.day_of_week}`}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{p.start_time?.slice(0, 5)} \u2013 {p.end_time?.slice(0, 5)}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] px-1.5 py-0.5 bg-teal-500/10 text-teal-400 rounded border border-teal-500/20">{p.shift_type}</span>
                      <span className="text-[10px] text-gray-500">{p.guards_required} guard{p.guards_required !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upcoming Shifts */}
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        <button
          onClick={() => toggleSection('upcoming')}
          className="w-full px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 flex items-center justify-center bg-cyan-500/10 rounded-lg border border-cyan-500/20">
              <i className="ri-calendar-line text-cyan-400 text-sm"></i>
            </div>
            <h3 className="text-sm font-semibold text-white">Upcoming Shifts (7 days)</h3>
          </div>
          <div className="w-5 h-5 flex items-center justify-center text-gray-400">
            {expandedSections.upcoming ? <i className="ri-arrow-up-s-line"></i> : <i className="ri-arrow-down-s-line"></i>}
          </div>
        </button>
        {expandedSections.upcoming && (
          <div className="px-5 pb-4">
            {shifts.loading ? (
              <div className="flex items-center justify-center py-4"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-500"></div></div>
            ) : shifts.upcomingShifts.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-xs text-gray-500">No upcoming shifts scheduled.</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {shifts.upcomingShifts.slice(0, 20).map((shift) => (
                  <div key={shift.id} className="flex items-center gap-3 p-2.5 bg-white/5 rounded-lg">
                    <span className="text-[10px] text-gray-400 w-14 flex-shrink-0">{formatDateShort(shift.start_time)}</span>
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${shift.guard_id ? 'bg-blue-400' : 'bg-gray-600'}`}></div>
                    <span className="text-xs text-white flex-1 min-w-0 truncate">{shift.guard_name}</span>
                    <span className="text-[10px] text-gray-500 flex-shrink-0">{formatTimeRange(shift.start_time, shift.end_time)}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium flex-shrink-0 ${shift.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                      {shift.status || 'scheduled'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contacts + Documents (NEW) */}
      <WidgetErrorBoundary>
      <div className="grid lg:grid-cols-2 gap-5">
        <ContactsWidget siteId={siteId} companyId={auth.companyId} enabled={dataEnabled} />
        <DocumentsWidget siteId={siteId} companyId={auth.companyId} clientId={auth.clientId} enabled={dataEnabled} />
      </div>
      </WidgetErrorBoundary>

      {/* Compliance (NEW) */}
      <WidgetErrorBoundary>
      <ComplianceWidget siteId={siteId} companyId={auth.companyId} enabled={dataEnabled} />
      </WidgetErrorBoundary>

      {/* Notices + SOPs */}
      <WidgetErrorBoundary>
      <div className="grid lg:grid-cols-2 gap-5">
        <NoticeWidget siteId={siteId} siteName={site.site_name} />

        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSection('sops')}
            className="w-full px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 flex items-center justify-center bg-amber-500/10 rounded-lg border border-amber-500/20">
                <i className="ri-file-text-line text-amber-400 text-sm"></i>
              </div>
              <h3 className="text-sm font-semibold text-white">SOPs &amp; Instructions</h3>
            </div>
            <div className="w-5 h-5 flex items-center justify-center text-gray-400">
              {expandedSections.sops ? <i className="ri-arrow-up-s-line"></i> : <i className="ri-arrow-down-s-line"></i>}
            </div>
          </button>
          {expandedSections.sops && (
            <div className="px-5 pb-4">
              {site.assignment_instructions && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 mb-3">
                  <p className="text-[10px] text-amber-400 uppercase tracking-wider mb-1">Site Instructions</p>
                  <p className="text-xs text-gray-300">{site.assignment_instructions}</p>
                </div>
              )}
              <SOPManager siteId={siteId} />
            </div>
          )}
        </div>
      </div>
      </WidgetErrorBoundary>

      {/* Inline Site Settings & Data Entry (replaces the old modal) */}
      <InlineSiteSettings siteId={siteId} auth={auth} onSaved={handleManualRefresh} />

      {/* Auto-refresh indicator */}
      <div className="text-center">
        <p className="text-[10px] text-gray-600">Auto-refreshes every 30 seconds \u00B7 Last updated {lastRefresh.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
      </div>
      </div>
    </>
  );
}