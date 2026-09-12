'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useOperationsCommand } from '@/lib/useOperationsCommand';
import MetricCards from './MetricCards';
import FilterBar from './FilterBar';
import ExportBar from './ExportBar';
import AIInsightsPanel from './AIInsightsPanel';

function timeAgo(iso: string | null): string {
  if (!iso) return 'N/A';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function PulseDot({ color }: { color: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5 shrink-0">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-75`}></span>
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color}`}></span>
    </span>
  );
}

const sevColors: Record<string, string> = {
  critical: 'text-red-400 bg-red-500/10 border-red-500/20',
  high: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  low: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
};

const sevDots: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-amber-500',
  low: 'bg-blue-500',
};

export default function OperationsCommandClient() {
  const { profile, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const {
    summary, welfareAlerts, patrolStatuses, gpsStatuses,
    clientNotifications, subscriptions, aiInsights,
    companies, sites,
    selectedCompanyId, selectedSiteId,
    setSelectedCompanyId, setSelectedSiteId,
    loading, error, lastUpdated, refetch,
  } = useOperationsCommand();
  const [activeTab, setActiveTab] = useState<'overview' | 'welfare' | 'patrols' | 'gps' | 'subscriptions'>('overview');

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#080c16] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
          <p className="text-sm text-gray-400">Loading Operations Command Centre...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#080c16] flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 max-w-md text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 flex items-center justify-center text-red-400">
              <i className="ri-error-warning-line text-lg"></i>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Failed to load dashboard</h2>
          <p className="text-sm text-gray-400 mb-4">{error}</p>
          <button onClick={refetch} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors cursor-pointer whitespace-nowrap">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const filteredNotifications = selectedSiteId
    ? clientNotifications
    : clientNotifications;

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'welfare' as const, label: 'Welfare', count: summary.welfareAlerts },
    { id: 'patrols' as const, label: 'Patrols', count: summary.missedCheckCalls },
    { id: 'gps' as const, label: 'GPS', count: summary.gpsOfflineGuards },
    { id: 'subscriptions' as const, label: 'Billing', count: summary.atRiskSubscriptions },
  ];

  return (
    <div className="min-h-screen bg-[#080c16]">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">Operations Command Centre</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                <PulseDot color="bg-emerald-500" />
                LIVE
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Real-time operations overview
              {lastUpdated && <span className="ml-2 text-gray-600">Updated {timeAgo(lastUpdated.toISOString())}</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ExportBar
              summary={summary}
              welfareAlerts={welfareAlerts}
              patrolStatuses={patrolStatuses}
              subscriptions={subscriptions}
              aiInsights={aiInsights}
            />
            <button
              onClick={refetch}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className="ri-refresh-line"></i>
              </div>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        <FilterBar
          companies={companies}
          sites={sites}
          selectedCompanyId={selectedCompanyId}
          selectedSiteId={selectedSiteId}
          onCompanyChange={setSelectedCompanyId}
          onSiteChange={setSelectedSiteId}
        />

        <MetricCards summary={summary} />

        <div className="flex items-center gap-1 mb-4 mt-6 px-1 py-1 bg-white/5 rounded-full w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'overview' && (
              <>
                <div className="bg-[#0c1222] border border-white/10 rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PulseDot color="bg-red-500" />
                      <h3 className="text-sm font-semibold text-white">Welfare Alerts</h3>
                    </div>
                    <span className="text-xs text-gray-500">{welfareAlerts.length} alerts</span>
                  </div>
                  <div className="max-h-[280px] overflow-y-auto">
                    {welfareAlerts.length === 0 ? (
                      <div className="px-5 py-8 text-center text-sm text-gray-500">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                          <div className="w-5 h-5 flex items-center justify-center text-emerald-400">
                            <i className="ri-check-line"></i>
                          </div>
                        </div>
                        No active welfare alerts
                      </div>
                    ) : (
                      welfareAlerts.slice(0, 10).map((alert) => (
                        <div key={alert.id} className="px-5 py-3 border-b border-white/5 hover:bg-white/5 transition-colors flex items-start gap-3">
                          <PulseDot color={alert.severity === 'critical' ? 'bg-red-500' : 'bg-orange-500'} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-medium text-white truncate">{alert.guardName}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${sevColors[alert.severity]}`}>
                                {alert.severity}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 truncate">{alert.description}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] text-gray-600">{alert.siteName}</span>
                              <span className="text-[10px] text-gray-600">{alert.companyName}</span>
                              <span className="text-[10px] text-gray-600">{timeAgo(alert.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-[#0c1222] border border-white/10 rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PulseDot color="bg-amber-500" />
                      <h3 className="text-sm font-semibold text-white">Patrol Compliance</h3>
                    </div>
                    <span className="text-xs text-gray-500">{summary.patrolCompletion}% complete</span>
                  </div>
                  <div className="max-h-[280px] overflow-y-auto">
                    {patrolStatuses.length === 0 ? (
                      <div className="px-5 py-8 text-center text-sm text-gray-500">No patrol data for today</div>
                    ) : (
                      patrolStatuses.map((p) => (
                        <div key={p.siteName} className="px-5 py-3 border-b border-white/5 hover:bg-white/5 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <span className="text-sm text-white truncate block">{p.siteName}</span>
                              <span className="text-[10px] text-gray-600">{p.companyName}</span>
                            </div>
                            <span className={`text-xs font-semibold shrink-0 ml-3 ${
                              p.percentage >= 90 ? 'text-emerald-400' :
                              p.percentage >= 50 ? 'text-amber-400' : 'text-red-400'
                            }`}>
                              {p.percentage}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                p.percentage >= 90 ? 'bg-emerald-500' :
                                p.percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.max(p.percentage, 2)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] text-gray-600">{p.completed}/{p.total} checkpoints</span>
                            <span className="text-[10px] text-gray-600">{timeAgo(p.lastPatrolAt)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-[#0c1222] border border-white/10 rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PulseDot color="bg-blue-500" />
                      <h3 className="text-sm font-semibold text-white">Client Notifications</h3>
                    </div>
                    <span className="text-xs text-gray-500">{filteredNotifications.length} unread</span>
                  </div>
                  <div className="max-h-[260px] overflow-y-auto">
                    {filteredNotifications.length === 0 ? (
                      <div className="px-5 py-8 text-center text-sm text-gray-500">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                          <div className="w-5 h-5 flex items-center justify-center text-emerald-400">
                            <i className="ri-check-line"></i>
                          </div>
                        </div>
                        All notifications cleared
                      </div>
                    ) : (
                      filteredNotifications.slice(0, 10).map((n) => (
                        <div key={n.id} className="px-5 py-3 border-b border-white/5 hover:bg-white/5 transition-colors flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${sevDots[n.severity] || 'bg-gray-500'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-medium text-white truncate">{n.title}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${sevColors[n.severity] || sevColors.low}`}>
                                {n.type}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] text-gray-600">{n.companyName}</span>
                              <span className="text-[10px] text-gray-600">{timeAgo(n.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'welfare' && (
              <div className="bg-[#0c1222] border border-white/10 rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
                  <PulseDot color="bg-red-500" />
                  <h3 className="text-sm font-semibold text-white">All Welfare Alerts</h3>
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                  {welfareAlerts.length === 0 ? (
                    <div className="px-5 py-12 text-center text-sm text-gray-500">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                        <div className="w-6 h-6 flex items-center justify-center text-emerald-400">
                          <i className="ri-shield-check-line"></i>
                        </div>
                      </div>
                      All guards safe — no welfare alerts
                    </div>
                  ) : (
                    welfareAlerts.map((alert) => (
                      <div key={alert.id} className="px-5 py-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                        <div className="flex items-start gap-3">
                          <PulseDot color={alert.severity === 'critical' ? 'bg-red-500' : 'bg-orange-500'} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-white">{alert.guardName}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${sevColors[alert.severity]}`}>
                                {alert.type.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400">{alert.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-gray-500">{alert.siteName}</span>
                              <span className="text-xs text-gray-500">{alert.companyName}</span>
                              <span className="text-xs text-gray-600">{timeAgo(alert.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'patrols' && (
              <div className="bg-[#0c1222] border border-white/10 rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
                  <PulseDot color="bg-amber-500" />
                  <h3 className="text-sm font-semibold text-white">Patrol Details</h3>
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                  {patrolStatuses.length === 0 ? (
                    <div className="px-5 py-12 text-center text-sm text-gray-500">No patrol data for today</div>
                  ) : (
                    patrolStatuses.map((p) => (
                      <div key={p.siteName} className="px-5 py-4 border-b border-white/5">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-sm font-semibold text-white block">{p.siteName}</span>
                            <span className="text-xs text-gray-500">{p.companyName}</span>
                          </div>
                          <span className={`text-lg font-bold ${
                            p.percentage >= 90 ? 'text-emerald-400' :
                            p.percentage >= 50 ? 'text-amber-400' : 'text-red-400'
                          }`}>
                            {p.percentage}%
                          </span>
                        </div>
                        <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-full rounded-full transition-all ${
                              p.percentage >= 90 ? 'bg-emerald-500' :
                              p.percentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.max(p.percentage, 3)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{p.completed} / {p.total} checkpoints</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                            p.status === 'complete' ? 'bg-emerald-500/10 text-emerald-400' :
                            p.status === 'partial' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-red-500/10 text-red-400'
                          }`}>
                            {p.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'gps' && (
              <div className="bg-[#0c1222] border border-white/10 rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
                  <PulseDot color="bg-blue-500" />
                  <h3 className="text-sm font-semibold text-white">GPS Tracking Status</h3>
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                  {gpsStatuses.length === 0 ? (
                    <div className="px-5 py-12 text-center text-sm text-gray-500">
                      <div className="w-12 h-12 rounded-full bg-gray-500/10 flex items-center justify-center mx-auto mb-3">
                        <div className="w-6 h-6 flex items-center justify-center text-gray-500">
                          <i className="ri-map-pin-line"></i>
                        </div>
                      </div>
                      No GPS data available
                    </div>
                  ) : (
                    gpsStatuses.map((g) => (
                      <div key={g.guardId} className="px-5 py-4 border-b border-white/5 hover:bg-white/5 transition-colors flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full shrink-0 ${g.online ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-white block truncate">{g.guardName}</span>
                          <span className="text-xs text-gray-500">{g.siteName} — {g.companyName}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-xs font-medium ${g.online ? 'text-emerald-400' : 'text-red-400'}`}>
                            {g.online ? 'Online' : 'Offline'}
                          </span>
                          <p className="text-[10px] text-gray-600">{timeAgo(g.lastCheckIn)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'subscriptions' && (
              <div className="bg-[#0c1222] border border-white/10 rounded-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
                  <PulseDot color="bg-purple-500" />
                  <h3 className="text-sm font-semibold text-white">Subscription Status</h3>
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                  {subscriptions.length === 0 ? (
                    <div className="px-5 py-12 text-center text-sm text-gray-500">No subscription data</div>
                  ) : (
                    subscriptions.map((sub) => (
                      <div key={sub.companyId} className="px-5 py-4 border-b border-white/5 hover:bg-white/5 transition-colors flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-white block truncate">{sub.companyName}</span>
                          <span className="text-xs text-gray-500">{sub.planName}</span>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                            sub.status === 'trialing' ? 'bg-blue-500/10 text-blue-400' :
                            sub.status === 'past_due' ? 'bg-red-500/10 text-red-400' :
                            'bg-gray-500/10 text-gray-400'
                          }`}>
                            {sub.status}
                          </span>
                          {sub.trialEndsAt && (
                            <p className="text-[10px] text-gray-600 mt-1">Trial ends {timeAgo(sub.trialEndsAt)}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <AIInsightsPanel insights={aiInsights} />

            <div className="bg-[#0c1222] border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 flex items-center justify-center text-purple-400">
                  <i className="ri-funds-line"></i>
                </div>
                <h3 className="text-sm font-semibold text-white">Revenue Snapshot</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-gray-500">Monthly Revenue</span>
                  <p className="text-2xl font-bold text-white">
                    £{(summary.monthlyRevenuePence / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <span className="text-lg font-bold text-emerald-400 block">{summary.activeSubscriptions}</span>
                    <span className="text-[10px] text-gray-500">Active</span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <span className="text-lg font-bold text-blue-400 block">{summary.trialingSubscriptions}</span>
                    <span className="text-[10px] text-gray-500">Trialing</span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <span className="text-lg font-bold text-red-400 block">{summary.atRiskSubscriptions}</span>
                    <span className="text-[10px] text-gray-500">At Risk</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#0c1222] border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 flex items-center justify-center text-emerald-400">
                  <i className="ri-map-pin-2-line"></i>
                </div>
                <h3 className="text-sm font-semibold text-white">GPS Overview</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-4 text-center">
                  <span className="text-2xl font-bold text-emerald-400 block">{summary.gpsTrackedGuards}</span>
                  <span className="text-xs text-gray-500">Online</span>
                </div>
                <div className={`${summary.gpsOfflineGuards > 0 ? 'bg-red-500/5 border-red-500/10' : 'bg-white/5 border-white/5'} rounded-lg p-4 text-center`}>
                  <span className={`text-2xl font-bold block ${summary.gpsOfflineGuards > 0 ? 'text-red-400' : 'text-gray-400'}`}>{summary.gpsOfflineGuards}</span>
                  <span className="text-xs text-gray-500">Offline</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}