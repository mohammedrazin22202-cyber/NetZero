import React, { useEffect } from 'react';
import { X, Info, ArrowUpRight, ArrowDownRight, Scale } from 'lucide-react';
import { Currency, UserProfile } from '../types';
import { formatMoney } from '../utils/formatters';

interface BalanceInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  netBalance: number;
  totalLent: number;
  totalBorrowed: number;
  settledTotal: number;
  currency: Currency;
  activeUser: UserProfile;
  friend: UserProfile;
  onOpenSettle?: () => void;
  onOpenShare?: () => void;
}

export const BalanceInfoModal: React.FC<BalanceInfoModalProps> = ({
  isOpen,
  onClose,
  netBalance,
  totalLent,
  totalBorrowed,
  settledTotal,
  currency,
  activeUser,
  friend,
  onOpenSettle,
  onOpenShare,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isPositive = netBalance > 0.005;
  const isZero = Math.abs(netBalance) <= 0.005;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-[#140d25] border border-purple-200 dark:border-purple-500/40 rounded-3xl shadow-2xl p-6 text-slate-900 dark:text-white flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-100 dark:border-purple-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#e0f2fe] dark:bg-cyan-950/80 border border-[#7dd3fc] dark:border-cyan-500/40 flex items-center justify-center text-[#0284c7] dark:text-cyan-400">
              <Info className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold">Balance Calculation</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">How your net balance is computed</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Calculation Formula Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-500/20 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">1. Total Lent by {activeUser.name}:</span>
            <span className="font-bold text-[#0284c7] dark:text-cyan-400 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +{formatMoney(totalLent, currency)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">2. Total Borrowed by {activeUser.name}:</span>
            <span className="font-bold text-[#ea580c] dark:text-fuchsia-400 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              -{formatMoney(totalBorrowed, currency)}
            </span>
          </div>

          {settledTotal > 0 && (
            <div className="flex items-center justify-between text-xs pt-1 border-t border-purple-100 dark:border-purple-500/20">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Total Past Settlements:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatMoney(settledTotal, currency)}
              </span>
            </div>
          )}

          <div className="pt-2 border-t border-purple-200 dark:border-purple-500/30 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-purple-500" />
              Net Balance:
            </span>
            <span
              className={`text-lg font-black tracking-tight ${
                isZero
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : isPositive
                  ? 'text-[#0284c7] dark:text-cyan-400'
                  : 'text-[#ea580c] dark:text-fuchsia-400'
              }`}
            >
              {isZero ? '' : isPositive ? '+' : '-'}
              {formatMoney(Math.abs(netBalance), currency)}
            </span>
          </div>
        </div>

        {/* Status Explanation */}
        <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-500/20 text-xs">
          {isZero ? (
            <p className="text-emerald-700 dark:text-emerald-300 font-medium leading-relaxed">
              🎉 <strong>All Settled Up!</strong> You and {friend.name} are completely even with a zero balance.
            </p>
          ) : isPositive ? (
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>{friend.name} owes you {formatMoney(netBalance, currency)}.</strong> When {friend.name} pays you back, record a settlement to bring the balance back to zero.
            </p>
          ) : (
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              <strong>You owe {friend.name} {formatMoney(Math.abs(netBalance), currency)}.</strong> Use the Settle Up button to generate a payment QR or link to pay them.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          {onOpenShare && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenShare();
              }}
              className="flex-1 py-2.5 px-3 rounded-xl border border-purple-200 dark:border-purple-500/30 text-xs font-semibold hover:bg-purple-50 dark:hover:bg-white/5 transition-colors text-purple-900 dark:text-purple-300"
            >
              Share Summary
            </button>
          )}
          {onOpenSettle && !isZero && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSettle();
              }}
              className="flex-1 py-2.5 px-3 rounded-xl btn-neon-cyan text-xs font-bold uppercase tracking-wider"
            >
              Settle Balance
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className={`${isZero || !onOpenSettle ? 'w-full' : 'px-4'} py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-xs font-semibold transition-colors`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
