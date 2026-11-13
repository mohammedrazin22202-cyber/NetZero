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
  return (
    <div 
      onClick={onClick}
      className="neon-glass-card neon-card-cyan-corner rounded-3xl p-5 select-none flex flex-col justify-between cursor-pointer hover:border-purple-400/50 transition-all h-[155px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-base font-semibold text-white">
          This Month
        </h3>

        {/* Change Badge */}
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-400 text-xs font-semibold shadow-[0_0_10px_rgba(0,240,255,0.25)]">
          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>{percentChange}% vs last month</span>
        </div>
      </div>

      {/* 2 Comparison Vertical Glass Bars */}
      <div className="pt-1 pb-1 flex items-end justify-center gap-8 sm:gap-12">
        {/* Bar 1: Last Month */}
        <div className="flex flex-col items-center">
          <span className="text-xs sm:text-sm font-bold text-white mb-2 tracking-tight">
            {currency.symbol}{lastMonthSpent.toFixed(2)}
          </span>

          <div 
            className="w-16 sm:w-20 h-14 sm:h-[60px] rounded-2xl bg-gradient-to-t from-purple-950/90 via-purple-900/60 to-purple-600/40 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-transform hover:scale-105"
          />

          <span className="text-[11px] sm:text-xs text-slate-400 font-medium mt-1.5">
            Last Month
          </span>
        </div>

        {/* Bar 2: This Month */}
        <div className="flex flex-col items-center">
          <span className="text-xs sm:text-sm font-bold text-white mb-2 tracking-tight">
            {currency.symbol}{thisMonthSpent.toFixed(2)}
          </span>

          <div 
            className="w-16 sm:w-20 h-12 sm:h-[48px] rounded-2xl bg-gradient-to-t from-cyan-600/90 to-cyan-400 border border-cyan-300 shadow-[0_0_24px_rgba(0,240,255,0.75)] transition-transform hover:scale-105"
          />

          <span className="text-[11px] sm:text-xs text-slate-400 font-medium mt-1.5">
            This Month
          </span>
        </div>
      </div>
    </div>
  );
};
