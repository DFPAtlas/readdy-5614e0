'use client';

import { useState } from 'react';
import { useInView } from '../../hooks/useInView';

const comparisonFeatures = [
  { name: 'Guards', sentinel: 'Up to 25', payg: 'Unlimited', command: 'Up to 200', titan: 'Unlimited' },
  { name: 'Sites', sentinel: 'Up to 3', payg: 'Unlimited', command: 'Unlimited', titan: 'Unlimited' },
  { name: 'Pricing model', sentinel: 'Monthly', payg: 'Per site/guard/day', command: 'Monthly', titan: 'Custom' },
  { name: 'Basic rota system', sentinel: true, payg: true, command: true, titan: true },
  { name: 'AI rota generation', sentinel: false, payg: false, command: true, titan: true },
  { name: 'Leave & sickness automation', sentinel: false, payg: false, command: true, titan: true },
  { name: 'Guard management', sentinel: true, payg: true, command: true, titan: true },
  { name: 'Site management', sentinel: true, payg: true, command: true, titan: true },
  { name: 'Incident reports', sentinel: true, payg: true, command: true, titan: true },
  { name: 'Digital occurrence book', sentinel: true, payg: true, command: true, titan: true },
  { name: 'Mobile guard portal', sentinel: true, payg: true, command: true, titan: true },
  { name: 'Patrol management', sentinel: false, payg: false, command: true, titan: true },
  { name: 'GPS tracking', sentinel: false, payg: false, command: true, titan: true },
  { name: 'Client portal', sentinel: false, payg: false, command: true, titan: true },
  { name: 'Compliance management', sentinel: false, payg: false, command: true, titan: true },
  { name: 'AI report writer', sentinel: false, payg: false, command: true, titan: true },
  { name: 'Basic KPI dashboard', sentinel: true, payg: true, command: true, titan: true },
  { name: 'Real-time dashboards', sentinel: false, payg: false, command: true, titan: true },
  { name: 'Limited AI usage', sentinel: true, payg: true, command: true, titan: true },
  { name: 'Advanced AI automation', sentinel: false, payg: false, command: false, titan: true },
  { name: 'Predictive staffing AI', sentinel: false, payg: false, command: false, titan: true },
  { name: 'White-label branding', sentinel: false, payg: false, command: false, titan: true },
  { name: 'API access', sentinel: false, payg: false, command: false, titan: true },
  { name: 'Custom integrations', sentinel: false, payg: false, command: false, titan: true },
  { name: 'Multi-company support', sentinel: false, payg: false, command: false, titan: true },
  { name: 'Dedicated account manager', sentinel: false, payg: false, command: false, titan: true },
  { name: 'Priority support', sentinel: false, payg: false, command: true, titan: true },
  { name: 'Support', sentinel: 'Email', payg: 'Email', command: 'Priority', titan: '24/7 phone' },
];

export default function ComparisonTable() {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <h3 className="text-2xl md:text-3xl font-bold text-white mb-10 text-center">
        Feature comparison
      </h3>

      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-4 pr-8 text-sm font-medium text-gray-500 w-[30%]">
                Feature
              </th>
              <th className="text-center py-4 px-4 text-sm font-semibold text-white min-w-[100px]">
                Sentinel
              </th>
              <th className="text-center py-4 px-4 text-sm font-semibold text-emerald-400 min-w-[100px]">
                Pay as You Go
              </th>
              <th className="text-center py-4 px-4 text-sm font-semibold text-blue-400 min-w-[100px]">
                Command
              </th>
              <th className="text-center py-4 px-4 text-sm font-semibold text-amber-400 min-w-[100px]">
                Titan
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisonFeatures.map((row, i) => (
              <tr
                key={i}
                className={`border-b ${i % 2 === 0 ? 'bg-white/[0.01]' : ''} border-white/5 hover:bg-white/[0.03] transition-colors`}
              >
                <td className="py-3.5 pr-8 text-sm text-gray-300 font-medium">{row.name}</td>
                <td className="text-center py-3.5 px-4 text-sm">
                  {renderCell(row.sentinel)}
                </td>
                <td className="text-center py-3.5 px-4 text-sm">
                  {renderCell(row.payg, 'payg')}
                </td>
                <td className="text-center py-3.5 px-4 text-sm">
                  {renderCell(row.command, 'command')}
                </td>
                <td className="text-center py-3.5 px-4 text-sm">
                  {renderCell(row.titan, 'titan')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderCell(value: string | boolean, tier?: 'payg' | 'command' | 'titan') {
  if (typeof value === 'boolean') {
    return value ? (
      <span className="w-6 h-6 flex items-center justify-center mx-auto">
        <i className="ri-check-line text-blue-400 text-base"></i>
      </span>
    ) : (
      <span className="w-6 h-6 flex items-center justify-center mx-auto">
        <i className="ri-subtract-line text-gray-700 text-base"></i>
      </span>
    );
  }

  const textColor = tier === 'payg' ? 'text-emerald-300' : tier === 'command' ? 'text-blue-300' : tier === 'titan' ? 'text-amber-300' : 'text-gray-300';
  return <span className={textColor}>{value}</span>;
}