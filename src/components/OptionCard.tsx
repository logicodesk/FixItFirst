import React from 'react';
import {
  Wrench,
  Recycle as RecycleIcon,
  Shuffle,
  ShoppingBag,
  Repeat,
  Trash2,
  ArrowRight,
  ChevronRight,
  Check,
  Tag,
  IndianRupee,
  Clock,
  Leaf,
  AlertTriangle,
} from 'lucide-react';
import { OptionDetail, ActionType } from '../types';
import { FitBadge } from './FitBadge';

interface OptionCardProps {
  option: OptionDetail;
  onSelect: (option: OptionDetail) => void;
  isCompareMode?: boolean;
  isCompareSelected?: boolean;
  onToggleCompare?: (action: ActionType) => void;
  index: number;
}

export const OptionCard: React.FC<OptionCardProps> = ({
  option,
  onSelect,
  isCompareMode = false,
  isCompareSelected = false,
  onToggleCompare,
  index,
}) => {
  const isBestFit = option.fit === 'best_fit';

  const getActionIcon = (action: ActionType) => {
    switch (action) {
      case 'repair':
        return <Wrench className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />;
      case 'recycle':
        return <RecycleIcon className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />;
      case 'repurpose':
        return <Shuffle className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />;
      case 'replace':
        return <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />;
      case 'reuse':
        return <Repeat className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />;
      case 'discard':
        return <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />;
    }
  };

  return (
    <article
      className={`relative flex flex-col justify-between rounded-2xl p-5 sm:p-6 transition-all duration-200 border ${
        isBestFit
          ? 'bg-[#DCE8DA]/95 backdrop-blur-xs border-[#C3D7BF] shadow-sm hover:shadow-md hover:-translate-y-1 ring-1 ring-[#173D32]/10'
          : 'bg-white/95 backdrop-blur-xs border-[#DCE8DA] shadow-xs hover:border-[#2C5B47]/40 hover:-translate-y-1 hover:shadow-md'
      }`}
    >
      {/* Best fit visual ribbon / recommendation tag */}
      {isBestFit && (
        <div className="absolute -top-3 left-6 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#173D32] text-white text-xs font-semibold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#CBEA72]" aria-hidden="true" />
          <span>Top recommendation</span>
        </div>
      )}

      {/* Compare selection checkbox */}
      {isCompareMode && (
        <div className="absolute top-4 right-4 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare?.(option.action);
            }}
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border transition-colors ${
              isCompareSelected
                ? 'bg-[#173D32] border-[#173D32] text-white'
                : 'bg-white border-[#DCE8DA] text-[#66736B] hover:border-[#173D32]'
            }`}
            aria-label={`${isCompareSelected ? 'Deselect' : 'Select'} ${option.title} for comparison`}
            aria-checked={isCompareSelected}
            role="checkbox"
          >
            <div
              className={`w-5 h-5 rounded flex items-center justify-center ${
                isCompareSelected ? 'bg-[#173D32] text-[#CBEA72]' : 'border border-[#66736B]'
              }`}
            >
              {isCompareSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </button>
        </div>
      )}

      <div>
        {/* Top Header: Icon + Name + Fit Badge */}
        <div className="flex items-start justify-between gap-3 mb-3 pt-1">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${
                isBestFit
                  ? 'bg-[#173D32] text-[#CBEA72] shadow-xs'
                  : 'bg-[#F3F4EE] text-[#2C5B47]'
              }`}
            >
              {getActionIcon(option.action)}
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[#66736B] font-semibold block">
                Option 0{index + 1}
              </span>
              <h3 className="text-xl font-bold text-[#182B24] leading-tight">
                {option.title}
              </h3>
            </div>
          </div>

          <div className={isCompareMode ? 'mr-10' : ''}>
            <FitBadge fit={option.fit} />
          </div>
        </div>

        {/* Reason */}
        <p className="text-sm text-[#182B24] font-medium leading-relaxed mb-3">
          {option.reason}
        </p>

        {/* Inexpensive Household Fix Callout */}
        {option.householdFix && (
          <div className="mb-3.5 p-3 rounded-xl bg-[#EBF5D8] border border-[#CDE5B3] flex items-start gap-2.5 shadow-2xs">
            <span className="text-base leading-none mt-0.5">💡</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="text-[11px] font-bold text-[#173D32]">
                  Household Fix (Desi Jugaad)
                </span>
                <span className="text-[10px] font-bold text-[#2C5B47] bg-white/80 px-1.5 py-0.5 rounded-full border border-[#CDE5B3]">
                  {option.householdFix.cost}
                </span>
              </div>
              <p className="text-xs text-[#2C5B47] font-medium leading-snug line-clamp-2">
                {option.householdFix.bestInexpensiveWay}
              </p>
            </div>
          </div>
        )}

        {/* Key Metrics Capsule Box */}
        <div
          className={`rounded-xl p-3 mb-4 space-y-2 border text-xs ${
            isBestFit
              ? 'bg-white/80 border-[#C3D7BF]'
              : 'bg-[#F7F8F2] border-[#E8E9E3]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#66736B]">
              <IndianRupee className="w-3.5 h-3.5 text-[#2C5B47]" aria-hidden="true" />
              <span>Cost</span>
            </span>
            <span className="font-semibold text-[#182B24]">
              {option.considerations.cost.value}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#66736B]">
              <Clock className="w-3.5 h-3.5 text-[#2C5B47]" aria-hidden="true" />
              <span>Time</span>
            </span>
            <span className="font-semibold text-[#182B24]">
              {option.considerations.time.value}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#66736B]">
              <Leaf className="w-3.5 h-3.5 text-[#2C5B47]" aria-hidden="true" />
              <span>Eco Benefit</span>
            </span>
            <span className="font-semibold text-[#182B24]">
              {option.considerations.impact.value}
            </span>
          </div>
        </div>
      </div>

      {/* Card Action Area */}
      <div className="pt-2">
        <button
          onClick={() => onSelect(option)}
          className={`w-full min-h-[44px] px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
            isBestFit
              ? 'bg-[#173D32] hover:bg-[#2C5B47] text-white shadow-xs'
              : 'bg-[#F3F4EE] hover:bg-[#E8E9E3] text-[#182B24]'
          }`}
          aria-label={`See why ${option.title} is rated ${option.fitLabel}`}
        >
          <span>See why</span>
          {isBestFit ? (
            <ArrowRight className="w-4 h-4 text-[#CBEA72]" aria-hidden="true" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[#66736B]" aria-hidden="true" />
          )}
        </button>
      </div>
    </article>
  );
};
