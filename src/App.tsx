import { useState, useEffect, useMemo, useRef } from 'react';
import { AppState, SplitType, Transaction, UserProfile, Category, RecurringExpense, KeyboardShortcuts, DEFAULT_KEYBOARD_SHORTCUTS } from './types';
import { loadAppState, saveAppState, getFreshSampleTransactions } from './utils/storage';
import { getLocalDateString, calculateBalance } from './utils/formatters';
import { CATEGORIES } from './utils/categories';
import { triggerConfetti } from './utils/confetti';
import { triggerHaptic } from './utils/haptics';
import { matchesKey } from './utils/shortcuts';

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
import { BalanceInfoModal } from './components/BalanceInfoModal';
import { TransactionList } from './components/TransactionList';
import { AnalyticsView } from './components/AnalyticsView';
import { FriendsView } from './components/FriendsView';
import { SettlementsView } from './components/SettlementsView';
import { CategoriesView } from './components/CategoriesView';
import { PinLoginScreen } from './components/PinLoginScreen';
import { ApprovalRequestsBanner } from './components/ApprovalRequestsBanner';

export function App() {
  const [state, setState] = useState<AppState>(loadAppState);
  // Always locked on initial load / refresh
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [sessionTerminatedReason, setSessionTerminatedReason] = useState<string | null>(null);
  const INACTIVITY_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes of inactivity
  const lastActivityRef = useRef<number>(Date.now());
  const [activeNav, setActiveNav] = useState<NavItemKey>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [initialSplit, setInitialSplit] = useState<SplitType>('equal_split');
  const [addInitialMode, setAddInitialMode] = useState<'simple' | 'itemized'>('simple');
  const [addInitialCategory, setAddInitialCategory] = useState<Category | undefined>(undefined);
  const [addInitialTxType, setAddInitialTxType] = useState<'expense' | 'loan'>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState<'profiles' | 'security' | 'currency' | 'data'>('profiles');
  const [isRecurringOpen, setIsRecurringOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isBalanceInfoOpen, setIsBalanceInfoOpen] = useState(false);
  const [isProOpen, setIsProOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('This Month');
  const [acknowledgedNotifications, setAcknowledgedNotifications] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('netzero_acknowledged_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const handleAcknowledgeNotification = (id: string) => {
    triggerHaptic('light');
    setAcknowledgedNotifications((prev) => {
      const updated = Array.from(new Set([...prev, id]));
      try {
        localStorage.setItem('netzero_acknowledged_notifications', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const handleAcknowledgeAllNotifications = (ids: string[]) => {
    triggerHaptic('success');
    setAcknowledgedNotifications((prev) => {
      const updated = Array.from(new Set([...prev, ...ids]));
      try {
        localStorage.setItem('netzero_acknowledged_notifications', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

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

  // Active user / friend resolution based on activeUserId & PIN authentication
  const activeUser = state.activeUserId === state.user2.id ? state.user2 : state.currentUser;
  const activePartner = state.activeUserId === state.user2.id ? state.currentUser : state.user2;

  // Guarantee that refreshing or reloading always locks the app
  useEffect(() => {
    sessionStorage.removeItem('netzero_authenticated');
    sessionStorage.removeItem('netzero_session_id');
    sessionStorage.removeItem('netzero_session_user_id');

    const handleBeforeUnload = () => {
      sessionStorage.removeItem('netzero_authenticated');
      sessionStorage.removeItem('netzero_session_id');
      sessionStorage.removeItem('netzero_session_user_id');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // PIN Login & Session Lock handlers
  const handleLoginSuccess = (user: UserProfile) => {
    const newSessionId = 'sess_' + user.id + '_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    sessionStorage.setItem('netzero_session_id', newSessionId);
    sessionStorage.setItem('netzero_session_user_id', user.id);
    localStorage.setItem('netzero_active_session_' + user.id, newSessionId);

    // Broadcast login to terminate any previous sessions of this user on other tabs/devices
    try {
      const channel = new BroadcastChannel('netzero_session_sync');
      channel.postMessage({
        type: 'USER_LOGIN',
        userId: user.id,
        sessionId: newSessionId,
        timestamp: Date.now(),
      });
      channel.close();
    } catch {
      // BroadcastChannel unavailable
    }

    setSessionTerminatedReason(null);
    lastActivityRef.current = Date.now();
    setIsAuthenticated(true);
    triggerHaptic('success');
    setState((prev) => {
      const isMainUser = user.id === prev.currentUser.id;
      if (isMainUser) {
        return {
          ...prev,
          activeUserId: prev.currentUser.id,
        };
      } else {
        // Friend logging in with their 4-digit ID
        return {
          ...prev,
          selectedFriendId: user.id,
          user2: user,
          transactions: prev.friendTransactions[user.id] || [],
          activeUserId: user.id,
        };
      }
    });
  };

  const handleLockApp = () => {
    sessionStorage.removeItem('netzero_session_id');
    sessionStorage.removeItem('netzero_session_user_id');
    setSessionTerminatedReason(null);
    setIsAuthenticated(false);
    triggerHaptic('medium');
  };

  // Single-device session concurrency listener (auto-logout if second device/tab logs in)
  useEffect(() => {
    if (!isAuthenticated) return;

    const myUserId = sessionStorage.getItem('netzero_session_user_id') || activeUser.id;
    const mySessionId = sessionStorage.getItem('netzero_session_id');

    // If session ID is missing but authenticated, assign one now
    if (!mySessionId) {
      const newSess = 'sess_' + myUserId + '_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem('netzero_session_id', newSess);
      sessionStorage.setItem('netzero_session_user_id', myUserId);
      localStorage.setItem('netzero_active_session_' + myUserId, newSess);
      return;
    }

    const triggerDeviceLogout = () => {
      triggerHaptic('warning');
      sessionStorage.removeItem('netzero_session_id');
      sessionStorage.removeItem('netzero_session_user_id');
      setIsAuthenticated(false);
      setSessionTerminatedReason(
        'You were automatically logged out because your account was logged into on another device or window.'
      );
    };

    // 1. Storage event listener (across browser tabs/windows)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'netzero_active_session_' + myUserId) {
        if (e.newValue && e.newValue !== mySessionId) {
          triggerDeviceLogout();
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 2. BroadcastChannel for instant real-time logout across windows
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('netzero_session_sync');
      channel.onmessage = (event) => {
        if (event.data?.type === 'USER_LOGIN' && event.data?.userId === myUserId) {
          if (event.data?.sessionId !== mySessionId) {
            triggerDeviceLogout();
          }
        }
      };
    } catch {
      // BroadcastChannel unavailable
    }

    // 3. Fallback interval check (every 1.5 seconds)
    const interval = setInterval(() => {
      const activeSession = localStorage.getItem('netzero_active_session_' + myUserId);
      if (activeSession && activeSession !== mySessionId) {
        triggerDeviceLogout();
      }
    }, 1500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (channel) channel.close();
      clearInterval(interval);
    };
  }, [isAuthenticated, activeUser.id]);

  // 3-Minute Inactivity Auto-Lock
  useEffect(() => {
    if (!isAuthenticated) return;

    // Reset timestamp when authenticated
    lastActivityRef.current = Date.now();

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const checkInactivity = () => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= INACTIVITY_TIMEOUT_MS) {
        triggerHaptic('warning');
        sessionStorage.removeItem('netzero_session_id');
        sessionStorage.removeItem('netzero_session_user_id');
        setIsAddOpen(false);
        setIsSettleOpen(false);
        setIsSettingsOpen(false);
        setIsShortcutsOpen(false);
        setIsProOpen(false);
        setIsAddFriendOpen(false);
        setIsRecurringOpen(false);
        setIsBalanceInfoOpen(false);
        setIsNotificationsOpen(false);
        setIsAuthenticated(false);
        setSessionTerminatedReason(
          'Your session was automatically locked after 3 minutes of inactivity to protect your account.'
        );
      }
    };

    // User interaction events
    const interactionEvents: (keyof WindowEventMap)[] = [
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'wheel',
      'pointerdown',
    ];

    // Throttle mousemove to avoid continuous event firing overhead
    let lastMouseMove = 0;
    const handleMouseMove = () => {
      const now = Date.now();
      if (now - lastMouseMove > 2000) {
        lastMouseMove = now;
        updateActivity();
      }
    };

    interactionEvents.forEach((evt) => {
      window.addEventListener(evt, updateActivity, { passive: true });
    });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Handle tab visibility change / focus (immediate check when returning after tab switch or sleep)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkInactivity();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', checkInactivity);

    // Periodic check every 1.5 seconds
    const intervalId = setInterval(checkInactivity, 1500);

    return () => {
      interactionEvents.forEach((evt) => {
        window.removeEventListener(evt, updateActivity);
      });
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', checkInactivity);
      clearInterval(intervalId);
    };
  }, [isAuthenticated]);

  // Transaction Approval & 72-Hour Hold handlers
  const handleAcceptTransaction = (txId: string) => {
    triggerConfetti();
    triggerHaptic('success');
    setState((prev) => {
      const activeFriendId = prev.selectedFriendId || prev.user2.id;
      const updatedTxs = prev.transactions.map((t) =>
        t.id === txId ? { ...t, approvalStatus: 'approved' as const } : t
      );
      return {
        ...prev,
        transactions: updatedTxs,
        friendTransactions: {
          ...prev.friendTransactions,
          [activeFriendId]: updatedTxs,
        },
      };
    });
  };

  const handleDenyTransaction = (txId: string) => {
    triggerHaptic('error');
    const now = Date.now();
    const lockedUntil = now + 72 * 60 * 60 * 1000;
    setState((prev) => {
      const activeFriendId = prev.selectedFriendId || prev.user2.id;
      const updatedTxs = prev.transactions.map((t) =>
        t.id === txId
          ? {
              ...t,
              approvalStatus: 'on_hold' as const,
              deniedAt: now,
              lockedUntil,
              reviewVotes: {},
            }
          : t
      );
      return {
        ...prev,
        transactions: updatedTxs,
        friendTransactions: {
          ...prev.friendTransactions,
          [activeFriendId]: updatedTxs,
        },
      };
    });
  };

  const handleFastForwardHold = (txId: string) => {
    triggerHaptic('medium');
    setState((prev) => {
      const activeFriendId = prev.selectedFriendId || prev.user2.id;
      const updatedTxs = prev.transactions.map((t) =>
        t.id === txId
          ? {
              ...t,
              approvalStatus: 'disputed_review' as const,
              lockedUntil: Date.now() - 1000,
            }
          : t
      );
      return {
        ...prev,
        transactions: updatedTxs,
        friendTransactions: {
          ...prev.friendTransactions,
          [activeFriendId]: updatedTxs,
        },
      };
    });
  };

  const handleVoteReview = (txId: string, isTrue: boolean) => {
    triggerHaptic(isTrue ? 'success' : 'error');
    setState((prev) => {
      const activeFriendId = prev.selectedFriendId || prev.user2.id;
      const updatedTxs = prev.transactions.map((t) => {
        if (t.id !== txId) return t;

        const currentVotes = { ...(t.reviewVotes || {}) };
        currentVotes[activeUser.id] = isTrue;

        // Check if both parties have voted
        const userVote = currentVotes[activeUser.id];
        const partnerVote = currentVotes[activePartner.id];

        let newStatus = t.approvalStatus;

        // "if both said true. record it and vice versa"
        if (userVote !== undefined && partnerVote !== undefined) {
          if (userVote === true && partnerVote === true) {
            newStatus = 'approved';
            triggerConfetti();
          } else {
            newStatus = 'rejected';
          }
        }

        return {
          ...t,
          approvalStatus: newStatus,
          reviewVotes: currentVotes,
        };
      });

      return {
        ...prev,
        transactions: updatedTxs,
        friendTransactions: {
          ...prev.friendTransactions,
          [activeFriendId]: updatedTxs,
        },
      };
    });
  };

  // Toggle user perspective
  const handleTogglePerspective = () => {
    triggerHaptic('light');
    setState((prev) => ({
      ...prev,
      activeUserId: prev.activeUserId === prev.currentUser.id ? prev.user2.id : prev.currentUser.id,
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
  const handleOpenAddWithPreset = (
    preset?: SplitType,
    mode: 'simple' | 'itemized' = 'simple',
    initialCat?: Category,
    initialTxType: 'expense' | 'loan' = 'expense'
  ) => {
    triggerHaptic('light');
    setEditingTransaction(null);
    setInitialSplit(preset || 'equal_split');
    setAddInitialMode(mode);
    setAddInitialCategory(initialCat);
    setAddInitialTxType(initialTxType);
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
          approvalStatus: 'pending_approval',
          approvalRequestedBy: activeUser.id,
          approvalRespondentId: activePartner.id,
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

  // Delete friend and all their data
  const handleDeleteFriend = (friendId: string) => {
    const friendToDelete = state.friends.find((f) => f.id === friendId) || state.user2;
    if (window.confirm(`Are you sure you want to delete ${friendToDelete.name} and all their transactions? This cannot be undone.`)) {
      setState((prev) => {
        const remainingFriends = prev.friends.filter((f) => f.id !== friendId);
        const newFriends = remainingFriends.length > 0 ? remainingFriends : [
          {
            id: 'user_' + Date.now(),
            name: 'Friend',
            avatar: 'F',
            color: 'purple',
          }
        ];
        const nextActiveFriend = newFriends[0];
        const updatedFriendTxs = { ...prev.friendTransactions };
        delete updatedFriendTxs[friendId];
        const nextTxs = updatedFriendTxs[nextActiveFriend.id] || [];

        return {
          ...prev,
          friends: newFriends,
          selectedFriendId: nextActiveFriend.id,
          user2: nextActiveFriend,
          transactions: nextTxs,
          friendTransactions: updatedFriendTxs,
          activeUserId: prev.currentUser.id,
        };
      });
      triggerHaptic('medium');
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
      approvalStatus: 'pending_approval',
      approvalRequestedBy: activeUser.id,
      approvalRespondentId: activePartner.id,
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

  // Recurring Expenses management
  const handleAddRecurring = (expenseData: Omit<RecurringExpense, 'id'>) => {
    const newExpense: RecurringExpense = {
      ...expenseData,
      id: 'rec_' + Date.now(),
    };
    setState((prev) => ({
      ...prev,
      recurringExpenses: [...prev.recurringExpenses, newExpense],
    }));
    triggerHaptic('success');
  };

  const handleDeleteRecurring = (id: string) => {
    setState((prev) => ({
      ...prev,
      recurringExpenses: prev.recurringExpenses.filter((r) => r.id !== id),
    }));
    triggerHaptic('light');
  };

  const handleLogRecurring = (expense: RecurringExpense) => {
    const now = new Date();
    const currentMonthKey = now.toISOString().slice(0, 7);
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = getLocalDateString(now);

    const owedAmount =
      expense.splitType === 'equal_split'
        ? Math.round((expense.amount / 2) * 100) / 100
        : expense.amount;

    const beneficiaryId =
      expense.paidBy === state.currentUser.id ? state.user2.id : state.currentUser.id;

    const newTx: Transaction = {
      id: 'tx_rec_' + Date.now(),
      title: `${expense.title} (${now.toLocaleDateString(undefined, { month: 'short' })})`,
      amount: expense.amount,
      paidBy: expense.paidBy,
      payerOwedAmount: owedAmount,
      beneficiaryId,
      splitType: expense.splitType,
      category: expense.category,
      date: dateStr,
      time: timeStr,
      note: `Recurring monthly bill`,
      createdAt: Date.now(),
      approvalStatus: 'pending_approval',
      approvalRequestedBy: activeUser.id,
      approvalRespondentId: activePartner.id,
    };

    setState((prev) => {
      const activeFriendId = prev.selectedFriendId || prev.user2.id;
      const updatedTxs = [newTx, ...prev.transactions];
      const updatedRecurring = prev.recurringExpenses.map((r) =>
        r.id === expense.id ? { ...r, lastLoggedMonth: currentMonthKey } : r
      );
      return {
        ...prev,
        transactions: updatedTxs,
        friendTransactions: {
          ...prev.friendTransactions,
          [activeFriendId]: updatedTxs,
        },
        recurringExpenses: updatedRecurring,
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

  const handleUpdateShortcut = (id: keyof KeyboardShortcuts, newKey: string) => {
    setState((prev) => ({
      ...prev,
      shortcuts: {
        ...(prev.shortcuts || DEFAULT_KEYBOARD_SHORTCUTS),
        [id]: newKey,
      },
    }));
  };

  const handleResetShortcuts = () => {
    setState((prev) => ({
      ...prev,
      shortcuts: DEFAULT_KEYBOARD_SHORTCUTS,
    }));
  };

  // Keyboard Shortcuts (Ctrl+K for search, custom bindings for actions)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Global search focus: Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
        return;
      }

      const activeShortcuts = state.shortcuts || DEFAULT_KEYBOARD_SHORTCUTS;

      // Handle close modal key (e.g. Escape or custom binding)
      if (matchesKey(e.key, activeShortcuts.closeModal)) {
        const activeEl = document.activeElement as HTMLElement | null;
        if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
          activeEl.blur();
        }
        setIsAddOpen(false);
        setIsSettleOpen(false);
        setIsSettingsOpen(false);
        setIsShortcutsOpen(false);
        setIsProOpen(false);
        setIsAddFriendOpen(false);
        setIsRecurringOpen(false);
        setIsBalanceInfoOpen(false);
        setIsNotificationsOpen(false);
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

      if (matchesKey(e.key, activeShortcuts.newExpense)) {
        e.preventDefault();
        handleOpenAddWithPreset('equal_split');
      } else if (matchesKey(e.key, activeShortcuts.settle)) {
        e.preventDefault();
        setIsSettleOpen(true);
      } else if (matchesKey(e.key, activeShortcuts.perspective)) {
        e.preventDefault();
        handleTogglePerspective();
      } else if (matchesKey(e.key, activeShortcuts.toggleTheme)) {
        e.preventDefault();
        handleToggleTheme();
      } else if (matchesKey(e.key, activeShortcuts.shortcutsGuide)) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.shortcuts, state.transactions, state.user1.id, state.user2.id]);

  // Balance calculations (Dynamic based on current transactions and active user perspective)
  const balanceSummary = useMemo(() => {
    return calculateBalance(state.transactions, activeUser.id, activePartner.id);
  }, [state.transactions, activeUser.id, activePartner.id]);

  const displayNetBalance = balanceSummary.netBalance;
  const displayLent = balanceSummary.owedToActiveUser;
  const displayBorrowed = balanceSummary.owedByActiveUser;
  const displaySettled = balanceSummary.settledTotal;
  const displayTxCount = state.transactions.length;

  const currentUserName = activeUser?.name || 'MegaTron';

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

  // Dynamic Category breakdown for SpendingOverviewCard
  const { totalSpent, categoryStats } = useMemo(() => {
    const expenseTxs = state.transactions.filter((t) => !t.isSettlement);
    const total = expenseTxs.reduce((sum, t) => sum + t.amount, 0);

    const categoryMap: Partial<Record<Category, number>> = {};
    for (const t of expenseTxs) {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    }

    const neonPalette = [
      { color: '#fb923c', glow: 'rgba(251, 146, 60, 0.7)' },
      { color: '#c084fc', glow: 'rgba(192, 132, 252, 0.7)' },
      { color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.7)' },
      { color: '#e879f9', glow: 'rgba(232, 121, 249, 0.7)' },
      { color: '#34d399', glow: 'rgba(52, 211, 153, 0.7)' },
      { color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.7)' },
    ];

    const sorted = Object.entries(categoryMap)
      .map(([cat, amt]) => ({
        category: cat as Category,
        amount: amt,
        percentage: total > 0 ? Math.round((amt / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const topCategories = sorted.slice(0, 3).map((item, idx) => {
      const catMeta = CATEGORIES[item.category];
      const palette = neonPalette[idx % neonPalette.length];
      return {
        name: catMeta ? catMeta.label : item.category,
        percentage: item.percentage,
        color: palette.color,
        glowColor: palette.glow,
      };
    });

    return {
      totalSpent: Math.round(total * 100) / 100,
      categoryStats: topCategories,
    };
  }, [state.transactions]);

  // Dynamic This Month vs Last Month for ThisMonthCard
  const { thisMonthSpend, lastMonthSpend, momPercentChange } = useMemo(() => {
    const expenseTxs = state.transactions.filter((t) => !t.isSettlement);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const currentMonthExpenses = expenseTxs.filter((t) => {
      if (!t.date) return false;
      const parts = t.date.split('-');
      if (parts.length < 2) return false;
      return parseInt(parts[0], 10) === currentYear && parseInt(parts[1], 10) - 1 === currentMonth;
    });
    const currentSpend = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0);

    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = prevMonthDate.getMonth();

    const prevMonthExpenses = expenseTxs.filter((t) => {
      if (!t.date) return false;
      const parts = t.date.split('-');
      if (parts.length < 2) return false;
      return parseInt(parts[0], 10) === prevYear && parseInt(parts[1], 10) - 1 === prevMonth;
    });
    const prevSpend = prevMonthExpenses.reduce((sum, t) => sum + t.amount, 0);

    let change = 0;
    if (prevSpend > 0) {
      change = Math.round(((currentSpend - prevSpend) / prevSpend) * 100);
    } else if (currentSpend > 0) {
      change = 100;
    }

    return {
      thisMonthSpend: Math.round(currentSpend * 100) / 100,
      lastMonthSpend: Math.round(prevSpend * 100) / 100,
      momPercentChange: Math.abs(change),
    };
  }, [state.transactions]);

  if (!isAuthenticated) {
    return (
      <PinLoginScreen
        currentUser={state.currentUser}
        friends={state.friends}
        onLoginSuccess={handleLoginSuccess}
        sessionTerminatedReason={sessionTerminatedReason}
        onClearTerminatedReason={() => setSessionTerminatedReason(null)}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-row overflow-x-hidden font-sans relative transition-colors duration-300 ${
      state.theme === 'dark'
        ? 'bg-[#06040d] text-white selection:bg-cyan-500 selection:text-black'
        : 'bg-gradient-to-br from-[#e0f2fe] via-[#f7f4fc] to-[#fef2eb] text-[#1e1b4b] selection:bg-orange-300 selection:text-slate-900'
    }`}>
      {/* Background Bioluminescent Glowing Ambient Tubes & Waves */}
      <AmbientNeonBackground theme={state.theme} />

      {/* Left Sidebar Navigation */}
      <Sidebar
        activeNav={activeNav}
        onSelectNav={(nav) => {
          if (nav === 'settings') {
            setSettingsSection('profiles');
            setIsSettingsOpen(true);
          } else {
            setActiveNav(nav);
          }
        }}
        onOpenUpgrade={() => setIsProOpen(true)}
      />

      {/* Main App Workspace (Right of Sidebar) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen px-4 sm:px-6 py-2.5 relative z-10 overflow-y-auto">
        {/* Top Header Bar */}
        <TopBar
          currentUser={activeUser}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenNotifications={() => setIsNotificationsOpen((prev) => !prev)}
          onToggleTheme={handleToggleTheme}
          onOpenProfile={() => {
            setSettingsSection('profiles');
            setIsSettingsOpen(true);
          }}
          onLockApp={handleLockApp}
          onChangePin={() => {
            setSettingsSection('security');
            setIsSettingsOpen(true);
          }}
          theme={state.theme}
          hasUnreadNotifications={state.transactions.some((t) => !acknowledgedNotifications.includes(t.id))}
        />

        {/* Notifications Popover Dropdown */}
        <NotificationPopover
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          transactions={state.transactions}
          activeFriend={activePartner}
          currency={state.currency}
          acknowledgedIds={acknowledgedNotifications}
          onAcknowledge={handleAcknowledgeNotification}
          onAcknowledgeAll={handleAcknowledgeAllNotifications}
        />

        {/* Approval Requests & 72-Hour Hold Dispute Banner */}
        <ApprovalRequestsBanner
          transactions={state.transactions}
          currentUser={activeUser}
          activeFriend={activePartner}
          currency={state.currency}
          onAccept={handleAcceptTransaction}
          onDeny={handleDenyTransaction}
          onVoteReview={handleVoteReview}
          onFastForwardHold={handleFastForwardHold}
        />

        {/* View Switcher based on Sidebar Navigation */}
        {activeNav === 'dashboard' ? (
          <div className="w-full flex flex-col gap-3 pb-8 animate-fadeIn">
            {/* Greeting Row */}
            <GreetingRow
              userName={currentUserName}
              selectedPeriod={selectedPeriod}
              onPeriodChange={(period) => setSelectedPeriod(period)}
            />

            {/* Dashboard 2-Column Responsive Layout matching screenshot */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start max-w-[1360px]">
              {/* Left/Center Main Column */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                {/* Row 1: Net Balance Card + 2x2 Stat Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-stretch h-[195px]">
                  {/* Net Balance Card */}
                  <div className="md:col-span-7 flex flex-col h-full">
                    <NetBalanceHero
                      netBalance={displayNetBalance}
                      currency={state.currency}
                      onInfoClick={() => setIsBalanceInfoOpen(true)}
                      onShareClick={() => setIsShareOpen(true)}
                      theme={state.theme}
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
                  onAddExpense={() => handleOpenAddWithPreset('equal_split', 'simple', undefined, 'expense')}
                  onLoan={() => handleOpenAddWithPreset('you_paid_full', 'simple', 'loan', 'loan')}
                  onSplitBill={() => handleOpenAddWithPreset('equal_split', 'itemized', undefined, 'expense')}
                  onRecordPayment={() => setIsSettleOpen(true)}
                  onRecurringBills={() => setIsRecurringOpen(true)}
                  onCustomSplit={() => handleOpenAddWithPreset('custom', 'simple', undefined, 'expense')}
                />

                {/* Row 3: Recent Transactions Card */}
                <RecentTransactionsCard
                  transactions={filteredTransactions}
                  currentUser={activeUser}
                  activeFriend={activePartner}
                  currency={state.currency}
                  onViewAll={() => setActiveNav('transactions')}
                  onSelectTransaction={(tx) => {
                    setEditingTransaction(tx);
                    setIsAddOpen(true);
                  }}
                  onDeleteTransaction={handleDeleteTransaction}
                />
              </div>

              {/* Right Column */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                {/* Spending Overview Donut Chart */}
                <SpendingOverviewCard
                  totalSpent={totalSpent}
                  currency={state.currency}
                  categories={categoryStats}
                  onCategoryClick={() => setActiveNav('categories')}
                />

                {/* This Month Comparison Card */}
                <ThisMonthCard
                  lastMonthSpent={lastMonthSpend}
                  thisMonthSpent={thisMonthSpend}
                  percentChange={momPercentChange}
                  currency={state.currency}
                  onClick={() => setActiveNav('analytics')}
                />

                {/* Friends Card */}
                <FriendsCard
                  friend={activePartner}
                  friendCount={state.friends.length || 1}
                  transactionCount={displayTxCount}
                  netBalance={displayNetBalance}
                  currency={state.currency}
                  onViewAll={() => setActiveNav('friends')}
                  onSelectFriend={(id) => handleSelectFriend(id)}
                  onAddFriend={() => setIsAddFriendOpen(true)}
                />
              </div>
            </div>
          </div>
        ) : activeNav === 'transactions' ? (
          /* Full Transactions Ledger View */
          <div className="w-full max-w-4xl mx-auto py-4 animate-fadeIn">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-bold">All Transactions</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Complete transaction history with {activePartner.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveNav('dashboard')}
                  className="px-3.5 py-2 rounded-xl border border-purple-200 dark:border-purple-500/30 text-xs font-semibold hover:bg-purple-50 dark:hover:bg-white/5 transition-colors"
                >
                  ← Dashboard
                </button>
                <button
                  onClick={() => handleOpenAddWithPreset('equal_split')}
                  className="px-4 py-2 rounded-xl btn-neon-cyan text-xs font-bold uppercase tracking-wider"
                >
                  + Add Expense
                </button>
              </div>
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
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setActiveNav('dashboard')}
                className="px-3.5 py-2 rounded-xl border border-purple-200 dark:border-purple-500/30 text-xs font-semibold hover:bg-purple-50 dark:hover:bg-white/5 transition-colors"
              >
                ← Back to Dashboard
              </button>
            </div>
            <AnalyticsView
              state={state}
              onUpdateBudget={handleUpdateBudget}
            />
          </div>
        ) : activeNav === 'friends' ? (
          /* Full Friends Management View */
          <FriendsView
            state={state}
            onSelectFriend={handleSelectFriend}
            onAddFriend={() => setIsAddFriendOpen(true)}
            onDeleteFriend={handleDeleteFriend}
            onOpenSettle={(id) => {
              handleSelectFriend(id);
              setIsSettleOpen(true);
            }}
            onOpenShare={(id) => {
              handleSelectFriend(id);
              setIsShareOpen(true);
            }}
            onViewTransactions={(id) => {
              handleSelectFriend(id);
              setActiveNav('transactions');
            }}
            onBackToDashboard={() => setActiveNav('dashboard')}
          />
        ) : activeNav === 'settlements' ? (
          /* Full Settlements View */
          <SettlementsView
            state={state}
            onOpenSettle={() => setIsSettleOpen(true)}
            onOpenShare={() => setIsShareOpen(true)}
            onBackToDashboard={() => setActiveNav('dashboard')}
            onSelectTransaction={(tx) => {
              setEditingTransaction(tx);
              setIsAddOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
          />
        ) : activeNav === 'categories' ? (
          /* Full Categories Breakdown View */
          <CategoriesView
            state={state}
            onBackToDashboard={() => setActiveNav('dashboard')}
            onSelectTransaction={(tx) => {
              setEditingTransaction(tx);
              setIsAddOpen(true);
            }}
            onDeleteTransaction={handleDeleteTransaction}
            onAddNewExpense={(cat) => handleOpenAddWithPreset('equal_split', 'simple', cat)}
          />
        ) : null}
      </div>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        state={{
          ...state,
          currentUser: activeUser,
          user2: activePartner,
        }}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
        editingTransaction={editingTransaction}
        initialSplitType={initialSplit}
        initialMode={addInitialMode}
        initialCategory={addInitialCategory}
        initialTxType={addInitialTxType}
      />

      <SettleModal
        isOpen={isSettleOpen}
        onClose={() => setIsSettleOpen(false)}
        state={{
          ...state,
          currentUser: activeUser,
          user2: activePartner,
        }}
        onSettle={handleSettle}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        state={state}
      />

      <BalanceInfoModal
        isOpen={isBalanceInfoOpen}
        onClose={() => setIsBalanceInfoOpen(false)}
        netBalance={displayNetBalance}
        totalLent={displayLent}
        totalBorrowed={displayBorrowed}
        settledTotal={displaySettled}
        currency={state.currency}
        activeUser={activeUser}
        friend={activePartner}
        onOpenSettle={() => setIsSettleOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        state={state}
        onUpdateState={handleUpdateState}
        onResetSampleData={handleResetSampleData}
        onClearAll={handleClearAll}
        onDeleteFriend={handleDeleteFriend}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        initialSection={settingsSection}
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
        shortcuts={state.shortcuts || DEFAULT_KEYBOARD_SHORTCUTS}
        onUpdateShortcut={handleUpdateShortcut}
        onResetShortcuts={handleResetShortcuts}
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
