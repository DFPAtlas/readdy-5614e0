'use client';

import { useState, useEffect, useCallback } from 'react';

interface TourStep {
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="welcome"]',
    title: 'Your Command Centre',
    description: 'Get a quick overview of active shifts, sites, and any open incidents across your operation.',
    position: 'bottom',
  },
  {
    target: '[data-tour="kpis"]',
    title: 'Key Metrics at a Glance',
    description: 'Track active guards, open incidents, patrol completion, and upcoming shifts in real time.',
    position: 'bottom',
  },
  {
    target: '[data-tour="sites"]',
    title: 'Site Monitoring',
    description: 'See the status of every site. Click any site card to drill into detailed analytics and staff info.',
    position: 'top',
  },
  {
    target: '[data-tour="incidents"]',
    title: 'Incident Feed',
    description: 'All recent incidents flow in here. Click any item to view full details and manage the response.',
    position: 'top',
  },
  {
    target: '[data-tour="ai-alerts"]',
    title: 'AI Risk Alerts',
    description: 'Our AI analyses patterns and flags potential risks before they escalate.',
    position: 'left',
  },
  {
    target: '[data-tour="sidebar"]',
    title: 'Navigation',
    description: 'Access Sites, Guards, Rotas, Reports, and the AI Assistant from the sidebar.',
    position: 'right',
  },
];

const STORAGE_KEY = 'guardianhub-dashboard-tour-completed';

export default function OnboardingTour() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      const timer = setTimeout(() => {
        const hasContent = document.querySelector('[data-tour="welcome"]');
        if (hasContent) {
          setIsVisible(true);
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const step = TOUR_STEPS[currentStep];

  const updateTarget = useCallback(() => {
    if (!isVisible || !step) return;
    const el = document.querySelector(step.target) as HTMLElement;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTargetRect(el.getBoundingClientRect());
    }
  }, [isVisible, step]);

  useEffect(() => {
    updateTarget();
    const handleResize = () => updateTarget();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateTarget]);

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((c) => c + 1);
    } else {
      localStorage.setItem(STORAGE_KEY, 'true');
      setIsVisible(false);
    }
  };

  const handleBack = () => {
    setCurrentStep((c) => Math.max(0, c - 1));
  };

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
  };

  if (!isVisible || !step) return null;

  const tooltipWidth = 320;
  const tooltipHeight = 200;
  const gap = 16;

  let position = step.position;
  if (isMobile) position = 'bottom';

  let tooltipTop = 0;
  let tooltipLeft = 0;

  if (targetRect) {
    switch (position) {
      case 'bottom':
        tooltipTop = targetRect.bottom + gap;
        tooltipLeft = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case 'top':
        tooltipTop = targetRect.top - tooltipHeight - gap;
        tooltipLeft = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        tooltipTop = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        tooltipLeft = targetRect.left - tooltipWidth - gap;
        break;
      case 'right':
        tooltipTop = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        tooltipLeft = targetRect.right + gap;
        break;
    }

    tooltipTop = Math.max(8, Math.min(tooltipTop, window.innerHeight - tooltipHeight - 8));
    tooltipLeft = Math.max(8, Math.min(tooltipLeft, window.innerWidth - tooltipWidth - 8));
  }

  const arrowClass =
    position === 'bottom'
      ? 'top-[-6px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-[#111827]'
      : position === 'top'
      ? 'bottom-[-6px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-[#111827]'
      : position === 'left'
      ? 'right-[-6px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-[#111827]'
      : 'left-[-6px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-[#111827]';

  return (
    <>
      <div
        className="fixed inset-0 z-[59] cursor-pointer"
        onClick={handleSkip}
      />
      {targetRect && (
        <div
          className="fixed z-[60] rounded-lg pointer-events-none"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.65), 0 0 24px 4px rgba(59,130,246,0.25)',
            border: '2px solid rgba(59,130,246,0.6)',
            animation: 'tourPulse 2.5s ease-in-out infinite',
          }}
        />
      )}

      <div
        className="fixed z-[61] w-80 bg-[#111827] border border-white/10 rounded-xl shadow-2xl p-5"
        style={{ top: tooltipTop, left: tooltipLeft }}
      >
        <style>{`
          @keyframes tourPulse {
            0%, 100% { border-color: rgba(59,130,246,0.4); }
            50% { border-color: rgba(59,130,246,0.9); }
          }
          @keyframes fadeSlide {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <div className={`absolute w-3 h-3 rotate-45 border-[6px] ${arrowClass}`} />

        <div className="relative">
          <div className="flex items-center gap-1.5 mb-3">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? 'w-6 bg-blue-500'
                    : i < currentStep
                    ? 'w-3 bg-blue-500/40'
                    : 'w-3 bg-white/10'
                }`}
              />
            ))}
          </div>

          <p className="text-[11px] text-blue-400 font-semibold uppercase tracking-wider mb-1">
            Step {currentStep + 1} of {TOUR_STEPS.length}
          </p>
          <h3 className="text-base font-semibold text-white mb-1.5">{step.title}</h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-5">{step.description}</p>

          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-xs text-gray-500 hover:text-gray-300 cursor-pointer transition-colors"
            >
              Skip tour
            </button>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handleBack}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white cursor-pointer transition-colors"
              >
                {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}