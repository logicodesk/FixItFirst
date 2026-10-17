import React, { useState } from 'react';
import {
  Search,
  X,
  Lightbulb,
  Armchair,
  Shirt,
  Headphones,
  Box,
  Footprints,
  ShoppingBag,
  Wrench,
  Clock,
  Sparkles,
  Check,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { AssessmentDraft, ConditionType } from '../types';
import { detectCategory, ASSET_IMAGES } from '../engine/scoreOptions';
import { CameraCapture } from './CameraCapture';
import logoBadge from '../assets/logo-badge.png';

interface Step1ItemProps {
  draft: AssessmentDraft;
  onUpdateDraft: (partial: Partial<AssessmentDraft>) => void;
  onNext: () => void;
}

const QUICK_PICK_ITEMS = [
  { label: 'Lamp', icon: Lightbulb, value: 'Desk lamp' },
  { label: 'Chair', icon: Armchair, value: 'Office swivel chair' },
  { label: 'Shirt', icon: Shirt, value: 'Cotton shirt' },
  { label: 'Headphones', icon: Headphones, value: 'Headphones' },
  { label: 'Container', icon: Box, value: 'Food container' },
  { label: 'Shoes', icon: Footprints, value: 'Running shoes' },
  { label: 'Bag', icon: ShoppingBag, value: 'Backpack' },
];

export const Step1Item: React.FC<Step1ItemProps> = ({
  draft,
  onUpdateDraft,
  onNext,
}) => {
  const [error, setError] = useState<string | null>(null);

  const recognizedCategory = detectCategory(draft.itemName);
  const isLamp = draft.itemName.toLowerCase().includes('lamp') || draft.itemName.toLowerCase().includes('light');

  const handleSelectQuickPick = (itemValue: string) => {
    onUpdateDraft({ itemName: itemValue });
    setError(null);
  };

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.itemName.trim()) {
      setError('Please enter the name of the item you want to assess.');
      return;
    }
    setError(null);
    onNext();
  };

  return (
    <form onSubmit={handleContinue} className="w-full flex flex-col gap-6">
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCE8DA] text-[#173D32] text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2C5B47]" />
            <span>Conscious assessment • Indian cost calibration</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#182B24] tracking-tight">
            What would you like to fix?
          </h1>
          <p className="text-sm sm:text-base text-[#66736B] mt-1.5">
            Start with your household item. Compare Repair, Reuse, Repurpose, Replace, Recycle & Discard.
          </p>
        </div>

        <div className="hidden md:flex items-center gap-3 bg-white/90 border border-[#DCE8DA] p-3 rounded-2xl shadow-xs shrink-0">
          <img
            src={logoBadge}
            alt="Fix It First Logo"
            className="w-11 h-11 rounded-full border border-[#DCE8DA] bg-[#FAF8F5] p-0.5 object-contain"
          />
          <div>
            <p className="text-xs font-bold text-[#182B24] leading-tight">Fix It First</p>
            <p className="text-[10px] text-[#2C5B47] font-semibold uppercase tracking-wider">
              Repair • Reuse • Repurpose • Recycle
            </p>
            <p className="text-[10px] text-[#66736B]">Reasonable Indian standards</p>
          </div>
        </div>
      </div>

      {/* Item Input Field */}
      <section className="flex flex-col gap-2">
        <label
          htmlFor="item-name-input"
          className="text-sm font-semibold text-[#182B24] flex items-center justify-between"
        >
          <span>Item name</span>
          <span className="text-xs font-normal text-[#66736B]">Step 1 of assessment</span>
        </label>

        <div className="relative w-full rounded-xl bg-white border border-[#DCE8DA] shadow-xs focus-within:border-[#2C5B47] transition-all">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2C5B47]" />
          <input
            id="item-name-input"
            type="text"
            value={draft.itemName}
            onChange={(e) => {
              onUpdateDraft({ itemName: e.target.value });
              if (error) setError(null);
            }}
            placeholder="e.g. desk lamp, chair, jacket, headphones…"
            className="w-full pl-11 pr-11 py-3.5 rounded-xl bg-transparent text-sm sm:text-base text-[#182B24] placeholder:text-[#66736B]/60 focus:outline-none"
            autoFocus
          />
          {draft.itemName && (
            <button
              type="button"
              onClick={() => {
                onUpdateDraft({ itemName: '' });
                setError(null);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#F3F4EE] hover:bg-[#E8E9E3] text-[#66736B] flex items-center justify-center transition-colors"
              aria-label="Clear item input"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {error && (
          <p className="text-xs text-[#93000A] font-medium mt-1" role="alert">
            {error}
          </p>
        )}

        {/* Quick-Pick Popular Chips */}
        <div className="mt-2">
          <span className="text-xs text-[#66736B] font-medium block mb-2">
            Popular items to try
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_PICK_ITEMS.map((item) => {
              const Icon = item.icon;
              const isSelected = draft.itemName.toLowerCase() === item.value.toLowerCase();

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleSelectQuickPick(item.value)}
                  className={`min-h-[44px] px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-[#173D32] text-[#CBEA72] shadow-xs ring-1 ring-[#173D32]'
                      : 'bg-white border border-[#DCE8DA] text-[#182B24] hover:border-[#2C5B47]'
                  }`}
                  aria-pressed={isSelected}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Live Camera Capture Section */}
      <CameraCapture
        currentImage={draft.customImage}
        onCapture={(base64) => onUpdateDraft({ customImage: base64 })}
        onClear={() => onUpdateDraft({ customImage: undefined })}
        itemName={draft.itemName}
      />

      {/* Recognized Item Micro-Card */}
      {draft.itemName.trim() && (
        <div className="rounded-xl bg-white border border-[#DCE8DA] p-3.5 flex items-center gap-3.5 shadow-xs">
          <div className="w-14 h-14 rounded-lg bg-[#F7F8F2] overflow-hidden shrink-0 flex items-center justify-center border border-[#DCE8DA]">
            {draft.customImage ? (
              <img
                src={draft.customImage}
                alt="Your item"
                className="w-full h-full object-cover"
              />
            ) : isLamp ? (
              <img
                src={ASSET_IMAGES.lampWorkbench}
                alt="Desk lamp on workbench"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Lightbulb className="w-6 h-6 text-[#2C5B47]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#182B24] truncate">
              {draft.customImage ? `Your Photo: ${draft.itemName}` : `Identified: ${draft.itemName}`}
            </p>
            <p className="text-xs text-[#66736B] line-clamp-1">
              {draft.customImage
                ? 'Your custom photo is active and will guide all subsequent steps and checklist items.'
                : isLamp
                ? 'Small appliances & lamps have an 82% DIY repair success rate.'
                : recognizedCategory !== 'generic'
                ? `Mapped to ${recognizedCategory.replace('-', ' ')} diagnostic models.`
                : 'Custom item recognized. Our rule engine will guide you through 6 paths.'}
            </p>
          </div>
          <Sparkles className="w-4 h-4 text-[#2C5B47] shrink-0" aria-hidden="true" />
        </div>
      )}

      {/* Condition Selector Section */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#182B24]">
            What is the condition?
          </h2>
          <span className="text-xs text-[#2C5B47] font-semibold">Select one</span>
        </div>

        <div className="flex flex-col gap-3" role="radiogroup" aria-label="Item condition">
          {/* Option: Broken */}
          <label
            onClick={() => onUpdateDraft({ condition: 'broken' })}
            className={`cursor-pointer relative flex items-start gap-3.5 p-4 rounded-xl border transition-all select-none ${
              draft.condition === 'broken'
                ? 'bg-[#DCE8DA]/50 border-[#2C5B47] shadow-xs ring-1 ring-[#2C5B47]'
                : 'bg-white/95 backdrop-blur-xs border-[#DCE8DA] hover:border-[#2C5B47]/60 hover:-translate-y-0.5 hover:shadow-xs'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                draft.condition === 'broken'
                  ? 'bg-[#173D32] text-[#CBEA72]'
                  : 'bg-[#F3F4EE] text-[#2C5B47]'
              }`}
            >
              <Wrench className="w-5 h-5" />
            </div>
            <div className="flex-1 pr-8">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-bold text-[#182B24]">Broken</span>
                {draft.condition === 'broken' && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#CBEA72] text-[#182B24]">
                    Active focus
                  </span>
                )}
              </div>
              <p className="text-xs text-[#66736B] leading-relaxed">
                Doesn't work, cracked, snapped, or has faulty parts.
              </p>
            </div>
            <div
              className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center ${
                draft.condition === 'broken'
                  ? 'bg-[#173D32] text-[#CBEA72]'
                  : 'bg-[#E8E9E3] text-transparent'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
          </label>

          {/* Option: Worn out */}
          <label
            onClick={() => onUpdateDraft({ condition: 'worn_out' })}
            className={`cursor-pointer relative flex items-start gap-3.5 p-4 rounded-xl border transition-all select-none ${
              draft.condition === 'worn_out'
                ? 'bg-[#DCE8DA]/50 border-[#2C5B47] shadow-xs ring-1 ring-[#2C5B47]'
                : 'bg-white/95 backdrop-blur-xs border-[#DCE8DA] hover:border-[#2C5B47]/60 hover:-translate-y-0.5 hover:shadow-xs'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                draft.condition === 'worn_out'
                  ? 'bg-[#173D32] text-[#CBEA72]'
                  : 'bg-[#F3F4EE] text-[#2C5B47]'
              }`}
            >
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex-1 pr-8">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-bold text-[#182B24]">Worn out</span>
                {draft.condition === 'worn_out' && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#CBEA72] text-[#182B24]">
                    Active focus
                  </span>
                )}
              </div>
              <p className="text-xs text-[#66736B] leading-relaxed">
                Works partially, frayed, faded, or dull from regular use.
              </p>
            </div>
            <div
              className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center ${
                draft.condition === 'worn_out'
                  ? 'bg-[#173D32] text-[#CBEA72]'
                  : 'bg-[#E8E9E3] text-transparent'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
          </label>

          {/* Option: Unused */}
          <label
            onClick={() => onUpdateDraft({ condition: 'unused' })}
            className={`cursor-pointer relative flex items-start gap-3.5 p-4 rounded-xl border transition-all select-none ${
              draft.condition === 'unused'
                ? 'bg-[#DCE8DA]/50 border-[#2C5B47] shadow-xs ring-1 ring-[#2C5B47]'
                : 'bg-white/95 backdrop-blur-xs border-[#DCE8DA] hover:border-[#2C5B47]/60 hover:-translate-y-0.5 hover:shadow-xs'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                draft.condition === 'unused'
                  ? 'bg-[#173D32] text-[#CBEA72]'
                  : 'bg-[#F3F4EE] text-[#2C5B47]'
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1 pr-8">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-bold text-[#182B24]">Unused</span>
                {draft.condition === 'unused' && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#CBEA72] text-[#182B24]">
                    Active focus
                  </span>
                )}
              </div>
              <p className="text-xs text-[#66736B] leading-relaxed">
                In working order or intact, but sitting idle or unwanted.
              </p>
            </div>
            <div
              className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center ${
                draft.condition === 'unused'
                  ? 'bg-[#173D32] text-[#CBEA72]'
                  : 'bg-[#E8E9E3] text-transparent'
              }`}
            >
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
          </label>
        </div>
      </section>

      {/* Submit Action Button */}
      <div className="pt-2">
        <button
          type="submit"
          className="w-full min-h-[48px] rounded-xl bg-[#CBEA72] hover:bg-[#b8dc5c] active:scale-[0.99] text-[#182B24] font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <span>Continue to Diagnostic</span>
          <ArrowRight className="w-5 h-5" />
        </button>
        <p className="text-center text-xs text-[#66736B] mt-2.5">
          No account required · Instant guidance for any item.
        </p>
      </div>
    </form>
  );
};
