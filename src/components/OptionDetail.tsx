import React, { useState } from 'react';
import {
  X,
  ArrowLeft,
  Check,
  AlertCircle,
  Lightbulb,
  Bookmark,
  Share2,
  Wrench,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Clock,
  IndianRupee,
  HandMetal,
  Leaf,
  Recycle,
  Sparkles,
  Home,
} from 'lucide-react';
import { OptionDetail as OptionDetailType, ActionType } from '../types';
import { FitBadge } from './FitBadge';

interface OptionDetailProps {
  option: OptionDetailType;
  itemName: string;
  problem: string;
  onClose: () => void;
  onCommitPath: (option: OptionDetailType, completedChecklists: string[]) => void;
  onSelectSubsequent?: (action: ActionType) => void;
  isCommitted?: boolean;
  userImage?: string;
}

export const OptionDetail: React.FC<OptionDetailProps> = ({
  option,
  itemName,
  problem,
  onClose,
  onCommitPath,
  onSelectSubsequent,
  isCommitted = false,
  userImage,
}) => {
  // Checklist local state
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    // Default first mandatory safety item checked if already inspected
    const firstSafety = option.checklists.find(c => c.isMandatorySafety);
    return firstSafety ? [firstSafety.id] : [];
  });

  const [hasSaved, setHasSaved] = useState(isCommitted);
  const [savedForLater, setSavedForLater] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  const toggleChecklist = (id: string) => {
    setCompletedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleChoose = () => {
    setHasSaved(true);
    onCommitPath(option, completedIds);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Fix It First: ${option.title} for ${itemName}`,
          text: `Reviewing options to ${option.title.toLowerCase()} my ${itemName}.`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2500);
    }
  };

  const completedCount = completedIds.length;
  const totalChecklists = option.checklists.length;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="option-detail-title"
    >
      <div className="w-full max-w-4xl min-h-screen bg-[#F7F8F2] flex flex-col shadow-2xl relative">
        {/* Sticky Top Header Bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#DCE8DA] px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <button
            onClick={onClose}
            className="min-h-[44px] px-3 py-2 text-sm font-semibold text-[#2C5B47] hover:text-[#173D32] hover:bg-[#F3F4EE] rounded-lg transition-colors flex items-center gap-1.5"
            aria-label="Back to options"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to options</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSavedForLater(prev => !prev)}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border transition-colors ${
                savedForLater
                  ? 'bg-[#173D32] text-[#CBEA72] border-[#173D32]'
                  : 'bg-white text-[#66736B] border-[#DCE8DA] hover:text-[#182B24]'
              }`}
              aria-label="Bookmark this assessment"
              title="Save for later"
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-white text-[#66736B] border border-[#DCE8DA] hover:text-[#182B24] transition-colors"
              aria-label="Share assessment"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-white text-[#66736B] border border-[#DCE8DA] hover:text-[#182B24] hover:bg-[#F3F4EE] transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1 flex flex-col gap-6 max-w-4xl mx-auto w-full">
          {/* Hero Surface */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-[#DCE8DA] shadow-xs relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <FitBadge fit={option.fit} />
              <div className="text-xs text-[#66736B] font-medium bg-[#F3F4EE] px-3 py-1 rounded-full">
                Estimated fix: {option.considerations.time.value}
              </div>
            </div>

            <h1
              id="option-detail-title"
              className="text-2xl sm:text-3xl font-bold text-[#182B24] tracking-tight mb-1"
            >
              Why {option.title} makes sense
            </h1>

            <p className="text-sm text-[#66736B] mb-6">
              {itemName} · {problem || 'Inspection'}
            </p>

            {/* Optional Contextual Photo (User photo or pathway photo) */}
            {(userImage || option.imagePath) && (
              <div className="relative w-full h-52 sm:h-64 rounded-xl overflow-hidden mb-6 bg-[#EDEEE8] shadow-xs">
                <img
                  src={userImage || option.imagePath}
                  alt={userImage ? `Your ${itemName}` : `${option.title} reference photo`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                  <div className="text-xs text-white font-medium flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#CBEA72]" />
                      <span>{userImage ? `Your ${itemName} photo` : 'Component-level restoration · High feasibility score'}</span>
                    </div>
                    {userImage && (
                      <span className="text-[11px] text-[#DCE8DA] bg-black/40 px-2 py-0.5 rounded-full font-normal">
                        Assessing your item
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Why This Could Make Sense */}
            <div>
              <h2 className="text-base font-bold text-[#182B24] mb-3">
                Why this could make sense
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {option.reasons.map((r, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-[#F7F8F2] border border-[#DCE8DA] text-xs flex flex-col justify-between"
                  >
                    <p className="text-[#182B24] font-medium leading-relaxed mb-2">
                      {r}
                    </p>
                    <div className="flex items-center gap-1 text-[#2C5B47] font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Verified principle</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Best Inexpensive Household Way to Fix It */}
          {option.householdFix && (
            <section className="bg-gradient-to-br from-[#173D32] to-[#20493B] text-white rounded-2xl p-6 sm:p-7 shadow-md border border-[#2C5B47] relative overflow-hidden">
              {/* Subtle decorative glow */}
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#CBEA72]/15 blur-2xl pointer-events-none" />

              {/* Section Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CBEA72] text-[#173D32] text-xs font-bold shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Best Inexpensive Way to Fix It</span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#2C5B47] text-[#CBEA72] border border-[#3E705A]">
                  Est. Cost: {option.householdFix.cost}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-3">
                {option.householdFix.title}
              </h2>

              {/* The Best Inexpensive Way Callout */}
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 mb-5">
                <p className="text-xs uppercase tracking-wider text-[#CBEA72] font-bold mb-1">
                  💡 The Low-Cost Household Hack (Desi Jugaad)
                </p>
                <p className="text-sm font-semibold text-white leading-relaxed">
                  {option.householdFix.bestInexpensiveWay}
                </p>
              </div>

              {/* Household Materials Needed */}
              <div className="mb-5">
                <h3 className="text-xs uppercase tracking-wider text-[#A7CFC0] font-bold mb-2 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-[#CBEA72]" />
                  <span>Household Materials You Can Use</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {option.householdFix.materialsNeeded.map((mat, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs bg-white/10 border border-white/15 text-[#EDF4EC] font-medium"
                    >
                      {mat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Household Fix Method */}
              <div className="mb-4">
                <h3 className="text-xs uppercase tracking-wider text-[#A7CFC0] font-bold mb-2.5 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-[#CBEA72]" />
                  <span>How to Fix It at Home (Step-by-Step)</span>
                </h3>
                <div className="space-y-2.5">
                  {option.householdFix.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl bg-black/20 border border-white/10 text-xs sm:text-sm text-[#E2ECE4]"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#CBEA72] text-[#173D32] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safety notice if present */}
              {option.householdFix.safetyNotice && (
                <div className="p-3 rounded-xl bg-[#93000A]/30 border border-[#FFDAD6]/20 flex items-start gap-2 text-xs text-[#FFDAD6]">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-[#FFB4AB] mt-0.5" />
                  <p>{option.householdFix.safetyNotice}</p>
                </div>
              )}
            </section>
          )}

          {/* Things to Consider (Word-based Meters) */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-[#DCE8DA] shadow-xs">
            <h2 className="text-base font-bold text-[#182B24] mb-1">
              Things to consider
            </h2>
            <p className="text-xs text-[#66736B] mb-4">
              Pragmatic expectations before you pick up tools or make a trip
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cost Meter */}
              <div className="p-4 rounded-xl bg-[#F7F8F2] border border-[#DCE8DA]">
                <div className="flex items-center justify-between text-xs text-[#66736B] mb-1">
                  <span className="font-semibold uppercase tracking-wider">Estimated Cost</span>
                  <IndianRupee className="w-4 h-4 text-[#2C5B47]" />
                </div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-lg font-bold text-[#182B24]">
                    {option.considerations.cost.level}
                  </span>
                  <span className="text-xs font-semibold text-[#2C5B47]">
                    {option.considerations.cost.value}
                  </span>
                </div>
                <div className="w-full bg-[#E2E3DD] h-1.5 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="bg-[#2C5B47] h-full rounded-full"
                    style={{ width: `${option.considerations.cost.barPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#66736B]">
                  {option.considerations.cost.note}
                </p>
              </div>

              {/* Effort Meter */}
              <div className="p-4 rounded-xl bg-[#F7F8F2] border border-[#DCE8DA]">
                <div className="flex items-center justify-between text-xs text-[#66736B] mb-1">
                  <span className="font-semibold uppercase tracking-wider">Physical Effort</span>
                  <HandMetal className="w-4 h-4 text-[#2C5B47]" />
                </div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-lg font-bold text-[#182B24]">
                    {option.considerations.effort.level}
                  </span>
                  <span className="text-xs font-semibold text-[#2C5B47]">
                    {option.considerations.effort.value}
                  </span>
                </div>
                <div className="w-full bg-[#E2E3DD] h-1.5 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="bg-[#2C5B47] h-full rounded-full"
                    style={{ width: `${option.considerations.effort.barPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#66736B]">
                  {option.considerations.effort.note}
                </p>
              </div>

              {/* Time Meter */}
              <div className="p-4 rounded-xl bg-[#F7F8F2] border border-[#DCE8DA]">
                <div className="flex items-center justify-between text-xs text-[#66736B] mb-1">
                  <span className="font-semibold uppercase tracking-wider">Time Investment</span>
                  <Clock className="w-4 h-4 text-[#2C5B47]" />
                </div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-lg font-bold text-[#182B24]">
                    {option.considerations.time.level}
                  </span>
                  <span className="text-xs font-semibold text-[#2C5B47]">
                    {option.considerations.time.value}
                  </span>
                </div>
                <div className="w-full bg-[#E2E3DD] h-1.5 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="bg-[#2C5B47] h-full rounded-full"
                    style={{ width: `${option.considerations.time.barPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#66736B]">
                  {option.considerations.time.note}
                </p>
              </div>

              {/* Safety Meter */}
              <div className="p-4 rounded-xl bg-[#F7F8F2] border border-[#DCE8DA]">
                <div className="flex items-center justify-between text-xs text-[#66736B] mb-1">
                  <span className="font-semibold uppercase tracking-wider">Safety Risk</span>
                  <ShieldAlert className="w-4 h-4 text-[#2C5B47]" />
                </div>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-lg font-bold text-[#182B24]">
                    {option.considerations.safety.level}
                  </span>
                  <span className="text-xs font-semibold text-[#93000A]">
                    {option.considerations.safety.value}
                  </span>
                </div>
                <div className="w-full bg-[#E2E3DD] h-1.5 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="bg-[#CBEA72] h-full rounded-full"
                    style={{ width: `${option.considerations.safety.barPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#66736B]">
                  {option.considerations.safety.note}
                </p>
              </div>
            </div>
          </section>

          {/* Next Steps Interactive Checklist */}
          <section className="bg-white rounded-2xl p-6 sm:p-8 border border-[#DCE8DA] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[#182B24]">
                  Next steps checklist
                </h2>
                <p className="text-xs text-[#66736B]">
                  Check off items as you work through the diagnostic sequence
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#DCE8DA] text-[#173D32]">
                {completedCount} of {totalChecklists} done
              </span>
            </div>

            <div className="space-y-2.5">
              {option.checklists.map(item => {
                const isChecked = completedIds.includes(item.id);

                return (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors cursor-pointer select-none ${
                      isChecked
                        ? 'bg-[#DCE8DA]/40 border-[#C3D7BF]'
                        : 'bg-[#F7F8F2] border-[#DCE8DA] hover:bg-[#F3F4EE]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleChecklist(item.id)}
                      className="mt-0.5 w-5 h-5 rounded border-[#2C5B47] text-[#173D32] focus:ring-[#CBEA72] cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-sm font-semibold ${
                            isChecked ? 'line-through text-[#66736B]' : 'text-[#182B24]'
                          }`}
                        >
                          {item.text}
                        </span>
                        {item.isMandatorySafety && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#FFDAD6] text-[#93000A]">
                            Mandatory safety
                          </span>
                        )}
                      </div>
                      {item.detail && (
                        <p className="text-xs text-[#66736B] mt-0.5 leading-relaxed">
                          {item.detail}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>

            {/* Subsequent fallback option if repair fails */}
            {option.subsequentAction && onSelectSubsequent && (
              <div className="mt-5 p-3.5 rounded-xl bg-[#F3F4EE] border border-[#DCE8DA] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-[#182B24]">
                  <Recycle className="w-4 h-4 text-[#2C5B47] shrink-0" />
                  <span>
                    Still not working after checking all steps?
                  </span>
                </div>
                <button
                  onClick={() => onSelectSubsequent(option.subsequentAction!)}
                  className="min-h-[44px] px-3 py-1.5 text-xs font-semibold text-[#173D32] bg-white border border-[#DCE8DA] hover:bg-[#DCE8DA] rounded-lg transition-colors flex items-center gap-1 shrink-0"
                >
                  <span>Try Recycle next</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}
          </section>

          {/* Tools & Community Wisdom */}
          {(option.toolsNeeded || option.communityTip) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {option.toolsNeeded && (
                <div className="bg-white rounded-2xl p-5 border border-[#DCE8DA] shadow-xs">
                  <h3 className="text-sm font-bold text-[#182B24] mb-2 flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-[#2C5B47]" />
                    <span>Tools you will need</span>
                  </h3>
                  <ul className="space-y-1.5 text-xs text-[#66736B]">
                    {option.toolsNeeded.map((t, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2C5B47]" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {option.communityTip && (
                <div className="bg-[#173D32] text-white rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-[#CBEA72] text-xs font-semibold uppercase tracking-wider mb-2">
                      <Lightbulb className="w-4 h-4" />
                      <span>Community wisdom</span>
                    </div>
                    <p className="text-xs text-[#DCE8DA] leading-relaxed mb-3">
                      “{option.communityTip}”
                    </p>
                  </div>
                  <div className="text-[11px] text-[#A7CFC0]">
                    Verified Fix It First DIY Tip
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Commitment Action Bar */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-[#DCE8DA] p-4 rounded-xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-left">
              <p className="text-sm font-bold text-[#182B24]">
                {hasSaved ? 'Pathway bookmarked in your history' : `Ready to pursue ${option.title}?`}
              </p>
              <p className="text-xs text-[#66736B]">
                {hasSaved
                  ? 'Access your checklist anytime in session history'
                  : 'Saves your progress and checklist items'}
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleChoose}
                disabled={hasSaved}
                className={`flex-1 sm:flex-initial min-h-[44px] px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  hasSaved
                    ? 'bg-[#DCE8DA] text-[#173D32] cursor-default'
                    : 'bg-[#CBEA72] hover:bg-[#b8dc5c] text-[#182B24] shadow-sm'
                }`}
              >
                {hasSaved ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Chosen pathway</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Choose this path</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Toast */}
        {showShareToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#173D32] text-white text-xs font-medium px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#CBEA72]" />
            <span>Link copied to clipboard</span>
          </div>
        )}
      </div>
    </div>
  );
};
