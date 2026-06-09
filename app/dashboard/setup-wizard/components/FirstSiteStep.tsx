'use client';

import { useState } from 'react';

export interface SiteFormData {
  site_name: string;
  address: string;
  client_contact_name: string;
  client_contact_phone: string;
  emergency_contact: string;
  site_instructions: string;
  risk_level: string;
  check_call_interval: number;
}

interface FirstSiteStepProps {
  data: SiteFormData;
  onChange: (data: SiteFormData) => void;
}

const inputBase =
  'w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors';
const inputNormal = 'border-white/10';

const RISK_LEVELS = [
  { value: 'low', label: 'Low', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  { value: 'medium', label: 'Medium', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
  { value: 'high', label: 'High', color: 'text-red-400', border: 'border-red-500/30', bg: 'bg-red-500/10' },
];

const INTERVALS = [
  { value: 30, label: '30 min' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 240, label: '4 hours' },
];

export default function FirstSiteStep({ data, onChange }: FirstSiteStepProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Site Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={data.site_name}
          onChange={(e) => onChange({ ...data, site_name: e.target.value })}
          className={`${inputBase} ${inputNormal}`}
          placeholder="e.g. Westfield Shopping Centre"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Site Address <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={data.address}
          onChange={(e) => onChange({ ...data, address: e.target.value })}
          className={`${inputBase} ${inputNormal}`}
          placeholder="Full street address"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Client Contact Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={data.client_contact_name}
            onChange={(e) => onChange({ ...data, client_contact_name: e.target.value })}
            className={`${inputBase} ${inputNormal}`}
            placeholder="Primary site contact"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Client Contact Phone <span className="text-red-400">*</span>
          </label>
          <input
            type="tel"
            value={data.client_contact_phone}
            onChange={(e) => onChange({ ...data, client_contact_phone: e.target.value })}
            className={`${inputBase} ${inputNormal}`}
            placeholder="+44 7700 900000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Emergency Contact</label>
        <input
          type="text"
          value={data.emergency_contact}
          onChange={(e) => onChange({ ...data, emergency_contact: e.target.value })}
          className={`${inputBase} ${inputNormal}`}
          placeholder="Emergency contact number or name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Site Instructions</label>
        <textarea
          value={data.site_instructions}
          onChange={(e) => onChange({ ...data, site_instructions: e.target.value })}
          className={`${inputBase} ${inputNormal} min-h-[80px] resize-none`}
          placeholder="Key instructions for guards at this site (access codes, parking, etc.)"
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">{data.site_instructions.length}/500</p>
      </div>

      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors cursor-pointer"
      >
        <i className={`ri-${showAdvanced ? 'arrow-up-s' : 'arrow-down-s'}-line`} />
        {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
      </button>

      {showAdvanced && (
        <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10 animate-fadeSlide">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Risk Level</label>
            <div className="grid grid-cols-3 gap-2">
              {RISK_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => onChange({ ...data, risk_level: level.value })}
                  className={`py-2.5 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                    data.risk_level === level.value
                      ? `${level.bg} ${level.border} ${level.color}`
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Guard Check-in Interval</label>
            <div className="grid grid-cols-4 gap-2">
              {INTERVALS.map((interval) => (
                <button
                  key={interval.value}
                  onClick={() => onChange({ ...data, check_call_interval: interval.value })}
                  className={`py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                    data.check_call_interval === interval.value
                      ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {interval.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}