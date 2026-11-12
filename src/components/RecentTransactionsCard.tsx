import React from 'react';
import { ArrowRight, Utensils, Clapperboard, Car, Receipt, Coffee, ShoppingBag } from 'lucide-react';
import { Transaction, Currency, UserProfile } from '../types';

interface RecentTransactionsCardProps {
  transactions: Transaction[];
  currentUser: UserProfile;
  activeFriend: UserProfile;
  currency: Currency;
  onViewAll?: () => void;
  onSelectTransaction?: (tx: Transaction) => void;
}

export const RecentTransactionsCard: React.FC<RecentTransactionsCardProps> = ({
  transactions,
  currentUser,
  activeFriend,
  currency,
  onViewAll,
  onSelectTransaction,
}) => {
  // Sort newest first and pick top 3
  const recent = transactions.slice(0, 3);

  const getCategoryIcon = (category: string, title: string) => {
    const t = (title || '').toLowerCase();
    const c = (category || '').toLowerCase();

    if (t.includes('dinner') || t.includes('food') || c === 'food') {
      return {
        icon: <Utensils className="w-4 h-4 stroke-[2.2]" />,
        bg: 'bg-teal-950/80 border-teal-500/40 text-teal-400',
      };
    }
    if (t.includes('movie') || t.includes('ticket') || c === 'entertainment') {
      return {
        icon: <Clapperboard className="w-4 h-4 stroke-[2.2]" />,
        bg: 'bg-purple-950/80 border-purple-500/40 text-purple-400',
      };
    }
    if (t.includes('cab') || t.includes('uber') || t.includes('ride') || c === 'transport') {
      return {
        icon: <Car className="w-4 h-4 stroke-[2.2]" />,
        bg: 'bg-teal-950/80 border-teal-500/40 text-teal-400',
      };
    }
    if (c === 'drinks' || t.includes('coffee')) {
      return {
        icon: <Coffee className="w-4 h-4 stroke-[2.2]" />,
        bg: 'bg-amber-950/80 border-amber-500/40 text-amber-400',
      };
    }
    if (c === 'shopping') {
      return {
        icon: <ShoppingBag className="w-4 h-4 stroke-[2.2]" />,
        bg: 'bg-pink-950/80 border-pink-500/40 text-pink-400',
      };
    }
    return {
      icon: <Receipt className="w-4 h-4 stroke-[2.2]" />,
      bg: 'bg-purple-950/80 border-purple-500/40 text-purple-400',
    };
  };

  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        return `${monthNames[m]} ${String(d).padStart(2, '0')}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="neon-glass-card rounded-3xl p-5 sm:p-6 select-none flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-white">
          Recent Transactions
        </h3>
        <button
          onClick={onViewAll}
          className="text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* Transactions List */}
      <div className="flex flex-col divide-y divide-purple-500/10">
        {recent.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">
            No transactions yet. Add your first expense above!
          </div>
        ) : (
          recent.map((tx) => {
            const isUserPayer = tx.paidBy === currentUser.id;
            const friendName = activeFriend.name.split(' ')[0] || 'Sam';
            const { icon, bg } = getCategoryIcon(tx.category, tx.title);
            const dateLabel = formatShortDate(tx.date);

            return (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction?.(tx)}
                className="py-3.5 flex items-center justify-between gap-3 group cursor-pointer hover:bg-white/[0.02] rounded-xl px-2 -mx-2 transition-colors"
              >
                {/* Left: Icon & Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 ${bg}`}>
                    {icon}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                      {tx.title}
                    </span>
                    <span className="text-xs text-slate-400 truncate">
                      {isUserPayer ? `You paid • with ${friendName}` : `${friendName} paid • for you`}
                    </span>
                  </div>
                </div>

                {/* Right: Date & Amount */}
                <div className="flex items-center gap-6 shrink-0">
                  <span className="text-xs text-slate-400">
                    {dateLabel}
                  </span>

                  <span className={`text-sm sm:text-base font-bold min-w-[70px] text-right ${
                    isUserPayer ? 'text-cyan-400' : 'text-fuchsia-400'
                  }`}>
                    {currency.symbol}{tx.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
