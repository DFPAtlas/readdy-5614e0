'use client';

import { useState } from 'react';
import Link from 'next/link';

interface RateCard {
  id: string;
  name: string;
  type: string;
  rateType: string;
  amount: number;
  unit: string;
  appliesTo: string;
  effectiveFrom: string;
  status: string;
  version: number;
}

const payRates: RateCard[] = [
  { id: '1', name: 'Standard Day Rate', type: 'pay', rateType: 'standard_hourly', amount: 14.50, unit: 'hour', appliesTo: 'All Guards', effectiveFrom: '1 Jan 2024', status: 'active', version: 3 },
  { id: '2', name: 'Overtime Rate (1.5x)', type: 'pay', rateType: 'overtime', amount: 21.75, unit: 'hour', appliesTo: 'All Guards', effectiveFrom: '1 Jan 2024', status: 'active', version: 2 },
  { id: '3', name: 'Night Premium', type: 'pay', rateType: 'night', amount: 17.00, unit: 'hour', appliesTo: 'All Guards', effectiveFrom: '1 Jan 2024', status: 'active', version: 1 },
  { id: '4', name: 'Weekend Rate', type: 'pay', rateType: 'weekend', amount: 18.50, unit: 'hour', appliesTo: 'All Guards', effectiveFrom: '1 Jan 2024', status: 'active', version: 2 },
  { id: '5', name: 'Bank Holiday', type: 'pay', rateType: 'bank_holiday', amount: 29.00, unit: 'hour', appliesTo: 'All Guards', effectiveFrom: '1 Jan 2024', status: 'active', version: 1 },
  { id: '6', name: 'Canary Wharf Site Rate', type: 'pay', rateType: 'site_specific', amount: 16.00, unit: 'hour', appliesTo: 'Canary Wharf Tower', effectiveFrom: '1 Mar 2024', status: 'active', version: 1 },
];

const chargeRates: RateCard[] = [
  { id: '7', name: 'Standard Client Rate', type: 'charge', rateType: 'standard_hourly', amount: 25.00, unit: 'hour', appliesTo: 'All Clients', effectiveFrom: '1 Jan 2024', status: 'active', version: 2 },
  { id: '8', name: 'Night Client Rate', type: 'charge', rateType: 'night', amount: 30.00, unit: 'hour', appliesTo: 'All Clients', effectiveFrom: '1 Jan 2024', status: 'active', version: 1 },
  { id: '9', name: 'Weekend Client Rate', type: 'charge', rateType: 'weekend', amount: 32.00, unit: 'hour', appliesTo: 'All Clients', effectiveFrom: '1 Jan 2024', status: 'active', version: 1 },
  { id: '10', name: 'Bank Holiday Client', type: 'charge', rateType: 'bank_holiday', amount: 45.00, unit: 'hour', appliesTo: 'All Clients', effectiveFrom: '1 Jan 2024', status: 'active', version: 1 },
  { id: '11', name: 'Securitas Contract Rate', type: 'charge', rateType: 'site_specific', amount: 27.50, unit: 'hour', appliesTo: 'Securitas UK', effectiveFrom: '1 Feb 2024', status: 'active', version: 1 },
  { id: '12', name: 'Keyholding Service', type: 'charge', rateType: 'keyholding', amount: 150.00, unit: 'month', appliesTo: 'Per Site', effectiveFrom: '1 Jan 2024', status: 'draft', version: 1 },
];

export default function RateCardsPage() {
  const [tab, setTab] = useState<'pay' | 'charge'>('pay');
  const [showNewModal, setShowNewModal] = useState(false);

  const rates = tab === 'pay' ? payRates : chargeRates;

  const typeLabel = (t: string) => t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Rate Cards</h1>
          <p className="text-sm text-gray-400 mt-1">Manage guard pay and client charge rates</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/finance" className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white cursor-pointer whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-left-line"></i></div>
            Finance Centre
          </Link>
          <button onClick={() => setShowNewModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap">
            <div className="w-4 h-4 flex items-center justify-center"><i className="ri-add-line"></i></div>
            New Rate
          </button>
        </div>
      </div>

      <div className="flex bg-[#111827] border border-gray-700 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('pay')}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${tab === 'pay' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Guard Pay Rates
        </button>
        <button
          onClick={() => setTab('charge')}
          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${tab === 'charge' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
        >
          Client Charge Rates
        </button>
      </div>

      <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-500">
                <th className="text-left py-3 px-4 font-medium">Name</th>
                <th className="text-left py-3 px-4 font-medium">Type</th>
                <th className="text-right py-3 px-4 font-medium">Amount</th>
                <th className="text-left py-3 px-4 font-medium">Unit</th>
                <th className="text-left py-3 px-4 font-medium">Applies To</th>
                <th className="text-left py-3 px-4 font-medium">Effective</th>
                <th className="text-center py-3 px-4 font-medium">Version</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-right py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((r) => (
                <tr key={r.id} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                  <td className="py-3 px-4 text-gray-300 font-medium">{r.name}</td>
                  <td className="py-3 px-4 text-gray-400">{typeLabel(r.rateType)}</td>
                  <td className="py-3 px-4 text-right text-gray-300 font-mono">£{r.amount.toFixed(2)}</td>
                  <td className="py-3 px-4 text-gray-400">per {r.unit}</td>
                  <td className="py-3 px-4 text-gray-400">{r.appliesTo}</td>
                  <td className="py-3 px-4 text-gray-400">{r.effectiveFrom}</td>
                  <td className="py-3 px-4 text-center text-gray-500">v{r.version}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === 'active' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-gray-500/15 text-gray-400'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 cursor-pointer" title="Edit">
                        <i className="ri-edit-line"></i>
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-amber-400 hover:bg-gray-800 cursor-pointer" title="New Version">
                        <i className="ri-git-branch-line"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowNewModal(false)}>
          <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">New Rate Card</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs text-gray-500 block mb-1">Rate Name</label>
                <input type="text" className="w-full bg-[#1a1f2e] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none" placeholder="e.g. Standard Day Rate" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Category</label>
                <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white cursor-pointer flex items-center justify-between">
                  {tab === 'pay' ? 'Guard Pay' : 'Client Charge'}
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-down-s-line text-gray-500"></i></div>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Rate Type</label>
                <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white cursor-pointer flex items-center justify-between">
                  Standard Hourly
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-down-s-line text-gray-500"></i></div>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Amount (£)</label>
                <input type="number" step="0.01" className="w-full bg-[#1a1f2e] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none" placeholder="0.00" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Unit</label>
                <div className="bg-[#1a1f2e] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white cursor-pointer flex items-center justify-between">
                  hour
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-down-s-line text-gray-500"></i></div>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Effective From</label>
                <input type="date" className="w-full bg-[#1a1f2e] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Priority</label>
                <input type="number" className="w-full bg-[#1a1f2e] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none" defaultValue={100} />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-5">
              <button onClick={() => setShowNewModal(false)} className="flex-1 px-4 py-2 text-sm text-gray-400 border border-gray-700 rounded-lg hover:border-gray-600 cursor-pointer whitespace-nowrap">Cancel</button>
              <button className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-500 cursor-pointer whitespace-nowrap">Create Rate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}