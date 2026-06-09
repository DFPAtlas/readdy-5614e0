'use client';

import { SOPFormData } from '@/lib/useBuiltSOPs';

interface Props {
  data: SOPFormData;
  onChange: (data: Partial<SOPFormData>) => void;
}

export default function StepProcedure({ data, onChange }: Props) {
  const addStep = () => {
    onChange({
      procedure_steps: [
        ...data.procedure_steps,
        { step: data.procedure_steps.length + 1, instruction: '', expectedOutcome: '' },
      ],
    });
  };

  const updateStep = (idx: number, field: 'instruction' | 'expectedOutcome', value: string) => {
    const next = [...data.procedure_steps];
    next[idx] = { ...next[idx], [field]: value };
    onChange({ procedure_steps: next });
  };

  const removeStep = (idx: number) => {
    const next = data.procedure_steps.filter((_, i) => i !== idx);
    next.forEach((s, i) => (s.step = i + 1));
    onChange({ procedure_steps: next });
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...data.procedure_steps];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    next.forEach((s, i) => (s.step = i + 1));
    onChange({ procedure_steps: next });
  };

  const moveDown = (idx: number) => {
    if (idx >= data.procedure_steps.length - 1) return;
    const next = [...data.procedure_steps];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    next.forEach((s, i) => (s.step = i + 1));
    onChange({ procedure_steps: next });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Step-by-Step Procedure</h2>
        <p className="text-sm text-gray-400">Add each action in order. Include what the expected outcome should be.</p>
      </div>

      <div className="space-y-3">
        {data.procedure_steps.map((s, idx) => (
          <div key={idx} className="bg-gray-800/40 border border-gray-700 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">
                  {s.step}
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Step</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-gray-700 transition-colors disabled:opacity-20 cursor-pointer"
                >
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-up-line text-xs"></i></div>
                </button>
                <button
                  onClick={() => moveDown(idx)}
                  disabled={idx >= data.procedure_steps.length - 1}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-gray-700 transition-colors disabled:opacity-20 cursor-pointer"
                >
                  <div className="w-4 h-4 flex items-center justify-center"><i className="ri-arrow-down-line text-xs"></i></div>
                </button>
                {data.procedure_steps.length > 1 && (
                  <button
                    onClick={() => removeStep(idx)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <div className="w-4 h-4 flex items-center justify-center"><i className="ri-delete-bin-line text-xs"></i></div>
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={s.instruction}
              onChange={(e) => updateStep(idx, 'instruction', e.target.value)}
              placeholder="What action should be taken?"
              rows={2}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            />
            <input
              type="text"
              value={s.expectedOutcome}
              onChange={(e) => updateStep(idx, 'expectedOutcome', e.target.value)}
              placeholder="Expected outcome (optional)"
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        ))}

        <button
          onClick={addStep}
          className="w-full py-3 rounded-xl border border-dashed border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 hover:bg-gray-800/40 transition-all text-sm font-medium cursor-pointer whitespace-nowrap"
        >
          <div className="w-4 h-4 inline-flex items-center justify-center mr-1">
            <i className="ri-add-line"></i>
          </div>
          Add Step
        </button>
      </div>
    </div>
  );
}