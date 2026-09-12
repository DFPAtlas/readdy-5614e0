'use client';

import { useState } from 'react';
import { useInView } from '../../hooks/useInView';

const comparisonFeatures = [
  { name: 'Guards', starter: 'Up to 10', sentinel: 'Up to 25', command: 'Up to 200', titan: 'Unlimited' },
  { name: 'Sites', starter: '1', sentinel: 'Up to 3', command: 'Unlimited', titan: 'Unlimited' },
  { name: 'Pricing model', starter: 'Monthly / Annual', sentinel: 'Monthly / Annual', command: 'Monthly / Annual', titan: 'Custom' },
  { name: 'Basic rota system', starter: true, sentinel: true, command: true, titan: true },
  { name: 'AI rota generation', starter: false, sentinel: false, command: true, titan: true },
  { name: 'Leave & sickness automation', starter: false, sentinel: false, command: true, titan: true },
  { name: 'Guard management', starter: true, sentinel: true, command: true, titan: true },
  { name: 'Site management', starter: true, sentinel: true, command: true, titan: true },
  { name: 'Incident reports', starter: true, sentinel: true, command: true, titan: true },
  { name: 'Digital occurrence book', starter: true, sentinel: true, command: true, titan: true },
  { name: 'Mobile guard portal', starter: true, sentinel: true, command: true, titan: true },
  { name: 'Patrol management', starter: false, sentinel: false, command: true, titan: true },
  { name: 'GPS tracking', starter: false, sentinel: false, command: true, titan: true },
  { name: 'Client portal', starter: false, sentinel: false, command: true, titan: true },
  { name: 'Compliance management', starter: false, sentinel: false, command: true, titan: true },
  { name: 'AI report writer', starter: false, sentinel: false, command: true, titan: true },
  { name: 'Basic KPI dashboard', starter: false, sentinel: true, command: true, titan: true },
  { name: 'Real-time dashboards', starter: false, sentinel: false, command: true, titan: true },
  { name: 'Limited AI usage', starter: false, sentinel: true, command: true, titan: true },
  { name: 'Advanced AI automation', starter: false, sentinel: false, command: false, titan: true },
  { name: 'Predictive staffing AI', starter: false, sentinel: false, command: false, titan: true },
  { name: 'White-label branding', starter: false, sentinel: false, command: false, titan: true },
  { name: 'API access', starter: false, sentinel: false, command: false, titan: true },
  { name: 'Custom integrations', starter: false, sentinel: false, command: false, titan: true },
  { name: 'Multi-company support', starter: false, sentinel: false, command: false, titan: true },
  { name: 'Dedicated account manager', starter: false, sentinel: false, command: false, titan: true },
  { name: 'Priority support', starter: false, sentinel: false, command: true, titan: true },
  { name: 'Support', starter: 'Email', sentinel: 'Email', command: 'Priority', titan: '24/7 phone' },
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
        <table className="w-full min-w-[1100px]">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-4 pr-6 text-sm font-medium text-gray-500 w-[22%]">
                Feature
              </th>
              <th className="text-center py-4 px-3 text-sm font-semibold text-gray-300 min-w-[90px]">
                Starter
              </th>
              <th className="text-center py-4 px-3 text-sm font-semibold text-white min-w-[90px]">
                Sentinel
              </th>
              <th className="text-center py-4 px-3 text-sm font-semibold text-blue-400 min-w-[90px]">
                Command
              </th>
              <th className="text-center py-4 px-3 text-sm font-semibold text-amber-400 min-w-[90px]">
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
                <td className="py-3.5 pr-6 text-sm text-gray-300 font-medium">{row.name}</td>
                <td className="text-center py-3.5 px-3 text-sm">
                  {renderCell(row.starter)}
                </td>
                <td className="text-center py-3.5 px-3 text-sm">
                  {renderCell(row.sentinel)}
                </td>
                <td className="text-center py-3.5 px-3 text-sm">
                  {renderCell(row.command, 'command')}
                </td>
                <td className="text-center py-3.5 px-3 text-sm">
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

function renderCell(value: string | boolean, tier?: 'command' | 'titan') {
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

  const textColor = tier === 'command' ? 'text-blue-300' : tier === 'titan' ? 'text-amber-300' : 'text-gray-300';
  return <span className={textColor}>{value}</span>;
}