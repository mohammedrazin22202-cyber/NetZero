import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Currency } from '../types';

interface ThisMonthCardProps {
  lastMonthSpent?: number;
  thisMonthSpent?: number;
  percentChange?: number;
  currency: Currency;
  onClick?: () => void;
}

export const ThisMonthCard: React.FC<ThisMonthCardProps> = ({
  lastMonthSpent = 68.50,
  thisMonthSpent = 56.00,
  percentChange = 18,
  currency,
  onClick,
}) => {
  const maxSpend = Math.max(lastMonthSpent, thisMonthSpent, 1);
  const maxBarHeight = 44; // px
  const minBarHeight = 8; // px for 0 baseline

  const lastHeightPx = lastMonthSpent > 0
    ? Math.max(14, Math.round((lastMonthSpent / maxSpend) * maxBarHeight))
    : minBarHeight;

  const thisHeightPx = thisMonthSpent > 0
    ? Math.max(14, Math.round((thisMonthSpent / maxSpend) * maxBarHeight))
    : minBarHeight;

  const isNewActivity = lastMonthSpent === 0 && thisMonthSpent > 0;

  return (
    <div 
      onClick={onClick}
      className="neon-glass-card rounded-3xl p-5 select-none flex flex-col justify-between cursor-pointer hover:border-purple-400/50 transition-all h-[175px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
          This Month
        </h3>

        {/* Change Badge */}
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#e0f2fe] dark:bg-cyan-950/70 border border-[#7dd3fc] dark:border-cyan-500/40 text-[#0284c7] dark:text-cyan-400 text-xs font-semibold shadow-[0_0_10px_rgba(56,189,248,0.2)] dark:shadow-[0_0_10px_rgba(0,240,255,0.2)]">
          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>
            {isNewActivity ? 'New this month' : `${percentChange}% vs last month`}
          </span>
        </div>
      </div>

      {/* 2 Comparison Vertical Glass Bars - Dynamically Proportional */}
      <div className="flex items-end justify-around w-full px-2 mt-auto pt-2 pb-1">
        {/* Bar 1: Last Month */}
        <div className="flex flex-col items-center flex-1 max-w-[110px]">
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 tracking-tight">
            {currency.symbol}{lastMonthSpent.toFixed(2)}
          </span>

          <div 
            style={{ height: `${lastHeightPx}px` }}
            className={`w-full rounded-2xl transition-all duration-500 hover:scale-105 ${
              lastMonthSpent > 0
                ? 'bg-gradient-to-t from-[#e9d5ff] via-[#d8b4fe] to-[#c084fc] dark:from-purple-950/90 dark:via-purple-900/60 dark:to-purple-600/40 border border-[#c084fc]/50 dark:border-purple-500/40 shadow-[0_0_14px_rgba(192,132,252,0.35)] dark:shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                : 'bg-slate-200/60 dark:bg-purple-950/30 border border-slate-300/40 dark:border-purple-500/20'
            }`}
          />

          <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-2 whitespace-nowrap">
            Last Month
          </span>
        </div>

        {/* Bar 2: This Month */}
        <div className="flex flex-col items-center flex-1 max-w-[110px]">
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 tracking-tight">
            {currency.symbol}{thisMonthSpent.toFixed(2)}
          </span>

          <div 
            style={{ height: `${thisHeightPx}px` }}
            className={`w-full rounded-2xl transition-all duration-500 hover:scale-105 ${
              thisMonthSpent > 0
                ? 'bg-gradient-to-t from-[#38bdf8] to-[#7dd3fc] dark:from-cyan-600/90 dark:to-cyan-400 border border-[#bae6fd] dark:border-cyan-300 shadow-[0_0_20px_rgba(56,189,248,0.45)] dark:shadow-[0_0_24px_rgba(0,240,255,0.75)]'
                : 'bg-slate-200/60 dark:bg-cyan-950/30 border border-slate-300/40 dark:border-cyan-500/20'
            }`}
          />

          <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-2 whitespace-nowrap">
            This Month
          </span>
        </div>
      </div>
    </div>
  );
};
