export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD' | 'JPY';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  color: string;
  pin?: string; // 4-digit user ID / PIN (e.g. '8181')
  upiId?: string;
  paypalUser?: string;
  venmoUser?: string;
}

export type TransactionApprovalStatus =
  | 'approved'
  | 'pending_approval'
  | 'on_hold'
  | 'disputed_review'
  | 'rejected';

export type SplitType = 'you_paid_full' | 'friend_paid_full' | 'equal_split' | 'custom';

export type Category = 
  | 'food' 
  | 'drinks' 
  | 'transport' 
  | 'groceries' 
  | 'entertainment' 
  | 'shopping' 
  | 'rent' 
  | 'loan' 
  | 'settlement' 
  | 'other';

export interface ItemizedSplitItem {
  id: string;
  title: string;
  amount: number;
  assignedTo: 'active_user' | 'friend' | 'shared';
}

export interface Transaction {
  id: string;
  title: string;
  amount: number; // Total amount of transaction
  paidBy: string; // User ID who paid upfront
  payerOwedAmount: number; // Amount owed to the payer
  beneficiaryId: string; // The person who benefits/owes
  splitType: SplitType;
  category: Category;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  note?: string;
  receiptUrl?: string; // Optional image attachment
  items?: ItemizedSplitItem[];
  isSettlement?: boolean;
  isLoan?: boolean;
  type?: 'expense' | 'loan' | 'settlement';
  approvalStatus?: TransactionApprovalStatus; // 'approved' | 'pending_approval' | 'on_hold' | 'disputed_review' | 'rejected'
  approvalRequestedBy?: string; // User ID who initiated transaction
  approvalRespondentId?: string; // User ID who must approve/deny
  deniedAt?: number; // Timestamp (ms) when denied
  lockedUntil?: number; // Timestamp (ms) when 72h hold expires
  reviewVotes?: Record<string, boolean>; // [userId]: true | false
  createdAt: number;
}

export interface RecurringExpense {
  id: string;
  friendId: string;
  title: string;
  amount: number;
  paidBy: string;
  beneficiaryId?: string;
  splitType: SplitType;
  category: Category;
  dayOfMonth: number;
  note?: string;
  lastLoggedMonth?: string; // "YYYY-MM"
  lastLogged?: string;
}

export interface KeyboardShortcuts {
  newExpense: string;
  settle: string;
  perspective: string;
  toggleTheme: string;
  shortcutsGuide: string;
  closeModal: string;
}

export const DEFAULT_KEYBOARD_SHORTCUTS: KeyboardShortcuts = {
  newExpense: 'N',
  settle: 'S',
  perspective: 'P',
  toggleTheme: 'T',
  shortcutsGuide: '?',
  closeModal: 'Escape',
};

export interface AppState {
  currentUser: UserProfile; // Primary user ("You")
  friends: UserProfile[]; // All friends
  selectedFriendId: string; // Currently selected friend
  user1: UserProfile; // = currentUser (backward compat)
  user2: UserProfile; // = active friend (backward compat)
  activeUserId: string; // Viewing as currentUser or friend
  currency: Currency;
  transactions: Transaction[]; // Active friend's transactions
  friendTransactions: Record<string, Transaction[]>; // [friendId]: Transaction[]
  monthlyBudgets: Record<string, number>; // [friendId]: monthly budget
  recurringExpenses: RecurringExpense[];
  theme: 'dark' | 'light';
  shortcuts?: KeyboardShortcuts;
}
