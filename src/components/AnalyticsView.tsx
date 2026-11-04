import React from 'react';
import { AppState, Category } from '../types';
import { CATEGORIES } from '../utils/categories';
import { formatMoney } from '../utils/formatters';
import { PieChart, TrendingUp, Award, DollarSign } from 'lucide-react';

interface AnalyticsViewProps {
  state: AppState;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ state }) => {
  const activeUser = state.activeUserId === state.user1.id ? state.user1 : state.user2;
  const friend = state.activeUserId === state.user1.id ? state.user2 : state.user1;

  // Filter out settlements for spending analytics
  const expenseTransactions = state.transactions.filter((t) => !t.isSettlement);

  const totalSpentTogether = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);

  // Spent by active user vs friend
  const spentByActiveUser = expenseTransactions
    .filter((t) => t.paidBy === activeUser.id)
    .reduce((acc, t) => acc + t.amount, 0);

  const spentByFriend = expenseTransactions
    .filter((t) => t.paidBy === friend.id)
    .reduce((acc, t) => acc + t.amount, 0);

  // Category breakdown
  const categoryTotals: Partial<Record<Category, number>> = {};
  for (const t of expenseTransactions) {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  }

  const sortedCategories = Object.entries(categoryTotals)
    .map(([cat, amount]) => ({
      category: cat as Category,
      amount,
      percentage: totalSpentTogether > 0 ? (amount / totalSpentTogether) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const activeUserPercent =
    totalSpentTogether > 0 ? Math.round((spentByActiveUser / totalSpentTogether) * 100) : 0;
  const friendPercent = totalSpentTogether > 0 ? 100 - activeUserPercent : 0;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase mb-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
            <span>Total Shared Spend</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {formatMoney(totalSpentTogether, state.currency)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Across {expenseTransactions.length} shared events
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />
            <span>Average Expense</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {formatMoney(
              expenseTransactions.length > 0 ? totalSpentTogether / expenseTransactions.length : 0,
              state.currency
            )}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Per activity / outing</p>
        </div>
      </div>

      {/* Who paid more comparison bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Upfront Payer Comparison
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">All-time</span>
        </div>

        {totalSpentTogether === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 py-3 text-center">
            No expenses recorded yet.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-emerald-600 dark:text-emerald-400">
                {activeUser.name.split(' ')[0]} ({activeUserPercent}%)
              </span>
              <span className="text-indigo-600 dark:text-indigo-400">
                {friend.name.split(' ')[0]} ({friendPercent}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
              <div
                style={{ width: `${activeUserPercent}%` }}
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              />
              <div
                style={{ width: `${friendPercent}%` }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 transition-all duration-500"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              <span>{formatMoney(spentByActiveUser, state.currency)} paid</span>
              <span>{formatMoney(spentByFriend, state.currency)} paid</span>
            </div>
          </>
        )}
      </div>

      {/* Category Breakdown */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Spending by Category
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {sortedCategories.length} Categories
          </span>
        </div>

        {sortedCategories.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">
            No expense categories yet.
          </p>
        ) : (
          <div className="space-y-3.5">
            {sortedCategories.map(({ category, amount, percentage }) => {
              const meta = CATEGORIES[category] || CATEGORIES.other;
              return (
                <div key={category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{meta.emoji}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {meta.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                        {percentage.toFixed(1)}%
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatMoney(amount, state.currency)}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${percentage}%` }}
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
