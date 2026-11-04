import { AppState, Transaction } from '../types';
import { DEFAULT_CURRENCY } from './currencies';
import { getLocalDateString } from './formatters';

const STORAGE_KEY = 'account_balancer_state_v1';

export const INITIAL_USER_1 = {
  id: 'user_1',
  name: 'Me (Alex)',
  avatar: '😎',
  color: 'emerald',
  upiId: 'alex@upi',
  paypalUser: 'alexfriend',
  venmoUser: 'alex-friend',
};

export const INITIAL_USER_2 = {
  id: 'user_2',
  name: 'Sam (Bestie)',
  avatar: '🤝',
  color: 'indigo',
  upiId: 'sam@upi',
  paypalUser: 'sambestie',
  venmoUser: 'sam-bestie',
};

export function getFreshSampleTransactions(): Transaction[] {
  const now = new Date();
  const d2 = new Date(now.getTime() - 86400000 * 2);
  const d1 = new Date(now.getTime() - 86400000 * 1);

  return [
    {
      id: 'tx_3',
      title: 'Movie tickets (Cinema)',
      amount: 32.0,
      paidBy: 'user_1',
      payerOwedAmount: 32.0,
      beneficiaryId: 'user_2',
      splitType: 'you_paid_full',
      category: 'entertainment',
      date: getLocalDateString(now),
      time: '18:15',
      note: 'I covered Sam tickets upfront',
      createdAt: now.getTime(),
    },
    {
      id: 'tx_2',
      title: 'Uber ride home',
      amount: 18.5,
      paidBy: 'user_2',
      payerOwedAmount: 9.25,
      beneficiaryId: 'user_1',
      splitType: 'equal_split',
      category: 'transport',
      date: getLocalDateString(d1),
      time: '23:45',
      note: 'Late night ride',
      createdAt: d1.getTime(),
    },
    {
      id: 'tx_1',
      title: 'Pizza Night & Drinks',
      amount: 48.0,
      paidBy: 'user_1',
      payerOwedAmount: 24.0,
      beneficiaryId: 'user_2',
      splitType: 'equal_split',
      category: 'food',
      date: getLocalDateString(d2),
      time: '20:30',
      note: 'Split 50/50 for pizza and soda',
      createdAt: d2.getTime(),
    },
  ];
}

export const SAMPLE_TRANSACTIONS: Transaction[] = getFreshSampleTransactions();

export const DEFAULT_STATE: AppState = {
  user1: INITIAL_USER_1,
  user2: INITIAL_USER_2,
  activeUserId: 'user_1',
  currency: DEFAULT_CURRENCY,
  transactions: SAMPLE_TRANSACTIONS,
  theme: 'dark',
};

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);

    const user1 = {
      ...INITIAL_USER_1,
      ...(parsed.user1 || {}),
      id: INITIAL_USER_1.id,
      name: (parsed.user1?.name || '').trim() || INITIAL_USER_1.name,
    };

    const user2 = {
      ...INITIAL_USER_2,
      ...(parsed.user2 || {}),
      id: INITIAL_USER_2.id,
      name: (parsed.user2?.name || '').trim() || INITIAL_USER_2.name,
    };

    const activeUserId =
      parsed.activeUserId === user2.id ? user2.id : user1.id;

    return {
      ...DEFAULT_STATE,
      ...parsed,
      user1,
      user2,
      activeUserId,
      currency: parsed.currency && parsed.currency.code ? parsed.currency : DEFAULT_CURRENCY,
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : SAMPLE_TRANSACTIONS,
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
  const getUserName = (id: string) => (id === state.user1.id ? state.user1.name : state.user2.name);

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
