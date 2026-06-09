'use client';

import { useState, useMemo } from 'react';
import { type Site, type UserSiteAccessRecord } from './lib';

const ACCESS_TYPES = [
  { value: 'all', label: 'All Sites', icon: 'ri-global-line', desc: 'Access to every site in the company' },
  { value: 'selected', label: 'Selected Sites', icon: 'ri-checkbox-multiple-line', desc: 'Only specific sites chosen below' },
  { value: 'region', label: 'By Region', icon: 'ri-map-2-line', desc: 'All sites within a named region' },
  { value: 'own', label: 'Own Only', icon: 'ri-user-line', desc: 'Only sites the user is directly assigned to' },
];

interface Props {
  users: any[];
  sites: Site[];
  userSiteAccess: UserSiteAccessRecord[];
  saving: boolean;
  getUserSiteAccess: (userId: string) => UserSiteAccessRecord[];
  onUpdateAccess: (userId: string, accessType: 'all' | 'selected' | 'region' | 'own', selectedSiteIds?: string[], regionValue?: string) => Promise<void>;
}

export default function SiteAccessTab({ users, sites, saving, getUserSiteAccess, onUpdateAccess }: Props) {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [accessType, setAccessType] = useState<'all' | 'selected' | 'region' | 'own'>('all');
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);
  const [regionValue, setRegionValue] = useState('');
  const [search, setSearch] = useState('');

  const regions = useMemo(() => {
    const set = new Set<string>();
    sites.forEach(s => { if (s.region) set.add(s.region); });
    return Array.from(set).sort();
  }, [sites]);

  const openEditor = (userId: string) => {
    const access = getUserSiteAccess(userId);
    setSelectedUser(userId);
    if (access.length === 0) {
      setAccessType('all');
      setSelectedSiteIds([]);
      setRegionValue('');
    } else {
      const first = access[0];
      setAccessType(first.access_type as any);
      if (first.access_type === 'selected') {
        setSelectedSiteIds(access.map(a => a.site_id!).filter(Boolean));
      } else if (first.access_type === 'region') {
        setRegionValue(first.region || '');
        setSelectedSiteIds([]);
      } else {
        setSelectedSiteIds([]);
        setRegionValue('');
      }
    }
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    await onUpdateAccess(selectedUser, accessType, selectedSiteIds, regionValue);
    setSelectedUser(null);
  };

  const filteredUsers = search.trim()
    ? users.filter(u => {
        const term = search.toLowerCase();
        return (
          (u.first_name || '').toLowerCase().includes(term) ||
          (u.last_name || '').toLowerCase().includes(term) ||
          (u.email || '').toLowerCase().includes(term)
        );
      })
    : users;

  const getAccessLabel = (userId: string) => {
    const access = getUserSiteAccess(userId);
    if (access.length === 0) return 'Not set';
    const first = access[0];
    const type = ACCESS_TYPES.find(t => t.value === first.access_type);
    if (first.access_type === 'selected') return `${access.length} site${access.length !== 1 ? 's' : ''}`;
    if (first.access_type === 'region') return first.region || 'Region';
    return type?.label || first.access_type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Site Access Control</h2>
          <p className="text-sm text-gray-400 mt-1">Control which sites each user can view and manage</p>
        </div>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-gray-500">
            <i className="ri-search-line"></i>
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users..."
            className="bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 w-64"
          />
        </div>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Site Access</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-800/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-400 text-xs font-semibold shrink-0">
                        {(u.first_name?.[0] || '') + (u.last_name?.[0] || '') || '?'}
                      </div>
                      <span className="text-white font-medium whitespace-nowrap">{u.first_name || ''} {u.last_name || ''}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{u.email || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-300">{getAccessLabel(u.id)}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEditor(u.id)}
                      className="px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-600/10 rounded-md hover:bg-blue-600/20 whitespace-nowrap cursor-pointer"
                    >
                      Configure
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500 text-sm">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Site Access Editor Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-gray-700 rounded-xl w-full max-w-lg p-6 space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">Site Access</h3>
                <p className="text-sm text-gray-400">
                  {users.find(u => u.id === selectedUser)?.first_name || ''} {users.find(u => u.id === selectedUser)?.last_name || ''}
                </p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-white w-6 h-6 flex items-center justify-center cursor-pointer"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>

            {/* Access type cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ACCESS_TYPES.map(type => (
                <button
                  key={type.value}
                  onClick={() => setAccessType(type.value as any)}
                  className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    accessType === type.value
                      ? 'bg-blue-600/10 border-blue-500/30'
                      : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 flex items-center justify-center text-gray-400">
                      <i className={type.icon}></i>
                    </div>
                    <span className={`text-sm font-medium ${accessType === type.value ? 'text-blue-400' : 'text-gray-300'}`}>{type.label}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 pl-7">{type.desc}</p>
                </button>
              ))}
            </div>

            {/* Selected sites picker */}
            {accessType === 'selected' && (
              <div className="space-y-2">
                <label className="block text-sm text-gray-400">Select sites</label>
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 max-h-56 overflow-y-auto space-y-1">
                  {sites.map(site => {
                    const checked = selectedSiteIds.includes(site.id);
                    return (
                      <label key={site.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700/30 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={e => {
                            if (e.target.checked) setSelectedSiteIds(prev => [...prev, site.id]);
                            else setSelectedSiteIds(prev => prev.filter(id => id !== site.id));
                          }}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500 shrink-0"
                        />
                        <div>
                          <p className="text-sm text-white">{site.name}</p>
                          {site.region && <p className="text-xs text-gray-500">{site.region}{site.address ? ` · ${site.address}` : ''}</p>}
                        </div>
                      </label>
                    );
                  })}
                  {sites.length === 0 && (
                    <p className="text-gray-500 text-sm text-center py-4">No sites available</p>
                  )}
                </div>
                <p className="text-xs text-gray-500">{selectedSiteIds.length} site{selectedSiteIds.length !== 1 ? 's' : ''} selected</p>
              </div>
            )}

            {/* Region selector */}
            {accessType === 'region' && (
              <div className="space-y-2">
                <label className="block text-sm text-gray-400">Region name</label>
                {regions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {regions.map(r => (
                      <button
                        key={r}
                        onClick={() => setRegionValue(r)}
                        className={`px-2.5 py-1 text-xs rounded-md border cursor-pointer ${
                          regionValue === r
                            ? 'bg-blue-600/15 text-blue-400 border-blue-500/20'
                            : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
                <input
                  value={regionValue}
                  onChange={e => setRegionValue(e.target.value)}
                  placeholder="Enter region name"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setSelectedUser(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white whitespace-nowrap cursor-pointer">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || (accessType === 'selected' && selectedSiteIds.length === 0) || (accessType === 'region' && !regionValue.trim())}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg whitespace-nowrap cursor-pointer"
              >
                {saving ? <i className="ri-loader-4-line animate-spin mr-1"></i> : null}
                Save Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}