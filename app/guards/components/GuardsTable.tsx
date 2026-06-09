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
  onDelete: (guard: Guard) => void;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  total: number;
  canEdit?: boolean;
  canDelete?: boolean;
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

export default function GuardsTable({
  guards, loading, sortKey, sortDir, onSort, onView, onEdit, onDelete, page, totalPages, onPageChange, total,
  canEdit = true, canDelete = true,
}: Props) {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
      {loading ? (
        <div className="overflow-x-auto">
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
      ) : guards.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-xl bg-gray-800/50">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-shield-user-line text-gray-500 text-xl"></i>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-300 mb-1">No guards yet</h3>
          <p className="text-sm text-gray-500">Add your first guard to get started.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
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
                    <td className="px-5 py-3.5 text-sm text-gray-300">{guard.email || '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-300">{guard.phone || '—'}</td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-300">
                          {guard.sia_licence ? `****${guard.sia_licence.slice(-4)}` : '—'}
                        </div>
                        <SIAStatusBadge dateStr={guard.sia_expiry} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-300">
                      {guard.hourly_rate != null ? `£${Number(guard.hourly_rate).toFixed(2)}/hr` : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <SkillsChips skills={guard.skills} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={guard.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onView(guard)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                          title="View profile"
                        >
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-eye-line"></i>
                          </div>
                        </button>
                        {canEdit && (
                        <button
                          onClick={() => onEdit(guard)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-edit-line"></i>
                          </div>
                        </button>
                        )}
                        {canDelete && (
                        <button
                          onClick={() => onDelete(guard)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-delete-bin-line"></i>
                          </div>
                        </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={onPageChange} total={total} />
        </>
      )}
    </div>
  );
}