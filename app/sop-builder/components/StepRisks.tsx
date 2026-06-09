'use client';

import { SOPFormData } from '@/lib/useBuiltSOPs';

interface Props {
  data: SOPFormData;
  onChange: (data: Partial<SOPFormData>) => void;
}

export default function StepRisks({ data, onChange }: Props) {
  const addRisk = () => {
    onChange({ risks_controls: [...data.risks_controls, { risk: '', control: '' }] });
  };

  const updateRisk = (idx: number, field: 'risk' | 'control', value: string) => {
    const next = [...data.risks_controls];
    next[idx] = { ...next[idx], [field]: value };
    onChange({ risks_controls: next });
  };

  const removeRisk = (idx: number) => {
    onChange({ risks_controls: data.risks_controls.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Risks, Controls & PPE</h2>
        <p className="text-sm text-gray-400">Document hazards and how to mitigate them. Specify required PPE and health & safety notes.</p>
      </div>

      <div className="space-y-3">
        {data.risks_controls.map((r, idx) => (
          <div key={idx} className="bg-gray-800/40 border border-gray-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Risk {idx + 1}</span>
              {data.risks_controls.length > 1 && (
                <button
                  onClick={() => removeRisk(idx)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-delete-bin-line text-xs"></i></div>
                </button>
              )}
            </div>
            <input
              type="text"
              value={r.risk}
              onChange={(e) => updateRisk(idx, 'risk', e.target.value)}
              placeholder="Potential risk or hazard"
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              value={r.control}
              onChange={(e) => updateRisk(idx, 'control', e.target.value)}
              placeholder="Control measure to mitigate risk"
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        ))}

        <button
          onClick={addRisk}
          className="w-full py-3 rounded-xl border border-dashed border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 hover:bg-gray-800/40 transition-all text-sm font-medium cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 inline-flex items-center justify-center mr-1">
            <i className="ri-add-line"></i>
          </div>
          Add Risk & Control
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Required PPE</label>
          <input
            type="text"
            value={data.ppe}
            onChange={(e) => onChange({ ppe: e.target.value })}
            placeholder="e.g. High-vis vest, safety boots, hard hat"
            className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Health & Safety Notes</label>
          <input
            type="text"
            value={data.health_safety_notes}
            onChange={(e) => onChange({ health_safety_notes: e.target.value })}
            placeholder="Additional H&S considerations"
            className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}