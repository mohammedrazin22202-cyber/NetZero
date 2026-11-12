import { AppState, Transaction, UserProfile } from '../types';
import { DEFAULT_CURRENCY } from './currencies';

const STORAGE_KEY = 'account_balancer_state_v1';

export const INITIAL_USER_1: UserProfile = {
  id: 'user_1',
  name: 'MegaTron',
  avatar: 'M',
  color: 'purple',
  upiId: 'megatron@upi',
  paypalUser: 'megatron',
  venmoUser: 'megatron-pay',
};

export const INITIAL_USER_2: UserProfile = {
  id: 'user_2',
  name: 'Sam (Bestie)',
  avatar: 'S',
  color: 'purple',
  upiId: 'sam@upi',
  paypalUser: 'sambestie',
  venmoUser: 'sam-bestie',
};

export function getFreshSampleTransactions(): Transaction[] {
  return [
    {
      id: 'tx_1',
      title: 'Dinner',
      amount: 25.0,
      paidBy: 'user_1',
      payerOwedAmount: 25.0,
      beneficiaryId: 'user_2',
      splitType: 'you_paid_full',
      category: 'food',
      date: '2026-11-12',
      time: '20:15',
      note: 'Dinner with Sam',
      createdAt: 1794460000000,
    },
    {
      id: 'tx_2',
      title: 'Movie Tickets',
      amount: 21.75,
      paidBy: 'user_1',
      payerOwedAmount: 21.75,
      beneficiaryId: 'user_2',
      splitType: 'you_paid_full',
      category: 'entertainment',
      date: '2026-11-10',
      time: '19:30',
      note: 'Movie tickets with Sam',
      createdAt: 1794300000000,
    },
    {
      id: 'tx_3',
      title: 'Cab',
      amount: 9.25,
      paidBy: 'user_2',
      payerOwedAmount: 9.25,
      beneficiaryId: 'user_1',
      splitType: 'friend_paid_full',
      category: 'transport',
      date: '2026-11-08',
      time: '22:45',
      note: 'Cab ride for you',
      createdAt: 1794100000000,
    },
  ];
}

export const SAMPLE_TRANSACTIONS: Transaction[] = getFreshSampleTransactions();

export const DEFAULT_FRIENDS: UserProfile[] = [INITIAL_USER_2];

export const DEFAULT_STATE: AppState = {
  currentUser: INITIAL_USER_1,
  friends: DEFAULT_FRIENDS,
  selectedFriendId: INITIAL_USER_2.id,
  user1: INITIAL_USER_1,
  user2: INITIAL_USER_2,
  activeUserId: 'user_1',
  currency: DEFAULT_CURRENCY,
  transactions: SAMPLE_TRANSACTIONS,
  friendTransactions: {
    [INITIAL_USER_2.id]: SAMPLE_TRANSACTIONS,
  },
  monthlyBudgets: {},
  recurringExpenses: [],
  theme: 'dark',
};

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);

    const currentUser: UserProfile = {
      ...INITIAL_USER_1,
      ...(parsed.currentUser || parsed.user1 || {}),
      id: INITIAL_USER_1.id,
      name: (parsed.currentUser?.name || parsed.user1?.name || '').trim() || INITIAL_USER_1.name,
    };

    let friends: UserProfile[] = Array.isArray(parsed.friends) && parsed.friends.length > 0
      ? parsed.friends
      : [
          {
            ...INITIAL_USER_2,
            ...(parsed.user2 || {}),
            id: parsed.user2?.id || INITIAL_USER_2.id,
            name: (parsed.user2?.name || '').trim() || INITIAL_USER_2.name,
          },
        ];

    let selectedFriendId = parsed.selectedFriendId || friends[0].id;
    let activeFriend = friends.find((f) => f.id === selectedFriendId) || friends[0];
    selectedFriendId = activeFriend.id;

    // Load friendTransactions
    let friendTransactions: Record<string, Transaction[]> =
      parsed.friendTransactions && typeof parsed.friendTransactions === 'object'
        ? parsed.friendTransactions
        : {};

    // Ensure currently selected friend has their transactions list
    if (!friendTransactions[selectedFriendId]) {
      friendTransactions[selectedFriendId] = Array.isArray(parsed.transactions)
        ? parsed.transactions
        : SAMPLE_TRANSACTIONS;
    }

    const currentTransactions = friendTransactions[selectedFriendId] || [];

    const activeUserId =
      parsed.activeUserId === activeFriend.id ? activeFriend.id : currentUser.id;

    return {
      ...DEFAULT_STATE,
      ...parsed,
      currentUser,
      friends,
      selectedFriendId,
      user1: currentUser,
      user2: activeFriend,
      activeUserId,
      currency: parsed.currency && parsed.currency.code ? parsed.currency : DEFAULT_CURRENCY,
      transactions: currentTransactions,
      friendTransactions,
      monthlyBudgets: parsed.monthlyBudgets || {},
      recurringExpenses: Array.isArray(parsed.recurringExpenses) ? parsed.recurringExpenses : [],
      theme: parsed.theme === 'light' ? 'light' : 'dark',
    };
  } catch (e) {
    console.error('Failed to load state from localStorage:', e);
    return DEFAULT_STATE;
  }
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage:', e);
  }
}

export function exportToCSV(transactions: Transaction[], state: AppState): string {
  const headers = ['Date', 'Time', 'Title', 'Category', 'Total Amount', 'Paid By', 'Owed Amount', 'Split Type', 'Note'];
  const getUserName = (id: string) => (id === state.currentUser.id ? state.currentUser.name : state.user2.name);

  const rows = transactions.map((t) => [
    `"${(t.date || '').replace(/"/g, '""')}"`,
    `"${(t.time || '').replace(/"/g, '""')}"`,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    `"${(t.category || '').replace(/"/g, '""')}"`,
    (t.amount || 0).toFixed(2),
    `"${getUserName(t.paidBy).replace(/"/g, '""')}"`,
    (t.payerOwedAmount || 0).toFixed(2),
    `"${(t.splitType || '').replace(/"/g, '""')}"`,
    `"${(t.note || '').replace(/"/g, '""')}"`,
  ]);

  // Include UTF-8 BOM for flawless Excel opening
  return '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
