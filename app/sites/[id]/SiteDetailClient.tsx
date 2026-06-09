'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import SOPManager from '@/app/components/SOPManager';
import SiteCoverPlan from '../components/SiteCoverPlan';
import AutoShiftGenerator from '../components/AutoShiftGenerator';
import SiteRequirementsEditor from '../components/SiteRequirementsEditor';
import SiteRiskProfile from '../components/SiteRiskProfile';

interface Site {
  id: string;
  site_name: string;
  client_name: string | null;
  address: string | null;
  risk_level: string | null;
  check_call_interval: number | null;
  client_logo_url: string | null;
  client_contact_email: string | null;
  client_contact_name: string | null;
}

export default function SiteDetailClient() {
  const params = useParams();
  const router = useRouter();
  const { companyId } = useAuth();
  const siteId = params.id as string;

  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [genLoading, setGenLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'cover' | 'generator' | 'requirements'>('overview');

  useEffect(() => {
    if (!siteId || !companyId) return;
    (async () => {
      const { data } = await supabase
        .from('sites')
        .select('id, site_name, client_name, address, risk_level, check_call_interval, client_logo_url, client_contact_email, client_contact_name')
        .eq('id', siteId)
        .eq('company_id', companyId)
        .maybeSingle();
      setSite(data as Site | null);
      setLoading(false);
    })();
  }, [siteId, companyId]);

  useEffect(() => {
    const now = new Date();
    const ws = startOfWeek(subDays(now, 7), { weekStartsOn: 1 });
    const we = endOfWeek(subDays(now, 7), { weekStartsOn: 1 });
    setPeriodStart(ws.toISOString().slice(0, 10));
    setPeriodEnd(we.toISOString().slice(0, 10));
  }, []);

  const handleGenerate = async () => {
    if (!siteId) return;
    setGenLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-weekly-site-report`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`,
          },
          body: JSON.stringify({
            site_id: siteId,
            period_start: new Date(periodStart).toISOString(),
            period_end: new Date(periodEnd + 'T23:59:59').toISOString(),
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setToast('Weekly report generated successfully');
        setShowPeriodPicker(false);
      } else {
        setToast(data.error || 'Failed to generate report');
      }
    } catch {
      setToast('Failed to generate report');
    }
    setGenLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Site not found.</p>
        <button
          onClick={() => router.push('/sites')}
          className="mt-4 inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 cursor-pointer"
        >
          <i className="ri-arrow-left-line" /> Back to Sites
        </button>
      </div>
    );
  }

  const riskColor: Record<string, string> = {
    low: 'bg-emerald-500/10 text-emerald-400',
    medium: 'bg-yellow-500/10 text-yellow-400',
    high: 'bg-orange-500/10 text-orange-400',
    critical: 'bg-red-500/10 text-red-400',
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 border border-gray-700 text-white text-sm px-4 py-3 rounded-lg shadow-xl flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center text-emerald-400"><i className="ri-check-line"></i></div>
          {toast}
          <button onClick={() => setToast(null)} className="ml-2 text-gray-400 hover:text-white cursor-pointer"><i className="ri-close-line"></i></button>
        </div>
      )}

      {/* Site Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white">{site.site_name}</h1>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${riskColor[site.risk_level || 'low']}`}>
              {(site.risk_level || 'Low').charAt(0).toUpperCase() + (site.risk_level || 'low').slice(1)} Risk
            </span>
          </div>
          <p className="text-gray-400 text-sm">{site.address || 'No address on file'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('cover')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'cover' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Cover Plan
          </button>
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'generator' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Shift Generator
          </button>
          <button
            onClick={() => setActiveTab('requirements')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'requirements' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Requirements
          </button>
        </div>
        <button
          onClick={() => router.push('/sites')}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
          Back
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Site info cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Client</p>
              <p className="text-sm font-medium text-white">{site.client_name || '—'}</p>
              {site.client_contact_name && <p className="text-xs text-gray-400 mt-1">{site.client_contact_name}</p>}
            </div>
            <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Contact Email</p>
              <p className="text-sm font-medium text-white">{site.client_contact_email || '—'}</p>
            </div>
            <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Check-Call Interval</p>
              <p className="text-sm font-medium text-white">Every {site.check_call_interval || 60} min</p>
            </div>
            <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Site ID</p>
              <p className="text-sm font-medium text-white font-mono">{site.id.slice(0, 8)}</p>
            </div>
          </div>

          {/* Risk Profile */}
          <SiteRiskProfile siteId={site.id} />

          {/* Weekly report generation */}
          <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold text-white">Weekly Site Report</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Generate a PDF report covering shifts, incidents, patrols and occurrence book entries.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPeriodPicker(!showPeriodPicker)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-calendar-line"></i></div>
                  {format(new Date(periodStart), 'd MMM')} – {format(new Date(periodEnd), 'd MMM yyyy')}
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={genLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                >
                  {genLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <div className="w-4 h-4 flex items-center justify-center"><i className="ri-file-add-line"></i></div>
                  )}
                  Generate Report
                </button>
              </div>
            </div>

            {showPeriodPicker && (
              <div className="mt-4 flex items-center gap-3 p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Period Start</label>
                  <input
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Period End</label>
                  <input
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => router.push(`/occurrence-book?site=${site.id}`)}
              className="bg-[#111827]/60 border border-gray-800 rounded-xl p-4 text-left hover:border-gray-700 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-book-line text-blue-400"></i></div>
              </div>
              <p className="text-sm font-medium text-white">Occurrence Book</p>
              <p className="text-xs text-gray-500 mt-1">View entries for this site</p>
            </button>
            <button
              onClick={() => router.push(`/incidents?site=${site.id}`)}
              className="bg-[#111827]/60 border border-gray-800 rounded-xl p-4 text-left hover:border-gray-700 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center mb-3">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-alarm-warning-line text-red-400"></i></div>
              </div>
              <p className="text-sm font-medium text-white">Incidents</p>
              <p className="text-xs text-gray-500 mt-1">View incidents at this site</p>
            </button>
            <button
              onClick={() => router.push(`/rotas?site=${site.id}`)}
              className="bg-[#111827]/60 border border-gray-800 rounded-xl p-4 text-left hover:border-gray-700 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3">
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-calendar-event-line text-emerald-400"></i></div>
              </div>
              <p className="text-sm font-medium text-white">Rotas & Shifts</p>
              <p className="text-xs text-gray-500 mt-1">View schedule and shifts</p>
            </button>
          </div>

          {/* SOP Documents */}
          <div className="bg-[#111827]/60 border border-gray-800 rounded-xl p-5">
            <SOPManager siteId={site.id} />
          </div>
        </>
      )}

      {activeTab === 'cover' && <SiteCoverPlan siteId={site.id} />}

      {activeTab === 'generator' && <AutoShiftGenerator siteId={site.id} siteName={site.site_name} />}

      {activeTab === 'requirements' && <SiteRequirementsEditor siteId={site.id} onSaved={() => setToast('Requirements saved')} />}
    </div>
  );
}