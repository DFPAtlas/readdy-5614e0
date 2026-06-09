'use client';

import { SOPFormData } from '@/lib/useBuiltSOPs';

interface Props {
  data: SOPFormData;
  onChange: (data: Partial<SOPFormData>) => void;
}

export default function StepPurposeScope({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Purpose & Scope</h2>
        <p className="text-sm text-gray-400">Define why this SOP exists and who it applies to.</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Purpose</label>
          <textarea
            value={data.purpose}
            onChange={(e) => onChange({ purpose: e.target.value })}
            placeholder="Describe the purpose of this procedure..."
            rows={4}
            className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Scope</label>
          <textarea
            value={data.scope}
            onChange={(e) => onChange({ scope: e.target.value })}
            placeholder="Who does this apply to? When is it used? Any exclusions?"
            rows={4}
            className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Guard Role</label>
            <input
              type="text"
              value={data.guard_role}
              onChange={(e) => onChange({ guard_role: e.target.value })}
              placeholder="e.g. Static Guard, Mobile Patrol"
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Shift Type</label>
            <input
              type="text"
              value={data.shift_type}
              onChange={(e) => onChange({ shift_type: e.target.value })}
              placeholder="e.g. Day, Night, Weekend"
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}