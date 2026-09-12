'use client';

import Link from 'next/link';
import type { Site } from '@/lib/useSites';

interface SitesTableProps {
  sites: Site[];
  loading: boolean;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
}

function RiskBadge({ level }: { level: string | null }) {
  if (!level) return <span className="text-xs text-gray-500">—</span>;
  const map: Record<string, { bg: string; text: string }> = {
    low: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    medium: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
    high: { bg: 'bg-orange-500/10', text: 'text-orange-400' },
    critical: { bg: 'bg-red-500/10', text: 'text-red-400' },
  };
  const style = map[level] || { bg: 'bg-gray-500/10', text: 'text-gray-400' };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const effective = status || 'active';
  const map: Record<string, { bg: string; text: string; label: string }> = {
    active: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Active' },
    archived: { bg: 'bg-gray-500/10', text: 'text-gray-400', label: 'Archived' },
    inactive: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Inactive' },
  };
  const style = map[effective] || map.active;
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

function SiteIcon({ name }: { name: string }) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 6;
  const gradients = [
    'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-300',
    'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-300',
    'bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 text-violet-300',
    'bg-gradient-to-br from-orange-500/20 to-red-500/20 text-orange-300',
    'bg-gradient-to-br from-sky-500/20 to-indigo-500/20 text-sky-300',
    'bg-gradient-to-br from-rose-500/20 to-pink-500/20 text-rose-300',
  ];
  const initial = (name || 'S')[0].toUpperCase();
  return (
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${gradients[Math.abs(hash)]}`}>
      {initial}
    </div>
  );
}

export default function SitesTable({ sites, loading, onArchive, onRestore }: SitesTableProps) {
  if (loading && sites.length === 0) {
    return (
      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-12 flex items-center justify-center">
          <i className="ri-loader-4-line animate-spin text-blue-500 text-2xl"></i>
        </div>
      </div>
    );
  }

  if (sites.length === 0) {
    return (
      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-12 text-center">
          <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-xl bg-gray-800/50">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-building-line text-gray-500 text-xl"></i>
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-300 mb-1">No sites found</h3>
          <p className="text-sm text-gray-500">Add your first site to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800/40">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Site</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Location</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Risk Level</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Client</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Patrol</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {sites.map((site) => (
              <tr key={site.id} className="hover:bg-gray-800/20 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <SiteIcon name={site.site_name} />
                    <div>
                      <div className="text-sm font-medium text-white">{site.site_name}</div>
                      <div className="text-xs text-gray-500">{site.site_type || 'Static'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <div className="text-sm text-gray-300">{site.address || '—'}</div>
                  <div className="text-xs text-gray-500">{site.region || ''}</div>
                </td>
                <td className="px-5 py-3.5">
                  <RiskBadge level={site.risk_level} />
                </td>
                <td className="px-5 py-3.5">
                  <div className="text-sm text-gray-300">{site.client_name || '—'}</div>
                </td>
                <td className="px-5 py-3.5">
                  {site.patrol_enabled ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      {site.patrol_interval ? `Every ${site.patrol_interval}m` : 'Enabled'}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">Disabled</span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={site.status} />
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/dashboard/sites/${site.id}`}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
                      title="View"
                    >
                      <div className="w-4 h-4 flex items-center justify-center"><i className="ri-eye-line"></i></div>
                    </Link>
                    {site.status === 'archived' ? (
                      <button
                        onClick={() => onRestore(site.id)}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Restore"
                      >
                        <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-go-back-line"></i></div>
                      </button>
                    ) : (
                      <button
                        onClick={() => onArchive(site.id)}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Archive"
                      >
                        <div className="w-4 h-4 flex items-center justify-center"><i className="ri-archive-line"></i></div>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}