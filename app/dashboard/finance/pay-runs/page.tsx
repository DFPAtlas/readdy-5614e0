'use client';

import { useState } from 'react';
import Link from 'next/link';

interface PayRun {
  id: string;
  reference: string;
  periodStart: string;
  periodEnd: string;
  guardCount: number;
  grossTotal: string;
  expensesTotal: string;
  netTotal: string;
  status: string;
  preparedBy: string;
  date: string;
}

const mockPayRuns: PayRun[] = [
  { id: '1', reference: 'PR-2024-08-001', periodStart: '28 Jul', periodEnd: '3 Aug', guardCount: 24, grossTotal: '£12,450.00', expensesTotal: '£340.00', netTotal: '£12,790.00', status: 'approved', preparedBy: 'Rachel Adams', date: '4 Aug 2024' },
  { id: '2', reference: 'PR-2024-08-002', periodStart: '4 Aug', periodEnd: '10 Aug', guardCount: 26, grossTotal: '£13,120.00', expensesTotal: '£285.00', netTotal: '£13,405.00', status: 'draft', preparedBy: 'Rachel Adams', date: '—' },
  { id: '3', reference: 'PR-2024-07-005', periodStart: '21 Jul', periodEnd: '27 Jul', guardCount: 22, grossTotal: '£11,890.00', expensesTotal: '£420.00', netTotal: '£12,310.00', status: 'paid', preparedBy: 'Rachel Adams', date: '31 Jul 2024' },
  { id: '4', reference: 'PR-2024-07-004', periodStart: '14 Jul', periodEnd: '20 Jul', guardCount: 25, grossTotal: '£12,780.00', expensesTotal: '£310.00', netTotal: '£13,090.00', status: 'paid', preparedBy: 'Rachel Adams', date: '24 Jul 2024' },
  { id: '5', reference: 'PR-2024-07-003', periodStart: '7 Jul', periodEnd: '13 Jul', guardCount: 23, grossTotal: '£11,560.00', expensesTotal: '£275.00', netTotal: '£11,835.00', status: 'paid', preparedBy: 'Mark Stevens', date: '17 Jul 2024' },
];

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500/15 text-gray-400',
  calculating: 'bg-blue-500/15 text-blue-400',
  needs_review: 'bg-amber-500/15 text-amber-400',
  approved: 'bg-emerald-500/15 text-emerald-400',
  exported: 'bg-purple-500/15 text-purple-400',
  paid: 'bg-green-500/15 text-green-400',
  canceled: 'bg-red-500/15 text-red-400',
};

