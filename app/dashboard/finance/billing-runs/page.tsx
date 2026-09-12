'use client';

import { useState } from 'react';
import Link from 'next/link';

interface BillingRun {
  id: string;
  reference: string;
  client: string;
  period: string;
  netTotal: string;
  vatTotal: string;
  grossTotal: string;
  status: string;
  preparedBy: string;
  date: string;
}

const mockRuns: BillingRun[] = [
  { id: '1', reference: 'BR-2024-08-001', client: 'Securitas UK', period: '28 Jul - 3 Aug', netTotal: '£10,375.00', vatTotal: '£2,075.00', grossTotal: '£12,450.00', status: 'issued', preparedBy: 'Rachel Adams', date: '4 Aug 2024' },
  { id: '2', reference: 'BR-2024-08-002', client: 'G4S Facilities', period: '28 Jul - 3 Aug', netTotal: '£6,933.33', vatTotal: '£1,386.67', grossTotal: '£8,320.00', status: 'approved', preparedBy: 'Rachel Adams', date: '4 Aug 2024' },
  { id: '3', reference: 'BR-2024-08-003', client: 'Mitie Group', period: '4 Aug - 10 Aug', netTotal: '£8,200.00', vatTotal: '£1,640.00', grossTotal: '£9,840.00', status: 'draft', preparedBy: 'Rachel Adams', date: '—' },
  { id: '4', reference: 'BR-2024-08-004', client: 'Wilson James', period: '4 Aug - 10 Aug', netTotal: '£5,083.33', vatTotal: '£1,016.67', grossTotal: '£6,100.00', status: 'needs_review', preparedBy: 'Mark Stevens', date: '—' },
];

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500/15 text-gray-400',
  needs_review: 'bg-amber-500/15 text-amber-400',
  approved: 'bg-blue-500/15 text-blue-400',
  issued: 'bg-emerald-500/15 text-emerald-400',
};

export default function BillingRunsPage() {
  const [selectedRun, setSelectedRun] = useState<BillingRun | null>(null);

  const statusLabel = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const getBillableLines = () => [
    { site: 'Canary Wharf Tower', service: 'Day Cover', hrs: 84, rate: '£27.50', net: '£2,310.00', vat: '£462.00', total: '£2,772.00' },
    { site: 'Canary Wharf Tower', service: 'Night Cover', hrs: 84, rate: '£30.00', net: '£2,520.00', vat: '£504.00', total: '£3,024.00' },
    { site: 'Canary Wharf Tower', service: 'Weekend Cover', hrs: 48, rate: '£32.00', net: '£1,536.00', vat: '£307.20', total: '£1,843.20' },
    { site: 'Canary Wharf Tower', service: 'Keyholding', flat: true, rate: '£150.00', net: '£150.00', vat: '£30.00', total: '£180.00' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Billing Runs</h1>
          <p className="text-sm text-gray-400 mt-1">Prepare and approve client billing runs</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/finance" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white cursor-pointer whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
            Finance Centre
          </Link>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
            New Billing Run
          </button>
        </div>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-xs text-gray-500">
              <th className="text-left py-3 px-4 font-medium">Reference</th>
              <th className="text-left py-3 px-4 font-medium">Client</th>
              <th className="text-left py-3 px-4 font-medium">Period</th>
              <th className="text-right py-3 px-4 font-medium">Net</th>
              <th className="text-right py-3 px-4 font-medium">VAT</th>
              <th className="text-right py-3 px-4 font-medium">Gross</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-left py-3 px-4 font-medium">Prepared</th>
              <th className="text-right py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockRuns.map((run) => (
              <tr key={run.id} className="border-b border-gray-800/50 hover:bg-white/[0.02] cursor-pointer" onClick={() => setSelectedRun(run)}>
                <td className="py-3 px-4 text-gray-300 font-mono text-xs font-medium">{run.reference}</td>
                <td className="py-3 px-4 text-gray-300">{run.client}</td>
                <td className="py-3 px-4 text-gray-400">{run.period}</td>
                <td className="py-3 px-4 text-right text-gray-300 font-mono">{run.netTotal}</td>
                <td className="py-3 px-4 text-right text-gray-300 font-mono">{run.vatTotal}</td>
                <td className="py-3 px-4 text-right text-white font-mono font-semibold">{run.grossTotal}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[run.status] || ''}`}>{statusLabel(run.status)}</span>
                </td>
                <td className="py-3 px-4 text-gray-500">{run.preparedBy}</td>
                <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 cursor-pointer"><i className="ri-eye-line"></i></button>
                    {run.status === 'draft' && (
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-400 hover:bg-blue-500/10 cursor-pointer"><i className="ri-check-line"></i></button>
                    )}
                    {run.status === 'approved' && (
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"><i className="ri-send-plane-line"></i></button>
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
              <h3 className="text-lg font-semibold text-white">{selectedRun.reference} — {selectedRun.client}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[selectedRun.status]}`}>{statusLabel(selectedRun.status)}</span>
            </div>
            <div className="border-t border-gray-700 pt-4">
              <h4 className="text-sm font-semibold text-white mb-3">Billing Lines</h4>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-800">
                    <th className="text-left py-2">Site</th>
                    <th className="text-left py-2">Service</th>
                    <th className="text-right py-2">Qty</th>
                    <th className="text-right py-2">Rate</th>
                    <th className="text-right py-2">Net</th>
                    <th className="text-right py-2">VAT</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {getBillableLines().map((l, i) => (
                    <tr key={i} className="border-b border-gray-800/30 text-gray-300">
                      <td className="py-1.5">{l.site}</td>
                      <td className="py-1.5">{l.service}</td>
                      <td className="py-1.5 text-right font-mono">{l.flat ? '—' : l.hrs + ' hrs'}</td>
                      <td className="py-1.5 text-right font-mono">{l.rate}</td>
                      <td className="py-1.5 text-right font-mono">{l.net}</td>
                      <td className="py-1.5 text-right font-mono">{l.vat}</td>
                      <td className="py-1.5 text-right font-mono text-white">{l.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end gap-3 mt-4 text-sm border-t border-gray-700 pt-3">
              <span className="text-gray-400">Net: <span className="text-gray-300 font-mono">{selectedRun.netTotal}</span></span>
              <span className="text-gray-400">VAT: <span className="text-gray-300 font-mono">{selectedRun.vatTotal}</span></span>
              <span className="text-white font-semibold">Gross: <span className="font-mono">{selectedRun.grossTotal}</span></span>
            </div>
            <div className="flex items-center gap-3 mt-5">
              <button onClick={() => setSelectedRun(null)} className="flex-1 px-4 py-2 text-sm text-gray-400 border border-gray-700 rounded-lg hover:border-gray-600 cursor-pointer whitespace-nowrap">Close</button>
              {selectedRun.status === 'draft' && (
                <button className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-500 cursor-pointer whitespace-nowrap">Submit for Review</button>
              )}
              {selectedRun.status === 'approved' && (
                <button className="flex-1 px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 cursor-pointer whitespace-nowrap">Generate Invoice</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}