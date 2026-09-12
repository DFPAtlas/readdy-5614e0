'use client';

import { useState } from 'react';
import Link from 'next/link';

interface WorkRecord {
  id: string;
  guard: string;
  site: string;
  client: string;
  date: string;
  scheduled: string;
  actual: string;
  payableHours: number;
  billableHours: number;
  rateCategory: string;
  status: string;
}

const mockRecords: WorkRecord[] = [
  { id: '1', guard: 'James Wilson', site: 'Canary Wharf Tower', client: 'Securitas UK', date: '5 Aug 2024', scheduled: '08:00-20:00', actual: '07:55-20:03', payableHours: 12, billableHours: 12, rateCategory: 'Standard', status: 'approved' },
  { id: '2', guard: 'Sarah Khan', site: 'Canary Wharf Tower', client: 'Securitas UK', date: '5 Aug 2024', scheduled: '20:00-08:00', actual: '19:58-08:05', payableHours: 12, billableHours: 12, rateCategory: 'Night', status: 'needs_review' },
  { id: '3', guard: 'Michael Chen', site: 'Westfield Shopping', client: 'G4S Facilities', date: '5 Aug 2024', scheduled: '06:00-18:00', actual: '06:12-17:48', payableHours: 11.5, billableHours: 11.5, rateCategory: 'Standard', status: 'approved' },
  { id: '4', guard: 'Amina Yusuf', site: 'Heathrow Logistics', client: 'Mitie Group', date: '5 Aug 2024', scheduled: '08:00-20:00', actual: '08:00-19:55', payableHours: 12, billableHours: 12, rateCategory: 'Standard', status: 'disputed' },
  { id: '5', guard: 'David Park', site: 'Manchester DC', client: 'Wilson James', date: '4 Aug 2024', scheduled: '08:00-20:00', actual: '—', payableHours: 0, billableHours: 0, rateCategory: 'Standard', status: 'draft' },
  { id: '6', guard: 'Lucy Osei', site: 'Westfield Shopping', client: 'G4S Facilities', date: '4 Aug 2024', scheduled: '20:00-08:00', actual: '20:02-07:58', payableHours: 12, billableHours: 12, rateCategory: 'Night', status: 'approved' },
  { id: '7', guard: 'Tom Briggs', site: 'Heathrow Logistics', client: 'Mitie Group', date: '4 Aug 2024', scheduled: '06:00-18:00', actual: '05:55-18:10', payableHours: 12, billableHours: 12, rateCategory: 'Overtime', status: 'needs_review' },
  { id: '8', guard: 'Emily Ross', site: 'Canary Wharf Tower', client: 'Securitas UK', date: '3 Aug 2024', scheduled: '08:00-20:00', actual: '08:05-19:50', payableHours: 11.75, billableHours: 11.75, rateCategory: 'Weekend', status: 'locked' },
];

export default function TimesheetReviewPage() {
  const [filter, setFilter] = useState('all');
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [correctionRecord, setCorrectionRecord] = useState<WorkRecord | null>(null);

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      draft: 'bg-gray-500/15 text-gray-400',
      needs_review: 'bg-amber-500/15 text-amber-400',
      disputed: 'bg-red-500/15 text-red-400',
      approved: 'bg-emerald-500/15 text-emerald-400',
      locked: 'bg-blue-500/15 text-blue-400',
    };
    return map[s] || 'bg-gray-500/15 text-gray-400';
  };

  const statusLabel = (s: string) => s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const filtered = filter === 'all' ? mockRecords : mockRecords.filter((r) => r.status === filter);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedRecords);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedRecords(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Timesheet Review</h1>
          <p className="text-sm text-gray-400 mt-1">Review and approve guard work records</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/finance" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white cursor-pointer whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
            Finance Centre
          </Link>
          <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap" disabled={selectedRecords.size === 0}>
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-check-double-line"></i></div>
            Approve Selected
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {['all','needs_review','approved','disputed','draft','locked'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              filter === f ? 'bg-blue-600 text-white' : 'bg-[#111827] text-gray-400 border border-gray-700 hover:border-gray-600'
            }`}
          >
            {f === 'all' ? 'All' : statusLabel(f)}
          </button>
        ))}
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-500">
                <th className="text-left py-3 px-4 w-10">
                  <input type="checkbox" className="rounded border-gray-600 cursor-pointer" onChange={(e) => {
                    setSelectedRecords(e.target.checked ? new Set(filtered.map((r) => r.id)) : new Set());
                  }} />
                </th>
                <th className="text-left py-3 px-4 font-medium">Guard</th>
                <th className="text-left py-3 px-4 font-medium">Site / Client</th>
                <th className="text-left py-3 px-4 font-medium">Date</th>
                <th className="text-left py-3 px-4 font-medium">Scheduled</th>
                <th className="text-left py-3 px-4 font-medium">Actual</th>
                <th className="text-right py-3 px-4 font-medium">Pay Hrs</th>
                <th className="text-right py-3 px-4 font-medium">Bill Hrs</th>
                <th className="text-left py-3 px-4 font-medium">Rate</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                  <td className="py-2.5 px-4">
                    <input type="checkbox" checked={selectedRecords.has(r.id)} onChange={() => toggleSelect(r.id)} className="rounded border-gray-600 cursor-pointer" />
                  </td>
                  <td className="py-2.5 px-4 text-gray-300">{r.guard}</td>
                  <td className="py-2.5 px-4">
                    <p className="text-gray-300">{r.site}</p>
                    <p className="text-xs text-gray-600">{r.client}</p>
                  </td>
                  <td className="py-2.5 px-4 text-gray-400">{r.date}</td>
                  <td className="py-2.5 px-4 text-gray-400 font-mono text-xs">{r.scheduled}</td>
                  <td className="py-2.5 px-4 text-gray-300 font-mono text-xs">{r.actual}</td>
                  <td className="py-2.5 px-4 text-right text-gray-300 font-mono">{r.payableHours}</td>
                  <td className="py-2.5 px-4 text-right text-gray-300 font-mono">{r.billableHours}</td>
                  <td className="py-2.5 px-4 text-gray-400">{r.rateCategory}</td>
                  <td className="py-2.5 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(r.status)}`}>{statusLabel(r.status)}</span>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setCorrectionRecord(r); setShowCorrectionModal(true); }} className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 cursor-pointer" title="Correct">
                        <i className="ri-edit-line"></i>
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-emerald-400 hover:bg-gray-800 cursor-pointer" title="Approve">
                        <i className="ri-check-line"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCorrectionModal && correctionRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowCorrectionModal(false)}>
          <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Correct Timesheet</h3>
            <p className="text-sm text-gray-400 mb-4">{correctionRecord.guard} — {correctionRecord.date}</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Field</label>
                <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white cursor-pointer flex items-center justify-between">
                  Payable Hours
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-down-s-line text-gray-500"></i></div>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Original Value</label>
                <input type="text" className="w-full bg-[#1a1f2e] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-400" value={correctionRecord.payableHours.toString()} disabled />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">New Value</label>
                <input type="number" step="0.25" className="w-full bg-[#1a1f2e] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none" placeholder="Enter hours" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Reason</label>
                <textarea className="w-full bg-[#1a1f2e] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none resize-none h-20" placeholder="Explain the correction..." maxLength={500} />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-5">
              <button onClick={() => setShowCorrectionModal(false)} className="flex-1 px-4 py-2 text-sm text-gray-400 border border-gray-700 rounded-lg hover:border-gray-600 cursor-pointer whitespace-nowrap">Cancel</button>
              <button className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-500 cursor-pointer whitespace-nowrap">Submit Correction</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}