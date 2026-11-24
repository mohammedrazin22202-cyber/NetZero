import React, { useState } from 'react';
import { Currency } from '../types';

export interface SpendingCategory {
  name: string;
  percentage: number;
  amount?: number;
  color: string;
  glowColor: string;
}

export interface SpendingOverviewCardProps {
  totalSpent?: number;
  userSpent?: number;
  totalShared?: number;
  currency: Currency;
  categories?: SpendingCategory[];
  userCategories?: SpendingCategory[];
  sharedCategories?: SpendingCategory[];
  onCategoryClick?: (categoryName: string) => void;
}

export const SpendingOverviewCard: React.FC<SpendingOverviewCardProps> = ({
  totalSpent = 56.0,
  userSpent,
  totalShared,
  currency,
  categories = [
    { name: 'Food & Dining', percentage: 45, color: '#fb923c', glowColor: 'rgba(251, 146, 60, 0.7)' },
    { name: 'Entertainment', percentage: 39, color: '#c084fc', glowColor: 'rgba(192, 132, 252, 0.7)' },
    { name: 'Transport', percentage: 16, color: '#38bdf8', glowColor: 'rgba(56, 189, 248, 0.7)' },
  ],
  userCategories,
  sharedCategories,
  onCategoryClick,
}) => {
  // Default to 'user' mode if userSpent is available, else 'total'
  const [viewMode, setViewMode] = useState<'user' | 'total'>('user');

  const resolvedUserSpent = userSpent !== undefined ? userSpent : totalSpent;
  const resolvedSharedSpent = totalShared !== undefined ? totalShared : totalSpent;

  const isUserMode = viewMode === 'user';
  const displayAmount = isUserMode ? resolvedUserSpent : resolvedSharedSpent;

  const activeCategories = isUserMode
    ? (userCategories && userCategories.length > 0 ? userCategories : categories)
    : (sharedCategories && sharedCategories.length > 0 ? sharedCategories : categories);

  const radius = 46;
  const circumference = 2 * Math.PI * radius; // ~289.03

  let cumulativeOffset = 0;

  const hasModeDifference = totalShared !== undefined && userSpent !== undefined && Math.abs(totalShared - userSpent) > 0.01;

  return (
    <div className="neon-glass-card rounded-3xl p-5 select-none flex flex-col justify-between h-[195px]">
      {/* Header with Title and Mode Switcher */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
          Spending Overview
        </h3>

        {/* Clean Mode Switcher */}
        {hasModeDifference && (
          <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-200/60 dark:bg-black/40 border border-slate-300/60 dark:border-white/[0.08] backdrop-blur-md">
            <button
              type="button"
              onClick={() => setViewMode('user')}
              title="Your personal share of expenses"
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                isUserMode
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Your Share
            </button>
            <button
              type="button"
              onClick={() => setViewMode('total')}
              title="Total shared expenses for both friends"
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                !isUserMode
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Total Group
            </button>
          </div>
        )}
      </div>

      {/* Donut Chart & Legend Row - Balanced & Crisp */}
      <div className="flex items-center justify-between gap-4 my-auto">
        {/* Left: Donut Chart with Center Text */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center shrink-0">
          <svg
            viewBox="0 0 120 120"
            className="w-full h-full -rotate-90"
          >
            {/* Background ring */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="currentColor"
              className="text-slate-200/50 dark:text-white/[0.06]"
              strokeWidth="11"
            />

            {/* Colored Segments */}
            {activeCategories.length > 0 && activeCategories.map((cat, idx) => {
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
                  strokeWidth="11"
                  strokeDasharray={`${strokeLength} ${circumference}`}
                  strokeDashoffset={offset}
                  strokeLinecap={activeCategories.length > 1 && cat.percentage < 98 ? 'round' : 'butt'}
                  style={{
                    filter: `drop-shadow(0 0 4px ${cat.color}80)`,
                  }}
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>

          {/* Donut Center: Crisp Sizing & Clear Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-1">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-none">
              {isUserMode ? 'Your Share' : 'Total Group'}
            </span>
            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight my-0.5 leading-tight">
              {currency.symbol}{displayAmount.toFixed(2)}
            </span>
            {hasModeDifference && (
              <span className="text-[9px] font-medium text-slate-500 dark:text-slate-400 leading-none truncate max-w-[84px]">
                {isUserMode
                  ? `Group: ${currency.symbol}${resolvedSharedSpent.toFixed(0)}`
                  : `You: ${currency.symbol}${resolvedUserSpent.toFixed(0)}`}
              </span>
            )}
          </div>
        </div>

        {/* Right: Legend with bullet dots & percentages */}
        <div className="flex flex-col gap-2 flex-1 min-w-0 pr-1">
          {activeCategories.length === 0 ? (
            <div className="text-xs text-slate-400 dark:text-slate-500 italic py-2">
              No expenses recorded yet.
            </div>
          ) : (
            activeCategories.map((cat, idx) => (
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
                      boxShadow: `0 0 8px ${cat.glowColor || cat.color}`,
                    }}
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-medium truncate group-hover:text-purple-600 dark:group-hover:text-white transition-colors text-xs">
                    {cat.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {cat.amount !== undefined && (
                    <span className="text-slate-400 dark:text-slate-500 text-[11px] font-medium hidden sm:inline">
                      {currency.symbol}{cat.amount.toFixed(0)}
                    </span>
                  )}
                  <span className="text-slate-800 dark:text-slate-200 font-bold text-xs bg-slate-100 dark:bg-white/[0.06] px-1.5 py-0.5 rounded-md">
                    {cat.percentage}%
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
