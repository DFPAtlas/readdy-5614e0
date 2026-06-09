'use client';

interface StepIndicatorProps {
  steps: string[];
  current: number;
  onChange: (step: number) => void;
}

export default function StepIndicator({ steps, current, onChange }: StepIndicatorProps) {
  return (
    <div className="w-64 bg-[#111827] border-r border-gray-800 p-5 flex flex-col gap-1 flex-shrink-0">
      <h3 className="text-sm font-semibold text-white mb-4">SOP Builder</h3>
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const isActive = current === stepNum;
        const isDone = current > stepNum;
        const isPending = current < stepNum;

        return (
          <button
            key={stepNum}
            onClick={() => onChange(stepNum)}
            disabled={isPending}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left w-full cursor-pointer whitespace-nowrap ${
              isActive
                ? 'bg-blue-600/15 text-blue-400'
                : isDone
                ? 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                : 'text-gray-600 cursor-not-allowed'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                isActive
                  ? 'bg-blue-500 text-white'
                  : isDone
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-gray-800 text-gray-600'
              }`}
            >
              {isDone ? (
                <i className="ri-check-line text-xs"></i>
              ) : (
                stepNum
              )}
            </div>
            <span className="truncate">{label}</span>
          </button>
        );
      })}
    </div>
  );
}