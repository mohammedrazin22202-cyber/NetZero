import { AppState, Transaction } from '../types';
import { DEFAULT_CURRENCY } from './currencies';

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

export const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    title: 'Pizza Night & Drinks',
    amount: 48.0,
    paidBy: 'user_1',
    payerOwedAmount: 24.0,
    beneficiaryId: 'user_2',
    splitType: 'equal_split',
    category: 'food',
    date: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
    time: '20:30',
    note: 'Split 50/50 for pizza and soda',
    createdAt: Date.now() - 86400000 * 2,
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
    date: new Date(Date.now() - 86400000 * 1).toISOString().slice(0, 10),
    time: '23:45',
    note: 'Late night ride',
    createdAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'tx_3',
    title: 'Movie tickets (Cinema)',
    amount: 32.0,
    paidBy: 'user_1',
    payerOwedAmount: 32.0,
    beneficiaryId: 'user_2',
    splitType: 'you_paid_full',
    category: 'entertainment',
    date: new Date().toISOString().slice(0, 10),
    time: '18:15',
    note: 'I covered Sam tickets upfront',
    createdAt: Date.now(),
  },
];

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
    return {
      ...DEFAULT_STATE,
      ...parsed,
      currency: parsed.currency || DEFAULT_CURRENCY,
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : SAMPLE_TRANSACTIONS,
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
  const headers = ['Date', 'Title', 'Category', 'Total Amount', 'Paid By', 'Owed Amount', 'Split Type', 'Note'];
  const getUserName = (id: string) => (id === state.user1.id ? state.user1.name : state.user2.name);

  const rows = transactions.map((t) => [
    `"${t.date}"`,
    `"${t.title.replace(/"/g, '""')}"`,
    `"${t.category}"`,
    t.amount.toFixed(2),
    `"${getUserName(t.paidBy)}"`,
    t.payerOwedAmount.toFixed(2),
    `"${t.splitType}"`,
    `"${(t.note || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
