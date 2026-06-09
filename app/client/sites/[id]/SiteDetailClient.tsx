'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useClientPortal } from '@/lib/useClientPortal';
import { supabase } from '@/lib/supabase';
import SOPManager from '@/app/components/SOPManager';
import NoticeWidget from '@/app/dashboard/sites/[id]/notices/components/NoticeWidget';

interface SiteDetailData {
  id: string;
  site_name: string;
  address: string;
  risk_level: string;
  latitude: number | null;
  longitude: number | null;
  assignment_instructions: string | null;
}

export default function ClientSiteDetailPage({ siteId }: { siteId: string }) {
  const { sites, incidents, reports, clocking } = useClientPortal();
  const [site, setSite] = useState<SiteDetailData | null>(null);
  const [tab, setTab] = useState<'overview' | 'incidents' | 'activity' | 'reports' | 'sops' | 'clocking' | 'notices'>('overview');
  const [loading, setLoading] = useState(true);
  const [obEntries, setObEntries] = useState<any[]>([]);

  const siteIncidents = incidents.filter((i) => i.site_id === siteId);
  const siteReports = reports.filter((r) => r.site_id === siteId && r.status === 'sent');

  useEffect(() => {
    async function load() {
      const base = sites.find((s) => s.id === siteId);
      if (!base) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('sites')
        .select('id, site_name, address, risk_level, latitude, longitude, assignment_instructions')
        .eq('id', siteId)
        .maybeSingle();

      setSite(data as SiteDetailData || base);

      const { data: obData } = await supabase
        .from('occurrence_books')
        .select('id, entry, entry_type, created_at')
        .eq('site_id', siteId)
        .eq('client_visible', true)
        .order('created_at', { ascending: false })
        .limit(20);

      setObEntries(obData || []);
      setLoading(false);
    }
    load();
  }, [siteId, sites]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
        <p className="text-gray-400">Site not found.</p>
        <Link href="/client/sites" className="text-blue-400 text-sm mt-2 inline-block cursor-pointer">
          Back to sites
        </Link>
      </div>
    );
  }

  const mapUrl = site.latitude && site.longitude
    ? `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d5000!2d${site.longitude}!3d${site.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzk!5e0!3m2!1sen!2suk!4v1`
    : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
        <Link href="/client/sites" className="hover:text-white cursor-pointer">Sites</Link>
        <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-right-s-line"></i></div>
        <span className="text-white font-medium">{site.site_name}</span>
      </div>

      {/* Site header */}
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h1 className="text-xl font-semibold text-white">{site.site_name}</h1>
              <p className="text-sm text-gray-400">{site.address}</p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full border font-medium ${
              site.risk_level === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
              site.risk_level === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
              'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              {site.risk_level ? site.risk_level.charAt(0).toUpperCase() + site.risk_level.slice(1) : 'Standard'} risk
            </span>
          </div>
        </div>

        {mapUrl && (
          <div className="h-48 w-full">
            <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale-[30%]"
            />
          </div>
        )}
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{siteIncidents.length}</div>
          <div className="text-xs text-gray-400 mt-1">Incidents (90d)</div>
        </div>
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{obEntries.length}</div>
          <div className="text-xs text-gray-400 mt-1">Activity entries</div>
        </div>
        <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{siteReports.length}</div>
          <div className="text-xs text-gray-400 mt-1">Reports</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-[#0f172a]/70 backdrop-blur-sm border border-white/10 rounded-xl">
        <div className="flex border-b border-white/10">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'incidents', label: 'Incidents' },
            { key: 'activity', label: 'Activity' },
            { key: 'reports', label: 'Reports' },
            { key: 'sops', label: 'SOPs' },
            { key: 'clocking', label: 'Clocking' },
            { key: 'notices', label: 'Notices' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`flex-1 py-3 text-sm font-medium cursor-pointer whitespace-nowrap transition-colors ${
                tab === t.key ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === 'overview' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Today's operations</h3>
              {site.assignment_instructions && (
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Site instructions</p>
                  <p className="text-sm text-gray-300">{site.assignment_instructions}</p>
                </div>
              )}
              {siteIncidents.length === 0 && obEntries.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 flex items-center justify-center bg-emerald-500/10 rounded-full mx-auto mb-3">
                    <i className="ri-shield-check-line text-emerald-400 text-xl"></i>
                  </div>
                  <p className="text-sm text-gray-400 font-medium">All quiet today</p>
                  <p className="text-xs text-gray-500">No incidents or significant activity at this site.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {siteIncidents.slice(0, 3).map((i) => (
                    <div key={i.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <div className="w-8 h-8 flex items-center justify-center bg-red-500/10 rounded-lg flex-shrink-0">
                        <i className="ri-alarm-warning-line text-red-400 text-sm"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{i.incident_type}</p>
                        <p className="text-xs text-gray-400">{i.ai_rewritten_report?.slice(0, 80) || i.description?.slice(0, 80)}...</p>
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {new Date(i.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                  {obEntries.slice(0, 3).map((ob) => (
                    <div key={ob.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                      <div className="w-8 h-8 flex items-center justify-center bg-blue-500/10 rounded-lg flex-shrink-0">
                        <i className="ri-file-text-line text-blue-400 text-sm"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{ob.entry_type}</p>
                        <p className="text-xs text-gray-400">{ob.entry?.slice(0, 80)}...</p>
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {new Date(ob.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'incidents' && (
            <div className="space-y-3">
              {siteIncidents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">No incidents at this site.</p>
                </div>
              ) : (
                siteIncidents.map((i) => (
                  <Link
                    key={i.id}
                    href={`/client/incidents/${i.id}`}
                    className="block p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">{i.incident_type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded border font-medium ${
                        i.severity === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                        i.severity === 'high' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                        i.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                        'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      }`}>
                        {i.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">{i.ai_rewritten_report?.slice(0, 120) || i.description?.slice(0, 120)}...</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(i.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </Link>
                ))
              )}
            </div>
          )}

          {tab === 'activity' && (
            <div className="space-y-3">
              {obEntries.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">No client-visible activity entries.</p>
                </div>
              ) : (
                obEntries.map((ob) => (
                  <div key={ob.id} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{ob.entry_type}</span>
                      <span className="text-xs text-gray-500">{new Date(ob.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-sm text-gray-300">{ob.entry}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'reports' && (
            <div className="space-y-3">
              {siteReports.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">No reports available for this site yet.</p>
                </div>
              ) : (
                siteReports.map((r) => (
                  <div key={r.id} className="p-4 bg-white/5 rounded-lg flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{r.title || 'Weekly Security Report'}</p>
                      <p className="text-xs text-gray-400">
                        {r.period_start ? `${new Date(r.period_start).toLocaleDateString('en-GB')} — ${new Date(r.period_end || r.generated_at).toLocaleDateString('en-GB')}` : new Date(r.generated_at).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                    {r.file_url && (
                      <a
                        href={r.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <div className="w-3.5 h-3.5 flex items-center justify-center"><i className="ri-download-line"></i></div>
                        PDF
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'sops' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 flex items-center justify-center bg-blue-500/10 rounded-lg">
                  <i className="ri-file-list-3-line text-blue-400 text-sm"></i>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Standard Operating Procedures</h3>
                  <p className="text-xs text-gray-400">Documents and procedures for this site</p>
                </div>
              </div>
              <SOPManager siteId={siteId} />
            </div>
          )}

          {tab === 'clocking' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Officer clocking log</h3>
              {(() => {
                const siteClocking = clocking.filter((c) => c.site_id === siteId);
                if (siteClocking.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 flex items-center justify-center bg-white/10 rounded-full mx-auto mb-3">
                        <i className="ri-time-line text-gray-500 text-xl"></i>
                      </div>
                      <p className="text-sm text-gray-400 font-medium">No shift data available</p>
                      <p className="text-xs text-gray-500 mt-1">Clocking records will appear once officers are scheduled.</p>
                    </div>
                  );
                }
                return (
                  <div className="space-y-3">
                    {siteClocking.map((c) => (
                      <div key={c.shift_id} className="p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${c.is_clocked_in ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>
                            <span className="text-sm font-medium text-white">{c.guard_name}</span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded border font-medium ${c.is_clocked_in ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                            {c.is_clocked_in ? 'Clocked in' : 'Not clocked in'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-400 mt-2">
                          <div>
                            <span className="text-gray-500 uppercase tracking-wider">Shift</span>
                            <p className="text-gray-300 mt-0.5">
                              {new Date(c.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} — {new Date(c.end_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          {c.clocked_in_at && (
                            <div>
                              <span className="text-gray-500 uppercase tracking-wider">Clocked in</span>
                              <p className="text-gray-300 mt-0.5">
                                {new Date(c.clocked_in_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          )}
                        </div>
                        {c.clock_in_location && (
                          <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                            <i className="ri-map-pin-line"></i>
                            GPS verified at clock-in
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {tab === 'notices' && (
            <div className="space-y-4">
              <NoticeWidget siteId={siteId} siteName={site.site_name} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}