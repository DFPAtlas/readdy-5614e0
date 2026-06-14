'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { callAgent, logWebhookEvent, type AgentCallResult } from '@/lib/guardianhubAgents';
import { useClientPortal } from '@/lib/useClientPortal';
import GuardsOnSiteWidget from './components/GuardsOnSiteWidget';
import { FeatureGate } from '@/lib/useEntitlements';
import AgentStatusBar from '@/components/AgentStatusBar';
import Link from 'next/link';
import WidgetBoundary from '@/components/dashboard/WidgetBoundary';
import WidgetFallback from '@/components/dashboard/WidgetFallback';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function severityColor(severity: string) {
  switch (severity) {
    case 'critical': return 'bg-red-100 text-red-700 border-red-200';
    case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
    default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }
}

function activityIcon(type: string) {
  switch (type) {
    case 'incident': return 'ri-alarm-warning-line text-red-500';
    case 'patrol': return 'ri-route-line text-blue-500';
    case 'ob': return 'ri-file-text-line text-slate-500';
    case 'report': return 'ri-file-list-3-line text-purple-500';
    default: return 'ri-shield-check-line text-emerald-500';
  }
}

function activityLabel(type: string) {
  switch (type) {
    case 'incident': return 'Incident';
    case 'patrol': return 'Patrol';
    case 'ob': return 'Occurrence';
    case 'report': return 'Report';
    default: return 'Activity';
  }
}

function formatClockTime(dateStr: string | null) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function formatShiftTimeRange(start: string, end: string) {
  return `${formatClockTime(start)} – ${formatClockTime(end)}`;
}

