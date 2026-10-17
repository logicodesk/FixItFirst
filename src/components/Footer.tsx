import React from 'react';
import logoBadge from '../assets/logo-badge.png';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#F7F8F2]/90 backdrop-blur-sm border-t border-[#DCE8DA] py-6 px-4 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <img
            src={logoBadge}
            alt="Fix It First Logo"
            className="w-8 h-8 rounded-full border border-[#DCE8DA] shadow-2xs object-contain bg-[#FAF8F5] p-0.5"
          />
          <div>
            <p className="text-sm font-bold text-[#182B24] leading-tight">Fix It First</p>
            <p className="text-[10.5px] font-semibold text-[#2C5B47] uppercase tracking-wider">
              Repair • Reuse • Repurpose • Recycle
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-0.5 text-xs text-[#66736B]">
          <p className="italic font-medium text-[#2C5B47]">“The app guides. The user decides.”</p>
          <p>A guided decision companion for practical, low-waste living.</p>
        </div>
      </div>
    </footer>
  );
};
