import React, { useState, useMemo } from 'react';
import { AppState, Transaction } from '../types';
import { CATEGORIES } from '../utils/categories';
import { formatDate, formatMoney } from '../utils/formatters';
import { Search, Edit2, Trash2, ArrowUpRight, ArrowDownLeft, CheckCircle2, X } from 'lucide-react';

interface TransactionListProps {
  state: AppState;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  state,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterPayer, setFilterPayer] = useState<'all' | 'me' | 'friend'>('all');

  const activeUser = state.activeUserId === state.user1.id ? state.user1 : state.user2;
  const friend = state.activeUserId === state.user1.id ? state.user2 : state.user1;

  // Filtered and sorted list (chronological: newest first)
  const filtered = useMemo(() => {
    const list = state.transactions.filter((tx) => {
      // Search text (title, note, or amounts)
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        tx.title.toLowerCase().includes(query) ||
        (tx.note && tx.note.toLowerCase().includes(query)) ||
        tx.amount.toString().includes(query) ||
        tx.payerOwedAmount.toString().includes(query);

      // Category
      const matchesCategory =
        selectedCategory === 'all' || tx.category === selectedCategory;

      // Payer
      const matchesPayer =
        filterPayer === 'all' ||
        (filterPayer === 'me' && tx.paidBy === activeUser.id) ||
        (filterPayer === 'friend' && tx.paidBy === friend.id);

      return matchesSearch && matchesCategory && matchesPayer;
    });

    // Sort newest date/timestamp first
    return list.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (!isNaN(dateA) && !isNaN(dateB) && dateB !== dateA) {
        return dateB - dateA;
      }
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }, [state.transactions, searchTerm, selectedCategory, filterPayer, activeUser.id, friend.id]);

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="space-y-2.5">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search expenses, amounts, notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-sm"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setFilterPayer('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
              filterPayer === 'all'
                ? 'bg-slate-800 text-white dark:bg-slate-700 dark:text-white font-semibold'
                : 'bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => setFilterPayer('me')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
              filterPayer === 'me'
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/40'
                : 'bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Paid by You
          </button>
          <button
            onClick={() => setFilterPayer('friend')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
              filterPayer === 'friend'
                ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 font-semibold border border-rose-500/40'
                : 'bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Paid by {friend.name.split(' ')[0]}
          </button>

          {/* Category Dropdown Pill */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs focus:outline-none focus:border-emerald-500 shadow-sm"
          >
            <option value="all">All Categories</option>
            {Object.values(CATEGORIES).map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.emoji} {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Active Filter Info Banner */}
        {(searchTerm || selectedCategory !== 'all' || filterPayer !== 'all') && (
          <div className="flex items-center justify-between px-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              Showing {filtered.length} of {state.transactions.length} items
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setFilterPayer('all');
              }}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

      {/* List Feed */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center text-2xl mb-3">
            🔍
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No transactions found</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            {searchTerm || selectedCategory !== 'all' || filterPayer !== 'all'
              ? 'Try adjusting your search or category filters.'
              : 'Start tracking by recording your first expense together!'}
          </p>
          <button
            onClick={onAddNew}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold shadow-md hover:bg-emerald-400 transition-colors"
          >
            + Add Expense
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((tx) => {
            const catMeta = CATEGORIES[tx.category] || CATEGORIES.other;
            const youPaid = tx.paidBy === activeUser.id;
            const isSettlement = tx.isSettlement;

            return (
              <div
                key={tx.id}
                className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 transition-all shadow-sm"
              >
                {/* Left side: Icon + Title + Meta */}
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 border ${catMeta.bgColor}`}
                  >
                    {isSettlement ? '🤝' : catMeta.emoji}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {tx.title}
                      </h4>
                      {isSettlement && (
                        <span className="px-1.5 py-0.5 rounded-md bg-teal-500/20 text-teal-700 dark:text-teal-400 text-[10px] font-bold">
                          Settled
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      <span>{formatDate(tx.date)}</span>
                      <span>•</span>
                      <span className="truncate">
                        {isSettlement
                          ? youPaid
                            ? `You settled to ${friend.name.split(' ')[0]}`
                            : `${friend.name.split(' ')[0]} settled to you`
                          : youPaid
                          ? 'You paid'
                          : `${friend.name.split(' ')[0]} paid`}
                        {!isSettlement && tx.splitType === 'equal_split' && ' (50/50)'}
                      </span>
                      {tx.note && (
                        <>
                          <span>•</span>
                          <span
                            title={tx.note}
                            className="italic text-slate-400 dark:text-slate-500 truncate max-w-[120px]"
                          >
                            {tx.note}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Amount and actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    {/* The impact on your balance */}
                    <div
                      className={`text-xs sm:text-sm font-bold flex items-center justify-end gap-1 ${
                        isSettlement
                          ? 'text-teal-600 dark:text-teal-400'
                          : youPaid
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isSettlement ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{formatMoney(tx.amount, state.currency)}</span>
                        </>
                      ) : (
                        <>
                          {youPaid ? (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {youPaid ? '+' : '-'}
                            {formatMoney(tx.payerOwedAmount, state.currency)}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Total cost description */}
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      {isSettlement
                        ? 'Settlement'
                        : `total ${formatMoney(tx.amount, state.currency)}`}
                    </p>
                  </div>

                  {/* Actions Dropdown / Buttons */}
                  <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isSettlement && (
                      <button
                        onClick={() => onEdit(tx)}
                        title="Edit transaction"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(tx.id)}
                      title="Delete transaction"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
