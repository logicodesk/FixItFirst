import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  Zap,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { AssessmentDraft } from '../types';
import rulesData from '../data/rules.json';
import { detectCategory, ASSET_IMAGES } from '../engine/scoreOptions';

interface Step2ProblemProps {
  draft: AssessmentDraft;
  onUpdateDraft: (partial: Partial<AssessmentDraft>) => void;
  onBack: () => void;
  onNext: () => void;
}

export const Step2Problem: React.FC<Step2ProblemProps> = ({
  draft,
  onUpdateDraft,
  onBack,
  onNext,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryKey = detectCategory(draft.itemName, {
    usesPower: draft.genericPower,
    material: draft.genericMaterial,
  });

  const category = (rulesData.categories as Record<string, any>)[categoryKey] || rulesData.categories.generic;
  const isGeneric = categoryKey === 'generic';
  const isLamp = draft.itemName.toLowerCase().includes('lamp') || draft.itemName.toLowerCase().includes('light');

  const availableProblems: string[] = category.commonProblems || [
    "Doesn't work properly",
    'Cracked or snapped',
    'Loose parts',
    'Worn out',
    'Something else',
  ];

  const handleSelectProblem = (problem: string) => {
    onUpdateDraft({ problem });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Smooth transition feedback
    setTimeout(() => {
      setIsSubmitting(false);
      onNext();
    }, 200);
  };

  const notesCharCount = (draft.notes || '').length;

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
      {/* Intro Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#182B24] tracking-tight">
          What went wrong?
        </h1>
        <p className="text-sm sm:text-base text-[#66736B] mt-1.5">
          Select what best describes the issue or symptom.
        </p>
      </div>

      {/* Quick Diagnostic Context Card */}
      <div className="w-full p-4 rounded-xl bg-white border border-[#DCE8DA] shadow-xs flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg bg-[#F7F8F2] shrink-0 overflow-hidden relative border border-[#DCE8DA] flex items-center justify-center">
          {draft.customImage ? (
            <img
              src={draft.customImage}
              alt="Your uploaded item"
              className="w-full h-full object-cover"
            />
          ) : isLamp ? (
            <img
              src={ASSET_IMAGES.lampWorkbench}
              alt="Desk lamp diagnosis"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <Lightbulb className="w-6 h-6 text-[#2C5B47]" />
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2C5B47]">
              Quick Check
            </span>
            {draft.customImage && (
              <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-[#DCE8DA] text-[#173D32]">
                Your photo
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#182B24] line-clamp-2 mt-0.5">
            {isLamp
              ? 'Most lamp issues are switch wear, plug fuse, or wire fatigue rather than complete fixture failure.'
              : `Categorized as ${category.name}. Most household failures originate from simple mechanical fasteners or power contacts.`}
          </p>
        </div>
      </div>

      {/* Fallback Questions for Unrecognized Items */}
      {isGeneric && (
        <section className="bg-white rounded-xl p-4 sm:p-5 border border-[#DCE8DA] shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2C5B47]">
            <HelpCircle className="w-4 h-4" />
            <span>Two quick details to personalize guidance</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#182B24] block mb-2">
              Does this item connect to electricity, battery, or fuel?
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onUpdateDraft({ genericPower: true })}
                className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  draft.genericPower === true
                    ? 'bg-[#173D32] text-[#CBEA72]'
                    : 'bg-[#F7F8F2] border border-[#DCE8DA] text-[#182B24] hover:bg-[#EDEEE8]'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Yes (Power / Battery)</span>
              </button>
              <button
                type="button"
                onClick={() => onUpdateDraft({ genericPower: false })}
                className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  draft.genericPower === false
                    ? 'bg-[#173D32] text-[#CBEA72]'
                    : 'bg-[#F7F8F2] border border-[#DCE8DA] text-[#182B24] hover:bg-[#EDEEE8]'
                }`}
              >
                <span>No (Mechanical / Manual)</span>
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#182B24] block mb-2">
              What material is it primarily made of?
            </label>
            <div className="flex flex-wrap gap-2">
              {['Fabric', 'Wood', 'Plastic', 'Metal', 'Glass', 'Mixed'].map((mat) => (
                <button
                  key={mat}
                  type="button"
                  onClick={() => onUpdateDraft({ genericMaterial: mat.toLowerCase() })}
                  className={`min-h-[44px] px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    draft.genericMaterial === mat.toLowerCase()
                      ? 'bg-[#173D32] text-[#CBEA72]'
                      : 'bg-[#F7F8F2] border border-[#DCE8DA] text-[#182B24] hover:bg-[#EDEEE8]'
                  }`}
                >
                  {mat}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Primary Symptom Chips */}
      <section className="flex flex-col gap-2.5">
        <label className="text-sm font-semibold text-[#182B24]">
          Primary symptom
        </label>
        <div
          className="flex flex-wrap gap-2.5"
          role="radiogroup"
          aria-label="Select primary symptom"
        >
          {availableProblems.map((prob) => {
            const isSelected = draft.problem.toLowerCase() === prob.toLowerCase();

            return (
              <button
                key={prob}
                type="button"
                onClick={() => handleSelectProblem(prob)}
                className={`min-h-[44px] px-4 py-2.5 rounded-full text-xs sm:text-sm font-medium flex items-center gap-2 transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-[#173D32] text-white shadow-xs'
                    : 'bg-white border border-[#DCE8DA] text-[#182B24] hover:border-[#2C5B47]'
                }`}
                role="radio"
                aria-checked={isSelected}
              >
                {isSelected ? (
                  <CheckCircle2 className="w-4 h-4 text-[#CBEA72]" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-[#E8E9E3]" />
                )}
                <span>{prob}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Freeform Details Field */}
      <section className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="problem-notes" className="text-sm font-semibold text-[#182B24]">
            Tell us more
          </label>
          <span className="text-xs text-[#66736B]">Optional</span>
        </div>

        <div className="relative bg-white border border-[#DCE8DA] rounded-xl shadow-xs focus-within:border-[#2C5B47] transition-all">
          <textarea
            id="problem-notes"
            rows={3}
            value={draft.notes || ''}
            onChange={(e) => onUpdateDraft({ notes: e.target.value.slice(0, 250) })}
            placeholder="Add any specific symptoms, brand, or what happened right before it stopped working..."
            className="w-full p-4 bg-transparent text-sm text-[#182B24] placeholder:text-[#66736B]/60 focus:outline-none resize-none"
          />
          <div className="px-4 pb-2.5 flex justify-between items-center text-xs text-[#66736B]">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#2C5B47]" />
              <span>Helps calibrate repair cost</span>
            </span>
            <span>{notesCharCount}/250</span>
          </div>
        </div>
      </section>

      {/* Encouragement Card */}
      <div className="p-4 rounded-xl bg-[#DCE8DA]/40 border border-[#DCE8DA] flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#2C5B47] shrink-0 mt-0.5" />
        <div className="flex flex-col">
          <span className="text-xs font-bold text-[#173D32]">Good news</span>
          <p className="text-xs text-[#182B24] leading-relaxed">
            {isLamp
              ? 'Loose switch toggles on desk lamps are commonly fixable in under 15 minutes with simple tools.'
              : 'Small household diagnostics provide clarity in just a few minutes and prevent premature replacement.'}
          </p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-3 pt-2 mt-auto">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[48px] px-6 rounded-xl bg-white border border-[#DCE8DA] hover:bg-[#F3F4EE] text-[#182B24] font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors min-w-[100px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 min-h-[48px] px-6 rounded-xl bg-[#CBEA72] hover:bg-[#b8dc5c] active:scale-[0.99] text-[#182B24] font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <span>{isSubmitting ? 'Analyzing options…' : 'Explore options'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};
