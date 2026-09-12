'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import SiteKPICards from './SiteKPICards';
import SiteCards from './SiteCards';
import RecentCheckIns from './RecentCheckIns';
import SitePatrolOverview from './SitePatrolOverview';
import SiteOBFeed from './SiteOBFeed';
import SiteReportsPanel from './SiteReportsPanel';
import GuardsOnDuty from './GuardsOnDuty';
import ActiveAlerts from './ActiveAlerts';
import StatusSummary from './StatusSummary';
import SiteInfoModal from './SiteInfoModal';
import NoticeWidget from './notices/components/NoticeWidget';
import ManageSitePanel from './manage/ManageSitePanel';

export default function SiteDetailClient({ siteId }: { siteId: string }) {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [showManagePanel, setShowManagePanel] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [siteInfo, setSiteInfo] = useState<{
    address: string | null;
    risk_level: string | null;
    check_call_interval: number | null;
    client_name: string | null;
    status: string | null;
  } | null>(null);

  useEffect(() => {
    supabase
      .from('sites')
      .select('site_name, client_name, address, risk_level, check_call_interval, status')
      .eq('id', siteId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setSiteName(data.site_name);
          setSiteInfo({
            address: data.address,
            risk_level: data.risk_level,
            check_call_interval: data.check_call_interval,
            client_name: data.client_name,
            status: data.status,
          });
        }
      });
  }, [siteId, refreshKey]);

  const openModal = (type: string) => {
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
  };

  const refreshAll = () => {
    setRefreshKey((k) => k + 1);
    setTimeout(() => setShowManagePanel(false), 1200);
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const riskBadge = (level: string | null) => {
    const l = level || 'low';
    const cfg: Record<string, string> = {
      critical: 'bg-red-500/10 text-red-400 border-red-500/20',
      high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    };
    return cfg[l] || cfg.low;
  };

  return (
    <div>
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] px-4 py-3 rounded-lg text-sm font-medium shadow-lg ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-6">
        {/* Site operations header */}
        <div className="mb-6">
          <Link
            href="/dashboard/sites"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer mb-4"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
            Back to Sites
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                <i className="ri-building-line text-blue-400 text-xl"></i>
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-white truncate">{siteName || 'Loading...'}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-0.5 flex-wrap">
                  {siteInfo?.client_name && (
                    <span className="text-gray-300">{siteInfo.client_name}</span>
                  )}
                  {siteInfo?.address && (
                    <>
                      {siteInfo.client_name && <span className="text-gray-600">·</span>}
                      <span className="truncate max-w-[260px]">{siteInfo.address}</span>
                    </>
                  )}
                  {siteInfo?.risk_level && (
                    <>
                      <span className="text-gray-600">·</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${riskBadge(siteInfo.risk_level)}`}>
                        {siteInfo.risk_level.toUpperCase()} RISK
                      </span>
                    </>
                  )}
                  {siteInfo?.status && (
                    <>
                      <span className="text-gray-600">·</span>
                      <span className="text-xs text-gray-500 capitalize">{siteInfo.status}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowManagePanel(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2"
              >
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-settings-3-line"></i></div>
                Manage Site
              </button>
              <button
                onClick={() => openModal('risk-assessment')}
                className="px-3 py-2 bg-amber-600/10 border border-amber-500/20 rounded-lg text-xs text-amber-400 hover:bg-amber-600/20 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
              >
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-speed-mini-line"></i></div>
                Risk Assessment
              </button>
              <button
                onClick={() => openModal('incident-report')}
                className="px-3 py-2 bg-red-600/10 border border-red-500/20 rounded-lg text-xs text-red-400 hover:bg-red-600/20 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5"
              >
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-error-warning-line"></i></div>
                Report Incident
              </button>
            </div>
          </div>
        </div>

        {/* Status strip */}
        <SiteKPICards siteId={siteId} key={`kpi-${refreshKey}`} />

        {/* Main operations grid */}
        <div className="grid lg:grid-cols-12 gap-6 mt-6" key={`grid-${refreshKey}`}>
          {/* Left — primary site operations */}
          <div className="lg:col-span-8 space-y-6">
            <SiteCards siteId={siteId} />
            <RecentCheckIns siteId={siteId} />
            <SitePatrolOverview siteId={siteId} />
            <SiteOBFeed siteId={siteId} />
            <NoticeWidget siteId={siteId} siteName={siteName} />
            <SiteReportsPanel siteId={siteId} />
          </div>

          {/* Right — attention column */}
          <div className="lg:col-span-4 space-y-6">
            <GuardsOnDuty onOpenModal={openModal} siteId={siteId} />
            <ActiveAlerts siteId={siteId} />
            <StatusSummary siteId={siteId} />
          </div>
        </div>
      </div>

      {showManagePanel && (
        <ManageSitePanel siteId={siteId} onClose={() => setShowManagePanel(false)} onSaved={refreshAll} />
      )}

      {showModal && (
        <SiteInfoModal
          type={modalType}
          onClose={closeModal}
          siteId={siteId}
        />
      )}
    </div>
  );
}