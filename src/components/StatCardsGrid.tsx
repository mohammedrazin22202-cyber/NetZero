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
  lentAmount = 56.00,
  settledAmount = 0.00,
  borrowedAmount = 9.25,
  transactionCount = 3,
  currency,
  onLentClick,
  onSettledClick,
  onBorrowedClick,
  onTransactionsClick,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 select-none h-full">
      {/* 1. You Lent */}
      <div 
        onClick={onLentClick}
        className="neon-glass-card rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer hover:border-purple-400/60 transition-all active:scale-[0.98]"
      >
        <div className="w-10 h-10 rounded-xl bg-[#221040]/90 border border-purple-500/50 flex items-center justify-center text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)] shrink-0">
          <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-medium text-slate-400 truncate">
            You Lent
          </span>
          <span className="text-base font-bold text-white tracking-tight">
            {currency.symbol}{lentAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* 2. Settled */}
      <div 
        onClick={onSettledClick}
        className="neon-glass-card rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer hover:border-purple-400/60 transition-all active:scale-[0.98]"
      >
        <div className="w-10 h-10 rounded-full bg-[#0a2333]/90 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.4)] shrink-0">
          <Check className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-medium text-slate-400 truncate">
            Settled
          </span>
          <span className="text-base font-bold text-white tracking-tight">
            {currency.symbol}{settledAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* 3. You Borrowed */}
      <div 
        onClick={onBorrowedClick}
        className="neon-glass-card rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer hover:border-purple-400/60 transition-all active:scale-[0.98]"
      >
        <div className="w-10 h-10 rounded-xl bg-[#221040]/90 border border-purple-500/50 flex items-center justify-center text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)] shrink-0">
          <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-medium text-slate-400 truncate">
            You Borrowed
          </span>
          <span className="text-base font-bold text-white tracking-tight">
            {currency.symbol}{borrowedAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* 4. Transactions */}
      <div 
        onClick={onTransactionsClick}
        className="neon-glass-card rounded-2xl p-3.5 flex items-center gap-3 cursor-pointer hover:border-purple-400/60 transition-all active:scale-[0.98]"
      >
        <div className="w-10 h-10 rounded-xl bg-[#221040]/90 border border-purple-500/50 flex items-center justify-center text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)] shrink-0">
          <FileText className="w-4 h-4 stroke-[2.2]" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-medium text-slate-400 truncate">
            Transactions
          </span>
          <span className="text-base font-bold text-white tracking-tight">
            {transactionCount}
          </span>
        </div>
      </div>
    </div>
  );
};
