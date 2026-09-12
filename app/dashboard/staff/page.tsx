'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { getDaysUntil, getSIAStatus, getInitials } from '@/lib/useGuards';
import AddGuardModal from './AddGuardModal';
import CreateTemplateModal from './CreateTemplateModal';
import RotaManagementModal from './RotaManagementModal';
import GuardDetailsModal from './GuardDetailsModal';
import AITooledOperationsCopilot from '@/app/dashboard/components/AITooledOperationsCopilot';
import FilterDropdown from '@/app/guards/components/FilterDropdown';
import Pagination from '@/app/sites/components/Pagination';

interface Guard {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  sia_licence: string | null;
  sia_expiry: string | null;
  hourly_rate: number | null;
  skills: string[] | null;
  status: string | null;
  created_at: string | null;
  site_name?: string | null;
}

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

function SIAStatusBadge({ dateStr }: { dateStr: string | null }) {
  const days = getDaysUntil(dateStr);
  if (days === null) {
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400">Unknown</span>;
  }
  if (days < 0) {
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400">Expired</span>;
  }
  if (days <= 60) {
    return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400">Expiring in {days}d</span>;
  }
  return <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">Valid</span>;
}

function Avatar({ guard }: { guard: Guard }) {
  const initials = getInitials(guard as any) || 'G';
  const gradients = [
    'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-300',
    'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-300',
    'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-violet-300',
    'bg-gradient-to-br from-orange-500/20 to-red-500/20 text-orange-300',
    'bg-gradient-to-br from-sky-500/20 to-indigo-500/20 text-sky-300',
    'bg-gradient-to-br from-rose-500/20 to-pink-500/20 text-rose-300',
  ];
  let hash = 0;
  for (let i = 0; i < guard.id.length; i++) hash = (hash * 31 + guard.id.charCodeAt(i)) % gradients.length;
  const gradient = gradients[Math.abs(hash)];
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${gradient}`}>
      {initials}
    </div>
  );
}

export default function WorkforceOperations() {
  const { companyId } = useAuth();
  const [guards, setGuards] = useState<Guard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [siaFilter, setSiaFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [showAddGuard, setShowAddGuard] = useState(false);
  const [showRotaModal, setShowRotaModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedGuard, setSelectedGuard] = useState<Guard | null>(null);
  const [showGuardDetails, setShowGuardDetails] = useState(false);

  const loadGuards = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('guards')
      .select('*, shifts!guard_id(site_id, sites(site_name))')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
      setGuards([]);
    } else {
      setGuards((data || []).map((g: any) => {
        const siteNames = [...new Set((g.shifts || []).map((s: any) => s.sites?.site_name).filter(Boolean))];
        return {
          ...g,
          site_name: siteNames.length > 0 ? siteNames.join(', ') : 'Unassigned',
        };
      }));
    }
    setLoading(false);
  }, [companyId]);

  useEffect(() => {
    loadGuards();
  }, [loadGuards]);

  const filtered = useMemo(() => {
    let result = [...guards];
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((g) =>
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
    return result;
  }, [guards, search, statusFilter, siaFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / 25));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * 25, safePage * 25);

  const activeGuards = guards.filter((g) => g.status === 'active').length;
  const assigned = guards.filter((g) => g.site_name && g.site_name !== 'Unassigned').length;
  const unassigned = guards.length - assigned;

  const handleEditGuard = (guard: Guard) => {
    setSelectedGuard(guard);
    setShowAddGuard(true);
  };

  const handleViewGuard = (guard: Guard) => {
    setSelectedGuard(guard);
    setShowGuardDetails(true);
  };

  const handleDeleteGuard = async (guardId: string) => {
    if (!window.confirm('Are you sure you want to delete this guard? All related shifts, incidents, attendance logs and patrol logs will also be removed.')) return;
    setLoading(true);
    try {
      await supabase.from('shifts').delete().eq('guard_id', guardId);
      await supabase.from('incidents').delete().eq('guard_id', guardId);
      await supabase.from('attendance_logs').delete().eq('guard_id', guardId);
      await supabase.from('patrol_logs').delete().eq('guard_id', guardId);
      await supabase.from('guard_availability').delete().eq('guard_id', guardId);
      await supabase.from('guard_time_off').delete().eq('guard_id', guardId);
      await supabase.from('leave_requests').delete().eq('guard_id', guardId);
      await supabase.from('guard_site_assignments').delete().eq('guard_id', guardId);

      const { error } = await supabase.from('guards').delete().eq('id', guardId);
      if (error) throw error;

      setToast('Guard and all related records deleted');
      loadGuards();
    } catch {
      setToast('Failed to delete guard');
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleTemplateCreated = () => {
    setShowTemplateModal(false);
    setToast('Template saved');
    setTimeout(() => setToast(null), 3000);
  };

  const stats = [
    { label: 'Total Guards', value: guards.length, icon: 'ri-team-line', accent: 'bg-blue-500/15 text-blue-400' },
    { label: 'Active Guards', value: activeGuards, icon: 'ri-shield-check-line', accent: 'bg-emerald-500/15 text-emerald-400' },
    { label: 'Assigned', value: assigned, icon: 'ri-building-line', accent: 'bg-cyan-500/15 text-cyan-400' },
    { label: 'Unassigned', value: unassigned, icon: 'ri-user-unfollow-line', accent: 'bg-amber-500/15 text-amber-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Workforce Operations</h1>
          <p className="text-gray-400 text-sm mt-1">Manage guard deployment, assignments and workforce planning.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/guards"
            className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-id-card-line"></i></div>
            Guard Directory
          </Link>
          <Link
            href="/rotas"
            className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-calendar-event-line"></i></div>
            Rotas
          </Link>
          <button
            onClick={() => { setSelectedGuard(null); setShowAddGuard(true); }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
            Add Guard
          </button>
        </div>
      </div>

      {toast && (
        <div className="px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-check-line"></i></div>
          {toast}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[#111827] border border-gray-800 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${stat.accent}`}>
                <div className="w-4 h-4 flex items-center justify-center"><i className={stat.icon}></i></div>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider truncate">{stat.label}</p>
                <p className="text-lg font-bold text-white leading-tight">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-tools-line text-blue-400"></i></div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Workforce Tools</h2>
          </div>
          <p className="text-xs text-gray-500 mb-3">Templates and rota planning for deployment.</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowTemplateModal(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-800/60 hover:bg-gray-800 border border-gray-700 text-gray-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-file-copy-line"></i></div>
              Create Shift Template
            </button>
            <button
              onClick={() => setShowRotaModal(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-800/60 hover:bg-gray-800 border border-gray-700 text-gray-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-calendar-todo-line"></i></div>
              Rota Management
            </button>
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-route-line text-cyan-400"></i></div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Deployment</h2>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            <span className="text-emerald-400 font-medium">{assigned}</span> deployed ·{' '}
            <span className="text-amber-400 font-medium">{unassigned}</span> awaiting assignment
          </p>
          <Link
            href="/dashboard/site-assignments"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-800/60 hover:bg-gray-800 border border-gray-700 text-gray-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-right-line"></i></div>
            Open Assignments
          </Link>
        </div>
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

      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <i className="ri-loader-4-line animate-spin text-blue-500 text-2xl"></i>
          </div>
        ) : paged.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-xl bg-gray-800/50">
              <div className="w-6 h-6 flex items-center justify-center">
                <i className="ri-user-location-line text-gray-500 text-xl"></i>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-300 mb-1">No guards found</h3>
            <p className="text-sm text-gray-500">
              {search || statusFilter !== 'all' || siaFilter !== 'all'
                ? 'Try adjusting your filters.'
                : 'Add your first security guard to begin workforce planning.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/40">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Guard</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Current Assignment</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">SIA</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rate</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {paged.map((guard) => {
                    const isAssigned = guard.site_name && guard.site_name !== 'Unassigned';
                    return (
                      <tr key={guard.id} className="hover:bg-gray-800/20 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar guard={guard} />
                            <div>
                              <div className="text-sm font-medium text-white">{guard.first_name} {guard.last_name}</div>
                              <div className="text-xs text-gray-500">{guard.email || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 text-sm ${isAssigned ? 'text-gray-200' : 'text-gray-500'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isAssigned ? 'bg-emerald-500' : 'bg-gray-600'}`}></span>
                            {guard.site_name || 'Unassigned'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            isAssigned ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-500/10 text-gray-400'
                          }`}>
                            {isAssigned ? 'Assigned' : 'Unassigned'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <SIAStatusBadge dateStr={guard.sia_expiry} />
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-300">
                          {guard.hourly_rate ? `£${Number(guard.hourly_rate).toFixed(2)}/hr` : '—'}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleViewGuard(guard)}
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                              title="View guard"
                            >
                              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-eye-line"></i></div>
                            </button>
                            <button
                              onClick={() => { setSelectedGuard(guard); setShowRotaModal(true); }}
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors cursor-pointer"
                              title="View rota"
                            >
                              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-calendar-line"></i></div>
                            </button>
                            <button
                              onClick={() => handleEditGuard(guard)}
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Edit guard"
                            >
                              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-edit-line"></i></div>
                            </button>
                            <button
                              onClick={() => handleDeleteGuard(guard.id)}
                              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Permanent delete"
                            >
                              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-delete-bin-line"></i></div>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={safePage} totalPages={totalPages} onChange={setPage} total={filtered.length} />
          </>
        )}
      </div>

      <section className="bg-[#111827] border border-gray-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-lg bg-violet-600/20 flex items-center justify-center">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-sparkling-line text-violet-400"></i></div>
          </div>
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">AI Workforce Assistant</h2>
        </div>
        <p className="text-sm text-gray-400 mb-3">
          Ask the AI copilot about deployment gaps, staffing coverage and workforce planning. It works alongside your live operational data.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/ai-assistant"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-800/60 hover:bg-gray-800 border border-gray-700 text-gray-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-robot-2-line"></i></div>
            Open AI Assistant
          </Link>
          <Link
            href="/dashboard/ai-automation"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-800/60 hover:bg-gray-800 border border-gray-700 text-gray-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-sparkling-2-line"></i></div>
            AI Automation Hub
          </Link>
        </div>
        <AITooledOperationsCopilot />
      </section>

      {showAddGuard && (
        <AddGuardModal
          onClose={() => { setShowAddGuard(false); loadGuards(); }}
          onSubmit={async () => { setShowAddGuard(false); loadGuards(); }}
          existingGuard={selectedGuard}
          isEdit={!!selectedGuard}
        />
      )}
      {showRotaModal && (
        <RotaManagementModal
          onClose={() => setShowRotaModal(false)}
          selectedGuard={selectedGuard}
        />
      )}
      {showTemplateModal && (
        <CreateTemplateModal
          onClose={() => setShowTemplateModal(false)}
          onCreated={handleTemplateCreated}
        />
      )}
      {showGuardDetails && selectedGuard && (
        <GuardDetailsModal
          guard={selectedGuard}
          onClose={() => {
            setShowGuardDetails(false);
            setSelectedGuard(null);
          }}
          onDelete={async (id) => {
            await handleDeleteGuard(id);
            setShowGuardDetails(false);
            setSelectedGuard(null);
          }}
        />
      )}
    </div>
  );
}