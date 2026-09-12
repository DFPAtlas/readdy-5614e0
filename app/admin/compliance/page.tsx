'use client';

import { useState } from 'react';
import OverviewPanel from './components/OverviewPanel';
import RecordsPanel from './components/RecordsPanel';
import ProvidersPanel from './components/ProvidersPanel';
import LegalDocsPanel from './components/LegalDocsPanel';
import AiRegisterPanel from './components/AiRegisterPanel';
import BreachesPanel from './components/BreachesPanel';

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
  { id: 'records', label: 'Processing & DPIA', icon: 'ri-flow-chart' },
  { id: 'providers', label: 'Subprocessors', icon: 'ri-organization-chart' },
  { id: 'legal', label: 'Legal Documents', icon: 'ri-file-text-line' },
  { id: 'ai', label: 'AI Register', icon: 'ri-robot-line' },
  { id: 'breaches', label: 'Breaches', icon: 'ri-alert-line' },
];

export default function CompliancePage() {
  const [active, setActive] = useState('overview');

  return (
    <div className="min-h-screen bg-[#0a0e1a]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Compliance Command Centre</h1>
          <p className="text-sm text-gray-400 mt-1">
            UK GDPR, SIA and trust material. Items marked for legal review are not yet approved for production.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#111827]/80 border border-gray-800 rounded-xl p-1 mb-6 overflow-x-auto whitespace-nowrap">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                active === t.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                <i className={t.icon}></i>
              </div>
              {t.label}
            </button>
          ))}
        </div>

        {active === 'overview' && <OverviewPanel />}
        {active === 'records' && <RecordsPanel />}
        {active === 'providers' && <ProvidersPanel />}
        {active === 'legal' && <LegalDocsPanel />}
        {active === 'ai' && <AiRegisterPanel />}
        {active === 'breaches' && <BreachesPanel />}
      </div>
    </div>
  );
}