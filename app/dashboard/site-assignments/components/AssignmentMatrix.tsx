'use client';

import { useState } from 'react';

const statusColors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  assigned: { bg: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-400', icon: 'ri-check-line' },
  approved: { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-400', icon: 'ri-shield-check-line' },
  not_trained: { bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-400', icon: 'ri-alert-line' },
  blocked: { bg: 'bg-red-500', border: 'border-red-500', text: 'text-red-400', icon: 'ri-forbid-line' },
  expired_docs: { bg: 'bg-rose-500', border: 'border-rose-500', text: 'text-rose-400', icon: 'ri-file-warning-line' },
  available: { bg: 'bg-gray-500', border: 'border-gray-500', text: 'text-gray-400', icon: 'ri-question-line' },
};

interface AssignmentMatrixProps {
  rows: any[];
  columns: any[];
  filters: any;
  onCellClick: (guard: any, site: any, cell: any) => void;
}

export default function AssignmentMatrix({ rows, columns, filters, onCellClick }: AssignmentMatrixProps) {
  const [hoveredCol, setHoveredCol] = useState<string | null>(null);

  const filterRow = (row: any) => {
    if (filters.guard && filters.guard !== 'all' && row.guard_id !== filters.guard) return false;
    if (filters.search && !row.guard_name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.licence && filters.licence !== 'all' && row.sia_status !== filters.licence) return false;
    if (filters.status && filters.status !== 'all') {
      const hasMatchingCell = columns.some((col) => row.cells[col.id]?.status === filters.status);
      if (!hasMatchingCell) return false;
    }
    return true;
  };

  const filterCol = (col: any) => {
    if (filters.site && filters.site !== 'all' && col.id !== filters.site) return false;
    if (filters.client && filters.client !== 'all' && col.client_id !== filters.client) return false;
    if (filters.search && !col.site_name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  };

  const filteredRows = rows.filter(filterRow);
  const filteredCols = columns.filter(filterCol);

  if (filteredRows.length === 0 || filteredCols.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <div className="w-12 h-12 mx-auto mb-3 bg-white/5 rounded-xl flex items-center justify-center">
          <i className="ri-search-line text-gray-500"></i>
        </div>
        <p className="text-sm">No results match your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(statusColors).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-full ${val.bg}`} />
            <span className="text-gray-400 capitalize">{key.replace('_', ' ')}</span>
          </div>
        ))}
      </div>

      {/* Desktop Matrix */}
      <div className="hidden lg:block overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="sticky left-0 bg-[#0f172a] z-10 px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-white/10">
                Guard
              </th>
              {filteredCols.map((col) => (
                <th
                  key={col.id}
                  className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider min-w-[100px]"
                  onMouseEnter={() => setHoveredCol(col.id)}
                  onMouseLeave={() => setHoveredCol(null)}
                >
                  <div className="truncate max-w-[120px] mx-auto">{col.site_name}</div>
                  {col.client_name && <div className="text-gray-600 text-[10px] truncate">{col.client_name}</div>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr
                key={row.guard_id}
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="sticky left-0 bg-[#0f172a] z-10 px-4 py-3 border-r border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 text-xs font-semibold flex-shrink-0">
                      {row.guard_initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-white truncate">{row.guard_name}</div>
                      <div className="text-xs text-gray-500">
                        {row.sia_status === 'valid' ? (
                          <span className="text-emerald-400">SIA valid</span>
                        ) : row.sia_status === 'expiring' ? (
                          <span className="text-orange-400">SIA expiring</span>
                        ) : (
                          <span className="text-red-400">SIA expired</span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                {filteredCols.map((col) => {
                  const cell = row.cells[col.id] || { status: 'available' };
                  const style = statusColors[cell.status] || statusColors.available;
                  return (
                    <td
                      key={col.id}
                      className={`px-3 py-2 text-center cursor-pointer transition-all ${hoveredCol === col.id ? 'bg-white/5 opacity-100' : ''}`}
                      onClick={() => onCellClick(row, col, cell)}
                    >
                      <div className={`mx-auto w-8 h-8 rounded-lg flex items-center justify-center border ${style.border} ${style.bg}/15 hover:${style.bg}/30`}>
                        <div className="w-4 h-4 flex items-center justify-center">
                          <i className={`${style.icon} ${style.text} text-xs`}></i>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="lg:hidden space-y-3">
        {filteredRows.map((row) => (
          <div key={row.guard_id} className="bg-white/5 rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-semibold">
                {row.guard_initials}
              </div>
              <div>
                <div className="text-sm font-medium text-white">{row.guard_name}</div>
                <div className="text-xs text-gray-500">
                  {row.sia_status === 'valid' ? 'SIA valid' : row.sia_status === 'expiring' ? 'SIA expiring' : 'SIA expired'}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {filteredCols.map((col) => {
                const cell = row.cells[col.id] || { status: 'available' };
                const style = statusColors[cell.status] || statusColors.available;
                return (
                  <button
                    key={col.id}
                    onClick={() => onCellClick(row, col, cell)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border ${style.border} ${style.bg}/10 text-left transition-colors hover:bg-white/5 cursor-pointer`}
                  >
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: `var(--tw-color-${style.bg.replace('bg-', '')})` }}>
                      <div className={`w-3 h-3 rounded-full ${style.bg}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-white truncate">{col.site_name}</div>
                      <div className="text-[10px] text-gray-500 capitalize">{cell.status.replace('_', ' ')}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}