'use client';

import { SOPFormData } from '@/lib/useBuiltSOPs';
import { SOP_TYPES } from '@/lib/sopTypes';

interface Props {
  data: SOPFormData;
  onChange: (data: Partial<SOPFormData>) => void;
}

export default function StepType({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Choose SOP Type</h2>
        <p className="text-sm text-gray-400">Select the category of standard operating procedure you want to create.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {SOP_TYPES.map((t) => {
          const active = data.sop_type === t.value;
          return (
            <button
              key={t.value}
              onClick={() => onChange({ sop_type: t.value })}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left cursor-pointer whitespace-nowrap ${
                active
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : 'bg-gray-800/40 border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-800/60'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? 'bg-blue-500/20' : 'bg-gray-700/50'}`}>
                <i className={`${t.icon} text-sm`}></i>
              </div>
              <span className="text-sm font-medium">{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}