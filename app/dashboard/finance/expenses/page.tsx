'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Expense {
  id: string;
  guard: string;
  category: string;
  date: string;
  description: string;
  amount: string;
  site: string;
  status: string;
}

const mockExpenses: Expense[] = [
  { id: '1', guard: 'James Wilson', category: 'mileage', date: '3 Aug 2024', description: 'Travel to Canary Wharf - 45 miles', amount: '£20.25', site: 'Canary Wharf Tower', status: 'submitted' },
  { id: '2', guard: 'Sarah Khan', category: 'parking', date: '4 Aug 2024', description: 'Overnight parking at Canary Wharf', amount: '£12.00', site: 'Canary Wharf Tower', status: 'approved' },
  { id: '3', guard: 'Michael Chen', category: 'public_transport', date: '2 Aug 2024', description: 'Train to Westfield - zone 1-3 return', amount: '£8.40', site: 'Westfield Shopping', status: 'approved' },
  { id: '4', guard: 'Amina Yusuf', category: 'meal', date: '5 Aug 2024', description: 'Evening meal - 12hr shift', amount: '£15.00', site: 'Heathrow Logistics', status: 'submitted' },
  { id: '5', guard: 'Tom Briggs', category: 'equipment', date: '1 Aug 2024', description: 'Replacement torch battery', amount: '£6.50', site: 'Heathrow Logistics', status: 'rejected' },
  { id: '6', guard: 'Lucy Osei', category: 'mileage', date: '4 Aug 2024', description: 'Site to site - 22 miles', amount: '£9.90', site: 'Westfield Shopping', status: 'paid' },
];

const categoryIcons: Record<string, string> = {
  mileage: 'ri-car-line',
  parking: 'ri-parking-box-line',
  public_transport: 'ri-train-line',
  accommodation: 'ri-hotel-line',
  meal: 'ri-restaurant-line',
  equipment: 'ri-tools-line',
  other: 'ri-more-line',
};

const statusColors: Record<string, string> = {
  submitted: 'bg-amber-500/15 text-amber-400',
  under_review: 'bg-blue-500/15 text-blue-400',
  approved: 'bg-emerald-500/15 text-emerald-400',
  rejected: 'bg-red-500/15 text-red-400',
  paid: 'bg-green-500/15 text-green-400',
};

export default function ExpensesPage() {
  const [filter, setFilter] = useState('all');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const statusLabel = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const categoryLabel = (c: string) => c.replace(/_/g, ' ').replace(/\b\w/g, (w) => w.toUpperCase());

  const filtered = filter === 'all' ? mockExpenses : mockExpenses.filter((e) => e.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Guard Expenses</h1>
          <p className="text-sm text-gray-400 mt-1">Review and approve guard expense claims</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/finance" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white cursor-pointer whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
            Finance Centre
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {['all','submitted','under_review','approved','rejected','paid'].map((f) => (
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
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-xs text-gray-500">
              <th className="text-left py-3 px-4 font-medium">Guard</th>
              <th className="text-left py-3 px-4 font-medium">Category</th>
              <th className="text-left py-3 px-4 font-medium">Date</th>
              <th className="text-left py-3 px-4 font-medium">Description</th>
              <th className="text-left py-3 px-4 font-medium">Site</th>
              <th className="text-right py-3 px-4 font-medium">Amount</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-right py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((exp) => (
              <tr key={exp.id} className="border-b border-gray-800/50 hover:bg-white/[0.02] cursor-pointer" onClick={() => setSelectedExpense(exp)}>
                <td className="py-3 px-4 text-gray-300">{exp.guard}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <div className="w-4 h-4 flex items-center justify-center"><i className={categoryIcons[exp.category] || 'ri-more-line'}></i></div>
                    {categoryLabel(exp.category)}
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-400">{exp.date}</td>
                <td className="py-3 px-4 text-gray-300 max-w-xs truncate">{exp.description}</td>
                <td className="py-3 px-4 text-gray-400">{exp.site}</td>
                <td className="py-3 px-4 text-right text-gray-300 font-mono">{exp.amount}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[exp.status] || ''}`}>{statusLabel(exp.status)}</span>
                </td>
                <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    {exp.status === 'submitted' && (
                      <>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-emerald-400 hover:bg-emerald-500/10 cursor-pointer" title="Approve">
                          <i className="ri-check-line"></i>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-500/10 cursor-pointer" title="Reject">
                          <i className="ri-close-line"></i>
                        </button>
                      </>
                    )}
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 cursor-pointer" title="View Receipt">
                      <i className="ri-file-text-line"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setSelectedExpense(null)}>
          <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Expense Detail</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Guard</span><span className="text-gray-300">{selectedExpense.guard}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="text-gray-300">{categoryLabel(selectedExpense.category)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="text-gray-300">{selectedExpense.date}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Site</span><span className="text-gray-300">{selectedExpense.site}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="text-white font-mono font-semibold">{selectedExpense.amount}</span></div>
              <div>
                <span className="text-gray-500 block mb-1">Description</span>
                <p className="text-gray-300 bg-[#1a1f2e] p-3 rounded-lg">{selectedExpense.description}</p>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Receipt</span>
                <div className="bg-[#1a1f2e] border border-dashed border-gray-700 rounded-lg p-4 text-center">
                  <div className="w-10 h-10 mx-auto flex items-center justify-center text-gray-600 mb-2"><i className="ri-image-line text-2xl"></i></div>
                  <p className="text-xs text-gray-500">receipt_20240803_001.jpg</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-5">
              <button onClick={() => setSelectedExpense(null)} className="flex-1 px-4 py-2 text-sm text-gray-400 border border-gray-700 rounded-lg hover:border-gray-600 cursor-pointer whitespace-nowrap">Close</button>
              {selectedExpense.status === 'submitted' && (
                <>
                  <button className="flex-1 px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 cursor-pointer whitespace-nowrap">Approve</button>
                  <button className="px-4 py-2 text-sm bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg hover:bg-red-600/30 cursor-pointer whitespace-nowrap">Reject</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}