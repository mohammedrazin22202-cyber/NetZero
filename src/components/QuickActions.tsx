import React from 'react';
import { AppState, SplitType } from '../types';
import { PlusCircle, Split, HandCoins, ArrowDownRight } from 'lucide-react';

interface QuickActionsProps {
  state: AppState;
  onOpenAddModal: (presetSplit?: SplitType) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ state, onOpenAddModal }) => {
  const friendName =
    state.activeUserId === state.user1.id
      ? state.user2.name.split(' ')[0]
      : state.user1.name.split(' ')[0];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-5">
      {/* Action 1: Lent full */}
      <button
        onClick={() => onOpenAddModal('you_paid_full')}
        className="group relative flex flex-col items-start p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/90 border border-slate-200/90 dark:border-slate-800/80 hover:border-emerald-500/40 text-left transition-all active:scale-[0.98] shadow-sm hover:shadow-emerald-500/5"
      >
        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
          <PlusCircle className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
          I Lent {friendName}
        </span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
          {friendName} owes 100%
        </span>
      </button>

      {/* Action 2: Split 50/50 */}
      <button
        onClick={() => onOpenAddModal('equal_split')}
        className="group relative flex flex-col items-start p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/90 border border-slate-200/90 dark:border-slate-800/80 hover:border-teal-500/40 text-left transition-all active:scale-[0.98] shadow-sm hover:shadow-teal-500/5"
      >
        <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
          <Split className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
          Split 50 / 50
        </span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
          Equal split
        </span>
      </button>

      {/* Action 3: Friend paid for me */}
      <button
        onClick={() => onOpenAddModal('friend_paid_full')}
        className="group relative flex flex-col items-start p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/90 border border-slate-200/90 dark:border-slate-800/80 hover:border-rose-500/40 text-left transition-all active:scale-[0.98] shadow-sm hover:shadow-rose-500/5"
      >
        <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
          <ArrowDownRight className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
          {friendName} Paid
        </span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
          I owe {friendName}
        </span>
      </button>

      {/* Action 4: Quick Loan */}
      <button
        onClick={() => onOpenAddModal('custom')}
        className="group relative flex flex-col items-start p-3.5 rounded-2xl bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/90 border border-slate-200/90 dark:border-slate-800/80 hover:border-indigo-500/40 text-left transition-all active:scale-[0.98] shadow-sm hover:shadow-indigo-500/5"
      >
        <div className="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
          <HandCoins className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
          Custom Split
        </span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
          Exact split amounts
        </span>
      </button>
    </div>
  );
};
