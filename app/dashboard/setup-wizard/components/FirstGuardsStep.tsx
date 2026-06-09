'use client';

import { useState } from 'react';

export interface GuardFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  sia_licence: string;
  sia_expiry: string;
  role: string;
  hourly_rate: string;
  skills: string[];
}

interface FirstGuardsStepProps {
  guards: GuardFormData[];
  onChange: (guards: GuardFormData[]) => void;
}

const inputBase =
  'w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors';
const inputNormal = 'border-white/10';

const SKILL_OPTIONS = [
  'Door Supervisor',
  'CCTV',
  'First Aid',
  'Fire Marshal',
  'Keyholding',
  'Patrol',
  'Reception',
  'Events',
  'Close Protection',
  'Public Space Surveillance',
  'Vehicle Immobilisation',
  'Conflict Management',
  'Search & Frisk',
  'Manned Guarding',
  'Mobile Patrol',
];

const emptyGuard: GuardFormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  sia_licence: '',
  sia_expiry: '',
  role: 'Security Officer',
  hourly_rate: '',
  skills: [],
};

export default function FirstGuardsStep({ guards, onChange }: FirstGuardsStepProps) {
  const [activeGuard, setActiveGuard] = useState(0);

  const addGuard = () => {
    onChange([...guards, { ...emptyGuard }]);
    setActiveGuard(guards.length);
  };

  const removeGuard = (index: number) => {
    const next = guards.filter((_, i) => i !== index);
    onChange(next);
    setActiveGuard(Math.max(0, activeGuard - 1));
  };

  const updateGuard = (index: number, field: keyof GuardFormData, value: any) => {
    const next = [...guards];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  };

  const toggleSkill = (index: number, skill: string) => {
    const g = guards[index];
    const skills = g.skills.includes(skill) ? g.skills.filter((s) => s !== skill) : [...g.skills, skill];
    updateGuard(index, 'skills', skills);
  };

  const guard = guards[activeGuard] || emptyGuard;

  return (
    <div className="space-y-4">
      {/* Guard tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {guards.map((g, i) => (
          <button
            key={i}
            onClick={() => setActiveGuard(i)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all whitespace-nowrap cursor-pointer ${
              activeGuard === i
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">
              {g.first_name ? g.first_name[0] : i + 1}
            </div>
            <span>{g.first_name ? `${g.first_name} ${g.last_name}` : `Guard ${i + 1}`}</span>
            {guards.length > 1 && (
              <i
                className="ri-close-line text-gray-500 hover:text-red-400 cursor-pointer ml-1"
                onClick={(e) => {
                  e.stopPropagation();
                  removeGuard(i);
                }}
              />
            )}
          </button>
        ))}
        <button
          onClick={addGuard}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all cursor-pointer whitespace-nowrap"
        >
          <i className="ri-add-line" /> Add Guard
        </button>
      </div>

      {/* Guard form */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              First Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={guard.first_name}
              onChange={(e) => updateGuard(activeGuard, 'first_name', e.target.value)}
              className={`${inputBase} ${inputNormal}`}
              placeholder="John"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Last Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={guard.last_name}
              onChange={(e) => updateGuard(activeGuard, 'last_name', e.target.value)}
              className={`${inputBase} ${inputNormal}`}
              placeholder="Smith"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={guard.email}
              onChange={(e) => updateGuard(activeGuard, 'email', e.target.value)}
              className={`${inputBase} ${inputNormal}`}
              placeholder="guard@company.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Phone <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              value={guard.phone}
              onChange={(e) => updateGuard(activeGuard, 'phone', e.target.value)}
              className={`${inputBase} ${inputNormal}`}
              placeholder="+44 7700 900000"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">SIA Licence Number</label>
            <input
              type="text"
              value={guard.sia_licence}
              onChange={(e) => updateGuard(activeGuard, 'sia_licence', e.target.value)}
              className={`${inputBase} ${inputNormal}`}
              placeholder="e.g. 1234567890123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">SIA Expiry Date</label>
            <input
              type="date"
              value={guard.sia_expiry}
              onChange={(e) => updateGuard(activeGuard, 'sia_expiry', e.target.value)}
              className={`${inputBase} ${inputNormal}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Role</label>
            <input
              type="text"
              value={guard.role}
              onChange={(e) => updateGuard(activeGuard, 'role', e.target.value)}
              className={`${inputBase} ${inputNormal}`}
              placeholder="Security Officer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Hourly Rate (GBP)</label>
            <input
              type="number"
              step="0.01"
              value={guard.hourly_rate}
              onChange={(e) => updateGuard(activeGuard, 'hourly_rate', e.target.value)}
              className={`${inputBase} ${inputNormal}`}
              placeholder="15.50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Skills & Qualifications</label>
          <div className="flex flex-wrap gap-2">
            {SKILL_OPTIONS.map((skill) => {
              const active = guard.skills.includes(skill);
              return (
                <button
                  key={skill}
                  onClick={() => toggleSkill(activeGuard, skill)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                    active
                      ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20'
                  }`}
                >
                  {active && <i className="ri-check-line mr-1" />}
                  {skill}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}