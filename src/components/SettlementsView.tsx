import React from 'react';
import { CheckCircle2, Share2, Sparkles, Trash2 } from 'lucide-react';
import { AppState, Transaction } from '../types';
import { calculateBalance, formatMoney } from '../utils/formatters';

interface SettlementsViewProps {
  state: AppState;
  onOpenSettle: () => void;
  onOpenShare: () => void;
  onBackToDashboard: () => void;
  onSelectTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
}

export const SettlementsView: React.FC<SettlementsViewProps> = ({
  state,
  onOpenSettle,
  onOpenShare,
  onBackToDashboard,
  onSelectTransaction,
  onDeleteTransaction,
}) => {
  const activeUser = state.activeUserId === state.user1.id ? state.user1 : state.user2;
  const friend = state.activeUserId === state.user1.id ? state.user2 : state.user1;

  const { netBalance, owedToActiveUser, owedByActiveUser, settledTotal } = calculateBalance(
    state.transactions,
    activeUser.id,
    friend.id
  );

  const isZero = Math.abs(netBalance) < 0.005;
  const isPositive = netBalance > 0.005;

  // Filter only settlement transactions
  const settlements = state.transactions.filter((t) => t.isSettlement);

  return (
    <div className="w-full max-w-4xl mx-auto py-4 animate-fadeIn select-none text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settlements Center</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track payments, mark debts paid, and keep ledgers balanced with {friend.name}
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
            onClick={onOpenSettle}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl btn-neon-cyan text-xs font-bold uppercase tracking-wider"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>Settle Up</span>
          </button>
        </div>
      </div>

      {/* Hero Balance Card */}
      <div className="neon-glass-card rounded-3xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Current Outstanding Balance
            </span>
            <div className="mt-1 flex items-baseline gap-3">
              <span
                className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                  isZero
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : isPositive
                    ? 'text-[#0284c7] dark:text-cyan-400'
                    : 'text-[#ea580c] dark:text-fuchsia-400'
                }`}
              >
                {isZero ? formatMoney(0, state.currency) : `${isPositive ? '+' : '-'}${formatMoney(Math.abs(netBalance), state.currency)}`}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                {isZero ? 'All debts settled!' : isPositive ? `${friend.name} owes you` : `You owe ${friend.name}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenShare}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-white/5 border border-purple-200 dark:border-purple-500/30 hover:border-purple-400 text-xs font-semibold transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-[#0284c7] dark:text-cyan-400" />
              <span>Share Summary</span>
            </button>
            <button
              type="button"
              onClick={onOpenSettle}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-2xl btn-neon-cyan text-xs font-bold uppercase tracking-wider"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>Record Settlement</span>
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-purple-100 dark:border-purple-500/20 text-center">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Total Lent</span>
            <span className="text-sm font-bold text-[#0284c7] dark:text-cyan-400">
              +{formatMoney(owedToActiveUser, state.currency)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Total Borrowed</span>
            <span className="text-sm font-bold text-[#ea580c] dark:text-fuchsia-400">
              -{formatMoney(owedByActiveUser, state.currency)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Total Settled</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {formatMoney(settledTotal, state.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Settlement Records List */}
      <div>
        <h3 className="text-base font-bold mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>Settlement Records ({settlements.length})</span>
        </h3>

        {settlements.length > 0 ? (
          <div className="space-y-2.5">
            {settlements.map((tx) => {
              const isPayerYou = tx.paidBy === state.currentUser.id;
              const payerName = isPayerYou ? 'You' : friend.name;
              const recipientName = isPayerYou ? friend.name : 'You';

              return (
                <div
                  key={tx.id}
                  onClick={() => onSelectTransaction?.(tx)}
                  className="neon-glass-card rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:border-emerald-500/50 transition-all group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold truncate group-hover:text-emerald-500 transition-colors">
                          {tx.title || 'Settled Balance'}
                        </span>
                        {tx.deletionStatus === 'pending_deletion' && (
                          <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold border border-rose-500/30 shrink-0">
                            Deletion Pending
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {payerName} paid {recipientName} • {tx.note || 'Settled'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {tx.date}
                    </span>
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      {formatMoney(tx.amount, state.currency)}
                    </span>
                    {onDeleteTransaction && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTransaction(tx.id);
                        }}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete this settlement record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="neon-glass-card rounded-3xl p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-500/30 text-purple-500 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 stroke-[2]" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">No settlements logged yet</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              When you or {friend.name} pay each other back to settle debts, log it here to adjust the net balance.
            </p>
            <button
              type="button"
              onClick={onOpenSettle}
              className="mt-4 px-4 py-2 rounded-xl btn-neon-cyan text-xs font-bold uppercase tracking-wider"
            >
              Record First Settlement
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
