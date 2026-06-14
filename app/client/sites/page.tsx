'use client';

import Link from 'next/link';
import { useClientPortal } from '@/lib/useClientPortal';
import WidgetBoundary from '@/components/dashboard/WidgetBoundary';
import WidgetFallback from '@/components/dashboard/WidgetFallback';

export default function ClientSitesPage() {
  const { sites, currentShifts, isLoading } = useClientPortal();

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
        <div>
          <h1 className="text-2xl font-semibold text-white">Your Sites</h1>
          <p className="text-gray-400 mt-1">
            {sites.length} site{sites.length !== 1 ? 's' : ''} under security cover
          </p>
        </div>
      </WidgetBoundary>

      <WidgetBoundary widgetName="SitesGrid" pagePath="/client/sites" fallbackTitle="Sites">
        {sites.length === 0 ? (
          <WidgetFallback state="empty" title="No sites" message="Your security provider will link your sites to this portal shortly." />
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sites.map((site) => {
              const shift = currentShifts.find((s) => s.site_id === site.id);
              return (
                <div key={site.id} className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-blue-500/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${shift ? 'bg-emerald-500' : 'bg-gray-500'}`}></div>
                      <h3 className="font-semibold text-white">{site.site_name}</h3>
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
                    View site dashboard
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </WidgetBoundary>
    </div>
  );
}