export default function PayRunsPage() {
  const [selectedRun, setSelectedRun] = useState<PayRun | null>(null);

  const statusLabel = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pay Runs</h1>
          <p className="text-sm text-gray-400 mt-1">Prepare, approve and export payroll runs</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/finance" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white cursor-pointer whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
            Finance Centre
          </Link>
          <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
            New Pay Run
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Pay Runs', value: '5', sub: 'This month', icon: 'ri-file-list-3-line', color: 'text-blue-400' },
          { label: 'Gross Pay', value: '£24,605', sub: 'Approved this month', icon: 'ri-money-pound-circle-line', color: 'text-emerald-400' },
          { label: 'Guards Paid', value: '26', sub: 'Across all sites', icon: 'ri-team-line', color: 'text-purple-400' },
          { label: 'Pending Approval', value: '1', sub: 'PR-2024-08-002', icon: 'ri-time-line', color: 'text-amber-400' },
        ].map((c, i) => (
          <div key={i} className="bg-[#111827] border border-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 flex items-center justify-center rounded-lg bg-[#1a1f2e] ${c.color}`}>
                <i className={c.icon}></i>
              </div>
            </div>
            <p className="text-xl font-bold text-white">{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
            <p className="text-xs text-gray-600">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-xs text-gray-500">
              <th className="text-left py-3 px-4 font-medium">Reference</th>
              <th className="text-left py-3 px-4 font-medium">Period</th>
              <th className="text-center py-3 px-4 font-medium">Guards</th>
              <th className="text-right py-3 px-4 font-medium">Gross</th>
              <th className="text-right py-3 px-4 font-medium">Expenses</th>
              <th className="text-right py-3 px-4 font-medium">Net</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-left py-3 px-4 font-medium">Prepared</th>
              <th className="text-right py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockPayRuns.map((run) => (
              <tr key={run.id} className="border-b border-gray-800/50 hover:bg-white/[0.02] cursor-pointer" onClick={() => setSelectedRun(run)}>
                <td className="py-3 px-4 text-gray-300 font-mono text-xs font-medium">{run.reference}</td>
                <td className="py-3 px-4 text-gray-400">{run.periodStart} — {run.periodEnd}</td>
                <td className="py-3 px-4 text-center text-gray-300">{run.guardCount}</td>
                <td className="py-3 px-4 text-right text-gray-300 font-mono">{run.grossTotal}</td>
                <td className="py-3 px-4 text-right text-gray-300 font-mono">{run.expensesTotal}</td>
                <td className="py-3 px-4 text-right text-white font-mono font-semibold">{run.netTotal}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[run.status] || ''}`}>
                    {statusLabel(run.status)}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-500">{run.preparedBy}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 cursor-pointer" title="View">
                      <i className="ri-eye-line"></i>
                    </button>
                    {run.status === 'draft' && (
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg text-emerald-400 hover:bg-emerald-500/10 cursor-pointer" title="Approve">
                        <i className="ri-check-line"></i>
                      </button>
                    )}
                    {run.status === 'approved' && (
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-400 hover:bg-blue-500/10 cursor-pointer" title="Export">
                        <i className="ri-download-2-line"></i>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setSelectedRun(null)}>
          <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{selectedRun.reference}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[selectedRun.status]}`}>{statusLabel(selectedRun.status)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <div><span className="text-gray-500">Period:</span> <span className="text-gray-300">{selectedRun.periodStart} — {selectedRun.periodEnd}</span></div>
              <div><span className="text-gray-500">Prepared:</span> <span className="text-gray-300">{selectedRun.preparedBy}</span></div>
              <div><span className="text-gray-500">Guards:</span> <span className="text-gray-300">{selectedRun.guardCount}</span></div>
              <div><span className="text-gray-500">Date:</span> <span className="text-gray-300">{selectedRun.date}</span></div>
            </div>
            <div className="border-t border-gray-700 pt-4">
              <h4 className="text-sm font-semibold text-white mb-3">Pay Lines (Sample)</h4>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-800">
                    <th className="text-left py-2">Guard</th>
                    <th className="text-left py-2">Category</th>
                    <th className="text-right py-2">Hours</th>
                    <th className="text-right py-2">Rate</th>
                    <th className="text-right py-2">Gross</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { guard: 'James Wilson', cat: 'Standard', hrs: 48, rate: '£14.50', gross: '£696.00' },
                    { guard: 'Sarah Khan', cat: 'Night', hrs: 36, rate: '£17.00', gross: '£612.00' },
                    { guard: 'Michael Chen', cat: 'Standard', hrs: 44, rate: '£14.50', gross: '£638.00' },
                    { guard: 'Amina Yusuf', cat: 'Standard', hrs: 48, rate: '£14.50', gross: '£696.00' },
                    { guard: 'Tom Briggs', cat: 'Overtime', hrs: 8, rate: '£21.75', gross: '£174.00' },
                  ].map((l, i) => (
                    <tr key={i} className="border-b border-gray-800/30 text-gray-300">
                      <td className="py-1.5">{l.guard}</td>
                      <td className="py-1.5">{l.cat}</td>
                      <td className="py-1.5 text-right font-mono">{l.hrs}</td>
                      <td className="py-1.5 text-right font-mono">{l.rate}</td>
                      <td className="py-1.5 text-right font-mono">{l.gross}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-3 mt-5">
              <button onClick={() => setSelectedRun(null)} className="flex-1 px-4 py-2 text-sm text-gray-400 border border-gray-700 rounded-lg hover:border-gray-600 cursor-pointer whitespace-nowrap">Close</button>
              {selectedRun.status === 'draft' && (
                <button className="flex-1 px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 cursor-pointer whitespace-nowrap">Approve Pay Run</button>
              )}
              {selectedRun.status === 'approved' && (
                <button className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-500 cursor-pointer whitespace-nowrap">Export CSV</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}