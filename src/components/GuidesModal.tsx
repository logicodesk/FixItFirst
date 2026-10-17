import React from 'react';
import {
  X,
  Wrench,
  Repeat,
  Shuffle,
  ShoppingBag,
  Recycle,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import logoBadge from '../assets/logo-badge.png';

interface GuidesModalProps {
  onClose: () => void;
}

const SIX_PATHS = [
  {
    name: 'Repair',
    icon: Wrench,
    desc: 'Restore full function by fixing the specific component or fastener that failed.',
    mindset: 'High resource savings and lowest out-of-pocket expense.',
  },
  {
    name: 'Reuse',
    icon: Repeat,
    desc: 'Pass along to friends, students, or community charity groups if intact.',
    mindset: 'Extends product circulation without manufacturing burden.',
  },
  {
    name: 'Repurpose',
    icon: Shuffle,
    desc: 'Convert into storage, garden planters, workshop caddies, or craft projects.',
    mindset: 'Unlocks secondary utility directly at home.',
  },
  {
    name: 'Replace',
    icon: ShoppingBag,
    desc: 'A pragmatic backup when repair parts cost more than purchasing a reliable unit.',
    mindset: 'No shame or guilt; choose modular, repair-friendly replacements.',
  },
  {
    name: 'Recycle',
    icon: Recycle,
    desc: 'Certified drop-off to reclaim copper, brass, steel, and technical polymers.',
    mindset: 'Separates hazardous materials away from groundwater and soil.',
  },
  {
    name: 'Discard',
    icon: Trash2,
    desc: 'Absolute last resort when biohazards or contamination prevent all recovery.',
    mindset: 'Always verify council landfill bans and wrap sharp edges safely.',
  },
];

export const GuidesModal: React.FC<GuidesModalProps> = ({ onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guides-title"
    >
      <div className="bg-[#F7F8F2] border border-[#DCE8DA] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-[#66736B] hover:text-[#182B24] hover:bg-[#E8E9E3] transition-colors"
          aria-label="Close guides modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6 flex items-start gap-4">
          <img
            src={logoBadge}
            alt="Fix It First Logo"
            className="w-12 h-12 rounded-full border border-[#DCE8DA] bg-[#FAF8F5] p-0.5 shadow-xs shrink-0 object-contain hidden sm:block"
          />
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCE8DA] text-[#173D32] text-xs font-semibold mb-2">
              <span>Fix It First Principles</span>
            </div>
            <h2 id="guides-title" className="text-2xl font-bold text-[#182B24] tracking-tight">
              Understanding the 6 Pathways
            </h2>
            <p className="text-sm text-[#66736B] mt-1">
              Before you replace it, understand your options: Repair, Reuse, Repurpose, Replace, Recycle, Discard.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {SIX_PATHS.map((path) => {
            const Icon = path.icon;
            return (
              <div
                key={path.name}
                className="bg-white border border-[#DCE8DA] rounded-xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-[#F3F4EE] flex items-center justify-center text-[#2C5B47]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-[#182B24]">{path.name}</span>
                  </div>
                  <p className="text-xs text-[#66736B] leading-relaxed mb-2">
                    {path.desc}
                  </p>
                </div>
                <div className="text-[11px] text-[#2C5B47] font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{path.mindset}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-[#173D32] text-white rounded-xl p-4 text-xs leading-relaxed flex items-center justify-between gap-4">
          <p>
            <strong className="text-[#CBEA72]">Guiding Philosophy:</strong> We never judge or shame you for choosing Replace or Discard. Practical realities like safety, budget, and time matter.
          </p>
          <button
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 bg-[#CBEA72] text-[#182B24] font-bold rounded-lg shrink-0 hover:bg-[#b8dc5c] transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
