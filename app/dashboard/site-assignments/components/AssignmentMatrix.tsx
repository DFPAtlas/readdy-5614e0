'use client';

import { useState } from 'react';

const statusColors: Record<string, { bg: string; border: string; text: string; icon: string; label: string }> = {
  assigned: { bg: 'bg-emerald-500', border: 'border-emerald-500', text: 'text-emerald-400', icon: 'ri-check-line', label: 'Assigned' },
  approved: { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-400', icon: 'ri-shield-check-line', label: 'Approved' },
  not_trained: { bg: 'bg-amber-500', border: 'border-amber-500', text: 'text-amber-400', icon: 'ri-alert-line', label: 'Not Trained' },
  blocked: { bg: 'bg-red-500', border: 'border-red-500', text: 'text-red-400', icon: 'ri-forbid-line', label: 'Blocked' },
  expired_docs: { bg: 'bg-rose-500', border: 'border-rose-500', text: 'text-rose-400', icon: 'ri-file-warning-line', label: 'Expired Docs' },
  available: { bg: 'bg-sky-500', border: 'border-sky-500', text: 'text-sky-400', icon: 'ri-add-circle-line', label: 'Available' },
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
        <div className="w-12 h-12 mx-auto mb-3 bg-gray-800/50 rounded-xl flex items-center justify-center">
          <i className="ri-search-line text-gray-500"></i>
        </div>
        <p className="text-sm">No results match your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
        {Object.entries(statusColors).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 rounded-sm ${val.bg}`} />
            <span className="text-gray-400">{val.label}</span>
          </div>
        ))}
      </div>

      <div className="hidden lg:block overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-800 bg-[#0b0f19]">
              <th className="sticky left-0 bg-[#0b0f19] z-10 px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider border-r border-gray-800">
                Guard
              </th>
              {filteredCols.map((col) => (
                <th
                  key={col.id}
                  className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider min-w-[104px] border-b border-gray-800"
                  onMouseEnter={() => setHoveredCol(col.id)}
                  onMouseLeave={() => setHoveredCol(null)}
                >
                  <div className="truncate max-w-[130px] mx-auto">{col.site_name}</div>
                  {col.client_name && <div className="text-gray-600 text-[10px] truncate max-w-[130px] mx-auto">{col.client_name}</div>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr
                key={row.guard_id}
                className="border-b border-gray-800/60 hover:bg-gray-800/20 transition-colors"
              >
                <td className="sticky left-0 bg-[#0b0f19] z-10 px-4 py-3 border-r border-gray-800">
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
                          <span className="text-amber-400">SIA expiring</span>
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
                      className={`px-3 py-2 text-center cursor-pointer transition-colors ${hoveredCol === col.id ? 'bg-gray-800/30' : ''}`}
                      onClick={() => onCellClick(row, col, cell)}
                      title={`${row.guard_name} — ${col.site_name}: ${style.label}`}
                    >
                      <div
                        className={`mx-auto w-8 h-8 rounded-lg flex items-center justify-center border ${style.border} ${style.bg}/15 hover:${style.bg}/30 transition-colors`}
                      >
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

      <div className="lg:hidden space-y-3">
        {filteredRows.map((row) => (
          <div key={row.guard_id} className="bg-[#151b27] rounded-xl border border-gray-800 p-4">
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
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border ${style.border} ${style.bg}/10 text-left transition-colors hover:${style.bg}/20 cursor-pointer`}
                  >
                    <div className={`w-3 h-3 rounded-sm flex-shrink-0 ${style.bg}`} />
                    <div className="min-w-0">
                      <div className="text-xs text-white truncate">{col.site_name}</div>
                      <div className="text-[10px] text-gray-500">{style.label}</div>
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