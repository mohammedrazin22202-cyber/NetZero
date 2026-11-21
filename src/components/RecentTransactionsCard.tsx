import React from 'react';
import { ArrowRight, Utensils, Clapperboard, Car, Receipt, Coffee, ShoppingBag, Trash2, HandCoins } from 'lucide-react';
import { Transaction, Currency, UserProfile } from '../types';

interface RecentTransactionsCardProps {
  transactions: Transaction[];
  currentUser: UserProfile;
  activeFriend: UserProfile;
  currency: Currency;
  onViewAll?: () => void;
  onSelectTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
}

export const RecentTransactionsCard: React.FC<RecentTransactionsCardProps> = ({
  transactions,
  currentUser,
  activeFriend,
  currency,
  onViewAll,
  onSelectTransaction,
  onDeleteTransaction,
}) => {
  const recent = transactions.slice(0, 3);

  const getCategoryDetails = (category: string, title: string) => {
    const t = (title || '').toLowerCase();
    const c = (category || '').toLowerCase();

    if (t.includes('dinner') || t.includes('food') || c === 'food') {
      return {
        icon: <Utensils className="w-4 h-4 stroke-[2.2]" />,
        bg: 'bg-[#fff4ed] dark:bg-[#0a232e]/90 border border-[#fed7aa] dark:border-teal-500/50 text-[#ea580c] dark:text-teal-400 shadow-[0_0_10px_rgba(251,146,60,0.25)] dark:shadow-[0_0_10px_rgba(20,184,166,0.3)]',
      };
    }
    if (t.includes('movie') || t.includes('ticket') || c === 'entertainment') {
      return {
        icon: <Clapperboard className="w-4 h-4 stroke-[2.2]" />,
        bg: 'bg-[#f5efff] dark:bg-[#251042]/90 border border-[#d8b4fe] dark:border-purple-500/50 text-[#9333ea] dark:text-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.25)] dark:shadow-[0_0_10px_rgba(168,85,247,0.3)]',
      };
    }
    if (t.includes('cab') || t.includes('uber') || t.includes('ride') || c === 'transport') {
      return {
        icon: <Car className="w-4 h-4 stroke-[2.2]" />,
        bg: 'bg-[#e0f2fe] dark:bg-[#0a232e]/90 border border-[#7dd3fc] dark:border-teal-500/50 text-[#0284c7] dark:text-teal-400 shadow-[0_0_10px_rgba(56,189,248,0.25)] dark:shadow-[0_0_10px_rgba(20,184,166,0.3)]',
      };
    }
    if (c === 'drinks' || t.includes('coffee')) {
      return {
        icon: <Coffee className="w-4 h-4 stroke-[2.2]" />,
        bg: 'bg-[#fff7ed] dark:bg-[#2b1704]/90 border border-[#fdba74] dark:border-amber-500/50 text-[#ea580c] dark:text-amber-400',
      };
    }
    if (c === 'shopping') {
      return {
        icon: <ShoppingBag className="w-4 h-4 stroke-[2.2]" />,
        bg: 'bg-[#fdf2f8] dark:bg-[#2e0921]/90 border border-[#f472b6] dark:border-pink-500/50 text-[#db2777] dark:text-pink-400',
      };
    }
    if (c === 'loan' || t.toLowerCase().includes('loan')) {
      return {
        icon: <HandCoins className="w-4 h-4 stroke-[2.2]" />,
        bg: 'bg-emerald-50 dark:bg-emerald-950/90 border border-emerald-400 dark:border-emerald-500/50 text-emerald-600 dark:text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.25)]',
      };
    }
    return {
      icon: <Receipt className="w-4 h-4 stroke-[2.2]" />,
      bg: 'bg-[#f5efff] dark:bg-[#251042]/90 border border-[#d8b4fe] dark:border-purple-500/50 text-[#9333ea] dark:text-purple-400',
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
    <div className="neon-glass-card rounded-3xl p-5 select-none flex flex-col justify-between h-[215px]">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Recent Transactions
          </h3>
          <button
            onClick={onViewAll}
            className="text-xs sm:text-sm font-semibold text-[#0284c7] dark:text-cyan-400 hover:opacity-80 flex items-center gap-1 transition-opacity"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
        {/* Subtle Hairline Horizontal Divider */}
        <div className="w-full h-px bg-purple-200/50 dark:bg-purple-500/20 mb-2" />
      </div>

      {/* Transactions List */}
      <div className="flex flex-col justify-between flex-1 py-1">
        {recent.length === 0 ? (
          <div className="py-6 text-center text-sm text-slate-400">
            No transactions yet.
          </div>
        ) : (
          recent.map((tx) => {
            const isUserPayer = tx.paidBy === currentUser.id;
            const friendName = activeFriend.name.split(' ')[0] || 'Sam';
            const isLoan = Boolean(tx.isLoan || tx.category === 'loan' || tx.type === 'loan');
            const { icon, bg } = getCategoryDetails(tx.category, tx.title);
            const dateLabel = formatShortDate(tx.date);

            return (
              <div
                key={tx.id}
                onClick={() => onSelectTransaction?.(tx)}
                className="py-1 px-2 flex items-center justify-between gap-3 group cursor-pointer hover:bg-purple-50/60 dark:hover:bg-white/[0.03] rounded-2xl transition-colors"
              >
                {/* Left: Icon & Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${bg}`}>
                    {icon}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-[#0284c7] dark:group-hover:text-cyan-300 transition-colors">
                        {tx.title}
                      </span>
                      {isLoan && (
                        <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold border border-emerald-500/30 shrink-0">
                          Loan
                        </span>
                      )}
                      {tx.approvalStatus === 'pending_approval' && (
                        <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[9px] font-bold border border-amber-500/30 shrink-0">
                          ⏳ Pending
                        </span>
                      )}
                      {tx.approvalStatus === 'on_hold' && (
                        <span className="px-1.5 py-0.2 rounded-md bg-orange-500/20 text-orange-700 dark:text-orange-300 text-[9px] font-bold border border-orange-500/30 shrink-0">
                          🔒 Hold
                        </span>
                      )}
                      {tx.approvalStatus === 'disputed_review' && (
                        <span className="px-1.5 py-0.2 rounded-md bg-purple-500/20 text-purple-700 dark:text-purple-300 text-[9px] font-bold border border-purple-500/30 shrink-0">
                          ⚖️ Review
                        </span>
                      )}
                      {tx.approvalStatus === 'rejected' && (
                        <span className="px-1.5 py-0.2 rounded-md bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[9px] font-bold border border-rose-500/30 shrink-0">
                          ❌ Rejected
                        </span>
                      )}
                      {tx.deletionStatus === 'pending_deletion' && (
                        <span className="px-1.5 py-0.2 rounded-md bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[9px] font-bold border border-rose-500/30 shrink-0">
                          🗑️ Deletion Pending
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {isLoan
                        ? isUserPayer
                          ? `You loaned  •  to ${friendName}`
                          : `${friendName} loaned  •  to you`
                        : isUserPayer
                        ? `You paid  •  with ${friendName}`
                        : `${friendName} paid  •  for you`}
                    </span>
                  </div>
                </div>

                {/* Right: Date, Amount & Delete */}
                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                  <span className="text-xs text-slate-500 dark:text-slate-400 min-w-[45px] text-right">
                    {dateLabel}
                  </span>

                  <span className={`text-base font-bold min-w-[65px] text-right ${
                    isUserPayer ? 'text-[#0284c7] dark:text-cyan-400' : 'text-[#ea580c] dark:text-[#e879f9]'
                  }`}>
                    {currency.symbol}{tx.amount.toFixed(2)}
                  </span>

                  {onDeleteTransaction && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteTransaction(tx.id);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 opacity-70 hover:opacity-100 transition-all"
                      title="Delete transaction"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
