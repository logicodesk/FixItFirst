import React from 'react';
import { ArrowLeft, Edit3 } from 'lucide-react';
import { AssessmentDraft } from '../types';

interface StepHeaderProps {
  currentStep: 1 | 2 | 3;
  draft: AssessmentDraft;
  onBack?: () => void;
  onEdit?: () => void;
  stepTitle?: string;
}

export const StepHeader: React.FC<StepHeaderProps> = ({
  currentStep,
  draft,
  onBack,
  onEdit,
  stepTitle,
}) => {
  const stepLabels = {
    1: 'Item & Condition',
    2: 'Issue Diagnostic',
    3: 'Decision Framework',
  };

  const progressPercent = currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : '100%';

  return (
    <div className="w-full flex flex-col gap-2 mb-6">
      {/* Top Stepper Indicator */}
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="min-h-[44px] min-w-[44px] -ml-2 flex items-center justify-center text-[#2C5B47] hover:text-[#173D32] rounded-lg transition-colors"
              aria-label="Go back to previous step"
            >
              <ArrowLeft className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
          <span className="font-semibold text-[#2C5B47] uppercase tracking-wider text-xs">
            Step {currentStep} of 3
          </span>
          {currentStep === 3 && (
            <span className="font-medium text-[#66736B]">· Done</span>
          )}
        </div>
        <span className="text-[#66736B] font-medium text-xs sm:text-sm">
          {stepTitle || stepLabels[currentStep]}
        </span>
      </div>

      {/* Progress Bar */}
      <div
        className="w-full h-1.5 bg-[#E8E9E3] rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={3}
        aria-label={`Assessment progress: step ${currentStep} of 3`}
      >
        <div
          className="h-full bg-[#173D32] rounded-full transition-all duration-300 ease-out"
          style={{ width: progressPercent }}
        />
      </div>

      {/* Summary Context Strip (Steps 2 & 3) */}
      {currentStep > 1 && draft.itemName && (
        <div className="mt-2 bg-white border border-[#DCE8DA] rounded-xl px-4 py-2.5 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            {draft.customImage ? (
              <img
                src={draft.customImage}
                alt={draft.itemName}
                className="w-6 h-6 rounded-md object-cover border border-[#DCE8DA] shrink-0"
              />
            ) : (
              <div className="w-2 h-2 rounded-full bg-[#2C5B47] shrink-0" aria-hidden="true" />
            )}
            <p className="text-sm font-medium text-[#182B24] truncate">
              <span className="font-semibold">{draft.itemName}</span>
              <span className="text-[#66736B] mx-1.5">/</span>
              <span className="capitalize">{draft.condition.replace('_', ' ')}</span>
              {draft.problem && (
                <>
                  <span className="text-[#66736B] mx-1.5">/</span>
                  <span className="text-[#66736B] truncate">{draft.problem}</span>
                </>
              )}
            </p>
          </div>
          {onEdit && (
            <button
              onClick={onEdit}
              className="min-h-[44px] px-2.5 py-1 text-xs font-semibold text-[#2C5B47] hover:text-[#173D32] hover:bg-[#F3F4EE] rounded-lg transition-colors flex items-center gap-1 shrink-0"
              aria-label="Edit assessment details"
            >
              <span>Edit</span>
              <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
