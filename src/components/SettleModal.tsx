import React, { useState, useEffect } from 'react';
import { AppState } from '../types';
import { calculateBalance, formatMoney } from '../utils/formatters';
import { QRCodeDisplay } from './QRCodeDisplay';
import { X, Check, QrCode, ExternalLink, AlertCircle } from 'lucide-react';

interface SettleModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onSettle: (amount: number, paidBy: string, beneficiaryId: string, note: string) => void;
}

export const SettleModal: React.FC<SettleModalProps> = ({ isOpen, onClose, state, onSettle }) => {
  const activeUser = state.activeUserId === state.user1.id ? state.user1 : state.user2;
  const friend = state.activeUserId === state.user1.id ? state.user2 : state.user1;

  const { netBalance } = calculateBalance(state.transactions, activeUser.id, friend.id);

  const debtor = netBalance > 0 ? friend : activeUser;
  const creditor = netBalance > 0 ? activeUser : friend;
  const defaultAmount = Math.abs(netBalance);

  const [settleAmount, setSettleAmount] = useState<string>(defaultAmount.toFixed(2));
  const [showQR, setShowQR] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'upi' | 'paypal' | 'venmo' | 'cash'>('upi');
  const [note, setNote] = useState('Account balance settled');

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Sync state whenever modal opens or netBalance / active user changes
  useEffect(() => {
    if (isOpen) {
      setSettleAmount(defaultAmount.toFixed(2));
      setShowQR(false);
      setPaymentMode(
        creditor.upiId
          ? 'upi'
          : creditor.paypalUser
          ? 'paypal'
          : creditor.venmoUser
          ? 'venmo'
          : 'cash'
      );
      setNote('Account balance settled');
    }
  }, [isOpen, defaultAmount, creditor.upiId, creditor.paypalUser, creditor.venmoUser]);

  if (!isOpen || Math.abs(netBalance) < 0.005) return null;

  const amountToSettle = parseFloat(settleAmount);
  const isAmountValid = !isNaN(amountToSettle) && amountToSettle > 0;

  // Build Payment URL / UPI String
  const upiUrl =
    creditor.upiId && isAmountValid
      ? `upi://pay?pa=${encodeURIComponent(creditor.upiId)}&pn=${encodeURIComponent(
          creditor.name
        )}&am=${amountToSettle.toFixed(2)}&cu=${state.currency.code}&tn=Account+Settlement`
      : '';

  const paypalUrl =
    creditor.paypalUser && isAmountValid
      ? `https://paypal.me/${creditor.paypalUser}/${amountToSettle.toFixed(2)}`
      : '';

  const venmoUrl =
    creditor.venmoUser && isAmountValid
      ? `https://venmo.com/${creditor.venmoUser}?txn=pay&amount=${amountToSettle.toFixed(2)}&note=Account+Settlement`
      : '';

  const qrValue =
    paymentMode === 'upi' && upiUrl
      ? upiUrl
      : paymentMode === 'paypal' && paypalUrl
      ? paypalUrl
      : paymentMode === 'venmo' && venmoUrl
      ? venmoUrl
      : `Payment of ${state.currency.symbol}${isAmountValid ? amountToSettle.toFixed(2) : '0'} to ${creditor.name}`;

  const handleConfirm = () => {
    if (!isAmountValid) return;
    onSettle(amountToSettle, debtor.id, creditor.id, note);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-slate-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤝</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Settle Up Balances
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="text-3xl">{debtor.avatar}</div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Payment Flow</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                <span className="text-rose-600 dark:text-rose-400">{debtor.name}</span> pays{' '}
                <span className="text-emerald-600 dark:text-emerald-400">{creditor.name}</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 dark:text-slate-400">Total Due</span>
              <p className="text-base font-black text-emerald-600 dark:text-emerald-400">
                {formatMoney(defaultAmount, state.currency)}
              </p>
            </div>
          </div>

          {/* Amount to Settle Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Settlement Amount
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-xl font-bold text-slate-400 dark:text-slate-500">
                {state.currency.symbol}
              </span>
              <input
                type="number"
                step="any"
                min="0.01"
                value={settleAmount}
                onChange={(e) => setSettleAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-2xl text-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <button
                type="button"
                onClick={() => setSettleAmount(defaultAmount.toFixed(2))}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-500/30"
              >
                100% Full ({formatMoney(defaultAmount, state.currency)})
              </button>
              {defaultAmount > 5 && (
                <button
                  type="button"
                  onClick={() => setSettleAmount((defaultAmount / 2).toFixed(2))}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
                >
                  50% Half ({formatMoney(defaultAmount / 2, state.currency)})
                </button>
              )}
              {defaultAmount > 20 && (
                <button
                  type="button"
                  onClick={() => setSettleAmount((defaultAmount / 4).toFixed(2))}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium"
                >
                  25% ({formatMoney(defaultAmount / 4, state.currency)})
                </button>
              )}
            </div>
          </div>

          {/* Payment Method Selector & Instant QR */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Payment Channel
              </label>
              <button
                type="button"
                onClick={() => setShowQR(!showQR)}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <QrCode className="w-3.5 h-3.5" />
                {showQR ? 'Hide QR' : 'Show Pay QR'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setPaymentMode('upi');
                  setShowQR(true);
                }}
                className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                  paymentMode === 'upi'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                UPI / QR
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentMode('paypal');
                  setShowQR(true);
                }}
                className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                  paymentMode === 'paypal'
                    ? 'bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                PayPal
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentMode('venmo');
                  setShowQR(true);
                }}
                className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                  paymentMode === 'venmo'
                    ? 'bg-sky-500/20 border-sky-500 text-sky-700 dark:text-sky-300'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Venmo
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentMode('cash');
                  setShowQR(false);
                }}
                className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                  paymentMode === 'cash'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                💵 Cash / Bank
              </button>
            </div>
          </div>

          {/* Missing info notice */}
          {paymentMode === 'upi' && !creditor.upiId && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                No UPI ID configured for {creditor.name}. You can add one in Settings.
              </span>
            </div>
          )}

          {paymentMode === 'paypal' && !creditor.paypalUser && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                No PayPal username configured for {creditor.name}. You can add one in Settings.
              </span>
            </div>
          )}

          {paymentMode === 'venmo' && !creditor.venmoUser && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                No Venmo username configured for {creditor.name}. You can add one in Settings.
              </span>
            </div>
          )}

          {/* QR Code Container */}
          {showQR && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center animate-in fade-in duration-200">
              <QRCodeDisplay
                value={qrValue}
                size={160}
                label={`Scan to pay ${creditor.name} ${formatMoney(isAmountValid ? amountToSettle : 0, state.currency)}`}
              />
              {paymentMode === 'paypal' && paypalUrl && (
                <a
                  href={paypalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  <span>Open direct PayPal link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {paymentMode === 'venmo' && venmoUrl && (
                <a
                  href={venmoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center gap-1.5 text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold"
                >
                  <span>Open direct Venmo link</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Settlement Note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isAmountValid}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Mark as Settled</span>
          </button>
        </div>
      </div>
    </div>
  );
};
