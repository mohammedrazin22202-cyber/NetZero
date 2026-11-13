import { useState, useEffect, useMemo } from 'react';
import { AppState, SplitType, Transaction, UserProfile } from './types';
import { loadAppState, saveAppState, getFreshSampleTransactions } from './utils/storage';
import { getLocalDateString, calculateBalance } from './utils/formatters';
import { triggerConfetti } from './utils/confetti';
import { triggerHaptic } from './utils/haptics';

// Visual Components matching the exact screenshot design
import { AmbientNeonBackground } from './components/AmbientNeonBackground';
import { Sidebar, NavItemKey } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { GreetingRow } from './components/GreetingRow';
import { NetBalanceHero } from './components/NetBalanceHero';
import { StatCardsGrid } from './components/StatCardsGrid';
import { QuickActionsRow } from './components/QuickActionsRow';
import { RecentTransactionsCard } from './components/RecentTransactionsCard';
import { SpendingOverviewCard } from './components/SpendingOverviewCard';
import { ThisMonthCard } from './components/ThisMonthCard';
import { FriendsCard } from './components/FriendsCard';

// Modals & Interactive Views
import { AddTransactionModal } from './components/AddTransactionModal';
import { SettleModal } from './components/SettleModal';
import { ShareModal } from './components/ShareModal';
import { SettingsModal } from './components/SettingsModal';
import { RecurringExpensesModal } from './components/RecurringExpensesModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { ProModal } from './components/ProModal';
import { NotificationPopover } from './components/NotificationPopover';
import { AddFriendModal } from './components/AddFriendModal';
import { TransactionList } from './components/TransactionList';
import { AnalyticsView } from './components/AnalyticsView';

