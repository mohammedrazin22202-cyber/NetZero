import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { AppState, Category, Transaction } from '../types';
import { CATEGORIES } from '../utils/categories';
import { formatMoney } from '../utils/formatters';

interface CategoriesViewProps {
  state: AppState;
  onSelectTransaction?: (tx: Transaction) => void;
  onBackToDashboard: () => void;
  onAddNewExpense: (category?: Category) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  state,
  onSelectTransaction,
  onBackToDashboard,
  onAddNewExpense,
}) => {
  const [selectedCat, setSelectedCat] = useState<Category | 'all'>('all');

  // Exclude settlements for spending metrics
  const expenseTxs = state.transactions.filter((t) => !t.isSettlement);
  const totalSpent = expenseTxs.reduce((sum, t) => sum + t.amount, 0);

  // Group by category
  const categoryStats = Object.values(CATEGORIES).map((cat) => {
    const txsInCat = expenseTxs.filter((t) => t.category === cat.id);
    const amount = txsInCat.reduce((sum, t) => sum + t.amount, 0);
    const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
    return {
      ...cat,
      amount,
      count: txsInCat.length,
      percentage,
    };
  }).sort((a, b) => b.amount - a.amount);

  // Filtered transactions for the selected category
  const displayedTxs =
    selectedCat === 'all'
      ? expenseTxs
      : expenseTxs.filter((t) => t.category === selectedCat);

  return (
    <div className="w-full max-w-4xl mx-auto py-4 animate-fadeIn select-none text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Spending by Category</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Total spending breakdown across categories with {state.user2.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="px-3.5 py-2 rounded-xl border border-purple-200 dark:border-purple-500/30 text-xs font-semibold hover:bg-purple-50 dark:hover:bg-white/5 transition-colors"
          >
            ← Dashboard
          </button>
          <button
            type="button"
            onClick={() => onAddNewExpense(selectedCat !== 'all' ? selectedCat : undefined)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl btn-neon-cyan text-xs font-bold uppercase tracking-wider"
          >
            <span>+ Add Expense</span>
          </button>
        </div>
      </div>

      {/* Category Pills / Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
        {categoryStats.map((cat) => {
          const isSelected = selectedCat === cat.id;
          return (
            <div
              key={cat.id}
              onClick={() => setSelectedCat(isSelected ? 'all' : cat.id)}
              className={`p-3.5 rounded-2xl cursor-pointer border transition-all ${
                isSelected
                  ? 'neon-glass-card border-purple-400 dark:border-cyan-400 ring-2 ring-purple-400/50 shadow-lg'
                  : 'neon-glass-card border-purple-200/60 dark:border-purple-500/25 hover:border-purple-300 dark:hover:border-purple-400/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xl">{cat.emoji}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  {cat.percentage.toFixed(0)}%
                </span>
              </div>
              <span className="text-xs font-bold block truncate">{cat.label}</span>
              <span className="text-sm font-extrabold text-[#0284c7] dark:text-cyan-400 block mt-0.5">
                {formatMoney(cat.amount, state.currency)}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                {cat.count} {cat.count === 1 ? 'expense' : 'expenses'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Filter status header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Filter className="w-4 h-4 text-purple-500" />
          <span>
            {selectedCat === 'all'
              ? `All Expenses (${displayedTxs.length})`
              : `${CATEGORIES[selectedCat]?.label || selectedCat} Expenses (${displayedTxs.length})`}
          </span>
        </h3>
        {selectedCat !== 'all' && (
          <button
            type="button"
            onClick={() => setSelectedCat('all')}
            className="text-xs text-[#0284c7] dark:text-cyan-400 hover:underline font-semibold"
          >
            Show All
          </button>
        )}
      </div>

      {/* Transactions List */}
      {displayedTxs.length > 0 ? (
        <div className="space-y-2">
          {displayedTxs.map((tx) => (
            <div
              key={tx.id}
              onClick={() => onSelectTransaction?.(tx)}
              className="neon-glass-card rounded-2xl p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:border-purple-400/60 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl">{CATEGORIES[tx.category]?.emoji || '🧾'}</span>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold truncate group-hover:text-[#0284c7] dark:group-hover:text-cyan-300 transition-colors">
                    {tx.title}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {tx.date} • Paid by {tx.paidBy === state.currentUser.id ? 'You' : state.user2.name}
                  </span>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white shrink-0">
                {formatMoney(tx.amount, state.currency)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="neon-glass-card rounded-3xl p-8 text-center text-xs text-slate-500 dark:text-slate-400">
          No expenses recorded for this category yet.
        </div>
      )}
    </div>
  );
};
