import { useState, useEffect } from 'react';
import { AppState, SplitType, Transaction, UserProfile, RecurringExpense } from './types';
import { loadAppState, saveAppState, getFreshSampleTransactions } from './utils/storage';
import { getLocalDateString, calculateBalance } from './utils/formatters';
import { triggerConfetti } from './utils/confetti';
import { triggerHaptic } from './utils/haptics';
import { Header } from './components/Header';
import { HeroBalance } from './components/HeroBalance';
import { QuickActions } from './components/QuickActions';
import { TransactionList } from './components/TransactionList';
import { AnalyticsView } from './components/AnalyticsView';
import { AddTransactionModal } from './components/AddTransactionModal';
import { SettleModal } from './components/SettleModal';
import { ShareModal } from './components/ShareModal';
import { SettingsModal } from './components/SettingsModal';
import { RecurringExpensesModal } from './components/RecurringExpensesModal';
import { InstallPrompt } from './components/InstallPrompt';
import { ShortcutsModal } from './components/ShortcutsModal';
import { Plus } from 'lucide-react';

export function App() {
  const [state, setState] = useState<AppState>(loadAppState);
  const [activeTab, setActiveTab] = useState<'activity' | 'analytics'>('activity');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [initialSplit, setInitialSplit] = useState<SplitType>('equal_split');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRecurringOpen, setIsRecurringOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Sync state to local storage on change
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  // Sync theme to root and body class
  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === 'light') {
      root.classList.remove('dark');
      document.body.classList.remove('bg-slate-950', 'text-slate-100');
      document.body.classList.add('bg-slate-100', 'text-slate-900');
    } else {
      root.classList.add('dark');
      document.body.classList.remove('bg-slate-100', 'text-slate-900');
      document.body.classList.add('bg-slate-950', 'text-slate-100');
    }
  }, [state.theme]);

  // Toggle user perspective (Viewing as Alex vs Current Friend)
  const handleTogglePerspective = () => {
    triggerHaptic('light');
    setState((prev) => ({
      ...prev,
      activeUserId: prev.activeUserId === prev.user1.id ? prev.user2.id : prev.user1.id,
    }));
  };

  const handleToggleTheme = () => {
    triggerHaptic('light');
    setState((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  // Multi-friend selection
  const handleSelectFriend = (friendId: string) => {
    setState((prev) => {
      const targetFriend = prev.friends.find((f) => f.id === friendId) || prev.user2;
      const friendTxs = prev.friendTransactions[friendId] || [];
      return {
        ...prev,
        selectedFriendId: friendId,
        user2: targetFriend,
        transactions: friendTxs,
        activeUserId: prev.currentUser.id,
      };
    });
  };

  // Add new friend to multi-friend ledger
  const handleAddFriend = (friendData: Omit<UserProfile, 'id'>) => {
    const newId = 'user_' + Date.now();
    const newFriend: UserProfile = {
      ...friendData,
      id: newId,
    };

    setState((prev) => ({
      ...prev,
      friends: [...prev.friends, newFriend],
      selectedFriendId: newId,
      user2: newFriend,
      transactions: [],
      friendTransactions: {
        ...prev.friendTransactions,
        [newId]: [],
      },
      activeUserId: prev.currentUser.id,
    }));
  };

  // Monthly Budget update
  const handleUpdateBudget = (friendId: string, budget: number) => {
    setState((prev) => ({
      ...prev,
      monthlyBudgets: {
        ...prev.monthlyBudgets,
        [friendId]: budget,
      },
    }));
    triggerHaptic('success');
  };

  // Recurring bills management
  const handleAddRecurring = (expense: Omit<RecurringExpense, 'id'>) => {
    const newRec: RecurringExpense = {
      ...expense,
      id: 'rec_' + Date.now(),
    };
    setState((prev) => ({
      ...prev,
      recurringExpenses: [...(prev.recurringExpenses || []), newRec],
    }));
    triggerHaptic('success');
  };

  const handleDeleteRecurring = (id: string) => {
    setState((prev) => ({
      ...prev,
      recurringExpenses: (prev.recurringExpenses || []).filter((r) => r.id !== id),
    }));
    triggerHaptic('light');
  };

  const handleLogRecurring = (rec: RecurringExpense) => {
    const now = new Date();
    const today = getLocalDateString(now);
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let payerOwedAmount = rec.amount;
    if (rec.splitType === 'equal_split') {
      payerOwedAmount = Math.round((rec.amount / 2) * 100) / 100;
    }

    const activeFriendId = state.selectedFriendId || state.user2.id;
    const beneficiaryId =
      rec.beneficiaryId || (rec.paidBy === state.currentUser.id ? activeFriendId : state.currentUser.id);

    const tx: Transaction = {
      id: 'tx_rec_' + Date.now(),
      title: `${rec.title} (Recurring)`,
      amount: rec.amount,
      paidBy: rec.paidBy,
      payerOwedAmount,
      beneficiaryId,
      splitType: rec.splitType,
      category: rec.category,
      date: today,
      time: timeStr,
      note: `Auto-logged recurring bill on day ${rec.dayOfMonth}`,
      createdAt: Date.now(),
    };

    setState((prev) => {
      const activeFriendId = prev.selectedFriendId || prev.user2.id;
      const updatedTxs = [tx, ...prev.transactions];
      const updatedRecs = (prev.recurringExpenses || []).map((r) =>
        r.id === rec.id ? { ...r, lastLogged: today } : r
      );
      return {
        ...prev,
        transactions: updatedTxs,
        friendTransactions: {
          ...prev.friendTransactions,
          [activeFriendId]: updatedTxs,
        },
        recurringExpenses: updatedRecs,
      };
    });

    triggerHaptic('success');
  };

  // Global keyboard shortcuts (N for new expense, S for settle, P for perspective, T for theme)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        handleOpenAddWithPreset('equal_split');
      } else if (e.key === 's' || e.key === 'S') {
        const { netBalance } = calculateBalance(state.transactions, state.user1.id, state.user2.id);
        if (Math.abs(netBalance) > 0.005) {
          e.preventDefault();
          setIsSettleOpen(true);
        }
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        handleTogglePerspective();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        handleToggleTheme();
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.transactions, state.user1.id, state.user2.id]);

  // Open Add modal with preset
  const handleOpenAddWithPreset = (preset?: SplitType) => {
    triggerHaptic('light');
    setEditingTransaction(null);
    setInitialSplit(preset || 'equal_split');
    setIsAddOpen(true);
  };

  // Save new or edited transaction
  const handleSaveTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setState((prev) => {
      const activeFriendId = prev.selectedFriendId || prev.user2.id;
      let updatedTxs: Transaction[];

      if (editingTransaction) {
        updatedTxs = prev.transactions.map((t) =>
          t.id === editingTransaction.id
            ? {
                ...txData,
                id: t.id,
                time: t.time || timeStr,
                createdAt: t.createdAt,
              }
            : t
        );
      } else {
        const newTx: Transaction = {
          ...txData,
          id: 'tx_' + Date.now(),
          time: timeStr,
          createdAt: Date.now(),
        };
        updatedTxs = [newTx, ...prev.transactions];
      }

      return {
        ...prev,
        transactions: updatedTxs,
        friendTransactions: {
          ...prev.friendTransactions,
          [activeFriendId]: updatedTxs,
        },
      };
    });

    triggerHaptic('success');
  };

  // Delete transaction
  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setState((prev) => {
        const activeFriendId = prev.selectedFriendId || prev.user2.id;
        const updatedTxs = prev.transactions.filter((t) => t.id !== id);
        return {
          ...prev,
          transactions: updatedTxs,
          friendTransactions: {
            ...prev.friendTransactions,
            [activeFriendId]: updatedTxs,
          },
        };
      });
      triggerHaptic('light');
    }
  };

  // Record a settlement
  const handleSettle = (amount: number, paidBy: string, beneficiaryId: string, note: string) => {
    const now = new Date();
    const roundedAmount = Math.round(amount * 100) / 100;
    const settleTx: Transaction = {
      id: 'settle_' + Date.now(),
      title: 'Settled Balance',
      amount: roundedAmount,
      paidBy,
      payerOwedAmount: roundedAmount,
      beneficiaryId,
      splitType: 'you_paid_full',
      category: 'settlement',
      date: getLocalDateString(now),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: note.trim() || 'Settled up',
      isSettlement: true,
      createdAt: Date.now(),
    };

    setState((prev) => {
      const activeFriendId = prev.selectedFriendId || prev.user2.id;
      const updatedTxs = [settleTx, ...prev.transactions];
      return {
        ...prev,
        transactions: updatedTxs,
        friendTransactions: {
          ...prev.friendTransactions,
          [activeFriendId]: updatedTxs,
        },
      };
    });

    triggerConfetti();
    triggerHaptic('success');
  };

  // Reset sample data
  const handleResetSampleData = () => {
    if (window.confirm('Reset current friend transactions to realistic sample demo data?')) {
      const fresh = getFreshSampleTransactions();
      setState((prev) => {
        const activeFriendId = prev.selectedFriendId || prev.user2.id;
        return {
          ...prev,
          transactions: fresh,
          friendTransactions: {
            ...prev.friendTransactions,
            [activeFriendId]: fresh,
          },
        };
      });
      setIsSettingsOpen(false);
      triggerHaptic('medium');
    }
  };

  // Clear all data
  const handleClearAll = () => {
    if (window.confirm('Clear all transactions with this friend? This cannot be undone.')) {
      setState((prev) => {
        const activeFriendId = prev.selectedFriendId || prev.user2.id;
        return {
          ...prev,
          transactions: [],
          friendTransactions: {
            ...prev.friendTransactions,
            [activeFriendId]: [],
          },
        };
      });
      setIsSettingsOpen(false);
      triggerHaptic('medium');
    }
  };

  const handleUpdateState = (partial: Partial<AppState>) => {
    setState((prev) => {
      const next = { ...prev, ...partial };
      if (partial.user1) {
        next.currentUser = partial.user1;
      }
      if (partial.user2) {
        next.friends = prev.friends.map((f) => (f.id === partial.user2!.id ? partial.user2! : f));
      }
      return next;
    });
  };

  return (
    <div
      className={`min-h-screen ${
        state.theme === 'light'
          ? 'bg-slate-100 text-slate-900'
          : 'bg-slate-950 text-slate-100'
      } transition-colors duration-300 pb-20`}
    >
      {/* Top App Header */}
      <Header
        state={state}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onTogglePerspective={handleTogglePerspective}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleTheme={handleToggleTheme}
        onSelectFriend={handleSelectFriend}
        onAddFriend={handleAddFriend}
        onOpenRecurring={() => setIsRecurringOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto px-4 pt-5 pb-10">
        {/* Hero Card: Net Balance & Settle/Share */}
        <HeroBalance
          state={state}
          onOpenSettle={() => setIsSettleOpen(true)}
          onOpenShare={() => setIsShareOpen(true)}
        />

        {/* Quick Actions (Lend, Split 50/50, Borrow, Loan) */}
        <QuickActions state={state} onOpenAddModal={handleOpenAddWithPreset} />

        {/* Tab View: Activity vs Analytics */}
        {activeTab === 'activity' ? (
          <TransactionList
            state={state}
            onEdit={(tx) => {
              setEditingTransaction(tx);
              setIsAddOpen(true);
            }}
            onDelete={handleDeleteTransaction}
            onAddNew={() => handleOpenAddWithPreset('equal_split')}
          />
        ) : (
          <AnalyticsView
            state={state}
            onUpdateBudget={handleUpdateBudget}
          />
        )}
      </main>

      {/* Floating Action Button for Mobile quick-add */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => handleOpenAddWithPreset('equal_split')}
          title="Add new expense or lending (Press N)"
          className="flex items-center gap-2 p-4 sm:px-5 sm:py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-2xl shadow-emerald-500/40 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span className="hidden sm:inline">Add Expense</span>
        </button>
      </div>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        state={state}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        initialSplitType={initialSplit}
      />

      <SettleModal
        isOpen={isSettleOpen}
        onClose={() => setIsSettleOpen(false)}
        state={state}
        onSettle={handleSettle}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        state={state}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        state={state}
        onUpdateState={handleUpdateState}
        onResetSampleData={handleResetSampleData}
        onClearAll={handleClearAll}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      <RecurringExpensesModal
        isOpen={isRecurringOpen}
        onClose={() => setIsRecurringOpen(false)}
        state={state}
        onAddRecurring={handleAddRecurring}
        onDeleteRecurring={handleDeleteRecurring}
        onLogRecurring={handleLogRecurring}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* PWA In-App Install Prompt Banner */}
      <InstallPrompt />
    </div>
  );
}

export default App;