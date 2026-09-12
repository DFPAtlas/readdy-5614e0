'use client';

import { useState } from 'react';
import LocationTrackingPanel from './LocationTrackingPanel';
import SiaAcsPanel from './SiaAcsPanel';
import BreachPanel from './BreachPanel';
import RecordsPanel from './RecordsPanel';

const TABS = [
  { id: 'location', label: 'Location Tracking', icon: 'ri-map-pin-line' },
  { id: 'sia', label: 'SIA & ACS', icon: 'ri-shield-user-line' },
  { id: 'breaches', label: 'Breaches', icon: 'ri-alert-line' },
  { id: 'records', label: 'Records & DPIA', icon: 'ri-flow-chart' },
];

export default function ComplianceSettings() {
  const [active, setActive] = useState('location');

  return (
    <div>
      <div className="flex items-center gap-1 bg-[#111827]/80 border border-gray-800 rounded-xl p-1 mb-6 overflow-x-auto whitespace-nowrap">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
              active === t.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="w-4 h-4 flex items-center justify-center">
              <i className={t.icon}></i>
            </div>
            {t.label}
          </button>
        ))}
      </div>

      {active === 'location' && <LocationTrackingPanel />}
      {active === 'sia' && <SiaAcsPanel />}
      {active === 'breaches' && <BreachPanel />}
      {active === 'records' && <RecordsPanel />}
    </div>
  );
}