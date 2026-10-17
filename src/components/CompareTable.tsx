import React from 'react';
import {
  ArrowLeft,
  IndianRupee,
  HandMetal,
  Clock,
  ShieldAlert,
  Leaf,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { OptionDetail } from '../types';
import { FitBadge } from './FitBadge';

interface CompareTableProps {
  options: OptionDetail[];
  onBack: () => void;
  onSelectOption: (option: OptionDetail) => void;
  itemName: string;
  userImage?: string;
}

export const CompareTable: React.FC<CompareTableProps> = ({
  options,
  onBack,
  onSelectOption,
  itemName,
  userImage,
}) => {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="min-h-[44px] inline-flex items-center gap-2 text-sm font-semibold text-[#2C5B47] hover:text-[#173D32] transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to cards grid</span>
        </button>
        <span className="text-xs text-[#66736B] bg-[#EDEEE8] px-3 py-1 rounded-full font-medium">
          Side-by-side evaluation for {itemName}
        </span>
      </div>

      {/* Narrative Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#182B24] tracking-tight">
            Compare Pathways: {itemName}
          </h2>
          <p className="text-sm text-[#66736B] mt-1 max-w-2xl">
            Evaluate costs, effort, safety, and eco-impact across options to find what works best for your schedule and budget.
          </p>
        </div>

        {userImage && (
          <div className="flex items-center gap-3 bg-white border border-[#DCE8DA] p-2 pr-3.5 rounded-xl shadow-xs shrink-0 self-start sm:self-auto">
            <img
              src={userImage}
              alt="Your uploaded item"
              className="w-10 h-10 rounded-lg object-cover border border-[#DCE8DA]"
            />
            <div className="text-left">
              <span className="text-[11px] font-bold text-[#173D32] block">Your Photo</span>
              <span className="text-[10px] text-[#66736B]">Personalized guide</span>
            </div>
          </div>
        )}
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {options.map((option, idx) => {
          const isBestFit = option.fit === 'best_fit';

          return (
            <div
              key={option.action}
              className={`rounded-2xl p-5 sm:p-6 flex flex-col justify-between border transition-all ${
                isBestFit
                  ? 'bg-[#DCE8DA] border-[#C3D7BF] shadow-md ring-1 ring-[#173D32]/10'
                  : 'bg-white border-[#DCE8DA] shadow-xs'
              }`}
            >
              <div>
                {/* Pathway Label */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#66736B]">
                    Pathway 0{idx + 1}
                  </span>
                  <FitBadge fit={option.fit} />
                </div>

                <h3 className="text-xl font-bold text-[#182B24] mb-1">
                  {option.title}
                </h3>
                <p className="text-xs text-[#66736B] mb-4">{option.subtitle}</p>

                {/* Optional Photo Thumbnail */}
                {option.imagePath && (
                  <div className="w-full h-36 rounded-xl overflow-hidden mb-4 bg-[#EDEEE8] relative">
                    <img
                      src={option.imagePath}
                      alt={option.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Household Fix Callout if available */}
                {option.householdFix && (
                  <div className="mb-3 p-2.5 rounded-xl bg-[#EBF5D8] border border-[#CDE5B3] text-xs">
                    <div className="flex items-center justify-between font-bold text-[#173D32] mb-0.5 text-[11px]">
                      <span>💡 Best Household Fix</span>
                      <span className="text-[#2C5B47]">{option.householdFix.cost}</span>
                    </div>
                    <p className="text-[11px] text-[#2C5B47] line-clamp-2 leading-tight">
                      {option.householdFix.bestInexpensiveWay}
                    </p>
                  </div>
                )}

                {/* Metric Rows */}
                <div className="space-y-3 text-xs">
                  {/* Cost */}
                  <div className="p-2.5 rounded-lg bg-white/70 border border-[#DCE8DA]/60">
                    <div className="flex items-center justify-between font-semibold text-[#182B24] mb-0.5">
                      <span className="flex items-center gap-1.5 text-[#66736B]">
                        <IndianRupee className="w-3.5 h-3.5 text-[#2C5B47]" />
                        Estimated Cost
                      </span>
                      <span>{option.considerations.cost.value}</span>
                    </div>
                    <p className="text-[11px] text-[#66736B]">{option.considerations.cost.note}</p>
                  </div>

                  {/* Effort */}
                  <div className="p-2.5 rounded-lg bg-white/70 border border-[#DCE8DA]/60">
                    <div className="flex items-center justify-between font-semibold text-[#182B24] mb-0.5">
                      <span className="flex items-center gap-1.5 text-[#66736B]">
                        <HandMetal className="w-3.5 h-3.5 text-[#2C5B47]" />
                        Required Effort
                      </span>
                      <span>{option.considerations.effort.value}</span>
                    </div>
                    <p className="text-[11px] text-[#66736B]">{option.considerations.effort.note}</p>
                  </div>

                  {/* Time */}
                  <div className="p-2.5 rounded-lg bg-white/70 border border-[#DCE8DA]/60">
                    <div className="flex items-center justify-between font-semibold text-[#182B24] mb-0.5">
                      <span className="flex items-center gap-1.5 text-[#66736B]">
                        <Clock className="w-3.5 h-3.5 text-[#2C5B47]" />
                        Time Needed
                      </span>
                      <span>{option.considerations.time.value}</span>
                    </div>
                    <p className="text-[11px] text-[#66736B]">{option.considerations.time.note}</p>
                  </div>

                  {/* Safety */}
                  <div className="p-2.5 rounded-lg bg-white/70 border border-[#DCE8DA]/60">
                    <div className="flex items-center justify-between font-semibold text-[#182B24] mb-0.5">
                      <span className="flex items-center gap-1.5 text-[#66736B]">
                        <ShieldAlert className="w-3.5 h-3.5 text-[#2C5B47]" />
                        Safety Risk
                      </span>
                      <span>{option.considerations.safety.level}</span>
                    </div>
                    <p className="text-[11px] text-[#66736B]">{option.considerations.safety.note}</p>
                  </div>

                  {/* Eco Benefit */}
                  <div className="p-2.5 rounded-lg bg-white/70 border border-[#DCE8DA]/60">
                    <div className="flex items-center justify-between font-semibold text-[#182B24] mb-0.5">
                      <span className="flex items-center gap-1.5 text-[#66736B]">
                        <Leaf className="w-3.5 h-3.5 text-[#2C5B47]" />
                        Eco Benefit
                      </span>
                      <span>{option.considerations.impact.value}</span>
                    </div>
                    <p className="text-[11px] text-[#66736B]">{option.considerations.impact.note}</p>
                  </div>

                  {/* Optimal Criteria */}
                  <div className="p-2.5 rounded-lg bg-white/90 border border-[#DCE8DA] mt-2">
                    <div className="flex items-center gap-1 text-[#2C5B47] font-semibold mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Best when:</span>
                    </div>
                    <p className="text-[11px] text-[#182B24] leading-relaxed">
                      {option.optimalCriteria}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-5 mt-4">
                <button
                  onClick={() => onSelectOption(option)}
                  className={`w-full min-h-[44px] px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                    isBestFit
                      ? 'bg-[#173D32] hover:bg-[#2C5B47] text-white shadow-xs'
                      : 'bg-[#F3F4EE] hover:bg-[#E8E9E3] text-[#182B24]'
                  }`}
                >
                  <span>Choose {option.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
