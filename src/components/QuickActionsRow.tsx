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
    <div className="w-full my-3 select-none">
      <h3 className="text-sm font-semibold text-white mb-2.5 px-0.5">
        Quick Actions
      </h3>

      <div className="grid grid-cols-5 gap-3">
        {/* 1. Add Expense (Solid glowing cyan pill with black text and icon on top) */}
        <button
          onClick={onAddExpense}
          className="rounded-2xl py-3 px-2 btn-neon-cyan flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-transform"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <PlusCircle className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-xs font-extrabold text-slate-950 whitespace-nowrap">
            Add Expense
          </span>
        </button>

        {/* 2. Split Bill */}
        <button
          onClick={onSplitBill}
          className="rounded-2xl py-3 px-2 btn-glass-action flex flex-col items-center justify-center gap-1.5 active:scale-95"
        >
          <div className="w-6 h-6 flex items-center justify-center text-slate-200">
            <Users className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-xs font-medium text-white whitespace-nowrap">
            Split Bill
          </span>
        </button>

        {/* 3. Record Payment */}
        <button
          onClick={onRecordPayment}
          className="rounded-2xl py-3 px-2 btn-glass-action flex flex-col items-center justify-center gap-1.5 active:scale-95"
        >
          <div className="w-6 h-6 flex items-center justify-center text-slate-200">
            <CheckCircle2 className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-xs font-medium text-white whitespace-nowrap">
            Record Payment
          </span>
        </button>

        {/* 4. Settle Up */}
        <button
          onClick={onSettleUp}
          className="rounded-2xl py-3 px-2 btn-glass-action flex flex-col items-center justify-center gap-1.5 active:scale-95"
        >
          <div className="w-6 h-6 flex items-center justify-center text-slate-200">
            <ArrowLeftRight className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-xs font-medium text-white whitespace-nowrap">
            Settle Up
          </span>
        </button>

        {/* 5. Custom Split */}
        <button
          onClick={onCustomSplit}
          className="rounded-2xl py-3 px-2 btn-glass-action flex flex-col items-center justify-center gap-1.5 active:scale-95"
        >
          <div className="w-6 h-6 flex items-center justify-center text-slate-200">
            <SlidersHorizontal className="w-5 h-5 stroke-[2]" />
          </div>
          <span className="text-xs font-medium text-white whitespace-nowrap">
            Custom Split
          </span>
        </button>
      </div>
    </div>
  );
};
