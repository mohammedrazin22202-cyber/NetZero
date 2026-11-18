import React, { useRef, useEffect } from 'react';
import { Bell, Sparkles, CheckCircle2, Check, CheckCheck } from 'lucide-react';
import { Transaction, UserProfile, Currency } from '../types';

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  transactions?: Transaction[];
  activeFriend?: UserProfile;
  currency?: Currency;
  acknowledgedIds?: string[];
  onAcknowledge?: (id: string) => void;
  onAcknowledgeAll?: (ids: string[]) => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  isOpen,
  onClose,
  transactions = [],
  activeFriend,
  currency,
  acknowledgedIds = [],
  onAcknowledge,
  onAcknowledgeAll,
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

  // Filter only unacknowledged notifications
  const activeTxs = transactions.filter((t) => !acknowledgedIds.includes(t.id));
  const recentTxs = activeTxs.slice(0, 5);

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
        <div className="flex items-center gap-2">
          {recentTxs.length > 1 && onAcknowledgeAll && (
            <button
              type="button"
              onClick={() => onAcknowledgeAll(recentTxs.map((t) => t.id))}
              className="text-[10px] text-purple-600 dark:text-purple-300 hover:underline font-semibold cursor-pointer"
            >
              Acknowledge All
            </button>
          )}
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e0f2fe] dark:bg-cyan-950 border border-[#7dd3fc] dark:border-cyan-500/40 text-[#0284c7] dark:text-cyan-400 font-semibold">
            {recentTxs.length > 0 ? `${recentTxs.length} New` : 'Caught Up'}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-0.5">
        {recentTxs.length > 0 ? (
          recentTxs.map((tx) => {
            const isSettlement = tx.isSettlement;
            const isLoan = Boolean(tx.isLoan || tx.category === 'loan' || tx.type === 'loan');

            return (
              <div
                key={tx.id}
                className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-500/20 hover:border-purple-300 dark:hover:border-purple-400/50 transition-colors flex flex-col gap-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center gap-1.5 truncate">
                    {isSettlement ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    ) : isLoan ? (
                      <span className="text-xs">🤝</span>
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-[#0284c7] dark:text-cyan-400 shrink-0" />
                    )}
                    <span className="truncate">{tx.title}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 shrink-0 ml-1">
                    {tx.date}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                  {currencySymbol}{tx.amount.toFixed(2)} recorded • {tx.note || (isSettlement ? 'Settled balance' : isLoan ? `Loan with ${friendName}` : `With ${friendName}`)}
                </p>

                {/* Acknowledge Button to dismiss/close */}
                <div className="flex items-center justify-between pt-1.5 border-t border-purple-100/60 dark:border-purple-500/20">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {isSettlement ? 'Settlement' : isLoan ? 'Cash Loan' : 'Expense'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAcknowledge?.(tx.id);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-purple-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-purple-200 hover:text-emerald-700 dark:hover:text-emerald-300 border border-purple-200 dark:border-purple-500/30 hover:border-emerald-400 dark:hover:border-emerald-500/50 text-[10px] font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                    title="Acknowledge and close this notification"
                  >
                    <Check className="w-3 h-3 text-emerald-500 stroke-[2.5]" />
                    <span>Acknowledge</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                All notifications acknowledged
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                You're all caught up with {friendName}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
