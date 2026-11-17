import React, { useRef, useEffect } from 'react';
import { Bell, CheckCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { Transaction, UserProfile, Currency } from '../types';

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  transactions?: Transaction[];
  activeFriend?: UserProfile;
  currency?: Currency;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  isOpen,
  onClose,
  transactions = [],
  activeFriend,
  currency,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const friendName = activeFriend?.name ? activeFriend.name.split(' ')[0] : 'friend';
  const currencySymbol = currency?.symbol || '$';

  // Build notifications from recent activity or helpful updates
  const recentTxs = transactions.slice(0, 3);

  return (
    <div
      ref={popoverRef}
      className="absolute right-4 sm:right-6 top-16 z-50 w-80 sm:w-88 rounded-2xl bg-white/95 dark:bg-[#140d25]/95 backdrop-blur-2xl border border-purple-200 dark:border-purple-500/30 p-4 shadow-[0_12px_36px_rgba(192,132,252,0.25)] dark:shadow-[0_0_30px_rgba(168,85,247,0.3)] animate-fadeIn select-none text-slate-900 dark:text-white"
    >
      <div className="flex items-center justify-between pb-3 border-b border-purple-100 dark:border-purple-500/20 mb-3">
        <h4 className="text-sm font-bold flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#0284c7] dark:text-cyan-400" />
          <span>Activity & Notifications</span>
        </h4>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e0f2fe] dark:bg-cyan-950 border border-[#7dd3fc] dark:border-cyan-500/40 text-[#0284c7] dark:text-cyan-400 font-semibold">
          {recentTxs.length > 0 ? `${recentTxs.length} Recent` : 'All Caught Up'}
        </span>
      </div>

      <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-0.5">
        {recentTxs.length > 0 ? (
          recentTxs.map((tx) => {
            const isSettlement = tx.isSettlement;
            return (
              <div
                key={tx.id}
                className="p-2.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-500/20 hover:border-purple-300 dark:hover:border-purple-400/50 transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center gap-1.5 truncate">
                    {isSettlement ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-[#0284c7] dark:text-cyan-400 shrink-0" />
                    )}
                    <span className="truncate">{tx.title}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 shrink-0 ml-1">
                    {tx.date}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                  {currencySymbol}{tx.amount.toFixed(2)} recorded • {tx.note || (isSettlement ? 'Settled balance' : `With ${friendName}`)}
                </p>
              </div>
            );
          })
        ) : (
          <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
            No recent activity with {friendName} yet.
          </div>
        )}

        <div className="p-2.5 rounded-xl bg-[#e0f2fe]/60 dark:bg-cyan-950/30 border border-[#bae6fd] dark:border-cyan-500/20">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#0284c7] dark:text-cyan-300 flex items-center gap-1.5">
              <CheckCheck className="w-3.5 h-3.5" />
              <span>NetZero Sync Active</span>
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Live</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-snug">
            All calculations and shared ledger states are automatically synced.
          </p>
        </div>
      </div>
    </div>
  );
};
