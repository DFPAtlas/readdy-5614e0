'use client';

import Link from 'next/link';
import { useClientPortal } from '@/lib/useClientPortal';
import { useClientAuth } from '@/lib/useClientAuth';
import WidgetBoundary from '@/components/dashboard/WidgetBoundary';
import WidgetFallback from '@/components/dashboard/WidgetFallback';

export default function ClientSitesPage() {
  const { sites, currentShifts, isLoading } = useClientPortal();
  const { isClientUser, loading: authLoading } = useClientAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WidgetBoundary widgetName="SitesHeader" pagePath="/client/sites">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Site Dashboards</h1>
            <p className="text-gray-400 mt-1">
              {sites.length} site{sites.length !== 1 ? 's' : ''} under security cover — click any to open its live dashboard
            </p>
          </div>
          <Link
            href="/client/sites/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
            Add New Site
          </Link>
        </div>
      </WidgetBoundary>

      <WidgetBoundary widgetName="SitesGrid" pagePath="/client/sites" fallbackTitle="Sites">
        {sites.length === 0 ? (
          <WidgetFallback state="empty" title="No sites" message="Your security provider will link your sites to this portal shortly." />
        ) : (
          <div className="space-y-5">
            {/* County Hall live dashboard card */}
            {(() => {
              const countyHall = sites.find((s) => s.site_name.toLowerCase().includes('county hall'));
              if (!countyHall) return null;
              const shift = currentShifts.find((s) => s.site_id === countyHall.id);
              return (
                <Link
                  href={`/client/sites/${countyHall.id}`}
                  className="block bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] border border-blue-500/20 rounded-xl p-5 hover:border-blue-400/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-blue-500/10 rounded-xl border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                        <i className="ri-government-line text-blue-400 text-xl"></i>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-white">County Hall</h3>
                          <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-full font-medium">Live Dashboard</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-0.5">{countyHall.address}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`inline-flex items-center gap-1 text-xs ${shift ? 'text-emerald-400' : 'text-gray-500'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${shift ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
                            {shift ? `${shift.guard_name || 'Officer'} on site` : 'No cover'}
                          </span>
                          <span className="text-xs text-gray-500">\u00B7</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${
                            countyHall.risk_level === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                            countyHall.risk_level === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                            'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          }`}>
                            {countyHall.risk_level ? countyHall.risk_level.charAt(0).toUpperCase() + countyHall.risk_level.slice(1) : 'Standard'} risk
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-medium text-blue-400 group-hover:text-blue-300 transition-colors whitespace-nowrap">Open Live Dashboard</span>
                      <div className="w-5 h-5 flex items-center justify-center text-blue-400 group-hover:translate-x-0.5 transition-transform">
                        <i className="ri-arrow-right-line"></i>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })()}

            {/* All sites grid */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {sites.map((site) => {
                if (!site.id) {
                  if (process.env.NODE_ENV === 'development') {
                    console.warn('[ClientSites] Site card missing id:', site.site_name);
                  }
                  return (
                    <div key={site.site_name || 'unknown'} className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5 opacity-50 cursor-not-allowed">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-gray-500"></div>
                          <h3 className="font-semibold text-gray-400">{site.site_name || 'Unknown site'}</h3>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">{site.address}</p>
                      <div className="block w-full text-center py-2.5 text-sm font-medium text-gray-500 bg-white/5 rounded-lg cursor-not-allowed whitespace-nowrap">
                        Dashboard unavailable
                      </div>
                    </div>
                  );
                }
                const shift = currentShifts.find((s) => s.site_id === site.id);
                const isCH = site.site_name.toLowerCase().includes('county hall');
                return (
                  <div key={site.id} className={`rounded-xl p-5 transition-colors ${isCH ? 'bg-[#0f172a]/70 backdrop-blur-sm border border-blue-500/20 hover:border-blue-400/40' : 'bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 hover:border-blue-500/30'}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${shift ? 'bg-emerald-500' : 'bg-gray-500'}`}></div>
                        <h3 className="font-semibold text-white">{site.site_name}</h3>
                        {isCH && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/15 border border-blue-500/25 text-blue-300 rounded-full font-medium whitespace-nowrap">Live</span>
                        )}
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                        site.risk_level === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                        site.risk_level === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                        'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      }`}>
                        {site.risk_level ? site.risk_level.charAt(0).toUpperCase() + site.risk_level.slice(1) : 'Standard'} risk
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">{site.address}</p>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full">
                        <i className="ri-shield-user-line text-gray-500 text-xs"></i>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Current cover</p>
                        <p className="text-sm font-medium text-white">
                          {shift ? shift.guard_name : 'No officer on site'}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/client/sites/${site.id}`}
                      className="block w-full text-center py-2.5 text-sm font-medium text-blue-400 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {isCH ? 'Open Live Dashboard' : 'View site dashboard'}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </WidgetBoundary>
    </div>
  );
}