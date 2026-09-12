'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Dispute {
  id: string;
  type: 'pay' | 'invoice';
  ref: string;
  raisedBy: string;
  against: string;
  description: string;
  amount: string;
  status: string;
  date: string;
  assignedTo: string;
}

const mockDisputes: Dispute[] = [
  { id: '1', type: 'pay', ref: 'WR-2024-0804', raisedBy: 'Amina Yusuf', against: 'WR-2024-0804', description: 'Shift was 12 hours not 11.5 — clocked out late due to handover', amount: '£7.25', status: 'open', date: '6 Aug 2024', assignedTo: 'Rachel Adams' },
  { id: '2', type: 'invoice', ref: 'INV-2024-0703', raisedBy: 'Mitie Group', against: 'INV-2024-0703', description: 'Bank holiday rate should not apply — site was closed', amount: '£480.00', status: 'under_review', date: '18 Jul 2024', assignedTo: 'Mark Stevens' },
  { id: '3', type: 'pay', ref: 'WR-2024-0731', raisedBy: 'Tom Briggs', against: 'WR-2024-0731', description: 'Missing night premium for 31 July shift', amount: '£20.00', status: 'resolved', date: '2 Aug 2024', assignedTo: 'Rachel Adams' },
  { id: '4', type: 'invoice', ref: 'INV-2024-0701', raisedBy: 'CIS Security', against: 'INV-2024-0701', description: 'Incorrect site rate applied for Manchester DC', amount: '£150.00', status: 'open', date: '10 Jul 2024', assignedTo: 'Mark Stevens' },
];

export default function DisputesPage() {
  const [tab, setTab] = useState<'all' | 'pay' | 'invoice'>('all');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);

  const statusColors: Record<string, string> = {
    open: 'bg-amber-500/15 text-amber-400',
    under_review: 'bg-blue-500/15 text-blue-400',
    resolved: 'bg-emerald-500/15 text-emerald-400',
    resolved_accepted: 'bg-emerald-500/15 text-emerald-400',
    resolved_adjusted: 'bg-purple-500/15 text-purple-400',
    dismissed: 'bg-gray-500/15 text-gray-400',
  };

  const statusLabel = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const filtered = tab === 'all' ? mockDisputes : mockDisputes.filter((d) => d.type === tab);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Disputes</h1>
          <p className="text-sm text-gray-400 mt-1">Manage pay and invoice disputes</p>
        </div>
        <Link href="/dashboard/finance" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white cursor-pointer whitespace-nowrap">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
          Finance Centre
        </Link>
      </div>

      <div className="flex bg-[#111827] border border-gray-700 rounded-lg p-1 w-fit">
        {(['all','pay','invoice'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${tab === t ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            {t === 'all' ? 'All' : t === 'pay' ? 'Pay Disputes' : 'Invoice Disputes'}
          </button>
        ))}
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-xs text-gray-500">
              <th className="text-left py-3 px-4 font-medium">Type</th>
              <th className="text-left py-3 px-4 font-medium">Raised By</th>
              <th className="text-left py-3 px-4 font-medium">Reference</th>
              <th className="text-left py-3 px-4 font-medium">Description</th>
              <th className="text-right py-3 px-4 font-medium">Amount</th>
              <th className="text-left py-3 px-4 font-medium">Assigned</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-right py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="border-b border-gray-800/50 hover:bg-white/[0.02] cursor-pointer" onClick={() => setSelectedDispute(d)}>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${d.type === 'pay' ? 'bg-purple-500/15 text-purple-400' : 'bg-blue-500/15 text-blue-400'}`}>
                    {d.type === 'pay' ? 'Pay' : 'Invoice'}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-300">{d.raisedBy}</td>
                <td className="py-3 px-4 text-gray-400 font-mono text-xs">{d.ref}</td>
                <td className="py-3 px-4 text-gray-300 max-w-xs truncate">{d.description}</td>
                <td className="py-3 px-4 text-right text-gray-300 font-mono">{d.amount}</td>
                <td className="py-3 px-4 text-gray-400">{d.assignedTo}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[d.status] || ''}`}>{statusLabel(d.status)}</span>
                </td>
                <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 cursor-pointer">
                    <i className="ri-eye-line"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setSelectedDispute(null)}>
          <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Dispute: {selectedDispute.ref}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[selectedDispute.status]}`}>{statusLabel(selectedDispute.status)}</span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="text-gray-300">{selectedDispute.type === 'pay' ? 'Pay Dispute' : 'Invoice Dispute'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Raised By</span><span className="text-gray-300">{selectedDispute.raisedBy}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Against</span><span className="text-gray-300 font-mono text-xs">{selectedDispute.against}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Disputed Amount</span><span className="text-white font-mono font-semibold">{selectedDispute.amount}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Assigned To</span><span className="text-gray-300">{selectedDispute.assignedTo}</span></div>
              <div><span className="text-gray-500 block mb-1">Description</span><p className="text-gray-300 bg-[#1a1f2e] p-3 rounded-lg">{selectedDispute.description}</p></div>
              <div>
                <span className="text-gray-500 block mb-1">Internal Notes</span>
                <textarea className="w-full bg-[#1a1f2e] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none resize-none h-20" placeholder="Add internal notes..." maxLength={500} />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-5">
              <button onClick={() => setSelectedDispute(null)} className="px-4 py-2 text-sm text-gray-400 border border-gray-700 rounded-lg hover:border-gray-600 cursor-pointer whitespace-nowrap">Close</button>
              <button className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 cursor-pointer whitespace-nowrap">Resolve</button>
              <button className="px-4 py-2 text-sm bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 cursor-pointer whitespace-nowrap">Dismiss</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}