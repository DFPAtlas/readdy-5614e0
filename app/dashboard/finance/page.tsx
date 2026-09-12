'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

interface MetricCard {
  label: string;
  value: string;
  sub: string;
  icon: string;
  color: string;
  href?: string;
}

export default function FinanceDashboardPage() {
  const { profile, company } = useAuth();
  const [period, setPeriod] = useState('this_month');

  const metrics: MetricCard[] = [
    { label: 'Payable Hours', value: '2,847.5', sub: '£32,463.75 estimated gross', icon: 'ri-time-line', color: 'text-emerald-400', href: '/dashboard/finance/timesheets' },
    { label: 'Billable Hours', value: '2,692.0', sub: '£67,300.00 estimated revenue', icon: 'ri-bank-line', color: 'text-blue-400', href: '/dashboard/finance/billing-runs' },
    { label: 'Gross Margin', value: '51.8%', sub: '£34,836.25 estimated', icon: 'ri-funds-line', color: 'text-amber-400' },
    { label: 'Unapproved Timesheets', value: '24', sub: 'Need review before pay run', icon: 'ri-alert-line', color: 'text-red-400', href: '/dashboard/finance/timesheets' },
    { label: 'Draft Pay Runs', value: '1', sub: 'Period ending Aug 4', icon: 'ri-file-list-3-line', color: 'text-purple-400', href: '/dashboard/finance/pay-runs' },
    { label: 'Draft Invoices', value: '3', sub: 'Across 3 clients', icon: 'ri-bill-line', color: 'text-orange-400', href: '/dashboard/finance/invoices' },
    { label: 'Overdue Invoices', value: '2', sub: '£8,450.00 outstanding', icon: 'ri-error-warning-line', color: 'text-red-500', href: '/dashboard/finance/invoices' },
    { label: 'Missing Rates', value: '7', sub: 'Guards without configured rates', icon: 'ri-price-tag-3-line', color: 'text-yellow-400', href: '/dashboard/finance/rate-cards' },
    { label: 'Pending Expenses', value: '5', sub: '£342.60 awaiting review', icon: 'ri-receipt-line', color: 'text-teal-400', href: '/dashboard/finance/expenses' },
    { label: 'Open Disputes', value: '2', sub: '1 pay, 1 invoice', icon: 'ri-question-answer-line', color: 'text-pink-400', href: '/dashboard/finance/disputes' },
  ];

  const quickActions = [
    { label: 'Review Timesheets', href: '/dashboard/finance/timesheets', icon: 'ri-calendar-check-line', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { label: 'New Pay Run', href: '/dashboard/finance/pay-runs', icon: 'ri-bank-card-line', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { label: 'New Billing Run', href: '/dashboard/finance/billing-runs', icon: 'ri-file-text-line', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { label: 'Manage Rates', href: '/dashboard/finance/rate-cards', icon: 'ri-price-tag-3-line', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { label: 'Export Payroll', href: '/dashboard/finance/exports', icon: 'ri-download-2-line', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
    { label: 'Finance Settings', href: '/dashboard/finance/exports', icon: 'ri-settings-3-line', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
  ];

  const recentRuns = [
    { type: 'Pay Run', ref: 'PR-2024-08-001', period: '28 Jul - 3 Aug 2024', status: 'Approved', total: '£12,450.00', date: '4 Aug 2024' },
    { type: 'Billing Run', ref: 'BR-2024-08-001', period: '28 Jul - 3 Aug 2024', status: 'Issued', total: '£28,320.00', date: '4 Aug 2024' },
    { type: 'Pay Run', ref: 'PR-2024-07-005', period: '21 - 27 Jul 2024', status: 'Paid', total: '£11,890.00', date: '31 Jul 2024' },
    { type: 'Billing Run', ref: 'BR-2024-07-004', period: '21 - 27 Jul 2024', status: 'Paid', total: '£26,750.00', date: '28 Jul 2024' },
  ];

  const statusColors: Record<string, string> = {
    Approved: 'bg-emerald-500/20 text-emerald-400',
    Issued: 'bg-blue-500/20 text-blue-400',
    Paid: 'bg-green-500/20 text-green-400',
    Draft: 'bg-gray-500/20 text-gray-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Finance Centre</h1>
          <p className="text-sm text-gray-400 mt-1">Payroll, client billing and margin reporting</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#111827] border border-gray-700 rounded-lg p-1">
            {['this_week','this_month','last_month','custom'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  period === p ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {p === 'this_week' ? 'This Week' : p === 'this_month' ? 'This Month' : p === 'last_month' ? 'Last Month' : 'Custom'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] ${action.color}`}
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-current/10">
              <i className={`${action.icon} text-lg`}></i>
            </div>
            <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {metrics.map((m) => (
          <Link
            key={m.label}
            href={m.href || '#'}
            className={`bg-[#111827] border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all cursor-pointer ${!m.href ? 'cursor-default hover:border-gray-800' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 flex items-center justify-center rounded-lg bg-[#1a1f2e] ${m.color}`}>
                <i className={m.icon}></i>
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{m.value}</p>
            <p className="text-xs text-gray-500 mt-1">{m.label}</p>
            <p className="text-xs text-gray-600 mt-0.5">{m.sub}</p>
          </Link>
        ))}
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="text-base font-semibold text-white">Recent Runs</h2>
          <Link href="/dashboard/finance/pay-runs" className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-500">
                <th className="text-left py-3 px-5 font-medium">Type</th>
                <th className="text-left py-3 px-5 font-medium">Reference</th>
                <th className="text-left py-3 px-5 font-medium">Period</th>
                <th className="text-left py-3 px-5 font-medium">Status</th>
                <th className="text-right py-3 px-5 font-medium">Total</th>
                <th className="text-right py-3 px-5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentRuns.map((run, i) => (
                <tr key={i} className="border-b border-gray-800/50 hover:bg-white/[0.02] cursor-pointer">
                  <td className="py-3 px-5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${run.type === 'Pay Run' ? 'bg-purple-500/15 text-purple-400' : 'bg-blue-500/15 text-blue-400'}`}>
                      {run.type}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-gray-300 font-mono text-xs">{run.ref}</td>
                  <td className="py-3 px-5 text-gray-400">{run.period}</td>
                  <td className="py-3 px-5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[run.status] || 'bg-gray-500/15 text-gray-400'}`}>
                      {run.status}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-right text-gray-300 font-mono">{run.total}</td>
                  <td className="py-3 px-5 text-right text-gray-500">{run.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
          <h3 className="text-base font-semibold text-white mb-4">Site Profitability (Est.)</h3>
          <div className="space-y-3">
            {[
              { site: 'Canary Wharf Tower', revenue: '£18,200', cost: '£8,450', margin: '53.6%' },
              { site: 'Westfield Shopping Centre', revenue: '£14,800', cost: '£7,200', margin: '51.4%' },
              { site: 'Heathrow Logistics Hub', revenue: '£9,600', cost: '£5,100', margin: '46.9%' },
              { site: 'Manchester Data Centre', revenue: '£7,500', cost: '£3,800', margin: '49.3%' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0">
                <div className="flex-1">
                  <p className="text-sm text-gray-300">{s.site}</p>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-sm text-gray-400 w-20 text-right font-mono">{s.revenue}</span>
                  <span className="text-sm text-gray-500 w-20 text-right font-mono">{s.cost}</span>
                  <span className={`text-sm font-semibold w-16 text-right ${parseFloat(s.margin) > 50 ? 'text-emerald-400' : parseFloat(s.margin) > 45 ? 'text-amber-400' : 'text-red-400'}`}>
                    {s.margin}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
          <h3 className="text-base font-semibold text-white mb-4">Client Invoice Status</h3>
          <div className="space-y-3">
            {[
              { client: 'Securitas UK', status: 'Paid', invoice: '#INV-2024-0801', amount: '£12,450', date: '1 Aug' },
              { client: 'G4S Facilities', status: 'Issued', invoice: '#INV-2024-0802', amount: '£8,320', date: '4 Aug' },
              { client: 'Mitie Group', status: 'Overdue', invoice: '#INV-2024-0703', amount: '£5,600', date: '15 Jul' },
              { client: 'Wilson James', status: 'Draft', invoice: '#INV-2024-0803', amount: '£6,100', date: '—' },
              { client: 'CIS Security', status: 'Overdue', invoice: '#INV-2024-0701', amount: '£2,850', date: '8 Jul' },
            ].map((c, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0">
                <div className="flex-1">
                  <p className="text-sm text-gray-300">{c.client}</p>
                  <p className="text-xs text-gray-600 font-mono">{c.invoice}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    c.status === 'Paid' ? 'bg-emerald-500/15 text-emerald-400' :
                    c.status === 'Issued' ? 'bg-blue-500/15 text-blue-400' :
                    c.status === 'Overdue' ? 'bg-red-500/15 text-red-400' :
                    'bg-gray-500/15 text-gray-400'
                  }`}>{c.status}</span>
                  <span className="text-sm text-gray-300 font-mono w-20 text-right">{c.amount}</span>
                  <span className="text-xs text-gray-500 w-12 text-right">{c.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}