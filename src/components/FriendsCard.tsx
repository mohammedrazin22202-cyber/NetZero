import React from 'react';
import { ArrowRight, ChevronRight, Plus } from 'lucide-react';
import { UserProfile, Currency } from '../types';

interface FriendsCardProps {
  friend: UserProfile;
  friendCount?: number;
  transactionCount?: number;
  netBalance?: number;
  currency: Currency;
  onViewAll?: () => void;
  onSelectFriend?: (friendId: string) => void;
  onAddFriend?: () => void;
}

export const FriendsCard: React.FC<FriendsCardProps> = ({
  friend,
  friendCount = 1,
  transactionCount = 0,
  netBalance = 0,
  currency,
  onViewAll,
  onSelectFriend,
  onAddFriend,
}) => {
  const isZero = Math.abs(netBalance) < 0.005;
  const isOwed = netBalance > 0.005;
  const balancePrefix = isZero ? '' : isOwed ? '+' : '-';
  const balanceText = `${balancePrefix}${currency.symbol}${Math.abs(netBalance).toFixed(2)}`;
  const statusText = isZero ? 'Settled up' : isOwed ? 'Owes you' : 'You owe';

  return (
    <div className="neon-glass-card rounded-3xl p-5 select-none flex flex-col justify-between h-[215px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          Friends ({friendCount})
        </h3>
        <button
          onClick={onViewAll}
          className="text-xs sm:text-sm font-semibold text-[#0284c7] dark:text-cyan-400 hover:opacity-80 flex items-center gap-1 transition-opacity"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* Friend Item (Soft Lavender White in light mode) */}
      <div
        onClick={() => onSelectFriend?.(friend.id)}
        className="rounded-2xl p-3 bg-[#faf8ff] dark:bg-[#19112d]/90 border border-purple-200/80 dark:border-purple-500/30 flex items-center justify-between gap-3 cursor-pointer hover:border-purple-300 dark:hover:border-purple-400/60 hover:bg-white dark:hover:bg-[#22163d] transition-all group"
      >
        {/* Left: Avatar & Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#8b5cf6] via-[#c084fc] to-[#fb923c] dark:from-purple-700 dark:via-purple-600 dark:to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_12px_rgba(192,132,252,0.35)] shrink-0">
            {friend.name ? friend.name.charAt(0).toUpperCase() : 'S'}
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-[#0284c7] dark:group-hover:text-cyan-300 transition-colors">
              {friend.name}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {transactionCount} transactions
            </span>
          </div>
        </div>

        {/* Right: Amount & Chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex flex-col items-end">
            <span className={`text-base font-bold tracking-tight ${
              isZero
                ? 'text-emerald-600 dark:text-emerald-400'
                : isOwed
                ? 'text-[#0284c7] dark:text-cyan-400'
                : 'text-[#ea580c] dark:text-[#e879f9]'
            }`}>
              {balanceText}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {statusText}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
        </div>
      </div>

      {/* Bottom Full-Width Add Friend Button (Sunset Peach in light mode) */}
      <div className="mt-2">
        <button
          onClick={onAddFriend}
          className="w-full py-2.5 rounded-2xl bg-white dark:bg-[#18112c]/85 border border-[#fed7aa] dark:border-purple-500/35 hover:border-[#fb923c] dark:hover:border-purple-400/70 text-[#ea580c] dark:text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_2px_12px_rgba(251,146,60,0.15)] dark:shadow-[0_0_14px_rgba(168,85,247,0.18)] hover:shadow-[0_4px_16px_rgba(251,146,60,0.25)] transition-all active:scale-[0.99]"
        >
          <Plus className="w-4 h-4 stroke-[2.5] text-[#ea580c] dark:text-purple-400" />
          <span>Add Friend</span>
        </button>
      </div>
    </div>
  );
};
