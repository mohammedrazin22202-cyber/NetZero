import React from 'react';
import { Currency } from '../types';

interface SpendingCategory {
  name: string;
  percentage: number;
  color: string;
  glowColor: string;
}

interface SpendingOverviewCardProps {
  totalSpent: number;
  currency: Currency;
  categories?: SpendingCategory[];
  onCategoryClick?: (categoryName: string) => void;
}

export const SpendingOverviewCard: React.FC<SpendingOverviewCardProps> = ({
  totalSpent = 56.0,
  currency,
  categories = [
    { name: 'Food & Dining', percentage: 45, color: '#a855f7', glowColor: 'rgba(168, 85, 247, 0.6)' },
    { name: 'Entertainment', percentage: 39, color: '#e879f9', glowColor: 'rgba(232, 121, 249, 0.6)' },
    { name: 'Transport', percentage: 16, color: '#00f0ff', glowColor: 'rgba(0, 240, 255, 0.6)' },
  ],
  onCategoryClick,
}) => {
  const radius = 46;
  const circumference = 2 * Math.PI * radius; // ~289.03

  let cumulativeOffset = 0;

  return (
    <div className="neon-glass-card rounded-3xl p-5 sm:p-6 select-none flex flex-col justify-between">
      {/* Header */}
      <h3 className="text-base font-semibold text-white mb-4">
        Spending Overview
      </h3>

      {/* Donut Chart & Legend Row */}
      <div className="flex items-center justify-between gap-4">
        {/* Left: Donut Chart with Center Text */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <svg
            viewBox="0 0 120 120"
            className="w-full h-full -rotate-90"
          >
            <defs>
              <filter id="donutGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background ring */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="14"
            />

            {/* Colored Segments */}
            {categories.map((cat, idx) => {
              const strokeLength = (cat.percentage / 100) * circumference;
              const offset = -cumulativeOffset;
              cumulativeOffset += strokeLength;

              return (
                <circle
                  key={idx}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke={cat.color}
                  strokeWidth="14"
                  strokeDasharray={`${strokeLength} ${circumference}`}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  filter="url(#donutGlow)"
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>

          {/* Donut Center: Total Spent */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-xl font-extrabold text-white tracking-tight">
              {currency.symbol}{totalSpent.toFixed(2)}
            </span>
            <span className="text-[11px] font-medium text-slate-400 mt-0.5">
              Total Spent
            </span>
          </div>
        </div>

        {/* Right: Legend with bullet dots & percentages */}
        <div className="flex flex-col gap-3 flex-1 min-w-0 pr-1">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => onCategoryClick?.(cat.name)}
              className="flex items-center justify-between gap-2 text-xs cursor-pointer hover:opacity-90 group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: cat.color,
                    boxShadow: `0 0 8px ${cat.glowColor}`,
                  }}
                />
                <span className="text-slate-300 font-medium truncate group-hover:text-white transition-colors">
                  {cat.name}
                </span>
              </div>
              <span className="text-slate-400 font-semibold shrink-0">
                {cat.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
