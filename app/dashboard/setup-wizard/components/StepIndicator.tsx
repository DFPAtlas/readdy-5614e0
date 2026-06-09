'use client';

interface StepIndicatorProps {
  steps: { id: number; title: string; icon: string }[];
  currentStep: number;
  completedSteps: number[];
}

export default function StepIndicator({ steps, currentStep, completedSteps }: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-1 sm:gap-2">
        {steps.map((s, i) => {
          const isCompleted = completedSteps.includes(s.id);
          const isActive = currentStep === s.id;
          return (
            <div key={s.id} className="flex items-center gap-1 sm:gap-2">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all border-2 cursor-default ${
                    isCompleted
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : isActive
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-[#0f172a] border-white/20 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <i className="ri-check-line text-sm sm:text-base" />
                  ) : (
                    <i className={`${s.icon} text-sm sm:text-base`} />
                  )}
                </div>
                <span className={`text-[10px] sm:text-xs mt-1.5 font-medium hidden sm:block ${isActive ? 'text-blue-400' : isCompleted ? 'text-emerald-400' : 'text-gray-600'}`}>
                  {s.title}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-6 sm:w-10 h-0.5 rounded-full transition-all ${
                    isCompleted ? 'bg-emerald-600' : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-center text-xs text-gray-500 mt-3 sm:hidden">
        Step {currentStep} of {steps.length}: {steps.find((s) => s.id === currentStep)?.title}
      </p>
    </div>
  );
}