'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Invoice {
  id: string;
  number: string;
  client: string;
  period: string;
  issueDate: string;
  dueDate: string;
  netTotal: string;
  vatTotal: string;
  grossTotal: string;
  amountPaid: string;
  status: string;
}

const mockInvoices: Invoice[] = [
  { id: '1', number: 'INV-2024-0801', client: 'Securitas UK', period: '28 Jul - 3 Aug', issueDate: '4 Aug 2024', dueDate: '3 Sep 2024', netTotal: '£10,375.00', vatTotal: '£2,075.00', grossTotal: '£12,450.00', amountPaid: '£12,450.00', status: 'paid' },
  { id: '2', number: 'INV-2024-0802', client: 'G4S Facilities', period: '28 Jul - 3 Aug', issueDate: '4 Aug 2024', dueDate: '3 Sep 2024', netTotal: '£6,933.33', vatTotal: '£1,386.67', grossTotal: '£8,320.00', amountPaid: '£0.00', status: 'issued' },
  { id: '3', number: 'INV-2024-0803', client: 'Wilson James', period: '4 Aug - 10 Aug', issueDate: '—', dueDate: '—', netTotal: '£5,083.33', vatTotal: '£1,016.67', grossTotal: '£6,100.00', amountPaid: '£0.00', status: 'draft' },
  { id: '4', number: 'INV-2024-0703', client: 'Mitie Group', period: '14 Jul - 20 Jul', issueDate: '15 Jul 2024', dueDate: '14 Aug 2024', netTotal: '£4,666.67', vatTotal: '£933.33', grossTotal: '£5,600.00', amountPaid: '£0.00', status: 'overdue' },
  { id: '5', number: 'INV-2024-0701', client: 'CIS Security', period: '7 Jul - 13 Jul', issueDate: '8 Jul 2024', dueDate: '7 Aug 2024', netTotal: '£2,375.00', vatTotal: '£475.00', grossTotal: '£2,850.00', amountPaid: '£0.00', status: 'overdue' },
  { id: '6', number: 'INV-2024-0702', client: 'Securitas UK', period: '14 Jul - 20 Jul', issueDate: '21 Jul 2024', dueDate: '20 Aug 2024', netTotal: '£9,583.33', vatTotal: '£1,916.67', grossTotal: '£11,500.00', amountPaid: '£11,500.00', status: 'paid' },
];

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500/15 text-gray-400',
  needs_review: 'bg-amber-500/15 text-amber-400',
  approved: 'bg-blue-500/15 text-blue-400',
  issued: 'bg-indigo-500/15 text-indigo-400',
  viewed: 'bg-cyan-500/15 text-cyan-400',
  partially_paid: 'bg-yellow-500/15 text-yellow-400',
  paid: 'bg-emerald-500/15 text-emerald-400',
  overdue: 'bg-red-500/15 text-red-400',
  disputed: 'bg-orange-500/15 text-orange-400',
  void: 'bg-gray-600/20 text-gray-500',
};

