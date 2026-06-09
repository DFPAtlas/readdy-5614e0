'use client';

import { SOPFormData } from '@/lib/useBuiltSOPs';

interface Props {
  data: SOPFormData;
  onChange: (data: Partial<SOPFormData>) => void;
}

export default function StepReview({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Review & Acknowledgement</h2>
        <p className="text-sm text-gray-400">Set the review cycle and the guard acknowledgement statement.</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Review Date</label>
          <input
            type="date"
            value={data.review_date}
            onChange={(e) => onChange({ review_date: e.target.value })}
            className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">When should this SOP be formally reviewed again?</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Guard Acknowledgement Statement</label>
          <textarea
            value={data.guard_acknowledgement_statement}
            onChange={(e) => onChange({ guard_acknowledgement_statement: e.target.value })}
            placeholder="e.g. I confirm that I have read, understood, and agree to comply with this Standard Operating Procedure..."
            rows={4}
            className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">Guards will be required to confirm this statement before starting shifts.</p>
        </div>
      </div>
    </div>
  );
}