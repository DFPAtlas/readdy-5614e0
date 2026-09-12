'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSites, type Site } from '@/lib/useSites';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import SiteFilters from './SiteFilters';
import SitesTable from './SitesTable';
import SiteStats from './SiteStats';

export default function SitesPage() {
  const { companyId } = useAuth();
  const { sites, loading, error, refetch, updateSite } = useSites();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) return;
    refetch();
  }, [companyId, refetch]);

  const filteredSites = useMemo(() => {
    let result = [...sites];
    const q = searchTerm.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (s) =>
          (s.site_name || '').toLowerCase().includes(q) ||
          (s.address || '').toLowerCase().includes(q) ||
          (s.client_name || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((s) => (s.status || 'active') === statusFilter);
    }
    if (riskFilter !== 'all') {
      result = result.filter((s) => s.risk_level === riskFilter);
    }
    return result;
  }, [sites, searchTerm, statusFilter, riskFilter]);

  const handleArchiveSite = async (siteId: string) => {
    if (!window.confirm('Archive this site? It will be hidden from active lists but all historical data will be preserved.')) return;
    const { error } = await updateSite(siteId, { status: 'archived' });
    if (!error) {
      setToast('Site archived');
      refetch();
    } else {
      setToast('Failed to archive site');
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleRestoreSite = async (siteId: string) => {
    const { error } = await updateSite(siteId, { status: 'active' });
    if (!error) {
      setToast('Site restored');
      refetch();
    } else {
      setToast('Failed to restore site');
    }
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Sites Management</h1>
            <p className="text-gray-400">Monitor and manage all your security sites</p>
          </div>
          <Link
            href="/dashboard/sites/new"
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors cursor-pointer whitespace-nowrap text-sm font-medium"
          >
            <div className="w-4 h-4 flex items-center justify-center mr-2">
              <i className="ri-add-line"></i>
            </div>
            Add New Site
          </Link>
        </div>

        {toast && (
          <div className="px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-check-line"></i></div>
            {toast}
          </div>
        )}

        <SiteStats sites={sites} loading={loading} />

        <SiteFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          riskFilter={riskFilter}
          setRiskFilter={setRiskFilter}
          totalSites={filteredSites.length}
        />

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-error-warning-line"></i></div>
            {error}
          </div>
        )}

        <SitesTable
          sites={filteredSites}
          loading={loading}
          onArchive={handleArchiveSite}
          onRestore={handleRestoreSite}
        />
      </div>
    </div>
  );
}