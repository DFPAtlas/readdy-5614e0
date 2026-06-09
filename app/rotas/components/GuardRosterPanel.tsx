'use client';

import { useState } from 'react';
import type { Guard } from '@/lib/useGuards';
import type { GuardRotaStats } from '@/app/rotas/hooks/useRotaEngine';
import { getSIAStatus, getDaysUntil } from '@/lib/useGuards';

interface GuardRosterPanelProps {
  guards: Guard[];
  guardStats: Record<string, GuardRotaStats>;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function GuardRosterPanel({
  guards,
  guardStats,
  collapsed,
  onToggleCollapse,
}: GuardRosterPanelProps) {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active'>('active');
  const [sortBy, setSortBy] = useState<'name' | 'hours' | 'conflicts'>('name');

  const filtered = (() => {
    let result = [...guards];
    if (statusFilter === 'active') {
      result = result.filter((g) => (g.status || 'active') === 'active');
    }
    const q = filter.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (g) =>
          `${g.first_name || ''} ${g.last_name || ''}`.toLowerCase().includes(q) ||
          (g.sia_licence || '').toLowerCase().includes(q)
      );
    }
    if (sortBy === 'hours') {
      result.sort((a, b) => {
        const ha = guardStats[a.id]?.totalHours || 0;
        const hb = guardStats[b.id]?.totalHours || 0;
        return hb - ha;
      });
    } else if (sortBy === 'conflicts') {
      result.sort((a, b) => {
        const ca = guardStats[a.id]?.conflicts || 0;
        const cb = guardStats[b.id]?.conflicts || 0;
        return cb - ca;
      });
    } else {
      result.sort((a, b) =>
        `${a.first_name || ''} ${a.last_name || ''}`.localeCompare(`${b.first_name || ''} ${b.last_name || ''}`)
      );
    }
    return result;
  })();

  return (
    <div className={`bg-[#151b27] border-r border-gray-800 flex flex-col transition-all duration-200 ${collapsed ? 'w-14' : 'w-72'}`}>
      <button
        onClick={onToggleCollapse}
        className="flex items-center gap-2 px-3 py-3 border-b border-gray-800 hover:bg-gray-800/30 transition-colors cursor-pointer"
      >
        <div className="w-5 h-5 flex items-center justify-center text-blue-400">
          <i className="ri-shield-user-line"></i>
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-white whitespace-nowrap">
            Guards ({filtered.length})
          </span>
        )}
        <div className={`w-4 h-4 flex items-center justify-center text-gray-500 ${collapsed ? '' : 'ml-auto'}`}>
          {collapsed ? (
            <i className="ri-arrow-right-s-line"></i>
          ) : (
            <i className="ri-arrow-left-s-line"></i>
          )}
        </div>
      </button>

      {!collapsed && (
        <>
          <div className="px-3 py-2 border-b border-gray-800 space-y-2">
            <div className="relative">
              <div className="w-4 h-4 flex items-center justify-center absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500">
                <i className="ri-search-line text-xs"></i>
              </div>
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Find guard..."
                className="w-full bg-gray-800/60 border border-gray-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-2 py-1 rounded text-[11px] font-medium cursor-pointer whitespace-nowrap ${
                  statusFilter === 'active'
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                    : 'bg-gray-800/60 text-gray-400 border border-gray-700 hover:text-gray-300'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2 py-1 rounded text-[11px] font-medium cursor-pointer whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                    : 'bg-gray-800/60 text-gray-400 border border-gray-700 hover:text-gray-300'
                }`}
              >
                All
              </button>
              <div className="ml-auto flex gap-1">
                <button
                  onClick={() => setSortBy('name')}
                  className={`w-6 h-6 flex items-center justify-center rounded text-xs cursor-pointer ${sortBy === 'name' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                  title="Sort by name"
                >
                  <i className="ri-sort-alphabet-asc"></i>
                </button>
                <button
                  onClick={() => setSortBy('hours')}
                  className={`w-6 h-6 flex items-center justify-center rounded text-xs cursor-pointer ${sortBy === 'hours' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                  title="Sort by hours"
                >
                  <i className="ri-time-line"></i>
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filtered.length === 0 && (
              <div className="text-center py-6">
                <p className="text-gray-500 text-xs">No guards found</p>
              </div>
            )}
            {filtered.map((guard) => (
              <GuardDraggableCard key={guard.id} guard={guard} stats={guardStats[guard.id]} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function GuardDraggableCard({ guard, stats }: { guard: Guard; stats?: GuardRotaStats }) {
  const initials = `${(guard.first_name || '')[0]}${(guard.last_name || '')[0]}`.toUpperCase();
  const fullName = `${guard.first_name || ''} ${guard.last_name || ''}`.trim() || 'Unnamed';
  const siaStatus = getSIAStatus(guard.sia_expiry);
  const daysLeft = getDaysUntil(guard.sia_expiry);

  const siaDot =
    siaStatus === 'expired'
      ? 'bg-red-500'
      : siaStatus === 'expiring_soon'
        ? 'bg-amber-500'
        : 'bg-emerald-500';

  const hours = stats?.totalHours || 0;
  const overtime = stats?.overtime || false;
  const warning = stats?.warning || false;
  const conflictCount = stats?.conflicts || 0;
  const onLeave = stats?.onLeave || false;
  const unavailableDays = stats?.unavailableDays || 0;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('type', 'guard');
    e.dataTransfer.setData('guardId', guard.id);
    e.dataTransfer.setData('guardName', fullName);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`flex items-center gap-2.5 border rounded-lg px-2.5 py-2 cursor-grab active:cursor-grabbing hover:border-blue-500/40 hover:bg-[#1f2535] transition-colors select-none group ${
        onLeave
          ? 'bg-red-500/5 border-red-500/20'
          : overtime
            ? 'bg-amber-500/5 border-amber-500/20'
            : 'bg-[#1a1f2e] border-gray-700/60'
      }`}
      title={`Drag ${fullName} onto a shift`}
    >
      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 shrink-0">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-xs font-medium text-gray-200 truncate">{fullName}</span>
          {conflictCount > 0 && (
            <span className="text-[9px] text-red-400 bg-red-500/10 px-1 rounded shrink-0">{conflictCount} conflict</span>
          )}
          {onLeave && (
            <span className="text-[9px] text-red-400 bg-red-500/10 px-1 rounded shrink-0">Leave</span>
          )}
          {unavailableDays > 0 && (
            <span className="text-[9px] text-gray-400 bg-gray-500/10 px-1 rounded shrink-0">{unavailableDays} off</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`w-1.5 h-1.5 rounded-full ${siaDot}`}></span>
          <span className="text-[10px] text-gray-500">
            {siaStatus === 'expired'
              ? 'SIA expired'
              : siaStatus === 'expiring_soon'
                ? `${daysLeft}d left`
                : 'SIA valid'}
          </span>
          <span className={`text-[10px] ml-auto ${overtime ? 'text-red-400 font-medium' : warning ? 'text-amber-400' : 'text-gray-500'}`}>
            {hours.toFixed(1)}h
            {overtime && ' OT'}
          </span>
        </div>
      </div>
      <div className="w-4 h-4 flex items-center justify-center text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <i className="ri-drag-move-line text-xs"></i>
      </div>
    </div>
  );
}