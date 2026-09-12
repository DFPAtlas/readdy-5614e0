'use client';

import { useState } from 'react';
import Link from 'next/link';

interface ClientInvoice {
  id: string;
  number: string;
  period: string;
  issueDate: string;
  dueDate: string;
  status: string;
  netTotal: string;
  vatTotal: string;
  grossTotal: string;
  amountPaid: string;
}

const mockClientInvoices: ClientInvoice[] = [
  { id: '1', number: 'INV-2024-0801', period: '28 Jul - 3 Aug 2024', issueDate: '4 Aug 2024', dueDate: '3 Sep 2024', status: 'paid', netTotal: '£10,375.00', vatTotal: '£2,075.00', grossTotal: '£12,450.00', amountPaid: '£12,450.00' },
  { id: '2', number: 'INV-2024-0702', period: '14 Jul - 20 Jul 2024', issueDate: '21 Jul 2024', dueDate: '20 Aug 2024', status: 'paid', netTotal: '£9,583.33', vatTotal: '£1,916.67', grossTotal: '£11,500.00', amountPaid: '£11,500.00' },
  { id: '3', number: 'INV-2024-0704', period: '21 Jul - 27 Jul 2024', issueDate: '28 Jul 2024', dueDate: '27 Aug 2024', status: 'issued', netTotal: '£8,450.00', vatTotal: '£1,690.00', grossTotal: '£10,140.00', amountPaid: '£0.00' },
  { id: '4', number: 'INV-2024-0603', period: '14 Jun - 20 Jun 2024', issueDate: '21 Jun 2024', dueDate: '21 Jul 2024', status: 'overdue', netTotal: '£6,200.00', vatTotal: '£1,240.00', grossTotal: '£7,440.00', amountPaid: '£0.00' },
];

const statusColors: Record<string, string> = {
  issued: 'bg-blue-500/15 text-blue-400',
  paid: 'bg-emerald-500/15 text-emerald-400',
  overdue: 'bg-red-500/15 text-red-400',
};

export default function ClientInvoicesPage() {
  const [selectedInvoice, setSelectedInvoice] = useState<ClientInvoice | null>(null);

  const statusLabel = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="min-h-screen bg-[#0b0f19]">
      <header className="bg-[#111827] border-b border-gray-800 px-4 py-3 flex items-center">
        <Link href="/client" className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer mr-3">
          <i className="ri-arrow-left-line"></i>
        </Link>
        <h1 className="text-lg font-semibold text-white">Invoices</h1>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-500">
                <th className="text-left py-3 px-4 font-medium">Invoice</th>
                <th className="text-left py-3 px-4 font-medium">Period</th>
                <th className="text-left py-3 px-4 font-medium">Issued</th>
                <th className="text-left py-3 px-4 font-medium">Due</th>
                <th className="text-right py-3 px-4 font-medium">Amount</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockClientInvoices.map((inv) => (
                <tr key={inv.id} className="border-b border-gray-800/50 hover:bg-white/[0.02] cursor-pointer" onClick={() => setSelectedInvoice(inv)}>
                  <td className="py-3 px-4 text-gray-300 font-mono text-xs font-medium">{inv.number}</td>
                  <td className="py-3 px-4 text-gray-400 text-xs">{inv.period}</td>
                  <td className="py-3 px-4 text-gray-400">{inv.issueDate}</td>
                  <td className="py-3 px-4 text-gray-400">{inv.dueDate}</td>
                  <td className="py-3 px-4 text-right text-white font-mono font-semibold">{inv.grossTotal}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[inv.status] || ''}`}>{statusLabel(inv.status)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setSelectedInvoice(null)}>
            <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">{selectedInvoice.number}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[selectedInvoice.status]}`}>{statusLabel(selectedInvoice.status)}</span>
              </div>
              <div className="space-y-3 text-sm border-t border-gray-700 pt-4">
                <div className="flex justify-between"><span className="text-gray-500">Period</span><span className="text-gray-300">{selectedInvoice.period}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Issue Date</span><span className="text-gray-300">{selectedInvoice.issueDate}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Due Date</span><span className="text-gray-300">{selectedInvoice.dueDate}</span></div>
                <div className="border-t border-gray-700 pt-3 space-y-2">
                  <div className="flex justify-between"><span className="text-gray-400">Net</span><span className="text-gray-300 font-mono">{selectedInvoice.netTotal}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">VAT</span><span className="text-gray-300 font-mono">{selectedInvoice.vatTotal}</span></div>
                  <div className="flex justify-between font-semibold"><span className="text-white">Total</span><span className="text-white font-mono">{selectedInvoice.grossTotal}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Paid</span><span className="text-emerald-400 font-mono">{selectedInvoice.amountPaid}</span></div>
                  <div className="flex justify-between font-semibold border-t border-gray-700 pt-2">
                    <span className="text-white">Balance</span>
                    <span className={`font-mono ${selectedInvoice.status === 'overdue' ? 'text-red-400' : 'text-white'}`}>
                      £{(parseFloat(selectedInvoice.grossTotal.replace(/[£,]/g, '')) - parseFloat(selectedInvoice.amountPaid.replace(/[£,]/g, ''))).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-5">
                <button onClick={() => setSelectedInvoice(null)} className="flex-1 px-4 py-2 text-sm text-gray-400 border border-gray-700 rounded-lg hover:border-gray-600 cursor-pointer whitespace-nowrap">Close</button>
                <button className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-500 cursor-pointer whitespace-nowrap">
                  <div className="w-4 h-4 flex items-center justify-center mr-1.5 inline"><i className="ri-download-2-line"></i></div>
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}