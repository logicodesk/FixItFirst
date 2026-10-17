import React from 'react';
import { FitLevel } from '../types';

interface FitBadgeProps {
  fit: FitLevel;
  className?: string;
  size?: 'sm' | 'md';
}

export const FitBadge: React.FC<FitBadgeProps> = ({ fit, className = '', size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  if (fit === 'best_fit') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold rounded-full bg-[#CBEA72] text-[#182B24] border border-[#B3D655] ${sizeClasses} ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#173D32]" aria-hidden="true" />
        <span>Best fit</span>
      </span>
    );
  }

  if (fit === 'worth_considering') {
    return (
      <span
        className={`inline-flex items-center gap-1 font-semibold rounded-full bg-[#F5E9BE] text-[#3D3200] border border-[#E8DCAC] ${sizeClasses} ${className}`}
      >
        <span>Worth considering</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full bg-[#E8E1F2] text-[#372B49] border border-[#D9D0E6] ${sizeClasses} ${className}`}
    >
      <span>Unlikely</span>
    </span>
  );
};
