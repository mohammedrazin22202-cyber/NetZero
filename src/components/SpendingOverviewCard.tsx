import React from 'react';
import { Currency } from '../types';

interface SpendingCategory {
  name: string;
  percentage: number;
  color: string;
  glowColor: string;
}

interface SpendingOverviewCardProps {
  totalSpent?: number;
  currency: Currency;
  categories?: SpendingCategory[];
  onCategoryClick?: (categoryName: string) => void;
}

export const SpendingOverviewCard: React.FC<SpendingOverviewCardProps> = ({
  totalSpent = 56.0,
  currency,
  categories = [
    { name: 'Food & Dining', percentage: 45, color: '#fb923c', glowColor: 'rgba(251, 146, 60, 0.7)' },
    { name: 'Entertainment', percentage: 39, color: '#c084fc', glowColor: 'rgba(192, 132, 252, 0.7)' },
    { name: 'Transport', percentage: 16, color: '#38bdf8', glowColor: 'rgba(56, 189, 248, 0.7)' },
  ],
  onCategoryClick,
}) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius; // ~282.74

  let cumulativeOffset = 0;

  return (
    <div className="neon-glass-card rounded-3xl p-5 select-none flex flex-col justify-between h-[195px]">
      {/* Header */}
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
        Spending Overview
      </h3>

      {/* Donut Chart & Legend Row - Balanced & Centered */}
      <div className="flex items-center justify-between gap-5 my-auto">
        {/* Left: Donut Chart with Center Text */}
        <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
          <svg
            viewBox="0 0 120 120"
            className="w-full h-full -rotate-90"
          >
            <defs>
              <filter id="donutGlowExact" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
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
              stroke="currentColor"
              className="text-purple-100/60 dark:text-white/[0.05]"
              strokeWidth="15"
            />

            {/* Colored Segments matching exact percentages */}
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
                  strokeWidth="15"
                  strokeDasharray={`${strokeLength} ${circumference}`}
                  strokeDashoffset={offset}
                  filter="url(#donutGlowExact)"
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>

          {/* Donut Center: Total Spent */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {currency.symbol}{totalSpent.toFixed(2)}
            </span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Total Spent
            </span>
          </div>
        </div>

        {/* Right: Legend with bullet dots & percentages */}
        <div className="flex flex-col gap-3 flex-1 min-w-0 pr-2">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => onCategoryClick?.(cat.name)}
              className="flex items-center justify-between gap-3 text-xs cursor-pointer hover:opacity-90 group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: cat.color,
                    boxShadow: `0 0 10px ${cat.glowColor}`,
                  }}
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium truncate group-hover:text-purple-900 dark:group-hover:text-white transition-colors text-xs">
                  {cat.name}
                </span>
              </div>
              <span className="text-slate-900 dark:text-slate-300 font-semibold shrink-0 text-xs">
                {cat.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
