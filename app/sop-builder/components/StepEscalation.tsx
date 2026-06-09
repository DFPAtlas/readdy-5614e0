'use client';

import { SOPFormData } from '@/lib/useBuiltSOPs';

interface Props {
  data: SOPFormData;
  onChange: (data: Partial<SOPFormData>) => void;
}

export default function StepEscalation({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Escalation & Reporting</h2>
        <p className="text-sm text-gray-400">Define how incidents are escalated and what reporting is required.</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Escalation Procedure</label>
          <textarea
            value={data.escalation_procedure}
            onChange={(e) => onChange({ escalation_procedure: e.target.value })}
            placeholder="Describe the escalation chain: who to contact first, second, third, and under what circumstances..."
            rows={6}
            className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Reporting Requirements</label>
          <textarea
            value={data.reporting_requirements}
            onChange={(e) => onChange({ reporting_requirements: e.target.value })}
            placeholder="What must be reported, in what format, and by when? e.g. Incident reports within 24 hours, daily logs by end of shift..."
            rows={5}
            className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>
      </div>
    </div>
  );
}