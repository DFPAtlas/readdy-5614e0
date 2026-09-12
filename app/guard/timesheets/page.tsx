'use client';

import { useState } from 'react';
import Link from 'next/link';

interface TimesheetEntry {
  id: string;
  date: string;
  site: string;
  scheduled: string;
  actual: string;
  payableHours: number;
  rateCategory: string;
  rate: string;
  grossPay: string;
  status: string;
}

const mockTimesheets: TimesheetEntry[] = [
  { id: '1', date: '5 Aug 2024', site: 'Canary Wharf Tower', scheduled: '08:00-20:00', actual: '07:55-20:03', payableHours: 12, rateCategory: 'Standard', rate: '£14.50', grossPay: '£174.00', status: 'approved' },
  { id: '2', date: '4 Aug 2024', site: 'Canary Wharf Tower', scheduled: '08:00-20:00', actual: '08:00-19:55', payableHours: 11.92, rateCategory: 'Standard', rate: '£14.50', grossPay: '£172.84', status: 'approved' },
  { id: '3', date: '3 Aug 2024', site: 'Canary Wharf Tower', scheduled: '08:00-20:00', actual: '08:05-19:50', payableHours: 11.75, rateCategory: 'Weekend', rate: '£18.50', grossPay: '£217.38', status: 'included' },
  { id: '4', date: '2 Aug 2024', site: 'Canary Wharf Tower', scheduled: '08:00-20:00', actual: '07:58-20:10', payableHours: 12, rateCategory: 'Standard', rate: '£14.50', grossPay: '£174.00', status: 'included' },
  { id: '5', date: '1 Aug 2024', site: 'Canary Wharf Tower', scheduled: '08:00-20:00', actual: '08:02-19:48', payableHours: 11.77, rateCategory: 'Standard', rate: '£14.50', grossPay: '£170.67', status: 'included' },
  { id: '6', date: '31 Jul 2024', site: 'Canary Wharf Tower', scheduled: '08:00-20:00', actual: '08:00-19:55', payableHours: 12, rateCategory: 'Standard', rate: '£14.50', grossPay: '£174.00', status: 'paid' },
];

export default function GuardTimesheetPage() {
  const [period, setPeriod] = useState('current');

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-500/15 text-gray-400',
    needs_review: 'bg-amber-500/15 text-amber-400',
    disputed: 'bg-red-500/15 text-red-400',
    approved: 'bg-emerald-500/15 text-emerald-400',
    included: 'bg-blue-500/15 text-blue-400',
    paid: 'bg-green-500/15 text-green-400',
  };

  const statusLabel = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const totalHours = mockTimesheets.reduce((sum, t) => sum + t.payableHours, 0);
  const totalGross = mockTimesheets.reduce((sum, t) => sum + parseFloat(t.grossPay.replace('£', '')), 0);

  return (
    <div className="min-h-screen bg-[#0b0f19]">
      <header className="bg-[#111827] border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/guard" className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer">
            <i className="ri-arrow-left-line"></i>
          </Link>
          <h1 className="text-lg font-semibold text-white">My Timesheets</h1>
        </div>
        <div className="flex bg-[#1a1f2e] border border-gray-700 rounded-lg p-1">
          {['current','last','previous'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                period === p ? 'bg-blue-600 text-white' : 'text-gray-400'
              }`}
            >
              {p === 'current' ? 'This Week' : p === 'last' ? 'Last Week' : 'Previous'}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500">Total Hours</p>
            <p className="text-xl font-bold text-white">{totalHours.toFixed(1)}</p>
          </div>
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500">Estimated Gross</p>
            <p className="text-xl font-bold text-emerald-400">£{totalGross.toFixed(2)}</p>
          </div>
          <div className="bg-[#111827] border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500">Status</p>
            <p className="text-xl font-bold text-blue-400">Active</p>
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800">
            <p className="text-sm font-medium text-white">Week: 29 Jul — 4 Aug 2024</p>
            <p className="text-xs text-gray-500">Pay Run: PR-2024-08-001</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-500">
                <th className="text-left py-2 px-4 font-medium">Date</th>
                <th className="text-left py-2 px-4 font-medium">Site</th>
                <th className="text-left py-2 px-4 font-medium">Scheduled</th>
                <th className="text-left py-2 px-4 font-medium">Actual</th>
                <th className="text-right py-2 px-4 font-medium">Hours</th>
                <th className="text-left py-2 px-4 font-medium">Rate</th>
                <th className="text-right py-2 px-4 font-medium">Gross</th>
                <th className="text-left py-2 px-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockTimesheets.map((t) => (
                <tr key={t.id} className="border-b border-gray-800/50">
                  <td className="py-2.5 px-4 text-gray-300">{t.date}</td>
                  <td className="py-2.5 px-4 text-gray-400 text-xs">{t.site}</td>
                  <td className="py-2.5 px-4 text-gray-400 font-mono text-xs">{t.scheduled}</td>
                  <td className="py-2.5 px-4 text-gray-300 font-mono text-xs">{t.actual}</td>
                  <td className="py-2.5 px-4 text-right text-gray-300 font-mono">{t.payableHours}</td>
                  <td className="py-2.5 px-4 text-gray-400 text-xs">{t.rateCategory}<br /><span className="text-gray-600">{t.rate}</span></td>
                  <td className="py-2.5 px-4 text-right text-gray-300 font-mono">{t.grossPay}</td>
                  <td className="py-2.5 px-4">
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusColors[t.status]}`}>{statusLabel(t.status)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-gray-800 flex justify-between text-sm">
            <span className="text-gray-500">Week Total</span>
            <div className="flex gap-6">
              <span className="text-gray-300">{totalHours.toFixed(1)} hrs</span>
              <span className="text-white font-semibold font-mono">£{totalGross.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-2 bg-[#111827] border border-gray-700 text-gray-400 rounded-xl py-3 text-sm hover:border-gray-600 cursor-pointer whitespace-nowrap">
          <div className="w-4 h-4 flex items-center justify-center"><i className="ri-question-answer-line"></i></div>
          Dispute a shift
        </button>
      </div>
    </div>
  );
}