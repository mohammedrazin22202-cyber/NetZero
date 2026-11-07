import React, { useMemo } from 'react';
import { AppState } from '../types';
import { calculateBalance, formatMoney } from '../utils/formatters';
import { triggerConfetti } from '../utils/confetti';
import { triggerHaptic } from '../utils/haptics';
import { CheckCircle2, ArrowUpRight, ArrowDownLeft, Share2, Sparkles, Clock, PartyPopper } from 'lucide-react';

interface HeroBalanceProps {
  state: AppState;
  onOpenSettle: () => void;
  onOpenShare: () => void;
}

export const HeroBalance: React.FC<HeroBalanceProps> = ({ state, onOpenSettle, onOpenShare }) => {
  const activeUser = state.activeUserId === state.user1.id ? state.user1 : state.user2;
  const friend = state.activeUserId === state.user1.id ? state.user2 : state.user1;

  const { netBalance, owedToActiveUser, owedByActiveUser, settledTotal } = calculateBalance(
    state.transactions,
    activeUser.id,
    friend.id
  );

  const friendOwesYou = netBalance > 0.005;
  const youOweFriend = netBalance < -0.005;
  const isSettled = !friendOwesYou && !youOweFriend;

  // Debt age calculation: days since earliest unsettled outing
  const oldestPendingDays = useMemo(() => {
    if (isSettled || state.transactions.length === 0) return 0;
    const expenseDates = state.transactions
      .filter((t) => !t.isSettlement)
      .map((t) => new Date(t.date).getTime())
      .filter((time) => !isNaN(time));
    if (expenseDates.length === 0) return 0;
    const earliestTime = Math.min(...expenseDates);
    const diffDays = Math.floor((Date.now() - earliestTime) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [state.transactions, isSettled]);

  const handleCelebrate = () => {
    triggerConfetti();
    triggerHaptic('success');
  };

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 shadow-xl dark:shadow-2xl transition-all duration-300 border border-slate-200/90 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/90">
      {/* Dynamic Background Glow based on balance */}
      <div
        className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-500 ${
          friendOwesYou
            ? 'bg-emerald-500'
            : youOweFriend
            ? 'bg-rose-500'
            : 'bg-teal-500'
        }`}
      />
      <div
        className={`absolute -bottom-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-15 pointer-events-none transition-all duration-500 ${
          friendOwesYou
            ? 'bg-teal-500'
            : youOweFriend
            ? 'bg-amber-500'
            : 'bg-indigo-500'
        }`}
      />

      {/* Header Info */}
      <div className="relative flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{friend.avatar}</span>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Balance with
            </span>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">{friend.name}</h2>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-1.5">
          {oldestPendingDays >= 14 && (
            <span
              title={`Oldest outing was ${oldestPendingDays} days ago`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400"
            >
              <Clock className="w-3 h-3" />
              <span>{oldestPendingDays}d</span>
            </span>
          )}

          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border shadow-sm ${
              friendOwesYou
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : youOweFriend
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400'
                : 'bg-teal-500/15 border-teal-500/30 text-teal-700 dark:text-teal-300'
            }`}
          >
            {friendOwesYou && <ArrowDownLeft className="w-3.5 h-3.5" />}
            {youOweFriend && <ArrowUpRight className="w-3.5 h-3.5" />}
            {isSettled && <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" />}
            {friendOwesYou && `${friend.name.split(' ')[0]} owes you`}
            {youOweFriend && `You owe ${friend.name.split(' ')[0]}`}
            {isSettled && 'All Settled Up'}
          </span>
        </div>
      </div>

      {/* Big Balance Display */}
      <div className="relative my-3">
        <div className="flex items-baseline gap-1">
          <span
            className={`text-4xl sm:text-5xl font-black tracking-tight drop-shadow-sm transition-colors ${
              friendOwesYou
                ? 'text-emerald-600 dark:text-emerald-400'
                : youOweFriend
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-800 dark:text-slate-100'
            }`}
          >
            {formatMoney(netBalance, state.currency)}
          </span>
        </div>

        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {friendOwesYou && `You're in the green! ${friend.name.split(' ')[0]} should pay you back.`}
          {youOweFriend && `You're in the red. Don't forget to pay ${friend.name.split(' ')[0]} back!`}
          {isSettled && 'No pending debts between you two. Everything is square! 🙌'}
        </p>
      </div>

      {/* Sub metrics stats */}
      <div className="grid grid-cols-3 gap-2 mt-5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold truncate">
              Lent
            </p>
            <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
              {formatMoney(owedToActiveUser, state.currency)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-500/15 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold truncate">
              Borrowed
            </p>
            <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
              {formatMoney(owedByActiveUser, state.currency)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/15 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold truncate">
              Settled
            </p>
            <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
              {formatMoney(settledTotal, state.currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons: Settle Up & Share */}
      <div className="flex items-center gap-2.5 mt-5">
        {isSettled ? (
          <button
            onClick={handleCelebrate}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md active:scale-[0.98] bg-teal-500/15 hover:bg-teal-500/25 text-teal-700 dark:text-teal-300 border border-teal-500/30"
          >
            <PartyPopper className="w-4 h-4" />
            <span>Celebrate 0 Balance 🎉</span>
          </button>
        ) : (
          <button
            onClick={onOpenSettle}
            title="Settle Up (Press S)"
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md active:scale-[0.98] ${
              friendOwesYou
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/20'
                : 'bg-gradient-to-r from-rose-500 to-amber-500 text-white hover:from-rose-400 hover:to-amber-400 shadow-rose-500/20'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Settle Up</span>
          </button>
        )}

        <button
          onClick={onOpenShare}
          className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 font-medium text-sm transition-all active:scale-[0.98] shadow-sm"
          title="Send WhatsApp or copy balance breakdown"
        >
          <Share2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          <span className="hidden sm:inline">Send Ping</span>
        </button>
      </div>
    </div>
  );
};