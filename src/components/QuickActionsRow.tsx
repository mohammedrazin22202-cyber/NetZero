import React from 'react';
import { PlusCircle, HandCoins, ListPlus, CheckCircle2, SlidersHorizontal, RefreshCw } from 'lucide-react';

interface QuickActionsRowProps {
  onAddExpense: () => void;
  onLoan: () => void;
  onSplitBill: () => void;
  onRecordPayment: () => void;
  onRecurringBills: () => void;
  onCustomSplit: () => void;
}

export const QuickActionsRow: React.FC<QuickActionsRowProps> = ({
  onAddExpense,
  onLoan,
  onSplitBill,
  onRecordPayment,
  onRecurringBills,
  onCustomSplit,
}) => {
  return (
    <div className="w-full my-3 select-none">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2.5 px-0.5">
        Quick Actions
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {/* 1. Add Expense */}
        <button
          type="button"
          onClick={onAddExpense}
          className="rounded-2xl py-3 px-2 btn-neon-cyan flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-transform"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <PlusCircle className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-xs font-extrabold whitespace-nowrap">
            Add Expense
          </span>
        </button>

        {/* 2. Cash Loan */}
        <button
          type="button"
          onClick={onLoan}
          className="rounded-2xl py-3 px-2 btn-glass-action flex flex-col items-center justify-center gap-1.5 active:scale-95"
        >
          <div className="w-6 h-6 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <HandCoins className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-xs font-semibold text-purple-950 dark:text-white whitespace-nowrap">
            Cash Loan
          </span>
        </button>

        {/* 3. Split Bill (Itemized) */}
        <button
          type="button"
          onClick={onSplitBill}
          className="rounded-2xl py-3 px-2 btn-glass-action flex flex-col items-center justify-center gap-1.5 active:scale-95"
        >
          <div className="w-6 h-6 flex items-center justify-center text-purple-600 dark:text-slate-200">
            <ListPlus className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-xs font-semibold text-purple-950 dark:text-white whitespace-nowrap">
            Split Bill
          </span>
        </button>

        {/* 4. Record Payment */}
        <button
          type="button"
          onClick={onRecordPayment}
          className="rounded-2xl py-3 px-2 btn-glass-action flex flex-col items-center justify-center gap-1.5 active:scale-95"
        >
          <div className="w-6 h-6 flex items-center justify-center text-[#0284c7] dark:text-slate-200">
            <CheckCircle2 className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-xs font-semibold text-purple-950 dark:text-white whitespace-nowrap">
            Record Payment
          </span>
        </button>

        {/* 5. Recurring Bills */}
        <button
          type="button"
          onClick={onRecurringBills}
          className="rounded-2xl py-3 px-2 btn-glass-action flex flex-col items-center justify-center gap-1.5 active:scale-95"
        >
          <div className="w-6 h-6 flex items-center justify-center text-[#ea580c] dark:text-slate-200">
            <RefreshCw className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-xs font-semibold text-purple-950 dark:text-white whitespace-nowrap">
            Recurring Bills
          </span>
        </button>

        {/* 6. Custom Split */}
        <button
          type="button"
          onClick={onCustomSplit}
          className="rounded-2xl py-3 px-2 btn-glass-action flex flex-col items-center justify-center gap-1.5 active:scale-95"
        >
          <div className="w-6 h-6 flex items-center justify-center text-purple-600 dark:text-slate-200">
            <SlidersHorizontal className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-xs font-semibold text-purple-950 dark:text-white whitespace-nowrap">
            Custom Split
          </span>
        </button>
      </div>
    </div>
  );
};