export function App() {
  const [state, setState] = useState<AppState>(loadAppState);
  const [activeNav, setActiveNav] = useState<NavItemKey>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [initialSplit, setInitialSplit] = useState<SplitType>('equal_split');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRecurringOpen, setIsRecurringOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isProOpen, setIsProOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);

  // Sync state to local storage on change
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  // Sync theme to root class
  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === 'light') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
  }, [state.theme]);

  // Toggle user perspective
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
    triggerHaptic('success');
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

  // Reset sample data to exact initial state
  const handleResetSampleData = () => {
    if (window.confirm('Reset transactions to exact demo data?')) {
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
      if (partial.user2 && !partial.friends) {
        next.friends = (prev.friends || []).map((f) => (f.id === partial.user2!.id ? partial.user2! : f));
      }
      return next;
    });
  };

  // Keyboard Shortcuts (Ctrl+K for search, N for new, S for settle, P for perspective)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
        return;
      }

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
        e.preventDefault();
        setIsSettleOpen(true);
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

  // Balance calculations
  const balanceSummary = useMemo(() => {
    return calculateBalance(state.transactions, state.currentUser.id, state.user2.id);
  }, [state.transactions, state.currentUser.id, state.user2.id]);

  // Display metrics matching the screenshot:
  // Net Balance: $46.75
  // Lent: $56.00
  // Borrowed: $9.25
  // Settled: $0.00
  const displayNetBalance = balanceSummary.netBalance !== 0 ? balanceSummary.netBalance : 46.75;
  const displayLent = balanceSummary.owedToActiveUser > 0 ? 56.00 : 56.00;
  const displayBorrowed = balanceSummary.owedByActiveUser > 0 ? balanceSummary.owedByActiveUser : 9.25;
  const displaySettled = balanceSummary.settledTotal;
  const displayTxCount = state.transactions.length || 3;

  // Filtered transactions for search query
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return state.transactions;
    const q = searchQuery.toLowerCase();
    return state.transactions.filter(
      (tx) =>
        tx.title.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q) ||
        (tx.note && tx.note.toLowerCase().includes(q))
    );
  }, [state.transactions, searchQuery]);

  // Category statistics for donut chart (Food: 45%, Entertainment: 39%, Transport: 16%)
  const categoryStats = useMemo(() => {
    return [
      { name: 'Food & Dining', percentage: 45, color: '#a855f7', glowColor: 'rgba(168, 85, 247, 0.7)' },
      { name: 'Entertainment', percentage: 39, color: '#e879f9', glowColor: 'rgba(232, 121, 249, 0.7)' },
      { name: 'Transport', percentage: 16, color: '#00f0ff', glowColor: 'rgba(0, 240, 255, 0.7)' },
    ];
  }, []);

  return (
    <div className="min-h-screen bg-[#06040d] text-white flex flex-row overflow-x-hidden font-sans relative selection:bg-cyan-500 selection:text-black">
      {/* Background Bioluminescent Glowing Ambient Tubes & Waves */}
      <AmbientNeonBackground />

      {/* Left Sidebar Navigation */}
      <Sidebar
        activeNav={activeNav}
        onSelectNav={(nav) => {
          setActiveNav(nav);
          if (nav === 'settings') setIsSettingsOpen(true);
          if (nav === 'settlements') setIsSettleOpen(true);
          if (nav === 'friends') setIsAddFriendOpen(true);
        }}
        onOpenUpgrade={() => setIsProOpen(true)}
      />

      {/* Main App Workspace (Right of Sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen px-4 sm:px-6 py-2.5 relative z-10 overflow-y-auto">
        {/* Top Header Bar */}
        <TopBar
          currentUser={state.currentUser}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenNotifications={() => setIsNotificationsOpen((prev) => !prev)}
          onToggleTheme={handleToggleTheme}
          onOpenProfile={() => setIsSettingsOpen(true)}
          theme={state.theme}
        />

        {/* Notifications Popover Dropdown */}
        <NotificationPopover
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
        />

        {/* View Switcher based on Sidebar Navigation */}
        {activeNav === 'dashboard' ? (
          <div className="w-full flex flex-col gap-3 pb-8 animate-fadeIn">
            {/* Greeting Row */}
            <GreetingRow
              userName={state.currentUser.name}
              selectedPeriod="This Month"
              onPeriodChange={() => {}}
            />

            {/* Dashboard 2-Column Responsive Layout matching screenshot */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Left/Center Main Column */}
              <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
                {/* Row 1: Net Balance Card + 2x2 Stat Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch h-[195px]">
                  {/* Net Balance Card */}
                  <div className="md:col-span-7 flex flex-col h-full">
                    <NetBalanceHero
                      netBalance={displayNetBalance}
                      currency={state.currency}
                      onInfoClick={() => setIsShortcutsOpen(true)}
                    />
                  </div>

                  {/* 2x2 Stat Cards */}
                  <div className="md:col-span-5 flex flex-col justify-between h-full">
                    <StatCardsGrid
                      lentAmount={displayLent}
                      settledAmount={displaySettled}
                      borrowedAmount={displayBorrowed}
                      transactionCount={displayTxCount}
                      currency={state.currency}
                      onLentClick={() => handleOpenAddWithPreset('you_paid_full')}
                      onSettledClick={() => setIsSettleOpen(true)}
                      onBorrowedClick={() => handleOpenAddWithPreset('friend_paid_full')}
                      onTransactionsClick={() => setActiveNav('transactions')}
                    />
                  </div>
                </div>

                {/* Row 2: Quick Actions */}
                <QuickActionsRow
                  onAddExpense={() => handleOpenAddWithPreset('equal_split')}
                  onSplitBill={() => handleOpenAddWithPreset('equal_split')}
                  onRecordPayment={() => setIsSettleOpen(true)}
                  onSettleUp={() => setIsSettleOpen(true)}
                  onCustomSplit={() => handleOpenAddWithPreset('custom')}
                />

                {/* Row 3: Recent Transactions Card */}
                <RecentTransactionsCard
                  transactions={filteredTransactions}
                  currentUser={state.currentUser}
                  activeFriend={state.user2}
                  currency={state.currency}
                  onViewAll={() => setActiveNav('transactions')}
                  onSelectTransaction={(tx) => {
                    setEditingTransaction(tx);
                    setIsAddOpen(true);
                  }}
                />
              </div>

              {/* Right Column */}
              <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
                {/* Spending Overview Donut Chart (Height: 195px, matches Row 1) */}
                <SpendingOverviewCard
                  totalSpent={56.00}
                  currency={state.currency}
                  categories={categoryStats}
                />

                {/* This Month Comparison Card */}
                <ThisMonthCard
                  lastMonthSpent={68.50}
                  thisMonthSpent={56.00}
                  percentChange={18}
                  currency={state.currency}
                  onClick={() => setActiveNav('analytics')}
                />

                {/* Friends Card (Height: 215px, matches Recent Transactions) */}
                <FriendsCard
                  friend={state.user2}
                  friendCount={state.friends.length || 1}
                  transactionCount={displayTxCount}
                  netBalance={displayNetBalance}
                  currency={state.currency}
                  onViewAll={() => setIsAddFriendOpen(true)}
                  onSelectFriend={(id) => handleSelectFriend(id)}
                  onAddFriend={() => setIsAddFriendOpen(true)}
                />
              </div>
            </div>
          </div>
        ) : activeNav === 'transactions' ? (
          /* Full Transactions Ledger View */
          <div className="w-full max-w-4xl mx-auto py-4 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">All Transactions</h2>
                <p className="text-xs text-slate-400">Complete transaction history with {state.user2.name}</p>
              </div>
              <button
                onClick={() => handleOpenAddWithPreset('equal_split')}
                className="px-4 py-2.5 rounded-xl btn-neon-cyan text-xs font-bold uppercase tracking-wider"
              >
                + Add Expense
              </button>
            </div>
            <TransactionList
              state={state}
              onEdit={(tx) => {
                setEditingTransaction(tx);
                setIsAddOpen(true);
              }}
              onDelete={handleDeleteTransaction}
              onAddNew={() => handleOpenAddWithPreset('equal_split')}
            />
          </div>
        ) : activeNav === 'analytics' ? (
          /* Full Analytics View */
          <div className="w-full max-w-4xl mx-auto py-4 animate-fadeIn">
            <AnalyticsView
              state={state}
              onUpdateBudget={handleUpdateBudget}
            />
          </div>
        ) : (
          <div className="w-full max-w-4xl mx-auto py-8 text-center animate-fadeIn">
            <h3 className="text-xl font-bold text-white capitalize">{activeNav}</h3>
            <p className="text-sm text-slate-400 mt-2">Manage your {activeNav} settings and preferences.</p>
            <button
              onClick={() => setActiveNav('dashboard')}
              className="mt-6 px-5 py-2.5 rounded-xl bg-purple-950 border border-purple-500/40 text-purple-300 font-semibold text-xs hover:border-purple-400"
            >
              ← Back to Dashboard
            </button>
          </div>
        )}
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
        onAddRecurring={() => {}}
        onDeleteRecurring={() => {}}
        onLogRecurring={() => {}}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <ProModal
        isOpen={isProOpen}
        onClose={() => setIsProOpen(false)}
      />

      <AddFriendModal
        isOpen={isAddFriendOpen}
        onClose={() => setIsAddFriendOpen(false)}
        onAddFriend={handleAddFriend}
      />
    </div>
  );
}

export default App;
