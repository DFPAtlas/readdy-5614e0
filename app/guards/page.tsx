'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useGuards, getDaysUntil, getSIAStatus, type Guard } from '@/lib/useGuards';
import { useAuth } from '@/lib/auth';
import { useMyPermissions } from '@/lib/usePermissions';
import { useEntitlements } from '@/lib/useEntitlements';
import { isTitanOrUnlimited } from '@/lib/featureMap';
import GuardsTable from './components/GuardsTable';
import GuardModal from './components/GuardModal';
import GuardProfileDrawer from './components/GuardProfileDrawer';
import GuardDeleteDialog from './components/GuardDeleteDialog';
import ExpiryAlertBanner from './components/ExpiryAlertBanner';
import GuardSummaryCards from './components/GuardSummaryCards';
import FilterDropdown from './components/FilterDropdown';
import Toast from '@/app/sites/components/Toast';
import UpgradeRequiredModal from '@/components/UpgradeRequiredModal';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses', dot: 'bg-gray-400' },
  { value: 'active', label: 'Active', dot: 'bg-emerald-500' },
  { value: 'suspended', label: 'Suspended', dot: 'bg-amber-500' },
  { value: 'inactive', label: 'Inactive', dot: 'bg-gray-500' },
];

const SIA_OPTIONS = [
  { value: 'all', label: 'All SIA', dot: 'bg-gray-400' },
  { value: 'valid', label: 'Valid', dot: 'bg-emerald-500' },
  { value: 'expiring_soon', label: 'Expiring Soon', dot: 'bg-amber-500' },
  { value: 'expired', label: 'Expired', dot: 'bg-red-500' },
];

