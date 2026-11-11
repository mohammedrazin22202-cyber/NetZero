import React, { useState, useEffect } from 'react';
import { AppState, Currency, UserProfile } from '../types';
import { SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from '../utils/currencies';
import { exportToCSV } from '../utils/storage';
import { X, Download, Upload, RotateCcw, Trash2, Check, Smartphone, User, AlertCircle, Keyboard } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  onUpdateState: (newState: Partial<AppState>) => void;
  onResetSampleData: () => void;
  onClearAll: () => void;
  onOpenShortcuts?: () => void;
}

const EMOJI_OPTIONS = ['😎', '🤝', '🚀', '⭐', '🍕', '🐱', '🦊', '🔥', '💎', '🎉'];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  state,
  onUpdateState,
  onResetSampleData,
  onClearAll,
  onOpenShortcuts,
}) => {
  const [activeSection, setActiveSection] = useState<'profiles' | 'currency' | 'data'>('profiles');

  const [u1, setU1] = useState<UserProfile>(state.user1);
  const [u2, setU2] = useState<UserProfile>(state.user2);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Sync u1 and u2 whenever modal opens or state updates
  useEffect(() => {
    if (isOpen) {
      setU1(state.user1);
      setU2(state.user2);
      setErrorMessage('');
      setSavedSuccess(false);
    }
  }, [isOpen, state.user1, state.user2]);

  if (!isOpen) return null;

  const handleSaveProfiles = (e: React.FormEvent) => {
    e.preventDefault();
    if (!u1.name.trim() || !u2.name.trim()) {
      setErrorMessage('Both names are required.');
      return;
    }
    setErrorMessage('');
    const updatedFriends = (state.friends || []).map((f) =>
      f.id === u2.id ? { ...u2, name: u2.name.trim() } : f
    );
    onUpdateState({
      user1: { ...u1, name: u1.name.trim() },
      user2: { ...u2, name: u2.name.trim() },
      friends: updatedFriends,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleCurrencyChange = (currency: Currency) => {
    onUpdateState({ currency });
  };

  const handleExportCSV = () => {
    const csvContent = exportToCSV(state.transactions, state);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `netzero_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `netzero_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (
          parsed &&
          Array.isArray(parsed.transactions) &&
          parsed.user1 &&
          parsed.user2 &&
          typeof parsed.user1.name === 'string' &&
          typeof parsed.user2.name === 'string'
        ) {
          const currentUser = parsed.currentUser || parsed.user1 || state.currentUser;
          const activeFriend = parsed.user2 || state.user2;
          const sanitizedState: Partial<AppState> = {
            currentUser,
            friends: parsed.friends || [activeFriend],
            selectedFriendId: parsed.selectedFriendId || activeFriend.id,
            transactions: parsed.transactions,
            friendTransactions: parsed.friendTransactions || {
              [activeFriend.id]: parsed.transactions,
            },
            monthlyBudgets: parsed.monthlyBudgets || {},
            recurringExpenses: parsed.recurringExpenses || [],
            user1: {
              ...state.user1,
              ...parsed.user1,
              name: parsed.user1.name.trim() || state.user1.name,
            },
            user2: {
              ...state.user2,
              ...parsed.user2,
              name: parsed.user2.name.trim() || state.user2.name,
            },
            currency: parsed.currency || DEFAULT_CURRENCY,
            theme: parsed.theme === 'light' ? 'light' : 'dark',
          };
          onUpdateState(sanitizedState);
          alert('Backup restored successfully!');
          onClose();
        } else {
          alert('Invalid backup file format. Missing user profiles or transactions.');
        }
      } catch {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    // Reset file input value so selecting the same file triggers onChange
    e.target.value = '';
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
            <span className="text-xl">⚙️</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">App Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-6 pt-2">
          <button
            onClick={() => setActiveSection('profiles')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeSection === 'profiles'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Friend Profiles
          </button>
          <button
            onClick={() => setActiveSection('currency')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeSection === 'currency'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Currency
          </button>
          <button
            onClick={() => setActiveSection('data')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all ${
              activeSection === 'data'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Backup & Data
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* SECTION: PROFILES */}
          {activeSection === 'profiles' && (
            <form onSubmit={handleSaveProfiles} className="space-y-6">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* User 1 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Primary Profile (You)
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={u1.name}
                      onChange={(e) => setU1({ ...u1, name: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                      Avatar
                    </label>
                    <select
                      value={u1.avatar}
                      onChange={(e) => setU1({ ...u1, avatar: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    >
                      {EMOJI_OPTIONS.map((em) => (
                        <option key={em} value={em}>
                          {em}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. name@upi"
                      value={u1.upiId || ''}
                      onChange={(e) => setU1({ ...u1, upiId: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                      PayPal Username
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. username"
                      value={u1.paypalUser || ''}
                      onChange={(e) => setU1({ ...u1, paypalUser: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                      Venmo Username
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. username"
                      value={u1.venmoUser || ''}
                      onChange={(e) => setU1({ ...u1, venmoUser: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* User 2 / Friend Profile */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    Friend Profile ({u2.name})
                  </h4>
                  {state.friends && state.friends.length > 1 && (
                    <span className="text-[10px] text-slate-400">
                      {state.friends.length} Friends
                    </span>
                  )}
                </div>

                {state.friends && state.friends.length > 1 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {state.friends.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setU2(f)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          u2.id === f.id
                            ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-sm">{f.avatar}</span>
                        <span className="truncate max-w-[80px]">{f.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={u2.name}
                      onChange={(e) => setU2({ ...u2, name: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                      Avatar
                    </label>
                    <select
                      value={u2.avatar}
                      onChange={(e) => setU2({ ...u2, avatar: e.target.value })}
                      className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    >
                      {EMOJI_OPTIONS.map((em) => (
                        <option key={em} value={em}>
                          {em}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. friend@upi"
                      value={u2.upiId || ''}
                      onChange={(e) => setU2({ ...u2, upiId: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                      PayPal Username
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. friendpaypal"
                      value={u2.paypalUser || ''}
                      onChange={(e) => setU2({ ...u2, paypalUser: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">
                      Venmo Username
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. friendvenmo"
                      value={u2.venmoUser || ''}
                      onChange={(e) => setU2({ ...u2, venmoUser: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
              >
                {savedSuccess ? <Check className="w-4 h-4" /> : null}
                <span>{savedSuccess ? 'Profiles Saved!' : 'Update Profiles'}</span>
              </button>
            </form>
          )}

          {/* SECTION: CURRENCY */}
          {activeSection === 'currency' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose the primary currency you and your friend use for debts:
              </p>
              <div className="grid grid-cols-1 gap-2">
                {SUPPORTED_CURRENCIES.map((curr) => (
                  <button
                    key={curr.code}
                    onClick={() => handleCurrencyChange(curr)}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition-all ${
                      state.currency.code === curr.code
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <span>{curr.name}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-800">
                      {curr.symbol}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: DATA & BACKUP */}
          {activeSection === 'data' && (
            <div className="space-y-4">
              {/* Export Buttons */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Export & Reports
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    <Download className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    <span>Download CSV</span>
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    <Download className="w-4 h-4 text-teal-500 dark:text-teal-400" />
                    <span>Export JSON</span>
                  </button>
                </div>
              </div>

              {/* Import Backup */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Restore from Backup
                </h4>
                <label className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  <span>Choose JSON Backup File</span>
                  <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                </label>
              </div>

              {/* Sample Data & Reset */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Danger & Testing Zone
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onResetSampleData}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Load Demo Data</span>
                  </button>
                  <button
                    onClick={onClearAll}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-medium text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All Data</span>
                  </button>
                </div>
              </div>

              {/* Keyboard Shortcuts Button */}
              {onOpenShortcuts && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Keyboard className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Keyboard Shortcuts
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenShortcuts();
                    }}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                  >
                    View Guide
                  </button>
                </div>
              )}

              {/* PWA Phone tip */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <p className="font-bold text-slate-900 dark:text-slate-200">
                    Use on your phone like an app:
                  </p>
                  <p>
                    Open this page on your phone browser &rarr; Tap "Share" &rarr; select{' '}
                    <strong>"Add to Home Screen"</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
