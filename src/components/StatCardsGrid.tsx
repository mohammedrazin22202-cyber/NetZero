import React from 'react';
import { ArrowUpRight, ArrowDownRight, Check, FileText } from 'lucide-react';
import { Currency } from '../types';

interface StatCardsGridProps {
  lentAmount: number;
  settledAmount: number;
  borrowedAmount: number;
  transactionCount: number;
  currency: Currency;
  onLentClick?: () => void;
  onSettledClick?: () => void;
  onBorrowedClick?: () => void;
  onTransactionsClick?: () => void;
}

export const StatCardsGrid: React.FC<StatCardsGridProps> = ({
  lentAmount,
  settledAmount,
  borrowedAmount,
  transactionCount,
  currency,
  onLentClick,
  onSettledClick,
  onBorrowedClick,
  onTransactionsClick,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 select-none">
      {/* 1. You Lent */}
      <div 
        onClick={onLentClick}
        className="neon-glass-card rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between cursor-pointer hover:border-purple-400/60 transition-all active:scale-[0.98]"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-[11px] sm:text-xs font-medium text-slate-400">
            You Lent
          </span>
        </div>
        <div className="mt-2 text-base sm:text-lg font-bold text-white tracking-tight">
          {currency.symbol}{lentAmount.toFixed(2)}
        </div>
      </div>

      {/* 2. Settled */}
      <div 
        onClick={onSettledClick}
        className="neon-glass-card rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between cursor-pointer hover:border-purple-400/60 transition-all active:scale-[0.98]"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.3)]">
            <Check className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-[11px] sm:text-xs font-medium text-slate-400">
            Settled
          </span>
        </div>
        <div className="mt-2 text-base sm:text-lg font-bold text-white tracking-tight">
          {currency.symbol}{settledAmount.toFixed(2)}
        </div>
      </div>

      {/* 3. You Borrowed */}
      <div 
        onClick={onBorrowedClick}
        className="neon-glass-card rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between cursor-pointer hover:border-purple-400/60 transition-all active:scale-[0.98]"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
            <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-[11px] sm:text-xs font-medium text-slate-400">
            You Borrowed
          </span>
        </div>
        <div className="mt-2 text-base sm:text-lg font-bold text-white tracking-tight">
          {currency.symbol}{borrowedAmount.toFixed(2)}
        </div>
      </div>

      {/* 4. Transactions */}
      <div 
        onClick={onTransactionsClick}
        className="neon-glass-card rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between cursor-pointer hover:border-purple-400/60 transition-all active:scale-[0.98]"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
            <FileText className="w-4 h-4 stroke-[2.2]" />
          </div>
          <span className="text-[11px] sm:text-xs font-medium text-slate-400">
            Transactions
          </span>
        </div>
        <div className="mt-2 text-base sm:text-lg font-bold text-white tracking-tight">
          {transactionCount}
        </div>
      </div>
    </div>
  );
};
