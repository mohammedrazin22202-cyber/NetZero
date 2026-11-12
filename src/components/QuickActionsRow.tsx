import React from 'react';
import { PlusCircle, Users, CheckCircle2, ArrowLeftRight, SlidersHorizontal } from 'lucide-react';

interface QuickActionsRowProps {
  onAddExpense: () => void;
  onSplitBill: () => void;
  onRecordPayment: () => void;
  onSettleUp: () => void;
  onCustomSplit: () => void;
}

export const QuickActionsRow: React.FC<QuickActionsRowProps> = ({
  onAddExpense,
  onSplitBill,
  onRecordPayment,
  onSettleUp,
  onCustomSplit,
}) => {
  return (
    <div className="w-full my-4 select-none">
      <h3 className="text-sm font-semibold text-white mb-2.5 px-1">
        Quick Actions
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
        {/* 1. Add Expense (Highlighted bright glowing cyan button) */}
        <button
          onClick={onAddExpense}
          className="col-span-2 sm:col-span-1 rounded-2xl py-3 px-3.5 btn-neon-cyan flex flex-row items-center justify-center gap-2 font-bold text-xs sm:text-sm active:scale-95 transition-transform"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>Add Expense</span>
        </button>

        {/* 2. Split Bill */}
        <button
          onClick={onSplitBill}
          className="rounded-2xl py-3 px-2 sm:px-3 btn-glass-action flex flex-row items-center justify-center gap-2 text-xs sm:text-sm font-medium active:scale-95"
        >
          <Users className="w-4 h-4 text-purple-400 stroke-[2]" />
          <span>Split Bill</span>
        </button>

        {/* 3. Record Payment */}
        <button
          onClick={onRecordPayment}
          className="rounded-2xl py-3 px-2 sm:px-3 btn-glass-action flex flex-row items-center justify-center gap-2 text-xs sm:text-sm font-medium active:scale-95"
        >
          <CheckCircle2 className="w-4 h-4 text-purple-400 stroke-[2]" />
          <span className="truncate">Record Payment</span>
        </button>

        {/* 4. Settle Up */}
        <button
          onClick={onSettleUp}
          className="rounded-2xl py-3 px-2 sm:px-3 btn-glass-action flex flex-row items-center justify-center gap-2 text-xs sm:text-sm font-medium active:scale-95"
        >
          <ArrowLeftRight className="w-4 h-4 text-purple-400 stroke-[2]" />
          <span>Settle Up</span>
        </button>

        {/* 5. Custom Split */}
        <button
          onClick={onCustomSplit}
          className="rounded-2xl py-3 px-2 sm:px-3 btn-glass-action flex flex-row items-center justify-center gap-2 text-xs sm:text-sm font-medium active:scale-95"
        >
          <SlidersHorizontal className="w-4 h-4 text-purple-400 stroke-[2]" />
          <span>Custom Split</span>
        </button>
      </div>
    </div>
  );
};
