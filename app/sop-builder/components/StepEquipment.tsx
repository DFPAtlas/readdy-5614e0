'use client';

import { SOPFormData } from '@/lib/useBuiltSOPs';
import { useState } from 'react';

interface Props {
  data: SOPFormData;
  onChange: (data: Partial<SOPFormData>) => void;
}

const COMMON_EQUIPMENT = [
  'Torch/Flashlight',
  'Radio',
  'Key Box',
  'Panic Button',
  'CCTV Monitor',
  'Access Control Card',
  'Patrol Clock',
  'First Aid Kit',
  'Incident Report Book',
  'Mobile Phone',
  'High-Vis Vest',
  'Body Camera',
];

export default function StepEquipment({ data, onChange }: Props) {
  const [custom, setCustom] = useState('');

  const toggle = (item: string) => {
    const has = data.equipment.includes(item);
    onChange({ equipment: has ? data.equipment.filter((e) => e !== item) : [...data.equipment, item] });
  };

  const addCustom = () => {
    const trimmed = custom.trim();
    if (trimmed && !data.equipment.includes(trimmed)) {
      onChange({ equipment: [...data.equipment, trimmed] });
      setCustom('');
    }
  };

  const remove = (item: string) => {
    onChange({ equipment: data.equipment.filter((e) => e !== item) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Required Equipment</h2>
        <p className="text-sm text-gray-400">Select all equipment required to perform this procedure.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {COMMON_EQUIPMENT.map((item) => {
          const active = data.equipment.includes(item);
          return (
            <button
              key={item}
              onClick={() => toggle(item)}
              className={`px-3 py-2 rounded-lg text-sm border transition-colors cursor-pointer whitespace-nowrap ${
                active
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : 'bg-gray-800/40 border-gray-700 text-gray-400 hover:border-gray-600'
              }`}
            >
              {active && (
                <div className="w-4 h-4 inline-flex items-center justify-center mr-1">
                  <i className="ri-check-line text-xs"></i>
                </div>
              )}
              {item}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())}
          placeholder="Add custom equipment..."
          className="flex-1 bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={addCustom}
          disabled={!custom.trim()}
          className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg border border-gray-700 transition-colors disabled:opacity-30 cursor-pointer whitespace-nowrap"
        >
          Add
        </button>
      </div>

      {data.equipment.length > 0 && (
        <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Selected Equipment ({data.equipment.length})</p>
          <div className="flex flex-wrap gap-2">
            {data.equipment.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-sm"
              >
                {item}
                <button
                  onClick={() => remove(item)}
                  className="w-4 h-4 flex items-center justify-center text-blue-400/60 hover:text-blue-400 transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-xs"></i>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}