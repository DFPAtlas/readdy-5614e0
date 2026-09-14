import type { Guard } from '@/lib/useGuards';
import { getFullName, getInitials } from '@/lib/useGuards';
import SIAStatusBadge from './SIAStatusBadge';
import SkillsChips from './SkillsChips';
import StatusBadge from './StatusBadge';
import GuardSortHeader from './GuardSortHeader';
import GuardTableSkeleton from './GuardTableSkeleton';
import Pagination from '@/app/sites/components/Pagination';

interface Props {
  guards: Guard[];
  loading: boolean;
  sortKey: string;
  sortDir: 'asc' | 'desc';
  onSort: (key: string) => void;
  onView: (guard: Guard) => void;
  onEdit: (guard: Guard) => void;
  onDeactivate: (guard: Guard) => void;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  total: number;
  totalAll: number;
  hasFilters: boolean;
  canEdit?: boolean;
  canDeactivate?: boolean;
}

function avatarGradient(id: string) {
  const gradients = [
    'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-300',
    'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-300',
    'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-violet-300',
    'bg-gradient-to-br from-orange-500/20 to-red-500/20 text-orange-300',
    'bg-gradient-to-br from-sky-500/20 to-indigo-500/20 text-sky-300',
    'bg-gradient-to-br from-rose-500/20 to-pink-500/20 text-rose-300',
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % gradients.length;
  return gradients[Math.abs(hash)];
}

function formatUKDate(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function maskSIA(value: string | null): string {
  if (!value) return '—';
  return `•••• ${value.slice(-4)}`;
}

function ActionButtons({
  guard, onView, onEdit, onDeactivate, canEdit, canDeactivate,
}: {
  guard: Guard;
  onView: (g: Guard) => void;
  onEdit: (g: Guard) => void;
  onDeactivate: (g: Guard) => void;
  canEdit: boolean;
  canDeactivate: boolean;
}) {
  const isInactive = (guard.status || 'active').toLowerCase() === 'inactive';
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onView(guard)}
        aria-label={`View profile for ${getFullName(guard)}`}
        title="View profile"
        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
      >
        <div className="w-4 h-4 flex items-center justify-center"><i className="ri-eye-line"></i></div>
      </button>
      {canEdit && (
        <button
          onClick={() => onEdit(guard)}
          aria-label={`Edit ${getFullName(guard)}`}
          title="Edit"
          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-edit-line"></i></div>
        </button>
      )}
      {canDeactivate && !isInactive && (
        <button
          onClick={() => onDeactivate(guard)}
          aria-label={`Deactivate ${getFullName(guard)}`}
          title="Deactivate guard"
          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer"
        >
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-user-unfollow-line"></i></div>
        </button>
      )}
    </div>
  );
}

export default function GuardsTable({
  guards, loading, sortKey, sortDir, onSort, onView, onEdit, onDeactivate, page, totalPages, onPageChange, total, totalAll, hasFilters,
  canEdit = true, canDeactivate = true,
}: Props) {
  const showEmptyNoGuards = !loading && totalAll === 0;
  const showEmptyNoMatch = !loading && totalAll > 0 && total === 0;

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
      {loading ? (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/40">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Phone</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">SIA Licence</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Rate</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Skills</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <GuardTableSkeleton />
            </table>
          </div>
          <div className="md:hidden space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-800/30 border border-gray-800 rounded-xl p-4 space-y-2">
                <div className="h-4 bg-gray-800 rounded w-32 animate-pulse"></div>
                <div className="h-3 bg-gray-800 rounded w-24 animate-pulse"></div>
                <div className="h-3 bg-gray-800 rounded w-40 animate-pulse"></div>
              </div>
            ))}
          </div>
        </>
      ) : showEmptyNoGuards ? (
        <div className="text-center py-12 px-4">
          <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-xl bg-gray-800/50">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-shield-user-line text-gray-500 text-xl"></i>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-300 mb-1">No guards yet</h3>
          <p className="text-sm text-gray-500">Add your first guard to get started.</p>
        </div>
      ) : showEmptyNoMatch ? (
        <div className="text-center py-12 px-4">
          <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-xl bg-gray-800/50">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-filter-off-line text-gray-500 text-xl"></i>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-300 mb-1">No guards match your search or filters</h3>
          <p className="text-sm text-gray-500">Try adjusting your search terms or clearing the filters.</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/40">
                <tr>
                  <GuardSortHeader label="Name" sortKey="first_name" activeKey={sortKey} dir={sortDir} onSort={onSort} />
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Phone</th>
                  <GuardSortHeader label="SIA Licence" sortKey="sia_expiry" activeKey={sortKey} dir={sortDir} onSort={onSort} />
                  <GuardSortHeader label="Rate" sortKey="hourly_rate" activeKey={sortKey} dir={sortDir} onSort={onSort} />
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Skills</th>
                  <GuardSortHeader label="Status" sortKey="status" activeKey={sortKey} dir={sortDir} onSort={onSort} />
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {guards.map((guard) => (
                  <tr key={guard.id} className="hover:bg-gray-800/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${avatarGradient(guard.id)}`}>
                          {getInitials(guard)}
                        </div>
                        <span className="text-sm font-medium text-white">{getFullName(guard)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-300 max-w-[200px] truncate">{guard.email || '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-300 whitespace-nowrap">{guard.phone || '—'}</td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-300 font-mono">{maskSIA(guard.sia_licence)}</div>
                        <SIAStatusBadge dateStr={guard.sia_expiry} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-300 whitespace-nowrap">
                      {guard.hourly_rate != null ? `£${Number(guard.hourly_rate).toFixed(2)}/hr` : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <SkillsChips skills={guard.skills} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={guard.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end">
                        <ActionButtons
                          guard={guard}
                          onView={onView}
                          onEdit={onEdit}
                          onDeactivate={onDeactivate}
                          canEdit={canEdit}
                          canDeactivate={canDeactivate}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-gray-800">
            {guards.map((guard) => (
              <div key={guard.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${avatarGradient(guard.id)}`}>
                      {getInitials(guard)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{getFullName(guard)}</p>
                      <p className="text-xs text-gray-500 truncate">{guard.email || guard.phone || '—'}</p>
                    </div>
                  </div>
                  <StatusBadge status={guard.status} />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider">SIA Licence</p>
                    <p className="text-gray-300 font-mono">{maskSIA(guard.sia_licence)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider">Expiry</p>
                    <p className="text-gray-300">{formatUKDate(guard.sia_expiry)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider">Hourly Rate</p>
                    <p className="text-gray-300">{guard.hourly_rate != null ? `£${Number(guard.hourly_rate).toFixed(2)}/hr` : '—'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-500 uppercase tracking-wider">SIA Status</p>
                    <SIAStatusBadge dateStr={guard.sia_expiry} />
                  </div>
                </div>

                <div className="mt-2">
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">Skills</p>
                  <SkillsChips skills={guard.skills} />
                </div>

                <div className="mt-3 flex items-center justify-end border-t border-gray-800 pt-3">
                  <ActionButtons
                    guard={guard}
                    onView={onView}
                    onEdit={onEdit}
                    onDeactivate={onDeactivate}
                    canEdit={canEdit}
                    canDeactivate={canDeactivate}
                  />
                </div>
              </div>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={onPageChange} total={total} />
        </>
      )}
    </div>
  );
}