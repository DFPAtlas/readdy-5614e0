'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { callAgent, type AgentCallResult } from '@/lib/guardianhubAgents';
import { useClientPortal } from '@/lib/useClientPortal';
import { FeatureGate } from '@/lib/useEntitlements';
import AgentStatusBar from '@/components/AgentStatusBar';
import Link from 'next/link';
import WidgetBoundary from '@/components/dashboard/WidgetBoundary';
import WidgetFallback from '@/components/dashboard/WidgetFallback';
import SiteOverviewCard from './components/SiteOverviewCard';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export default function ClientOverviewPage() {
  const { profile, company } = useAuth();
  const {
    sites, incidents, reports, currentShifts, clocking,
    patrolSummary, siteNotices, siteHealth, activities,
    isLoading,
  } = useClientPortal();
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
        'health.status',
        {
          sites_count: sites.length,
          incidents_count: incidents.length,
          reports_count: reports.length,
          shifts_active: currentShifts.length,
        },
        {
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

  const guardsOnDuty = currentShifts.length;
  const clockedInCount = clocking.filter((c) => c.is_clocked_in).length;
  const openIncidents = incidents.filter((i) => i.status === 'open');
  const overallPatrolPct = patrolSummary.length > 0
    ? Math.round(patrolSummary.reduce((sum, p) => sum + p.patrolCompletionPct, 0) / patrolSummary.length)
    : 0;
  const avgCompliance = siteHealth.length > 0
    ? Math.round(siteHealth.reduce((sum, h) => sum + h.score, 0) / siteHealth.length)
    : 0;
  const activeNotices = siteNotices.length;

  const lastActivityForSite = (siteId: string) => {
    const a = activities.find((act) => act.site_id === siteId);
    return a?.occurred_at || null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-white">
                  Good {getGreeting()}, {profile?.first_name || 'there'}
                </h1>
                <p className="text-gray-400 mt-1">
                  Company overview across {sites.length === 1 ? 'your site' : `your ${sites.length} sites`}. Open any site for its full operational dashboard.
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
              <Link
                href="/client/sites"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-building-line"></i></div>
                All Sites
              </Link>
            </div>
          </div>
        </WidgetBoundary>

        <WidgetBoundary widgetName="CompanyStats" pagePath="/client" clientId={profile?.company_id} userId={profile?.id}>
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {[
              { icon: 'ri-building-line', label: 'Total Sites', value: sites.length, sub: 'under cover', color: 'text-white' },
              { icon: 'ri-shield-user-line', label: 'Guards on Duty', value: guardsOnDuty, sub: `${clockedInCount} clocked in`, color: 'text-white' },
              { icon: 'ri-user-follow-line', label: 'On Site Now', value: clockedInCount, sub: 'active officers', color: 'text-emerald-400' },
              { icon: 'ri-alarm-warning-line', label: 'Open Incidents', value: openIncidents.length, sub: `${weekIncidents.length} this week`, color: openIncidents.length > 0 ? 'text-red-400' : 'text-white' },
              { icon: 'ri-route-line', label: 'Patrol Completion', value: `${overallPatrolPct}%`, sub: 'across all sites', color: 'text-white' },
              { icon: 'ri-file-list-3-line', label: 'Reports Ready', value: readyReports.length, sub: 'published', color: 'text-white' },
              { icon: 'ri-shield-check-line', label: 'Compliance', value: `${avgCompliance}%`, sub: 'avg health', color: 'text-white' },
            ].map((stat) => (
              <div key={stat.label} className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-2">
                  <div className="w-3.5 h-3.5 flex items-center justify-center"><i className={stat.icon}></i></div>
                  <span className="truncate">{stat.label}</span>
                </div>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{stat.sub}</div>
              </div>
            ))}
          </div>
        </WidgetBoundary>

        <WidgetBoundary widgetName="SiteCards" pagePath="/client" clientId={profile?.company_id} userId={profile?.id}>
          {sites.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Your Sites</h2>
                <Link href="/client/sites" className="text-sm text-blue-400 hover:text-blue-300 font-medium cursor-pointer whitespace-nowrap">
                  View all sites
                </Link>
              </div>
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {sites.filter((s) => s.id).map((site) => (
                  <SiteOverviewCard
                    key={site.id}
                    site={site}
                    shift={currentShifts.find((s) => s.site_id === site.id)}
                    clocking={clocking.find((c) => c.site_id === site.id)}
                    openIncidents={incidents.filter((i) => i.site_id === site.id && i.status === 'open').length}
                    patrol={patrolSummary.find((p) => p.site_id === site.id)}
                    health={siteHealth.find((h) => h.site_id === site.id)}
                    lastActivity={lastActivityForSite(site.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center">
              <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-full mx-auto mb-3">
                <i className="ri-building-line text-gray-500 text-lg"></i>
              </div>
              <p className="text-sm text-gray-400 font-medium">No site dashboards yet</p>
              <p className="text-xs text-gray-500 mt-1">Your security provider will assign sites to your account.</p>
            </div>
          )}
        </WidgetBoundary>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <WidgetBoundary widgetName="ComplianceSummary" pagePath="/client" clientId={profile?.company_id} userId={profile?.id} fallbackTitle="Compliance">
              <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 flex items-center justify-center bg-teal-500/10 rounded-lg border border-teal-500/20">
                      <i className="ri-shield-check-line text-teal-400 text-sm"></i>
                    </div>
                    <h3 className="text-sm font-semibold text-white">Compliance Summary</h3>
                  </div>
                  <span className="text-xs text-gray-500">{avgCompliance}% avg health</span>
                </div>
                <div className="p-4">
                  {siteHealth.length === 0 ? (
                    <WidgetFallback state="empty" title="Compliance" message="No sites to assess yet." />
                  ) : (
                    <div className="space-y-2">
                      {siteHealth.map((health) => (
                        <Link
                          key={health.site_id}
                          href={`/client/sites/${health.site_id}`}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              health.score >= 80 ? 'bg-emerald-500' : health.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                            }`}></span>
                            <span className="text-sm font-medium text-white truncate">{health.site_name}</span>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                              health.status === 'Complete' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                              health.status === 'Needs setup' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                              'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            }`}>{health.status}</span>
                            <span className="text-sm font-bold text-white w-12 text-right">{health.score}/100</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </WidgetBoundary>

            <WidgetBoundary widgetName="WeeklyReportBanner" pagePath="/client" clientId={profile?.company_id} userId={profile?.id}>
              {readyReports[0] ? (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 rounded-lg">
                      <i className="ri-file-list-3-line text-blue-400 text-lg"></i>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Your latest report is ready</p>
                      <p className="text-sm text-gray-400">{readyReports[0].site_name}</p>
                    </div>
                  </div>
                  <Link href="/client/reports" className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap">
                    <div className="w-4 h-4 flex items-center justify-center"><i className="ri-eye-line"></i></div>
                    View Reports
                  </Link>
                </div>
              ) : (
                <WidgetFallback state="empty" title="Reports" message="No reports published yet." />
              )}
            </WidgetBoundary>
          </div>

          <div className="space-y-6">
            <WidgetBoundary widgetName="NotificationsCard" pagePath="/client" clientId={profile?.company_id} userId={profile?.id}>
              <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 flex items-center justify-center bg-amber-500/10 rounded-lg border border-amber-500/20">
                      <i className="ri-notification-3-line text-amber-400 text-sm"></i>
                    </div>
                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  </div>
                  <span className="text-xs text-gray-500">{activeNotices} active</span>
                </div>
                <div className="p-4">
                  {siteNotices.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-sm text-gray-400 font-medium">No active notices</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {siteNotices.slice(0, 6).map((notice) => (
                        <Link key={notice.id} href={`/client/sites/${notice.site_id}`} className="block p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${
                              notice.priority === 'high' || notice.priority === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                              notice.priority === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                              'bg-white/5 border-white/10 text-gray-400'
                            }`}>{notice.category}</span>
                            <span className="text-[10px] text-gray-500 truncate">{notice.site_name}</span>
                          </div>
                          <p className="text-xs font-medium text-white truncate">{notice.title}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </WidgetBoundary>

            <WidgetBoundary widgetName="QuickActionsSidebar" pagePath="/client" clientId={profile?.company_id} userId={profile?.id}>
              <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Quick actions</h3>
                <div className="space-y-2">
                  {[
                    { href: '/client/clocking', icon: 'ri-time-line', color: 'emerald', title: 'Officer clocking', sub: 'Real-time attendance' },
                    { href: '/client/reports', icon: 'ri-file-list-3-line', color: 'blue', title: 'View reports', sub: 'Weekly & incident summaries' },
                    { href: '/client/messages', icon: 'ri-mail-line', color: 'purple', title: 'Message ops', sub: 'Contact account manager' },
                    { href: '/client/incidents', icon: 'ri-alarm-warning-line', color: 'amber', title: 'Incident history', sub: 'Full record across sites' },
                  ].map((action) => (
                    <Link key={action.href} href={action.href} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                      <div className={`w-8 h-8 flex items-center justify-center bg-${action.color}-500/10 rounded-lg`}>
                        <i className={`${action.icon} text-${action.color}-400 text-sm`}></i>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{action.title}</p>
                        <p className="text-xs text-gray-500">{action.sub}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </WidgetBoundary>

            <WidgetBoundary widgetName="BillingCard" pagePath="/client" clientId={profile?.company_id} userId={profile?.id}>
              <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-3">Your account manager</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 rounded-full text-blue-400 text-sm font-semibold">AM</div>
                  <div>
                    <p className="text-sm font-medium text-white">Ops Team</p>
                    <p className="text-xs text-gray-500">{company?.contact_email || 'ops@company.com'}</p>
                  </div>
                </div>
                <Link href="/client/messages" className="mt-3 w-full text-center inline-block py-2 text-sm font-medium text-blue-400 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors cursor-pointer whitespace-nowrap">
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
