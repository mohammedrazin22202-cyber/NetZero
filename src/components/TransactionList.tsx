import React, { useState, useMemo } from 'react';
import { AppState, Transaction } from '../types';
import { CATEGORIES } from '../utils/categories';
import { formatDate, formatMoney } from '../utils/formatters';
import { Search, Edit2, Trash2, ArrowUpRight, ArrowDownLeft, CheckCircle2 } from 'lucide-react';

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

  // Filtered list
  const filtered = useMemo(() => {
    return state.transactions.filter((tx) => {
      // Search text
      const matchesSearch =
        tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.note && tx.note.toLowerCase().includes(searchTerm.toLowerCase()));

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
  }, [state.transactions, searchTerm, selectedCategory, filterPayer, activeUser.id, friend.id]);

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="space-y-2.5">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search expenses, notes, places..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setFilterPayer('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
              filterPayer === 'all'
                ? 'bg-slate-700 text-white font-semibold'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => setFilterPayer('me')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
              filterPayer === 'me'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Paid by You
          </button>
          <button
            onClick={() => setFilterPayer('friend')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
              filterPayer === 'friend'
                ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/40'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Paid by {friend.name.split(' ')[0]}
          </button>

          {/* Category Dropdown Pill */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 font-medium text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Categories</option>
            {Object.values(CATEGORIES).map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.emoji} {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List Feed */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl bg-slate-900/40 border border-slate-800/80">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800/60 flex items-center justify-center text-2xl mb-3">
            🔍
          </div>
          <h4 className="text-sm font-bold text-slate-200">No transactions found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
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
                className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700/80 transition-all shadow-sm"
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
                      <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                        {tx.title}
                      </h4>
                      {isSettlement && (
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          Settlement
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 truncate">
                      <span>{formatDate(tx.date)}</span>
                      <span>•</span>
                      <span className="truncate">
                        {youPaid ? 'You paid' : `${friend.name.split(' ')[0]} paid`}
                        {tx.splitType === 'equal_split' && ' (split 50/50)'}
                      </span>
                      {tx.note && (
                        <>
                          <span>•</span>
                          <span className="italic text-slate-500 truncate">{tx.note}</span>
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
                          ? 'text-teal-400'
                          : youPaid
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {youPaid && !isSettlement && <ArrowDownLeft className="w-3.5 h-3.5" />}
                      {!youPaid && !isSettlement && <ArrowUpRight className="w-3.5 h-3.5" />}
                      {isSettlement && <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>
                        {youPaid ? '+' : '-'}
                        {formatMoney(tx.payerOwedAmount, state.currency)}
                      </span>
                    </div>

                    {/* Total cost */}
                    <p className="text-[10px] text-slate-500">
                      total {formatMoney(tx.amount, state.currency)}
                    </p>
                  </div>

                  {/* Actions Dropdown / Buttons */}
                  <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isSettlement && (
                      <button
                        onClick={() => onEdit(tx)}
                        title="Edit transaction"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(tx.id)}
                      title="Delete transaction"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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
