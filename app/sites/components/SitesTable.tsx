import type { Site } from '@/lib/useSites';
import Link from 'next/link';
import RiskBadge from './RiskBadge';
import SortHeader from './SortHeader';
import TableSkeleton from './TableSkeleton';
import EmptyState from './EmptyState';
import Pagination from './Pagination';

interface Props {
  sites: Site[];
  loading: boolean;
  sortKey: string;
  sortDir: 'asc' | 'desc';
  onSort: (key: string) => void;
  onEdit: (site: Site) => void;
  onDelete: (site: Site) => void;
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  total: number;
  search: string;
}

export default function SitesTable({
  sites, loading, sortKey, sortDir, onSort, onEdit, onDelete, page, totalPages, onPageChange, total, search,
}: Props) {
  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
      {loading ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/40">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Site Name</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Client</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Address</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Risk Level</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase">Check-Call</th>
                <th className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <TableSkeleton />
          </table>
        </div>
      ) : sites.length === 0 ? (
        <EmptyState search={search} />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/40">
                <tr>
                  <SortHeader label="Site Name" sortKey="site_name" activeKey={sortKey} dir={sortDir} onSort={onSort} />
                  <SortHeader label="Client" sortKey="client_name" activeKey={sortKey} dir={sortDir} onSort={onSort} />
                  <SortHeader label="Address" sortKey="address" activeKey={sortKey} dir={sortDir} onSort={onSort} />
                  <SortHeader label="Risk Level" sortKey="risk_level" activeKey={sortKey} dir={sortDir} onSort={onSort} />
                  <SortHeader label="Check-Call" sortKey="check_call_interval" activeKey={sortKey} dir={sortDir} onSort={onSort} />
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {sites.map((site) => (
                  <tr key={site.id} className="hover:bg-gray-800/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link href={`/sites/${site.id}`} className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors">
                          <div className="w-4 h-4 flex items-center justify-center">
                            <i className="ri-building-line text-blue-400 text-sm"></i>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{site.site_name}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-300">{site.client_name || '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-400 max-w-xs truncate" title={site.address || ''}>
                      {site.address || '—'}
                    </td>
                    <td className="px-5 py-3.5"><RiskBadge level={site.risk_level} /></td>
                    <td className="px-5 py-3.5 text-sm text-gray-400">Every {site.check_call_interval || 60} min</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/sites/${site.id}`}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                          title="View site"
                        >
                          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-eye-line"></i></div>
                        </Link>
                        <button
                          onClick={() => onEdit(site)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-edit-line"></i></div>
                        </button>
                        <button
                          onClick={() => onDelete(site)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-delete-bin-line"></i></div>
                        </button>
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