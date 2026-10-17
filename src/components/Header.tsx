import React from 'react';
import { History, BookOpen, Plus, User } from 'lucide-react';
import logoBadge from '../assets/logo-badge.png';

interface HeaderProps {
  onNavigate: (view: 'step1' | 'step2' | 'options' | 'history') => void;
  activeView: string;
  onOpenGuides: () => void;
  historyCount: number;
  onStartNew: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  activeView,
  onOpenGuides,
  historyCount,
  onStartNew,
}) => {
  return (
    <header className="sticky top-0 left-0 right-0 z-40 bg-[#173D32] text-white shadow-[0_1px_8px_rgba(23,61,50,0.12)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Lockup */}
        <button
          onClick={() => onNavigate('step1')}
          className="flex items-center gap-3 text-left group focus-visible:ring-2 focus-visible:ring-[#CBEA72] rounded-lg p-1 -ml-1 transition-all hover:opacity-95"
          aria-label="Fix It First Home"
        >
          {/* Official Logo mark */}
          <img
            src={logoBadge}
            alt="Fix It First Logo"
            className="w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#CBEA72]/40 shadow-sm shrink-0 object-contain p-0.5 transition-transform group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="font-bold text-lg text-white tracking-tight leading-none">
              Fix It First
            </span>
            <span className="text-[9.5px] font-semibold text-[#CBEA72] tracking-wider uppercase hidden sm:block mt-0.5">
              Repair • Reuse • Repurpose • Recycle
            </span>
          </div>
        </button>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="flex items-center gap-1 sm:gap-4" aria-label="Main Navigation">
            <button
              onClick={() => onNavigate('history')}
              className={`min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                activeView === 'history'
                  ? 'text-[#CBEA72] underline decoration-[#CBEA72] decoration-2 underline-offset-8'
                  : 'text-[#DCE8DA] hover:text-[#CBEA72]'
              }`}
              aria-label={`View history, ${historyCount} items`}
            >
              <History className="w-4 h-4" aria-hidden="true" />
              <span>History</span>
              {historyCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-xs font-semibold bg-[#2C5B47] text-[#CBEA72]">
                  {historyCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenGuides}
              className="min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium text-[#DCE8DA] hover:text-[#CBEA72] flex items-center gap-1.5 transition-colors hidden sm:inline-flex"
              aria-label="View 6 paths guide"
            >
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              <span>Guides</span>
            </button>
          </nav>

          <button
            onClick={onStartNew}
            className="min-h-[44px] px-3.5 sm:px-4 py-2 bg-[#CBEA72] hover:bg-[#b8dc5c] active:scale-[0.98] text-[#182B24] font-semibold text-xs sm:text-sm rounded-lg transition-all shadow-sm flex items-center gap-1.5 shrink-0"
            aria-label="Start new item assessment"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span className="hidden xs:inline">New assessment</span>
            <span className="xs:hidden">New</span>
          </button>

          <div
            className="w-8 h-8 rounded-full bg-[#2C5B47] border border-[#3E705A] flex items-center justify-center text-[#DCE8DA] shrink-0"
            title="User Profile"
            aria-label="User profile"
          >
            <User className="w-4 h-4" aria-hidden="true" />
          </div>
        </div>
      </div>
    </header>
  );
};
