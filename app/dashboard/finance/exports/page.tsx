'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function FinanceExportsPage() {
  const [payrollMapping, setPayrollMapping] = useState({
    employeeRef: 'badge_number',
    payCode: 'rate_category',
    hours: 'payable_hours',
    rate: 'unit_rate',
    gross: 'gross_amount',
    costCentre: 'site_name',
    period: 'pay_period',
  });

  const exportHistory = [
    { type: 'Payroll CSV', ref: 'PR-2024-08-001', generated: '4 Aug 2024 14:32', by: 'Rachel Adams', checksum: 'a3f2c...' },
    { type: 'Payroll CSV', ref: 'PR-2024-07-005', generated: '31 Jul 2024 11:15', by: 'Rachel Adams', checksum: 'b7e1d...' },
    { type: 'Invoice PDF', ref: 'INV-2024-0801', generated: '4 Aug 2024 15:00', by: 'Rachel Adams', checksum: 'c9a4f...' },
    { type: 'Invoice PDF', ref: 'INV-2024-0802', generated: '4 Aug 2024 15:05', by: 'Rachel Adams', checksum: 'd2b8e...' },
    { type: 'Billing CSV', ref: 'BR-2024-08-001', generated: '4 Aug 2024 14:50', by: 'Rachel Adams', checksum: 'e5f1a...' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Finance Exports</h1>
          <p className="text-sm text-gray-400 mt-1">Payroll CSV and invoice PDF exports</p>
        </div>
        <Link href="/dashboard/finance" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white cursor-pointer whitespace-nowrap">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
          Finance Centre
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
          <h2 className="text-base font-semibold text-white mb-4">Payroll CSV Mapping</h2>
          <p className="text-xs text-gray-500 mb-4">Configure column mapping for your payroll/accounting system import</p>
          <div className="space-y-3">
            {Object.entries(payrollMapping).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white cursor-pointer flex items-center gap-2 min-w-[160px] justify-between">
                  {value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-down-s-line text-gray-500"></i></div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-5">
            <button className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-download-2-line"></i></div>
              Export Payroll CSV
            </button>
            <button className="flex items-center gap-2 bg-[#1a1f2e] border border-gray-700 text-gray-400 text-sm font-medium px-4 py-2 rounded-lg hover:border-gray-600 cursor-pointer whitespace-nowrap">
              <div className="w-4 h-4 flex items-center justify-center"><i className="ri-eye-line"></i></div>
              Preview
            </button>
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
          <h2 className="text-base font-semibold text-white mb-4">Invoice PDF Export</h2>
          <p className="text-xs text-gray-500 mb-4">Generate PDF invoices from approved billing runs</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Billing Run</label>
              <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white cursor-pointer flex items-center justify-between">
                Select billing run...
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-down-s-line text-gray-500"></i></div>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Template</label>
              <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white cursor-pointer flex items-center justify-between">
                Standard Invoice
                <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-down-s-line text-gray-500"></i></div>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap mt-4">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-file-pdf-line"></i></div>
            Generate Invoice PDF
          </button>
        </div>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-xl">
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="text-base font-semibold text-white">Export History</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-xs text-gray-500">
              <th className="text-left py-3 px-5 font-medium">Type</th>
              <th className="text-left py-3 px-5 font-medium">Reference</th>
              <th className="text-left py-3 px-5 font-medium">Generated</th>
              <th className="text-left py-3 px-5 font-medium">By</th>
              <th className="text-left py-3 px-5 font-medium">Checksum</th>
              <th className="text-right py-3 px-5 font-medium">Download</th>
            </tr>
          </thead>
          <tbody>
            {exportHistory.map((e, i) => (
              <tr key={i} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                <td className="py-3 px-5 text-gray-300">{e.type}</td>
                <td className="py-3 px-5 text-gray-400 font-mono text-xs">{e.ref}</td>
                <td className="py-3 px-5 text-gray-400">{e.generated}</td>
                <td className="py-3 px-5 text-gray-400">{e.by}</td>
                <td className="py-3 px-5 text-gray-500 font-mono text-xs">{e.checksum}</td>
                <td className="py-3 px-5 text-right">
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 cursor-pointer">
                    <i className="ri-download-2-line"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}