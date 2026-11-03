import { Category } from '../types';

export interface CategoryMeta {
  id: Category;
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
}

export const CATEGORIES: Record<Category, CategoryMeta> = {
  food: {
    id: 'food',
    label: 'Food & Dining',
    emoji: '🍔',
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10 border-amber-400/20',
  },
  drinks: {
    id: 'drinks',
    label: 'Drinks & Coffee',
    emoji: '☕',
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10 border-orange-400/20',
  },
  transport: {
    id: 'transport',
    label: 'Cab & Travel',
    emoji: '🚕',
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10 border-blue-400/20',
  },
  groceries: {
    id: 'groceries',
    label: 'Groceries',
    emoji: '🛒',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10 border-emerald-400/20',
  },
  entertainment: {
    id: 'entertainment',
    label: 'Movies & Fun',
    emoji: '🎬',
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10 border-purple-400/20',
  },
  shopping: {
    id: 'shopping',
    label: 'Shopping',
    emoji: '🛍️',
    color: 'text-pink-400',
    bgColor: 'bg-pink-400/10 border-pink-400/20',
  },
  rent: {
    id: 'rent',
    label: 'Rent & Bills',
    emoji: '🏠',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-400/10 border-cyan-400/20',
  },
  loan: {
    id: 'loan',
    label: 'Cash Lending',
    emoji: '💵',
    color: 'text-green-400',
    bgColor: 'bg-green-400/10 border-green-400/20',
  },
  settlement: {
    id: 'settlement',
    label: 'Settlement',
    emoji: '🤝',
    color: 'text-emerald-300',
    bgColor: 'bg-emerald-500/20 border-emerald-400/30',
  },
  other: {
    id: 'other',
    label: 'General / Other',
    emoji: '📦',
    color: 'text-slate-400',
    bgColor: 'bg-slate-400/10 border-slate-400/20',
  },
};
