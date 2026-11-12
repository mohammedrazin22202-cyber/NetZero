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
  const recent = transactions.slice(0, 3);

  const getCategoryDetails = (category: string, title: string) => {
    const t = (title || '').toLowerCase();
    const c = (category || '').toLowerCase();

    if (t.includes('dinner') || t.includes('food') || c === 'food') {
      return {
        icon: <Utensils className="w-4 h-4 stroke-[2.2]" />,
        bg: 'bg-[#0a232e]/90 border border-teal-500/50 text-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.3)]',
      };
    }
    if (t.includes('movie') || t.includes('ticket') || c === 'entertainment') {
      return {
        icon: <Clapperboard className="w-4 h-4 stroke-[2.2]" />,
        bg: 'bg-[#251042]/90 border border-purple-500/50 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.3)]',
      };
    }
    if (t.includes('cab') || t.includes('uber') || t.includes('ride') || c === 'transport') {
      return {
        icon: <Car className="w-4 h-4 stroke-[2.2]" />,
        bg: 'bg-[#0a232e]/90 border border-teal-500/50 text-teal-400 shadow-[0_0_10px_rgba(20,184,166,0.3)]',
      };
    }
    if (c === 'drinks' || t.includes('coffee')) {
      return {
        icon: <Coffee className="w-4 h-4 stroke-[2.2]" />,
        bg: 'bg-[#2b1704]/90 border border-amber-500/50 text-amber-400',
      };
    }
    if (c === 'shopping') {
      return {
        icon: <ShoppingBag className="w-4 h-4 stroke-[2.2]" />,
        bg: 'bg-[#2e0921]/90 border border-pink-500/50 text-pink-400',
      };
    }
    return {
      icon: <Receipt className="w-4 h-4 stroke-[2.2]" />,
      bg: 'bg-[#251042]/90 border border-purple-500/50 text-purple-400',
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
    <div className="neon-glass-card rounded-3xl p-5 select-none flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
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
      <div className="flex flex-col gap-2">
        {recent.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">
            No transactions yet.
          </div>
        ) : (
          recent.map((tx) => {
            const isUserPayer = tx.paidBy === currentUser.id;
            const friendName = activeFriend.name.split(' ')[0] || 'Sam';
            const { icon, bg } = getCategoryDetails(tx.category, tx.title);
            const dateLabel = formatShortDate(tx.date);

            return (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction?.(tx)}
                className="py-2.5 px-2 flex items-center justify-between gap-3 group cursor-pointer hover:bg-white/[0.03] rounded-2xl transition-colors"
              >
                {/* Left: Icon & Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
                    {icon}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                      {tx.title}
                    </span>
                    <span className="text-xs text-slate-400 truncate">
                      {isUserPayer ? `You paid  •  with ${friendName}` : `${friendName} paid  •  for you`}
                    </span>
                  </div>
                </div>

                {/* Right: Date & Amount */}
                <div className="flex items-center gap-6 shrink-0">
                  <span className="text-xs text-slate-400 min-w-[45px] text-right">
                    {dateLabel}
                  </span>

                  <span className={`text-base font-bold min-w-[70px] text-right ${
                    isUserPayer ? 'text-cyan-400' : 'text-[#e879f9]'
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
