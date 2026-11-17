import React from 'react';
import { ArrowUpRight, ArrowDownRight, Check, FileText } from 'lucide-react';
import { Currency } from '../types';

interface StatCardsGridProps {
  lentAmount?: number;
  settledAmount?: number;
  borrowedAmount?: number;
  transactionCount?: number;
  currency: Currency;
  onLentClick?: () => void;
  onSettledClick?: () => void;
  onBorrowedClick?: () => void;
  onTransactionsClick?: () => void;
}

export const StatCardsGrid: React.FC<StatCardsGridProps> = ({
  lentAmount = 0.00,
  settledAmount = 0.00,
  borrowedAmount = 0.00,
  transactionCount = 0,
  currency,
  onLentClick,
  onSettledClick,
  onBorrowedClick,
  onTransactionsClick,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent, action?: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action?.();
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 select-none h-[195px]">
      {/* 1. You Lent */}
      <div 
        role="button"
        tabIndex={0}
        aria-label={`You Lent ${currency.symbol}${lentAmount.toFixed(2)}`}
        onClick={onLentClick}
        onKeyDown={(e) => handleKeyDown(e, onLentClick)}
        className="neon-glass-card rounded-2xl p-3 flex items-center gap-2.5 cursor-pointer hover:border-purple-400/60 transition-all active:scale-[0.98] focus:outline-none focus:ring-1 focus:ring-purple-400"
      >
        <div className="w-8 h-8 rounded-xl bg-[#f5efff] dark:bg-[#221040]/90 border border-[#d8b4fe] dark:border-purple-500/50 flex items-center justify-center text-[#9333ea] dark:text-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.25)] dark:shadow-[0_0_10px_rgba(168,85,247,0.4)] shrink-0">
          <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
            You Lent
          </span>
          <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
            {currency.symbol}{lentAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* 2. Settled */}
      <div 
        role="button"
        tabIndex={0}
        aria-label={`Settled Total ${currency.symbol}${settledAmount.toFixed(2)}`}
        onClick={onSettledClick}
        onKeyDown={(e) => handleKeyDown(e, onSettledClick)}
        className="neon-glass-card rounded-2xl p-3 flex items-center gap-2.5 cursor-pointer hover:border-purple-400/60 transition-all active:scale-[0.98] focus:outline-none focus:ring-1 focus:ring-[#38bdf8]"
      >
        <div className="w-8 h-8 rounded-full bg-[#e0f2fe] dark:bg-[#0a2333]/90 border border-[#7dd3fc] dark:border-cyan-500/50 flex items-center justify-center text-[#0284c7] dark:text-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.25)] dark:shadow-[0_0_10px_rgba(0,240,255,0.4)] shrink-0">
          <Check className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
            Settled
          </span>
          <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
            {currency.symbol}{settledAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* 3. You Borrowed */}
      <div 
        role="button"
        tabIndex={0}
        aria-label={`You Borrowed ${currency.symbol}${borrowedAmount.toFixed(2)}`}
        onClick={onBorrowedClick}
        onKeyDown={(e) => handleKeyDown(e, onBorrowedClick)}
        className="neon-glass-card rounded-2xl p-3 flex items-center gap-2.5 cursor-pointer hover:border-purple-400/60 transition-all active:scale-[0.98] focus:outline-none focus:ring-1 focus:ring-[#fb923c]"
      >
        <div className="w-8 h-8 rounded-xl bg-[#fff4ed] dark:bg-[#221040]/90 border border-[#fed7aa] dark:border-purple-500/50 flex items-center justify-center text-[#ea580c] dark:text-purple-400 shadow-[0_0_10px_rgba(251,146,60,0.25)] dark:shadow-[0_0_10px_rgba(168,85,247,0.4)] shrink-0">
          <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
            You Borrowed
          </span>
          <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">
            {currency.symbol}{borrowedAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* 4. Transactions */}
      <div 
        role="button"
        tabIndex={0}
        aria-label={`View ${transactionCount} Transactions`}
        onClick={onTransactionsClick}
        onKeyDown={(e) => handleKeyDown(e, onTransactionsClick)}
        className="neon-glass-card rounded-2xl p-3 flex items-center gap-2.5 cursor-pointer hover:border-purple-400/60 transition-all active:scale-[0.98] focus:outline-none focus:ring-1 focus:ring-purple-400"
      >
        <div className="w-8 h-8 rounded-xl bg-[#f5efff] dark:bg-[#221040]/90 border border-[#d8b4fe] dark:border-purple-500/50 flex items-center justify-center text-[#9333ea] dark:text-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.25)] dark:shadow-[0_0_10px_rgba(168,85,247,0.4)] shrink-0">
          <FileText className="w-4 h-4 stroke-[2.2]" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
            Transactions
          </span>
          <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            {transactionCount}
          </span>
        </div>
      </div>
    </div>
  );
};