export default function GuardsPage() {
  const { guards, loading, error, refetch, addGuard, updateGuard, deleteGuard, setGuardStatus } = useGuards();
  const { profile } = useAuth();
  const { can } = useMyPermissions(profile?.id || null, profile?.company_id || null);
  const { entitlements } = useEntitlements();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [siaFilter, setSiaFilter] = useState('all');
  const [sortKey, setSortKey] = useState('sia_expiry');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGuard, setEditingGuard] = useState<Guard | null>(null);
  const [saving, setSaving] = useState(false);

  const [profileGuard, setProfileGuard] = useState<Guard | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Guard | null>(null);
  const [processingDelete, setProcessingDelete] = useState(false);

  const [limitModalOpen, setLimitModalOpen] = useState(false);

  const maxGuards = entitlements?.maxGuards ?? 0;
  const guardsUnlimited = isTitanOrUnlimited(maxGuards);
  const activeGuards = guards.filter((g) => g.status === 'active').length;
  const atGuardLimit = !guardsUnlimited && activeGuards >= maxGuards;

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
    let result = [...guards];

    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (g) =>
          `${g.first_name || ''} ${g.last_name || ''}`.toLowerCase().includes(q) ||
          (g.email || '').toLowerCase().includes(q) ||
          (g.sia_licence || '').toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((g) => (g.status || 'active').toLowerCase() === statusFilter);
    }

    if (siaFilter !== 'all') {
      result = result.filter((g) => getSIAStatus(g.sia_expiry) === siaFilter);
    }

    result.sort((a, b) => {
      let aVal: any;
      let bVal: any;
      if (sortKey === 'sia_expiry') {
        aVal = a.sia_expiry || '9999-12-31';
        bVal = b.sia_expiry || '9999-12-31';
      } else {
        aVal = (a as any)[sortKey] ?? '';
        bVal = (b as any)[sortKey] ?? '';
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [guards, search, statusFilter, siaFilter, sortKey, sortDir]);

  const expiredCount = useMemo(() => {
    return guards.filter((g) => getSIAStatus(g.sia_expiry) === 'expired').length;
  }, [guards]);

  const expiringCount = useMemo(() => {
    return guards.filter((g) => {
      const days = getDaysUntil(g.sia_expiry);
      return days != null && days >= 0 && days <= 30;
    }).length;
  }, [guards]);

  const expiringSoonCount = useMemo(() => {
    return guards.filter((g) => getSIAStatus(g.sia_expiry) === 'expiring_soon').length;
  }, [guards]);

  const inactiveCount = guards.filter((g) => (g.status || 'active') !== 'active').length;

  const summaryItems = [
    { label: 'Total Guards', value: guards.length, icon: 'ri-team-line', accent: 'bg-blue-500/15 text-blue-400' },
    { label: 'Active', value: activeGuards, icon: 'ri-shield-check-line', accent: 'bg-emerald-500/15 text-emerald-400' },
    { label: 'Inactive / Suspended', value: inactiveCount, icon: 'ri-user-unfollow-line', accent: 'bg-gray-500/15 text-gray-400' },
    { label: 'SIA Expiring Soon', value: expiringSoonCount, icon: 'ri-time-line', accent: 'bg-amber-500/15 text-amber-400' },
    { label: 'SIA Expired', value: expiredCount, icon: 'ri-close-circle-line', accent: 'bg-red-500/15 text-red-400' },
  ];

  const totalPages = Math.max(1, Math.ceil(filtered.length / 25));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * 25, safePage * 25);

  const openAdd = () => {
    if (atGuardLimit) {
      setLimitModalOpen(true);
      return;
    }
    setEditingGuard(null);
    setModalOpen(true);
  };

  const openEdit = (guard: Guard) => {
    setEditingGuard(guard);
    setModalOpen(true);
  };

  const handleSave = async (payload: any) => {
    setSaving(true);
    if (editingGuard) {
      const { error } = await updateGuard(editingGuard.id, payload);
      if (!error) setToast('Guard updated');
      else setToast(error.message || 'Failed to update guard');
    } else {
      const { error } = await addGuard(payload);
      if (!error) setToast('Guard added');
      else setToast(error.message || 'Failed to add guard');
    }
    setSaving(false);
    setModalOpen(false);
    refetch();
  };

  const handleSetInactive = async () => {
    if (!deleteTarget) return;
    setProcessingDelete(true);
    const { error } = await setGuardStatus(deleteTarget.id, 'inactive');
    if (!error) setToast(`${deleteTarget.first_name || 'Guard'} set to Inactive`);
    else setToast('Failed to update status');
    setProcessingDelete(false);
    setDeleteTarget(null);
    refetch();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setProcessingDelete(true);
    const { error } = await deleteGuard(deleteTarget.id);
    if (!error) setToast('Guard deleted permanently');
    else setToast('Failed to delete guard');
    setProcessingDelete(false);
    setDeleteTarget(null);
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Guards</h1>
          <p className="text-gray-400 text-sm mt-1">Manage security personnel, credentials and employment status.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/staff"
            className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-dashboard-line"></i></div>
            Workforce Operations
          </Link>
          {can('staff', 'create') && (
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
              Add Guard
            </button>
          )}
        </div>
      </div>

      <GuardSummaryCards items={summaryItems} />

      {!bannerDismissed && (
        <ExpiryAlertBanner
          expiredCount={expiredCount}
          expiringCount={expiringCount}
          onReview={() => { setSiaFilter('expiring_soon'); setBannerDismissed(true); }}
          onDismiss={() => setBannerDismissed(true)}
        />
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="w-5 h-5 flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <i className="ri-search-line text-sm"></i>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, or SIA licence..."
            className="w-full bg-gray-800/60 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <FilterDropdown
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
          options={STATUS_OPTIONS}
          icon="ri-filter-line"
          label={(c) => (c.value === 'all' ? 'All Statuses' : `Status: ${c.label}`)}
        />
        <FilterDropdown
          value={siaFilter}
          onChange={(v) => { setSiaFilter(v); setPage(1); }}
          options={SIA_OPTIONS}
          icon="ri-shield-check-line"
          label={(c) => (c.value === 'all' ? 'All SIA' : `SIA: ${c.label}`)}
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-error-warning-line"></i></div>
          {error}
        </div>
      )}

      <GuardsTable
        guards={paged}
        loading={loading}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        onView={setProfileGuard}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        page={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
        total={filtered.length}
        canEdit={can('staff', 'edit')}
        canDelete={can('staff', 'delete')}
      />

      {modalOpen && (
        <GuardModal
          editingGuard={editingGuard}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
          saving={saving}
        />
      )}

      <GuardProfileDrawer
        guard={profileGuard}
        onClose={() => setProfileGuard(null)}
        onEdit={openEdit}
      />

      {deleteTarget && (
        <GuardDeleteDialog
          guard={deleteTarget}
          onSetInactive={handleSetInactive}
          onDelete={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          processing={processingDelete}
        />
      )}

      <UpgradeRequiredModal
        isOpen={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
        limitLabel={`Add Guard`}
        limitValue={maxGuards}
      />

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}