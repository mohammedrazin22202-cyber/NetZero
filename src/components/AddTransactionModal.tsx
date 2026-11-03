import React, { useState, useEffect } from 'react';
import { AppState, Category, SplitType, Transaction } from '../types';
import { CATEGORIES } from '../utils/categories';
import { X, Calendar, FileText, Check } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  editingTransaction?: Transaction | null;
  initialSplitType?: SplitType;
}

const COMMON_TITLES = [
  '☕ Coffee',
  '🍔 Dinner',
  '🚕 Uber / Cab',
  '🛒 Groceries',
  '🎬 Movie Tickets',
  '🍻 Drinks',
  '💵 Cash Loan',
  '🍕 Pizza',
];

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  state,
  onSave,
  editingTransaction,
  initialSplitType = 'equal_split',
}) => {
  const activeUser = state.activeUserId === state.user1.id ? state.user1 : state.user2;
  const friend = state.activeUserId === state.user1.id ? state.user2 : state.user1;

  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [payerId, setPayerId] = useState(activeUser.id);
  const [splitType, setSplitType] = useState<SplitType>(initialSplitType);
  const [customOwedStr, setCustomOwedStr] = useState('');
  const [category, setCategory] = useState<Category>('food');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState('');

  useEffect(() => {
    if (editingTransaction) {
      setTitle(editingTransaction.title);
      setAmountStr(editingTransaction.amount.toString());
      setPayerId(editingTransaction.paidBy);
      setSplitType(editingTransaction.splitType);
      setCustomOwedStr(editingTransaction.payerOwedAmount.toString());
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setNote(editingTransaction.note || '');
    } else {
      setTitle('');
      setAmountStr('');
      setPayerId(activeUser.id);
      setSplitType(initialSplitType);
      setCustomOwedStr('');
      setCategory('food');
      setDate(new Date().toISOString().slice(0, 10));
      setNote('');
    }
  }, [editingTransaction, initialSplitType, activeUser.id, isOpen]);

  if (!isOpen) return null;

  const totalAmount = parseFloat(amountStr) || 0;

  // Calculate owed amount based on split selection
  let calculatedOwed = 0;
  if (splitType === 'equal_split') {
    calculatedOwed = totalAmount / 2;
  } else if (splitType === 'you_paid_full' || splitType === 'friend_paid_full') {
    calculatedOwed = totalAmount;
  } else if (splitType === 'custom') {
    calculatedOwed = parseFloat(customOwedStr) || 0;
  }

  const handleAddPreset = (val: number) => {
    const current = parseFloat(amountStr) || 0;
    setAmountStr((current + val).toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || totalAmount <= 0) return;

    const beneficiaryId = payerId === activeUser.id ? friend.id : activeUser.id;

    onSave({
      title: title.trim(),
      amount: totalAmount,
      paidBy: payerId,
      payerOwedAmount: Math.round(calculatedOwed * 100) / 100,
      beneficiaryId,
      splitType,
      category,
      date,
      note: note.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <h3 className="text-base font-bold text-white">
              {editingTransaction ? 'Edit Transaction' : 'Record New Expense'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Amount input & Quick Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Total Amount
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-2xl font-bold text-slate-400">
                {state.currency.symbol}
              </span>
              <input
                type="number"
                step="any"
                min="0.01"
                required
                autoFocus
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-700/80 rounded-2xl text-2xl font-bold text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
            {/* Quick add chips */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {[5, 10, 20, 50, 100].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => handleAddPreset(v)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
                >
                  +{state.currency.symbol}
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Title & Quick Suggestions */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Description / What was this for?
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dinner, Uber, Groceries..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-2xl text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            {/* Quick title presets */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-none">
              {COMMON_TITLES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    const clean = t.replace(/^[^\w\s]+\s*/, '');
                    setTitle(clean);
                  }}
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 font-medium transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Who Paid */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Who Paid Upfront?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPayerId(activeUser.id)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all ${
                  payerId === activeUser.id
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>{activeUser.avatar}</span>
                <span>You Paid ({activeUser.name.split(' ')[0]})</span>
              </button>

              <button
                type="button"
                onClick={() => setPayerId(friend.id)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all ${
                  payerId === friend.id
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>{friend.avatar}</span>
                <span>{friend.name} Paid</span>
              </button>
            </div>
          </div>

          {/* Split Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              How Should This Be Split?
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSplitType('equal_split')}
                className={`py-2 px-2 rounded-xl border text-center text-xs font-semibold transition-all ${
                  splitType === 'equal_split'
                    ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                Split 50 / 50
              </button>

              <button
                type="button"
                onClick={() =>
                  setSplitType(payerId === activeUser.id ? 'you_paid_full' : 'friend_paid_full')
                }
                className={`py-2 px-2 rounded-xl border text-center text-xs font-semibold transition-all ${
                  splitType === 'you_paid_full' || splitType === 'friend_paid_full'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                100% Lent
              </button>

              <button
                type="button"
                onClick={() => setSplitType('custom')}
                className={`py-2 px-2 rounded-xl border text-center text-xs font-semibold transition-all ${
                  splitType === 'custom'
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                Custom Owed
              </button>
            </div>

            {/* Split description feedback */}
            <div className="mt-2.5 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                {payerId === activeUser.id ? `${friend.name} will owe you:` : `You will owe ${friend.name}:`}
              </span>
              <span className="font-bold text-emerald-400">
                {state.currency.symbol}
                {calculatedOwed.toFixed(2)}
              </span>
            </div>

            {splitType === 'custom' && (
              <div className="mt-2">
                <input
                  type="number"
                  step="any"
                  placeholder="Enter exact amount owed..."
                  value={customOwedStr}
                  onChange={(e) => setCustomOwedStr(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-indigo-500/60 rounded-xl text-xs font-semibold text-white focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {Object.values(CATEGORIES).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-medium transition-all ${
                    category === cat.id
                      ? `${cat.bgColor} font-bold ring-1 ring-emerald-500/50`
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-base">{cat.emoji}</span>
                  <span className="text-[10px] mt-0.5 truncate max-w-[70px]">{cat.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Note in 2 cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Date
              </label>
              <div className="relative flex items-center">
                <Calendar className="w-4 h-4 absolute left-3 text-slate-500" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Note (Optional)
              </label>
              <div className="relative flex items-center">
                <FileText className="w-4 h-4 absolute left-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. Paid cash at restaurant"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || totalAmount <= 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>{editingTransaction ? 'Save Changes' : 'Record Transaction'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