export default function InvoicesPage() {
  const [filter, setFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const statusLabel = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const filtered = filter === 'all' ? mockInvoices : mockInvoices.filter((i) => i.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Client Invoices</h1>
          <p className="text-sm text-gray-400 mt-1">Manage operational client billing</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/finance" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white cursor-pointer whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
            Finance Centre
          </Link>
          <Link href="/dashboard/finance/billing-runs" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
            New Billing Run
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Invoiced', value: '£46,820.00', icon: 'ri-bill-line', color: 'text-blue-400' },
          { label: 'Outstanding', value: '£16,770.00', icon: 'ri-error-warning-line', color: 'text-red-400' },
          { label: 'Overdue', value: '£8,450.00', icon: 'ri-alert-line', color: 'text-orange-400' },
          { label: 'Paid This Month', value: '£23,950.00', icon: 'ri-check-double-line', color: 'text-emerald-400' },
          { label: 'Draft Invoices', value: '3', icon: 'ri-draft-line', color: 'text-gray-400' },
        ].map((c, i) => (
          <div key={i} className="bg-[#111827] border border-gray-800 rounded-xl p-4">
            <div className={`w-8 h-8 flex items-center justify-center rounded-lg bg-[#1a1f2e] ${c.color} mb-2`}>
              <i className={c.icon}></i>
            </div>
            <p className="text-xl font-bold text-white">{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {['all','draft','issued','paid','overdue','disputed'].map((f) => (
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
              <th className="text-left py-3 px-4 font-medium">Invoice #</th>
              <th className="text-left py-3 px-4 font-medium">Client</th>
              <th className="text-left py-3 px-4 font-medium">Period</th>
              <th className="text-left py-3 px-4 font-medium">Issue Date</th>
              <th className="text-left py-3 px-4 font-medium">Due Date</th>
              <th className="text-right py-3 px-4 font-medium">Net</th>
              <th className="text-right py-3 px-4 font-medium">VAT</th>
              <th className="text-right py-3 px-4 font-medium">Gross</th>
              <th className="text-right py-3 px-4 font-medium">Paid</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-right py-3 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => (
              <tr key={inv.id} className="border-b border-gray-800/50 hover:bg-white/[0.02] cursor-pointer" onClick={() => setSelectedInvoice(inv)}>
                <td className="py-3 px-4 text-gray-300 font-mono text-xs font-medium">{inv.number}</td>
                <td className="py-3 px-4 text-gray-300">{inv.client}</td>
                <td className="py-3 px-4 text-gray-400 text-xs">{inv.period}</td>
                <td className="py-3 px-4 text-gray-400">{inv.issueDate}</td>
                <td className="py-3 px-4 text-gray-400">{inv.dueDate}</td>
                <td className="py-3 px-4 text-right text-gray-300 font-mono">{inv.netTotal}</td>
                <td className="py-3 px-4 text-right text-gray-300 font-mono">{inv.vatTotal}</td>
                <td className="py-3 px-4 text-right text-white font-mono font-semibold">{inv.grossTotal}</td>
                <td className="py-3 px-4 text-right text-gray-400 font-mono">{inv.amountPaid}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[inv.status] || ''}`}>
                    {statusLabel(inv.status)}
                  </span>
                </td>
                <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 cursor-pointer" title="View">
                      <i className="ri-eye-line"></i>
                    </button>
                    {inv.status === 'draft' && (
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-400 hover:bg-blue-500/10 cursor-pointer" title="Issue">
                        <i className="ri-send-plane-line"></i>
                      </button>
                    )}
                    {inv.status === 'issued' && (
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg text-emerald-400 hover:bg-emerald-500/10 cursor-pointer" title="Record Payment">
                        <i className="ri-bank-card-line"></i>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setSelectedInvoice(null)}>
          <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">{selectedInvoice.number}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[selectedInvoice.status]}`}>{statusLabel(selectedInvoice.status)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <div><span className="text-gray-500">Client:</span> <span className="text-gray-300">{selectedInvoice.client}</span></div>
              <div><span className="text-gray-500">Period:</span> <span className="text-gray-300">{selectedInvoice.period}</span></div>
              <div><span className="text-gray-500">Issued:</span> <span className="text-gray-300">{selectedInvoice.issueDate}</span></div>
              <div><span className="text-gray-500">Due:</span> <span className="text-gray-300">{selectedInvoice.dueDate}</span></div>
            </div>
            <div className="border-t border-gray-700 pt-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Net Total</span><span className="text-gray-300 font-mono">{selectedInvoice.netTotal}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">VAT (20%)</span><span className="text-gray-300 font-mono">{selectedInvoice.vatTotal}</span></div>
              <div className="flex justify-between text-sm font-semibold border-t border-gray-700 pt-2"><span className="text-white">Gross Total</span><span className="text-white font-mono">{selectedInvoice.grossTotal}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Amount Paid</span><span className="text-emerald-400 font-mono">{selectedInvoice.amountPaid}</span></div>
              <div className="flex justify-between text-sm font-semibold border-t border-gray-700 pt-2">
                <span className="text-white">Balance Due</span>
                <span className={`font-mono ${selectedInvoice.status === 'overdue' ? 'text-red-400' : 'text-white'}`}>
                  £{(parseFloat(selectedInvoice.grossTotal.replace(/[£,]/g, '')) - parseFloat(selectedInvoice.amountPaid.replace(/[£,]/g, ''))).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-5">
              <button onClick={() => setSelectedInvoice(null)} className="flex-1 px-4 py-2 text-sm text-gray-400 border border-gray-700 rounded-lg hover:border-gray-600 cursor-pointer whitespace-nowrap">Close</button>
              {selectedInvoice.status === 'issued' && (
                <button className="flex-1 px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 cursor-pointer whitespace-nowrap">Record Payment</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}