export default function ClientOverviewPage() {
  const { profile, company } = useAuth();
  const { sites, incidents, reports, activities, currentShifts, clocking, isLoading } = useClientPortal();
  const [agentResult, setAgentResult] = useState<AgentCallResult | null>(null);
  const [agentLoading, setAgentLoading] = useState(true);
  const [agentError, setAgentError] = useState<string | null>(null);

  const fetchAgentData = useCallback(async () => {
    if (!profile?.id || !sites.length) return;
    setAgentLoading(true);
    setAgentError(null);
    try {
      const result = await callAgent(
        'client_dashboard',
        {
          sites_count: sites.length,
          incidents_count: incidents.length,
          reports_count: reports.length,
          shifts_active: currentShifts.length,
        },
        {
          clientId: profile.company_id,
          userId: profile.id,
          requestedPage: '/client',
          requestedFeature: 'client_dashboard',
        }
      );
      setAgentResult(result);
      if (result.error) setAgentError(result.error);
    } catch (err: any) {
      setAgentError(err.message || 'Agent call failed');
    } finally {
      setAgentLoading(false);
    }
  }, [profile?.id, profile?.company_id, sites.length, incidents.length, reports.length, currentShifts.length]);

  useEffect(() => {
    if (!isLoading && profile?.id) {
      fetchAgentData();
    }
  }, [isLoading, profile?.id, fetchAgentData]);

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const weekIncidents = incidents.filter((i) => i.created_at >= weekAgo);
  const readyReports = reports.filter((r) => r.status === 'sent');
  const latestReport = readyReports[0];

  const activeSites = sites.filter((s) => {
    const shift = currentShifts.find((sh) => sh.site_id === s.id);
    return !!shift;
  });

  const lateCount = sites.reduce((count, site) => {
    const siteShift = currentShifts.find((sh) => sh.site_id === site.id);
    const siteClocking = clocking.find((c) => c.site_id === site.id);
    if (siteShift) {
      const shiftStarted = new Date(siteShift.start_time).getTime() < Date.now();
      const isLate = !siteClocking?.is_clocked_in && shiftStarted;
      return count + (isLate ? 1 : 0);
    }
    return count;
  }, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const dashboardCards = agentResult?.data?.dashboard_cards || [];
  const agentAlerts = agentResult?.data?.alerts || [];

  return (
    <FeatureGate feature="hasClientPortal">
    <div className="space-y-6">
      <WidgetBoundary widgetName="AgentStatusBar" pagePath="/client" clientId={profile?.company_id} userId={profile?.id}>
        <AgentStatusBar
          agentKey="client_dashboard"
          loading={agentLoading}
          error={agentError}
          data={agentResult?.data}
          onRetry={fetchAgentData}
        />
      </WidgetBoundary>

      <WidgetBoundary widgetName="WelcomeHeader" pagePath="/client" clientId={profile?.company_id} userId={profile?.id}>
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-white">
            Good {getGreeting()}, {profile?.first_name || 'there'}
          </h1>
          <p className="text-gray-400 mt-1">
            Here's what's been happening at {sites.length === 1 ? 'your site' : `your ${sites.length} sites`}.
          </p>
          {weekIncidents.length === 0 ? (
            <p className="text-sm text-emerald-400 mt-3 font-medium flex items-center gap-1.5">
              <span className="w-4 h-4 flex items-center justify-center inline-flex"><i className="ri-shield-check-line"></i></span>
              All sites secure. No incidents logged this week.
            </p>
          ) : (
            <p className="text-sm text-amber-400 mt-3 font-medium flex items-center gap-1.5">
              <span className="w-4 h-4 flex items-center justify-center inline-flex"><i className="ri-information-line"></i></span>
              {weekIncidents.length} incident{weekIncidents.length > 1 ? 's' : ''} logged this week. All under review.
            </p>
          )}
        </div>
      </WidgetBoundary>

      <WidgetBoundary widgetName="StatsCards" pagePath="/client" clientId={profile?.company_id} userId={profile?.id}>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-building-line"></i></div>
              Sites Under Cover
            </div>
            <div className="text-3xl font-bold text-white">{sites.length}</div>
            <div className="text-xs text-emerald-400 mt-1">{activeSites.length} with active officer{lateCount > 0 && ` · ${lateCount} late`}</div>
          </div>
          <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-shield-user-line"></i></div>
              Officers on Duty
            </div>
            <div className="text-3xl font-bold text-white">{currentShifts.length}</div>
            <div className="text-xs text-gray-500 mt-1">
              {clocking.filter(c => c.is_clocked_in).length} currently clocked in
            </div>
          </div>
          {lateCount > 0 && (
            <div className="bg-red-500/[0.08] backdrop-blur-sm border border-red-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 text-red-300 text-sm mb-2">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-time-line"></i></div>
                Late Officers
              </div>
              <div className="text-3xl font-bold text-red-400">{lateCount}</div>
              <div className="text-xs text-red-300/70 mt-1">Shift started, not clocked in</div>
            </div>
          )}
          <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-alarm-warning-line"></i></div>
              Incidents This Week
            </div>
            <div className="text-3xl font-bold text-white">{weekIncidents.length}</div>
            {weekIncidents.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {['critical', 'high', 'medium', 'low'].map((sev) => {
                  const count = weekIncidents.filter((i) => i.severity === sev).length;
                  if (!count) return null;
                  return (
                    <span key={sev} className={`text-[10px] px-1.5 py-0.5 rounded border ${
                      sev === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                      sev === 'high' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                      sev === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                      'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}>
                      {count} {sev}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
          <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-file-list-3-line"></i></div>
              Reports Available
            </div>
            <div className="text-3xl font-bold text-white">{readyReports.length}</div>
            <div className="text-xs text-gray-500 mt-1">
              {latestReport
                ? `Latest: ${new Date(latestReport.generated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
                : 'No reports yet'}
            </div>
          </div>
        </div>
      </WidgetBoundary>

      <WidgetBoundary widgetName="WeeklyReportBanner" pagePath="/client" clientId={profile?.company_id} userId={profile?.id}>
        {latestReport ? (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 rounded-lg">
                <i className="ri-file-list-3-line text-blue-400 text-lg"></i>
              </div>
              <div>
                <p className="font-semibold text-white">Your weekly security report is ready</p>
                <p className="text-sm text-gray-400">
                  {latestReport.site_name} — {new Date(latestReport.period_start || latestReport.generated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })} to {new Date(latestReport.period_end || latestReport.generated_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
            {latestReport.file_url && (
              <a
                href={latestReport.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-eye-line"></i></div>
                View Report
              </a>
            )}
          </div>
        ) : (
          <WidgetFallback state="empty" title="Weekly Report" message="No reports generated yet." />
        )}
      </WidgetBoundary>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <WidgetBoundary widgetName="SiteStatusList" pagePath="/client" clientId={profile?.company_id} userId={profile?.id} fallbackTitle="Site Status">
            <h2 className="text-lg font-semibold text-white">Right now at your sites</h2>
            {sites.length === 0 ? (
              <WidgetFallback state="empty" title="No sites" message="No sites assigned to your account yet." />
            ) : (
              <div className="space-y-3">
                {sites.map((site) => {
                  const siteClocking = clocking.find((c) => c.site_id === site.id);
                  const siteShift = currentShifts.find((sh) => sh.site_id === site.id);
                  const hasIssue = incidents.some((i) => i.site_id === site.id && i.status === 'open' && ['high', 'critical'].includes(i.severity));

                  let statusDot = 'bg-gray-500';
                  let statusText = 'No cover scheduled';
                  let statusSub = '';
                  let isLate = false;
                  if (siteClocking?.is_clocked_in) {
                    statusDot = 'bg-emerald-500';
                    statusText = `Officer on site: ${siteClocking.guard_name}`;
                    statusSub = `Clocked in at ${formatClockTime(siteClocking.clocked_in_at)}`;
                  } else if (siteShift) {
                    const shiftStarted = new Date(siteShift.start_time).getTime() < Date.now();
                    isLate = !siteClocking?.is_clocked_in && shiftStarted;
                    statusDot = isLate ? 'bg-red-500' : 'bg-amber-400';
                    statusText = `Officer assigned: ${siteShift.guard_name || 'Officer'}`;
                    if (isLate) {
                      const minsLate = Math.floor((Date.now() - new Date(siteShift.start_time).getTime()) / 60000);
                      const hoursLate = Math.floor(minsLate / 60);
                      const remMins = minsLate % 60;
                      const lateText = hoursLate > 0 ? `${hoursLate}h ${remMins}m late` : `${minsLate}m late`;
                      statusSub = `Shift started at ${formatClockTime(siteShift.start_time)} — ${lateText}`;
                    } else {
                      statusSub = `Shift ${formatShiftTimeRange(siteShift.start_time, siteShift.end_time)}`;
                      if (siteClocking?.clocked_in_at) {
                        statusSub = `Last clocked in at ${formatClockTime(siteClocking.clocked_in_at)}`;
                      }
                    }
                  } else if (hasIssue) {
                    statusDot = 'bg-red-500';
                    statusText = 'Issue reported — under review';
                  }

                  return (
                    <div key={site.id} className={`bg-[#0f172a]/70 backdrop-blur-sm border rounded-xl p-4 flex items-start justify-between gap-3 transition-colors ${
                      isLate ? 'border-red-500/30 bg-red-500/[0.07]' : 'border-white/10'
                    }`}>
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${statusDot}`}></div>
                        <div className="min-w-0">
                          <p className="font-medium text-white text-sm">{site.site_name}</p>
                          <p className="text-xs text-gray-500">{site.address}</p>
                          <p className={`text-xs mt-1 ${isLate ? 'text-red-300' : 'text-gray-300'}`}>{statusText}</p>
                          {statusSub && (
                            <p className={`text-[11px] mt-0.5 ${isLate ? 'text-red-400/80' : 'text-gray-500'}`}>{statusSub}</p>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/client/sites/${site.id}`}
                        className="text-sm text-blue-400 hover:text-blue-300 font-medium cursor-pointer whitespace-nowrap flex-shrink-0 mt-0.5"
                      >
                        View site
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </WidgetBoundary>

          <WidgetBoundary widgetName="RecentActivity" pagePath="/client" clientId={profile?.company_id} userId={profile?.id} fallbackTitle="Recent Activity">
            <h2 className="text-lg font-semibold text-white mt-6">Recent activity</h2>
            {activities.length === 0 ? (
              <WidgetFallback state="empty" title="All quiet" message="No activity to report in the last 7 days." />
            ) : (
              <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl divide-y divide-white/5">
                {activities.slice(0, 10).map((a) => (
                  <div key={a.id} className="p-4 flex items-start gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg flex-shrink-0">
                      <i className={activityIcon(a.type)}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{activityLabel(a.type)}</span>
                        <span className="text-xs text-gray-500">{a.site_name}</span>
                      </div>
                      <p className="text-sm text-white mt-0.5">{a.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{a.description}</p>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">{formatTimeAgo(a.occurred_at)}</span>
                  </div>
                ))}
              </div>
            )}
            {activities.length > 10 && (
              <Link href="/client/incidents" className="text-sm text-blue-400 hover:text-blue-300 font-medium cursor-pointer">
                View all activity
              </Link>
            )}
          </WidgetBoundary>
        </div>

        <div className="space-y-6">
          <WidgetBoundary widgetName="GuardsOnSite" pagePath="/client" clientId={profile?.company_id} userId={profile?.id}>
            <GuardsOnSiteWidget />
          </WidgetBoundary>

          <WidgetBoundary widgetName="QuickActionsSidebar" pagePath="/client" clientId={profile?.company_id} userId={profile?.id}>
            <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Quick actions</h3>
              <div className="space-y-2">
                <Link
                  href="/client/clocking"
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-emerald-500/10 rounded-lg">
                    <i className="ri-time-line text-emerald-400 text-sm"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Officer clocking</p>
                    <p className="text-xs text-gray-500">Real-time attendance at your sites</p>
                  </div>
                </Link>
                <Link
                  href="/client/reports"
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-blue-500/10 rounded-lg">
                    <i className="ri-file-list-3-line text-blue-400 text-sm"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">View reports</p>
                    <p className="text-xs text-gray-500">Weekly and incident summaries</p>
                  </div>
                </Link>
                <Link
                  href="/client/messages"
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-purple-500/10 rounded-lg">
                    <i className="ri-mail-line text-purple-400 text-sm"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Message ops</p>
                    <p className="text-xs text-gray-500">Contact your account manager</p>
                  </div>
                </Link>
                <Link
                  href="/client/incidents"
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 flex items-center justify-center bg-amber-500/10 rounded-lg">
                    <i className="ri-alarm-warning-line text-amber-400 text-sm"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Incident history</p>
                    <p className="text-xs text-gray-500">Full record across all sites</p>
                  </div>
                </Link>
              </div>
            </div>
          </WidgetBoundary>

          <WidgetBoundary widgetName="AccountManagerCard" pagePath="/client" clientId={profile?.company_id} userId={profile?.id}>
            <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">Your account manager</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 rounded-full text-blue-400 text-sm font-semibold">
                  AM
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Ops Team</p>
                  <p className="text-xs text-gray-500">{company?.contact_email || 'ops@company.com'}</p>
                </div>
              </div>
              <Link
                href="/client/messages"
                className="mt-3 w-full text-center inline-block py-2 text-sm font-medium text-blue-400 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors cursor-pointer whitespace-nowrap"
              >
                Send a message
              </Link>
            </div>
          </WidgetBoundary>
        </div>
      </div>
    </div>
    </FeatureGate>
  );
}