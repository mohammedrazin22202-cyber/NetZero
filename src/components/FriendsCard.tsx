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
  transactionCount = 3,
  netBalance = 46.75,
  currency,
  onViewAll,
  onSelectFriend,
  onAddFriend,
}) => {
  const isOwed = netBalance >= 0;
  const balancePrefix = isOwed ? '+' : '-';
  const balanceText = `${balancePrefix}${currency.symbol}${Math.abs(netBalance).toFixed(2)}`;

  return (
    <div className="neon-glass-card rounded-3xl p-5 select-none flex flex-col justify-between h-[215px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold text-white">
          Friends ({friendCount})
        </h3>
        <button
          onClick={onViewAll}
          className="text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* Friend Item */}
      <div
        onClick={() => onSelectFriend?.(friend.id)}
        className="rounded-2xl p-3 bg-[#19112d]/90 border border-purple-500/30 flex items-center justify-between gap-3 cursor-pointer hover:border-purple-400/60 hover:bg-[#22163d] transition-all group"
      >
        {/* Left: Avatar & Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-700 via-purple-600 to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_12px_rgba(168,85,247,0.45)] shrink-0">
            {friend.name ? friend.name.charAt(0).toUpperCase() : 'S'}
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
              {friend.name}
            </span>
            <span className="text-xs text-slate-400 truncate">
              {transactionCount} transactions
            </span>
          </div>
        </div>

        {/* Right: Amount & Chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex flex-col items-end">
            <span className={`text-base font-bold tracking-tight ${
              isOwed ? 'text-cyan-400' : 'text-[#e879f9]'
            }`}>
              {balanceText}
            </span>
            <span className="text-[11px] text-slate-400">
              {isOwed ? 'Owes you' : 'You owe'}
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
        </div>
      </div>

      {/* Bottom Full-Width Add Friend Button */}
      <div className="mt-2">
        <button
          onClick={onAddFriend}
          className="w-full py-2.5 rounded-2xl bg-[#18112c]/85 border border-purple-500/35 hover:border-purple-400/70 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_14px_rgba(168,85,247,0.18)] hover:shadow-[0_0_22px_rgba(168,85,247,0.35)] transition-all active:scale-[0.99]"
        >
          <Plus className="w-4 h-4 stroke-[2.5] text-purple-400" />
          <span>Add Friend</span>
        </button>
      </div>
    </div>
  );
};
