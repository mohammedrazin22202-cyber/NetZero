import React, { useState } from 'react';
import { AppState, RecurringExpense, Category, SplitType } from '../types';
import { CATEGORIES } from '../utils/categories';
import { formatMoney } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';
import { X, Plus, Trash2, Check, RefreshCw } from 'lucide-react';

interface RecurringExpensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onAddRecurring: (expense: Omit<RecurringExpense, 'id'>) => void;
  onDeleteRecurring: (id: string) => void;
  onLogRecurring: (expense: RecurringExpense) => void;
}

export const RecurringExpensesModal: React.FC<RecurringExpensesModalProps> = ({
  isOpen,
  onClose,
  state,
  onAddRecurring,
  onDeleteRecurring,
  onLogRecurring,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState<Category>('rent');
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [paidBy, setPaidBy] = useState(state.currentUser.id);
  const [splitType, setSplitType] = useState<SplitType>('equal_split');

  if (!isOpen) return null;

  const currentFriend = state.user2;
  const currentMonthKey = new Date().toISOString().slice(0, 7); // "YYYY-MM"

  const friendRecurring = state.recurringExpenses.filter(
    (r) => r.friendId === state.selectedFriendId
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr);
    if (!title.trim() || isNaN(amount) || amount <= 0) return;

    onAddRecurring({
      friendId: state.selectedFriendId,
      title: title.trim(),
      amount: Math.round(amount * 100) / 100,
      paidBy,
      splitType,
      category,
      dayOfMonth,
    });

    triggerHaptic('success');
    setTitle('');
    setAmountStr('');
    setIsAdding(false);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-slate-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔄</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recurring Shared Bills
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Monthly bills with {currentFriend.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Auto-remind or log shared Wi-Fi, rent, or subscriptions in 1-tap.
              </p>
            </div>
            {!isAdding && (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Bill</span>
              </button>
            )}
          </div>

          {/* Add form */}
          {isAdding && (
            <form onSubmit={handleCreate} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-emerald-500/30 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">New Recurring Shared Bill</h4>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Netflix, Wi-Fi"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Amount ({state.currency.symbol})</label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="0.01"
                    placeholder="0.00"
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Day of Month</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    {Object.values(CATEGORIES).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Paid By</label>
                  <select
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value={state.currentUser.id}>You ({state.currentUser.name.split(' ')[0]})</option>
                    <option value={currentFriend.id}>{currentFriend.name.split(' ')[0]}</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Split</label>
                  <select
                    value={splitType}
                    onChange={(e) => setSplitType(e.target.value as SplitType)}
                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="equal_split">Split 50/50</option>
                    <option value="you_paid_full">Full 100%</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
                >
                  Save Recurring Bill
                </button>
              </div>
            </form>
          )}

          {/* List of Recurring Expenses */}
          {friendRecurring.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No recurring bills configured with {currentFriend.name} yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {friendRecurring.map((item) => {
                const catMeta = CATEGORIES[item.category] || CATEGORIES.rent;
                const isLoggedThisMonth = item.lastLoggedMonth === currentMonthKey;

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base border ${catMeta.bgColor}`}>
                        {catMeta.emoji}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.title}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          Due on day {item.dayOfMonth} • {item.paidBy === state.currentUser.id ? 'You pay' : `${currentFriend.name.split(' ')[0]} pays`} • {item.splitType === 'equal_split' ? 'Split 50/50' : '100% full'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {formatMoney(item.amount, state.currency)}
                        </span>
                        <p className="text-[10px] text-slate-400">monthly</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('success');
                          onLogRecurring(item);
                        }}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isLoggedThisMonth
                            ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30'
                            : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm'
                        }`}
                        title={isLoggedThisMonth ? 'Logged for this month already' : 'Log to ledger for this month'}
                      >
                        {isLoggedThisMonth ? <Check className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        <span>{isLoggedThisMonth ? 'Logged' : 'Log Now'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteRecurring(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-colors"
                        title="Delete recurring bill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
