import React, { useState, useEffect } from 'react';
import { AppState, Category, SplitType, Transaction, ItemizedSplitItem } from '../types';
import { CATEGORIES } from '../utils/categories';
import { getLocalDateString } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';
import {
  X,
  Calendar,
  FileText,
  Check,
  Camera,
  ListPlus,
  Trash2,
} from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  editingTransaction?: Transaction | null;
  initialSplitType?: SplitType;
}

const COMMON_PRESETS: { title: string; category: Category }[] = [
  { title: '☕ Coffee', category: 'drinks' },
  { title: '🍔 Dinner', category: 'food' },
  { title: '🚕 Uber / Cab', category: 'transport' },
  { title: '🛒 Groceries', category: 'groceries' },
  { title: '🎬 Movie Tickets', category: 'entertainment' },
  { title: '🍻 Drinks', category: 'drinks' },
  { title: '💵 Cash Loan', category: 'loan' },
  { title: '🍕 Pizza', category: 'food' },
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

  const [entryMode, setEntryMode] = useState<'simple' | 'itemized'>('simple');
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [payerId, setPayerId] = useState(activeUser.id);
  const [splitType, setSplitType] = useState<SplitType>(initialSplitType);
  const [customOwedStr, setCustomOwedStr] = useState('');
  const [category, setCategory] = useState<Category>('food');
  const [date, setDate] = useState(getLocalDateString());
  const [note, setNote] = useState('');
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);

  // Itemized split line items
  const [items, setItems] = useState<ItemizedSplitItem[]>([]);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newItemAssigned, setNewItemAssigned] = useState<'active_user' | 'friend' | 'shared'>('shared');

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Sync state when modal opens or editingTransaction changes
  useEffect(() => {
    if (!isOpen) return;

    if (editingTransaction) {
      setTitle(editingTransaction.title);
      setAmountStr(editingTransaction.amount.toString());
      setPayerId(editingTransaction.paidBy);
      setSplitType(editingTransaction.splitType);
      setCustomOwedStr(editingTransaction.payerOwedAmount.toString());
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setNote(editingTransaction.note || '');
      setReceiptUrl(editingTransaction.receiptUrl);
      setItems(editingTransaction.items || []);
      setEntryMode(editingTransaction.items && editingTransaction.items.length > 0 ? 'itemized' : 'simple');
    } else {
      setTitle('');
      setAmountStr('');
      const defaultPayerId = initialSplitType === 'friend_paid_full' ? friend.id : activeUser.id;
      setPayerId(defaultPayerId);
      setSplitType(initialSplitType);
      setCustomOwedStr('');
      setCategory('food');
      setDate(getLocalDateString());
      setNote('');
      setReceiptUrl(undefined);
      setItems([]);
      setEntryMode('simple');
    }
  }, [editingTransaction, initialSplitType, activeUser.id, friend.id, isOpen]);

  if (!isOpen) return null;

  // Calculate itemized sums if in itemized mode
  let itemizedTotal = 0;
  let itemizedFriendOwed = 0;
  let itemizedActiveUserOwed = 0;

  if (entryMode === 'itemized' && items.length > 0) {
    for (const it of items) {
      itemizedTotal += it.amount;
      if (it.assignedTo === 'friend') {
        itemizedFriendOwed += it.amount;
      } else if (it.assignedTo === 'active_user') {
        itemizedActiveUserOwed += it.amount;
      } else {
        // Shared 50/50
        itemizedFriendOwed += it.amount / 2;
        itemizedActiveUserOwed += it.amount / 2;
      }
    }
  }

  const totalAmount =
    entryMode === 'itemized' && items.length > 0
      ? Math.round(itemizedTotal * 100) / 100
      : parseFloat(amountStr) || 0;

  // Calculate owed amount based on split selection
  let calculatedOwed = 0;
  if (entryMode === 'itemized' && items.length > 0) {
    calculatedOwed =
      payerId === activeUser.id ? itemizedFriendOwed : itemizedActiveUserOwed;
  } else if (splitType === 'equal_split') {
    calculatedOwed = totalAmount / 2;
  } else if (splitType === 'you_paid_full' || splitType === 'friend_paid_full') {
    calculatedOwed = totalAmount;
  } else if (splitType === 'custom') {
    calculatedOwed = parseFloat(customOwedStr) || 0;
  }

  const handleAddChip = (val: number) => {
    triggerHaptic('light');
    const current = parseFloat(amountStr) || 0;
    const nextVal = Number((current + val).toFixed(2));
    setAmountStr(nextVal.toString());
  };

  const handlePayerChange = (newPayerId: string) => {
    triggerHaptic('light');
    setPayerId(newPayerId);
    if (newPayerId === activeUser.id && splitType === 'friend_paid_full') {
      setSplitType('you_paid_full');
    } else if (newPayerId === friend.id && splitType === 'you_paid_full') {
      setSplitType('friend_paid_full');
    }
  };

  const handleSelectPreset = (preset: { title: string; category: Category }) => {
    triggerHaptic('light');
    const clean = preset.title.replace(/^[^\w\s]+\s*/, '');
    setTitle(clean);
    setCategory(preset.category);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmt = parseFloat(newItemAmount);
    if (!newItemTitle.trim() || isNaN(parsedAmt) || parsedAmt <= 0) return;

    triggerHaptic('light');
    const newItem: ItemizedSplitItem = {
      id: 'item_' + Date.now() + Math.random().toString(36).substring(2, 6),
      title: newItemTitle.trim(),
      amount: Math.round(parsedAmt * 100) / 100,
      assignedTo: newItemAssigned,
    };

    setItems([...items, newItem]);
    setNewItemTitle('');
    setNewItemAmount('');
  };

  const handleRemoveItem = (id: string) => {
    triggerHaptic('light');
    setItems(items.filter((it) => it.id !== id));
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setReceiptUrl(base64);
      triggerHaptic('success');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const isCustomInvalid =
    splitType === 'custom' &&
    entryMode === 'simple' &&
    (calculatedOwed <= 0 || (totalAmount > 0 && calculatedOwed > totalAmount));

  const isSubmitDisabled =
    !title.trim() || totalAmount <= 0 || isNaN(totalAmount) || isCustomInvalid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    triggerHaptic('success');
    const beneficiaryId = payerId === activeUser.id ? friend.id : activeUser.id;
    const roundedTotal = Math.round(totalAmount * 100) / 100;
    const roundedOwed = Math.round(calculatedOwed * 100) / 100;

    onSave({
      title: title.trim(),
      amount: roundedTotal,
      paidBy: payerId,
      payerOwedAmount: roundedOwed,
      beneficiaryId,
      splitType: entryMode === 'itemized' ? 'custom' : splitType,
      category,
      date,
      note: note.trim(),
      receiptUrl,
      items: items.length > 0 ? items : undefined,
    });
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col text-slate-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingTransaction ? 'Edit Transaction' : 'Record New Expense'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40 px-6 pt-2">
          <button
            type="button"
            onClick={() => setEntryMode('simple')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              entryMode === 'simple'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            Quick Split (50/50, 100%)
          </button>
          <button
            type="button"
            onClick={() => setEntryMode('itemized')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              entryMode === 'itemized'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <ListPlus className="w-3.5 h-3.5" />
            <span>Itemized Checklist</span>
            {items.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px]">
                {items.length}
              </span>
            )}
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Amount input & Quick Chips (if simple) */}
          {entryMode === 'simple' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Total Amount
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-2xl font-bold text-slate-400 dark:text-slate-500">
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
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-2xl text-2xl font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
              {/* Quick add chips */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {[5, 10, 20, 50, 100].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => handleAddChip(v)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    +{state.currency.symbol}
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Itemized Checklist Mode */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Bill Line Items ({items.length})
                </label>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Total: {state.currency.symbol}
                  {itemizedTotal.toFixed(2)}
                </span>
              </div>

              {/* Add item inputs */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="grid grid-cols-5 gap-2">
                  <input
                    type="text"
                    placeholder="Item (e.g. Burger)"
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    className="col-span-3 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Price"
                    value={newItemAmount}
                    onChange={(e) => setNewItemAmount(e.target.value)}
                    className="col-span-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-slate-400">For:</span>
                    <button
                      type="button"
                      onClick={() => setNewItemAssigned('shared')}
                      className={`px-2 py-1 rounded-lg font-semibold ${
                        newItemAssigned === 'shared'
                          ? 'bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30'
                          : 'text-slate-400'
                      }`}
                    >
                      50/50 Shared
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewItemAssigned('active_user')}
                      className={`px-2 py-1 rounded-lg font-semibold ${
                        newItemAssigned === 'active_user'
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'text-slate-400'
                      }`}
                    >
                      {activeUser.name.split(' ')[0]}
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewItemAssigned('friend')}
                      className={`px-2 py-1 rounded-lg font-semibold ${
                        newItemAssigned === 'friend'
                          ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                          : 'text-slate-400'
                      }`}
                    >
                      {friend.name.split(' ')[0]}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    disabled={!newItemTitle.trim() || !newItemAmount}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-40"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Items List */}
              {items.length > 0 && (
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {items.map((it) => (
                    <div
                      key={it.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white">{it.title}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {it.assignedTo === 'shared'
                            ? '50/50'
                            : it.assignedTo === 'active_user'
                            ? activeUser.name.split(' ')[0]
                            : friend.name.split(' ')[0]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {state.currency.symbol}
                          {it.amount.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(it.id)}
                          className="p-1 text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Title & Quick Suggestions */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Description / Outing Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dinner, Uber, Groceries..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            {/* Quick title presets */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-none">
              {COMMON_PRESETS.map((preset) => (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium transition-colors"
                >
                  {preset.title}
                </button>
              ))}
            </div>
          </div>

          {/* Who Paid */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Who Paid Upfront?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handlePayerChange(activeUser.id)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all ${
                  payerId === activeUser.id
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <span>{activeUser.avatar}</span>
                <span>You Paid ({activeUser.name.split(' ')[0]})</span>
              </button>

              <button
                type="button"
                onClick={() => handlePayerChange(friend.id)}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all ${
                  payerId === friend.id
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <span>{friend.avatar}</span>
                <span>{friend.name} Paid</span>
              </button>
            </div>
          </div>

          {/* Split Mode (shown if simple) */}
          {entryMode === 'simple' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                How Should This Be Split?
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSplitType('equal_split')}
                  className={`py-2 px-2 rounded-xl border text-center text-xs font-semibold transition-all ${
                    splitType === 'equal_split'
                      ? 'bg-teal-500/20 border-teal-500 text-teal-700 dark:text-teal-300'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
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
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {payerId === activeUser.id ? '100% Lent' : '100% Borrowed'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSplitType('custom');
                    if (!customOwedStr && totalAmount > 0) {
                      setCustomOwedStr((totalAmount / 2).toFixed(2));
                    }
                  }}
                  className={`py-2 px-2 rounded-xl border text-center text-xs font-semibold transition-all ${
                    splitType === 'custom'
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Custom Owed
                </button>
              </div>

              {splitType === 'custom' && (
                <div className="mt-2 space-y-1">
                  <input
                    type="number"
                    step="any"
                    placeholder="Enter exact amount owed..."
                    value={customOwedStr}
                    onChange={(e) => setCustomOwedStr(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-indigo-500/60 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                  />
                  {totalAmount > 0 && calculatedOwed > totalAmount && (
                    <p className="text-[11px] text-rose-500 font-medium">
                      ⚠️ Amount owed cannot exceed total amount ({state.currency.symbol}
                      {totalAmount.toFixed(2)})
                    </p>
                  )}
                  {calculatedOwed <= 0 && (
                    <p className="text-[11px] text-amber-500 font-medium">
                      ⚠️ Please enter an amount owed greater than 0
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Split description feedback box */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              {payerId === activeUser.id
                ? `${friend.name} will owe you:`
                : `You will owe ${friend.name}:`}
            </span>
            <span
              className={`font-bold text-sm ${
                payerId === activeUser.id
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {state.currency.symbol}
              {calculatedOwed.toFixed(2)}
            </span>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
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
                      : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <span className="text-base">{cat.emoji}</span>
                  <span className="text-[10px] mt-0.5 truncate max-w-[70px]">
                    {cat.label.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Date
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDate(getLocalDateString())}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                      date === getLocalDateString()
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setDate(getLocalDateString(new Date(Date.now() - 86400000)))}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                      date === getLocalDateString(new Date(Date.now() - 86400000))
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                    }`}
                  >
                    Yesterday
                  </button>
                </div>
              </div>
              <div className="relative flex items-center">
                <Calendar className="w-4 h-4 absolute left-3 text-slate-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                Note (Optional)
              </label>
              <div className="relative flex items-center">
                <FileText className="w-4 h-4 absolute left-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Paid cash at restaurant"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Receipt Photo Attachment */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Receipt Attachment
              </label>
              {receiptUrl && (
                <button
                  type="button"
                  onClick={() => setReceiptUrl(undefined)}
                  className="text-[11px] text-rose-500 hover:underline"
                >
                  Remove Receipt
                </button>
              )}
            </div>

            {!receiptUrl ? (
              <label className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500/50 cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors">
                <Camera className="w-4 h-4 text-emerald-500" />
                <span>Snap / Attach Receipt Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center p-2">
                <img
                  src={receiptUrl}
                  alt="Receipt Preview"
                  className="max-h-40 object-contain rounded-xl"
                />
              </div>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
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
