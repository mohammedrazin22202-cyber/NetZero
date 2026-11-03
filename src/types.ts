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

export interface Transaction {
  id: string;
  title: string;
  amount: number; // Total amount of transaction
  paidBy: string; // User ID who paid upfront
  payerOwedAmount: number; // Amount owed to the payer (e.g. for equal split of 100, payer is owed 50)
  beneficiaryId: string; // The person who benefits/owes
  splitType: SplitType;
  category: Category;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  note?: string;
  isSettlement?: boolean;
  createdAt: number;
}

export interface AppState {
  user1: UserProfile; // Primary user (default "You")
  user2: UserProfile; // Best Friend
  activeUserId: string; // Currently viewing as user1 or user2
  currency: Currency;
  transactions: Transaction[];
  theme: 'dark' | 'light';
}
