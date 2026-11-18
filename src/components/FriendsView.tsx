import React from 'react';
import { UserPlus, CheckCircle2, Share2, ArrowRight, UserCheck, Trash2 } from 'lucide-react';
import { AppState } from '../types';
import { calculateBalance, formatMoney } from '../utils/formatters';

interface FriendsViewProps {
  state: AppState;
  onSelectFriend: (friendId: string) => void;
  onAddFriend: () => void;
  onDeleteFriend: (friendId: string) => void;
  onOpenSettle: (friendId: string) => void;
  onOpenShare: (friendId: string) => void;
  onViewTransactions: (friendId: string) => void;
  onBackToDashboard: () => void;
}

export const FriendsView: React.FC<FriendsViewProps> = ({
  state,
  onSelectFriend,
  onAddFriend,
  onDeleteFriend,
  onOpenSettle,
  onOpenShare,
  onViewTransactions,
  onBackToDashboard,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto py-4 animate-fadeIn select-none text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Friends & Shared Ledgers</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your individual balance ledgers with all your friends
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
            onClick={onAddFriend}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl btn-neon-cyan text-xs font-bold uppercase tracking-wider"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Friend</span>
          </button>
        </div>
      </div>

      {/* Friends Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.friends.map((friend) => {
          const isActive = friend.id === state.selectedFriendId;
          const txs = state.friendTransactions[friend.id] || [];
          const balance = calculateBalance(txs, state.currentUser.id, friend.id);
          const isZero = Math.abs(balance.netBalance) < 0.005;
          const isPositive = balance.netBalance > 0.005;

          return (
            <div
              key={friend.id}
              className={`rounded-3xl p-5 border transition-all ${
                isActive
                  ? 'neon-glass-card border-purple-400/80 dark:border-purple-400 ring-1 ring-purple-400/40 shadow-lg'
                  : 'neon-glass-card border-purple-200/60 dark:border-purple-500/25 hover:border-purple-300 dark:hover:border-purple-400/50'
              }`}
            >
              {/* Top Row: Avatar, Name, Status Badge */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8b5cf6] via-[#c084fc] to-[#fb923c] dark:from-purple-700 dark:via-purple-600 dark:to-fuchsia-600 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(192,132,252,0.4)] shrink-0">
                    {friend.name ? friend.name.charAt(0).toUpperCase() : 'F'}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold truncate">
                        {friend.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-500/40 text-[10px] font-mono font-bold text-purple-700 dark:text-cyan-300">
                        ID: {friend.pin || '1234'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {txs.length} transactions recorded
                    </span>
                  </div>
                </div>

                {isActive ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold">
                    <UserCheck className="w-3 h-3" />
                    Active Ledger
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSelectFriend(friend.id)}
                    className="text-xs font-semibold text-[#0284c7] dark:text-cyan-400 hover:underline px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                  >
                    Switch to this ledger &rarr;
                  </button>
                )}
              </div>

              {/* Balance Box */}
              <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-500/20 mb-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                    {isZero ? 'Status' : isPositive ? `${friend.name} Owes You` : 'You Owe'}
                  </span>
                  <span
                    className={`text-xl font-extrabold tracking-tight ${
                      isZero
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isPositive
                        ? 'text-[#0284c7] dark:text-cyan-400'
                        : 'text-[#ea580c] dark:text-fuchsia-400'
                    }`}
                  >
                    {isZero ? 'All Settled' : formatMoney(Math.abs(balance.netBalance), state.currency)}
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-500 dark:text-slate-400 space-y-0.5">
                  <div>Lent: {formatMoney(balance.owedToActiveUser, state.currency)}</div>
                  <div>Borrowed: {formatMoney(balance.owedByActiveUser, state.currency)}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-purple-100 dark:border-purple-500/20">
                <button
                  type="button"
                  onClick={() => onOpenSettle(friend.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Settle</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenShare(friend.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#0284c7] dark:text-cyan-400" />
                  <span>Share</span>
                </button>

                <button
                  type="button"
                  onClick={() => onViewTransactions(friend.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-purple-500" />
                  <span>Ledger</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteFriend(friend.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title={`Delete friend ${friend.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
