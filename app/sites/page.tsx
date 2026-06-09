'use client';

import { useState, useMemo } from 'react';
import { useSites } from '@/lib/useSites';
import SitesTable from './components/SitesTable';
import SiteSetupWizard from './components/SiteSetupWizard';
import DeleteDialog from './components/DeleteDialog';
import Toast from './components/Toast';
import type { Site } from '@/lib/useSites';
import { saveSiteShiftPatterns } from '@/lib/useSiteShiftPatterns';
import { useAuth } from '@/lib/auth';
import { useMyPermissions } from '@/lib/usePermissions';
import { supabase } from '@/lib/supabase';
import { SOP_TYPES } from '@/lib/sopTypes';

const riskLevels = ['all', 'low', 'medium', 'high', 'critical'];

export default function SitesPage() {
  const { sites, loading, error, refetch, addSite, updateSite, deleteSite } = useSites();
  const { companyId, profile } = useAuth();
  const { can } = useMyPermissions(profile?.id || null, companyId);

  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [sortKey, setSortKey] = useState('site_name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Site | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    let result = sites.filter((s): s is Site => s != null && typeof s === 'object');
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (s) =>
          (s?.site_name || '').toLowerCase().includes(q) ||
          (s?.client_name || '').toLowerCase().includes(q) ||
          (s?.address || '').toLowerCase().includes(q)
      );
    }
    if (riskFilter !== 'all') {
      result = result.filter((s) => (s?.risk_level || 'low') === riskFilter);
    }
    result.sort((a, b) => {
      const aVal = (a as any)?.[sortKey] ?? '';
      const bVal = (b as any)?.[sortKey] ?? '';
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [sites, search, riskFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / 25));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * 25, safePage * 25);

  const openAdd = () => {
    setEditingSite(null);
    setModalOpen(true);
  };

  const openEdit = (site: Site) => {
    if (!site || typeof site !== 'object' || !('site_name' in site)) return;
    setEditingSite(site);
    setModalOpen(true);
  };

  const handleSave = async (payload: any, patterns: any[], requirements: any, sopLinkIds: string[], sopTypesToCreate: string[]) => {
    if (!companyId) { setToast('Not authenticated'); return; }
    setSaving(true);
    const targetId = editingSite?.id;
    if (editingSite && targetId) {
      const { error } = await updateSite(targetId, payload);
      if (!error) {
        await saveSiteShiftPatterns(targetId, patterns, companyId);
        await supabase.from('built_sops').update({ site_id: null }).eq('site_id', targetId).eq('company_id', companyId);
        if (sopLinkIds.length > 0) {
          for (const sopId of sopLinkIds) {
            await supabase.from('built_sops').update({ site_id: targetId }).eq('id', sopId).eq('company_id', companyId);
          }
        }
        setToast('Site updated');
      } else {
        setToast('Failed to update site');
      }
    } else {
      const { data, error } = await addSite(payload);
      if (!error && data) {
        await saveSiteShiftPatterns(data.id, patterns, companyId);
        if (sopLinkIds.length > 0) {
          for (const sopId of sopLinkIds) {
            await supabase.from('built_sops').update({ site_id: data.id }).eq('id', sopId).eq('company_id', companyId);
          }
        }
        if (sopTypesToCreate.length > 0) {
          for (const sopType of sopTypesToCreate) {
            const sopRef = `SOP-${sopType.toUpperCase().replace(/_/g, '-')}-${Date.now().toString().slice(-4)}`;
            await supabase.from('built_sops').insert({
              company_id: companyId,
              site_id: data.id,
              client_name: payload.client_name,
              title: `${data.site_name} — ${SOP_TYPES.find((t) => t.value === sopType)?.label || sopType}`,
              sop_type: sopType,
              sop_reference: sopRef,
              version_number: 1,
              status: 'draft',
              is_active: true,
            });
          }
        }
        setToast('Site created');
      } else {
        setToast('Failed to create site');
      }
    }
    setSaving(false);
    setModalOpen(false);
    refetch();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await deleteSite(deleteTarget.id);
    if (!error) setToast('Site deleted');
    else setToast('Failed to delete site');
    setDeleting(false);
    setDeleteTarget(null);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Sites</h1>
          <p className="text-gray-400 text-sm mt-1">Manage all sites your company guards</p>
        </div>
        {can('sites', 'create') && (
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
          Add Site
        </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="w-5 h-5 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <i className="ri-search-line text-sm"></i>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, client, or address..."
            className="w-full bg-gray-800/60 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="relative">
          <button
            onClick={() => setRiskFilter((r) => (r === 'all' ? 'low' : riskLevels[(riskLevels.indexOf(r) + 1) % riskLevels.length]))}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-700 bg-gray-800/60 text-gray-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-filter-line"></i></div>
            {riskFilter === 'all' ? 'All Risk Levels' : `Risk: ${riskFilter.charAt(0).toUpperCase() + riskFilter.slice(1)}`}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-error-warning-line"></i></div>
          {error}
        </div>
      )}

      <SitesTable
        sites={paged}
        loading={loading}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        page={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
        total={filtered.length}
        search={search}
      />

      {modalOpen && (
        <SiteSetupWizard
          editingSite={editingSite}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
          saving={saving}
        />
      )}

      <DeleteDialog
        site={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        deleting={deleting}
      />

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}