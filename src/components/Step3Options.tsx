import React, { useState } from 'react';
import {
  ShieldAlert,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  LayoutGrid,
  Check,
  RotateCcw,
  Lightbulb,
} from 'lucide-react';
import { AssessmentDraft, OptionDetail as OptionDetailType, ActionType } from '../types';
import { OptionCard } from './OptionCard';
import { CompareTable } from './CompareTable';
import { OptionDetail } from './OptionDetail';
import { ScoreOptionsResult } from '../engine/scoreOptions';

interface Step3OptionsProps {
  draft: AssessmentDraft;
  scoreResult: ScoreOptionsResult;
  onEdit: () => void;
  onCommitPath: (option: OptionDetailType, completedChecklists: string[]) => void;
  committedOptionAction?: ActionType;
}

export const Step3Options: React.FC<Step3OptionsProps> = ({
  draft,
  scoreResult,
  onEdit,
  onCommitPath,
  committedOptionAction,
}) => {
  const [activeOption, setActiveOption] = useState<OptionDetailType | null>(null);
  const [isCompareView, setIsCompareView] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<ActionType[]>([]);
  const [isCompareSelectionMode, setIsCompareSelectionMode] = useState(false);

  const toggleCompareSelection = (action: ActionType) => {
    setSelectedForCompare(prev => {
      if (prev.includes(action)) {
        return prev.filter(a => a !== action);
      }
      if (prev.length >= 3) {
        // limit to 3 items
        return [...prev.slice(1), action];
      }
      return [...prev, action];
    });
  };

  const handleLaunchCompare = () => {
    setIsCompareView(true);
  };

  const optionsToCompare =
    selectedForCompare.length >= 2
      ? scoreResult.options.filter(o => selectedForCompare.includes(o.action))
      : scoreResult.options.slice(0, 3); // Default top 3

  const isLamp = draft.itemName.toLowerCase().includes('lamp') || draft.itemName.toLowerCase().includes('light');

  // If in side-by-side comparison matrix view
  if (isCompareView) {
    return (
      <CompareTable
        options={optionsToCompare}
        itemName={draft.itemName}
        userImage={draft.customImage}
        onBack={() => setIsCompareView(false)}
        onSelectOption={(opt) => {
          setIsCompareView(false);
          setActiveOption(opt);
        }}
      />
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Screen Narrative Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#182B24] tracking-tight">
            Here's what you could do
          </h1>
          <p className="text-sm sm:text-base text-[#66736B] mt-1.5">
            Ranked by feasibility, cost, and eco-impact. You have 6 potential pathways.
          </p>
        </div>

        {/* View & Compare Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={() => {
              if (isCompareSelectionMode) {
                setIsCompareSelectionMode(false);
                setSelectedForCompare([]);
              } else {
                setIsCompareSelectionMode(true);
                // Preselect top 2
                setSelectedForCompare([scoreResult.options[0].action, scoreResult.options[1].action]);
              }
            }}
            className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              isCompareSelectionMode
                ? 'bg-[#173D32] text-[#CBEA72] border-[#173D32]'
                : 'bg-white border-[#DCE8DA] text-[#182B24] hover:bg-[#F3F4EE]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isCompareSelectionMode ? 'Cancel pick' : 'Select to compare'}</span>
          </button>

          <button
            type="button"
            onClick={handleLaunchCompare}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#CBEA72] hover:bg-[#b8dc5c] text-[#182B24] text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span>Compare side-by-side</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Compare selection bar if active */}
      {isCompareSelectionMode && (
        <div className="bg-[#DCE8DA] border border-[#C3D7BF] rounded-xl p-3 px-4 flex items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-[#173D32]">
            Pick 2 or 3 options ({selectedForCompare.length} selected):
          </span>
          <button
            type="button"
            disabled={selectedForCompare.length < 2}
            onClick={handleLaunchCompare}
            className="min-h-[36px] px-3 py-1.5 bg-[#173D32] text-white disabled:opacity-50 rounded-lg font-bold"
          >
            View comparison ({selectedForCompare.length})
          </button>
        </div>
      )}

      {/* Safety Caution Banner */}
      {scoreResult.safetyFlag && (
        <section
          className="bg-[#FBF4DE] border border-[#EFE3B8] text-[#29220A] rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs"
          role="alert"
        >
          <div className="w-9 h-9 rounded-full bg-[#EFE3B8] flex items-center justify-center shrink-0 text-[#4D3F00] mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-[#2C240A] mb-0.5">
              {scoreResult.safetyNotice?.title || 'Safety Precaution'}
            </h2>
            <p className="text-xs sm:text-sm text-[#463D1F] leading-relaxed">
              {scoreResult.safetyNotice?.description ||
                'This one can be risky. If you are unsure, ask a professional before opening components.'}
            </p>
          </div>
        </section>
      )}

      {/* Responsive Grid of 6 Decision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {scoreResult.options.map((option, idx) => (
          <OptionCard
            key={option.action}
            index={idx}
            option={option}
            onSelect={(opt) => setActiveOption(opt)}
            isCompareMode={isCompareSelectionMode}
            isCompareSelected={selectedForCompare.includes(option.action)}
            onToggleCompare={toggleCompareSelection}
          />
        ))}
      </div>

      {/* Helpful Decision Prompt / Diagnostic Encouragement */}
      <div className="rounded-2xl bg-white border border-[#DCE8DA] p-4 sm:p-5 flex items-center gap-3.5 shadow-xs">
        <Lightbulb className="w-6 h-6 text-[#2C5B47] shrink-0" />
        <p className="text-xs sm:text-sm text-[#66736B] leading-relaxed">
          Need quick diagnostic steps? Starting with{' '}
          <strong className="text-[#182B24]">Repair</strong> takes only 5–15 minutes with our guided bulb check.
        </p>
      </div>

      {/* Option Detail Drawer / Modal */}
      {activeOption && (
        <OptionDetail
          option={activeOption}
          itemName={draft.itemName}
          problem={draft.problem}
          userImage={draft.customImage}
          onClose={() => setActiveOption(null)}
          onCommitPath={(opt, checklists) => {
            onCommitPath(opt, checklists);
          }}
          onSelectSubsequent={(action) => {
            const nextOpt = scoreResult.options.find(o => o.action === action);
            if (nextOpt) setActiveOption(nextOpt);
          }}
          isCommitted={committedOptionAction === activeOption.action}
        />
      )}
    </div>
  );
};
