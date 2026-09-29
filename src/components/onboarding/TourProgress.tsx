import React from 'react';

interface TourProgressProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (stepNumber: number) => void;
}

export const TourProgress: React.FC<TourProgressProps> = ({
  currentStep,
  totalSteps,
  onStepClick
}) => {
  return (
    <div className="flex items-center justify-between gap-3 text-xs font-semibold select-none">
      {/* Visual Progress Dots */}
      <div className="flex items-center gap-1.5" role="tablist" aria-label="Tour step indicators">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <button
              key={stepNum}
              type="button"
              onClick={() => onStepClick?.(stepNum)}
              disabled={!onStepClick}
              aria-label={`Go to step ${stepNum} of ${totalSteps}`}
              aria-current={isCurrent ? 'step' : undefined}
              className={`
                transition-all duration-300 rounded-full cursor-pointer
                ${isCurrent 
                  ? 'w-6 h-2 bg-emerald-500 ring-2 ring-emerald-500/30' 
                  : isCompleted 
                    ? 'w-2 h-2 bg-emerald-600/70 hover:bg-emerald-500' 
                    : 'w-2 h-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600'
                }
              `}
            />
          );
        })}
      </div>

      {/* Numeric Step Text */}
      <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
        Step <strong className="text-emerald-600 dark:text-emerald-400">{currentStep}</strong> of {totalSteps}
      </span>
    </div>
  );
};
