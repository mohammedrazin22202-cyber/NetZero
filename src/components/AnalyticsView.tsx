import React, { useState } from 'react';
import { AppState, Category } from '../types';
import { CATEGORIES } from '../utils/categories';
import { formatMoney } from '../utils/formatters';
import {
  PieChart,
  TrendingUp,
  Award,
  DollarSign,
  Target,
  Printer,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Check,
} from 'lucide-react';

interface AnalyticsViewProps {
  state: AppState;
  onUpdateBudget?: (friendId: string, budget: number) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ state, onUpdateBudget }) => {
  const activeUser = state.activeUserId === state.user1.id ? state.user1 : state.user2;
  const friend = state.activeUserId === state.user1.id ? state.user2 : state.user1;
  const currentFriendId = state.selectedFriendId || state.user2.id;

  const currentBudget = state.monthlyBudgets?.[currentFriendId] || 0;
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(currentBudget ? currentBudget.toString() : '');

  // Filter out settlements for spending analytics
  const expenseTransactions = state.transactions.filter((t) => !t.isSettlement);

  const totalSpentTogether = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);

  // Month-over-Month calculation (parse YYYY-MM-DD directly to prevent timezone slips)
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  const currentMonthExpenses = expenseTransactions.filter((t) => {
    if (!t.date) return false;
    const parts = t.date.split('-');
    if (parts.length < 2) return false;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    return y === currentYear && m === currentMonth;
  });
  const currentMonthSpend = currentMonthExpenses.reduce((acc, t) => acc + t.amount, 0);

  const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const prevYear = prevMonthDate.getFullYear();
  const prevMonth = prevMonthDate.getMonth();

  const prevMonthExpenses = expenseTransactions.filter((t) => {
    if (!t.date) return false;
    const parts = t.date.split('-');
    if (parts.length < 2) return false;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    return y === prevYear && m === prevMonth;
  });
  const prevMonthSpend = prevMonthExpenses.reduce((acc, t) => acc + t.amount, 0);

  const momChange =
    prevMonthSpend > 0 ? ((currentMonthSpend - prevMonthSpend) / prevMonthSpend) * 100 : null;

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

  const maxExpense =
    expenseTransactions.length > 0
      ? [...expenseTransactions].sort((a, b) => b.amount - a.amount)[0]
      : null;

  const handleSaveBudget = () => {
    const num = parseFloat(budgetInput);
    if (!isNaN(num) && num >= 0 && onUpdateBudget) {
      onUpdateBudget(currentFriendId, num);
    }
    setIsEditingBudget(false);
  };

  const budgetPercent = currentBudget > 0 ? Math.min((currentMonthSpend / currentBudget) * 100, 100) : 0;
  const isOverBudget = currentBudget > 0 && currentMonthSpend > currentBudget;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Action Header: Month Summary & Print Statement */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-500" />
            Financial Insights & Statement
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Insights for shared ledger with {friend.name}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors shadow-sm"
          title="Print or export statement"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Statement</span>
        </button>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
            <span>This Month</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {formatMoney(currentMonthSpend, state.currency)}
          </p>
          <div className="flex items-center gap-1 text-[11px] mt-1">
            {momChange !== null ? (
              <span
                className={`flex items-center font-bold ${
                  momChange > 0 ? 'text-amber-500' : 'text-emerald-500'
                }`}
              >
                {momChange > 0 ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {Math.abs(momChange).toFixed(0)}% vs last mo
              </span>
            ) : (
              <span className="text-slate-400 dark:text-slate-500">First month tracked</span>
            )}
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase mb-1">
            <Award className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Top Outing</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">
            {maxExpense ? formatMoney(maxExpense.amount, state.currency) : formatMoney(0, state.currency)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {maxExpense ? maxExpense.title : 'No outings yet'}
          </p>
        </div>
      </div>

      {/* Monthly Budget Tracker Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Monthly Shared Budget
            </h3>
          </div>
          {!isEditingBudget ? (
            <button
              onClick={() => {
                setBudgetInput(currentBudget ? currentBudget.toString() : '');
                setIsEditingBudget(true);
              }}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" />
              <span>{currentBudget > 0 ? 'Edit Limit' : 'Set Budget'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="10"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                placeholder="e.g. 500"
                className="w-24 px-2 py-0.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                onClick={handleSaveBudget}
                className="p-1 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {currentBudget > 0 ? (
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {formatMoney(currentMonthSpend, state.currency)} of {formatMoney(currentBudget, state.currency)} spent
              </span>
              <span
                className={`font-bold flex items-center gap-1 ${
                  isOverBudget
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {isOverBudget ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    Over by {formatMoney(currentMonthSpend - currentBudget, state.currency)}!
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    {formatMoney(currentBudget - currentMonthSpend, state.currency)} left
                  </>
                )}
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                style={{ width: `${budgetPercent}%` }}
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverBudget
                    ? 'bg-rose-500'
                    : budgetPercent > 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
              />
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500 py-2">
            No spending budget set for this friend. Click &quot;Set Budget&quot; to keep monthly shared spending in check.
          </p>
        )}
      </div>

      {/* Upfront Payer Comparison Bar */}
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