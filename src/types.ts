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
  upiId?: string;
  paypalUser?: string;
  venmoUser?: string;
}

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
}
