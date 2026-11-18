import { LucideIcon } from 'lucide-react';
import {
  PieChart,
  BarChart3,
  BarChart2,
  TrendingUp,
  Activity,
  Compass,
  Users,
  Calendar,
  GitCommit,
  Sparkles,
} from 'lucide-react';

export type ChartType =
  | 'pie'
  | 'bar'
  | 'histogram'
  | 'trend'
  | 'area'
  | 'radar'
  | 'payer_split'
  | 'day_of_week'
  | 'waterfall'
  | 'scatter';

export interface ChartOption {
  id: ChartType;
  title: string;
  shortTitle: string;
  description: string;
  icon: LucideIcon;
  badge: string;
}

export const CHART_OPTIONS: ChartOption[] = [
  {
    id: 'pie',
    title: 'Category Donut & Pie Chart',
    shortTitle: 'Pie Chart',
    description: 'Visual breakdown of spending proportions by category',
    icon: PieChart,
    badge: 'Popular',
  },
  {
    id: 'bar',
    title: 'Category Bar Diagram',
    shortTitle: 'Bar Diagram',
    description: 'Side-by-side vertical comparisons of total spend per category',
    icon: BarChart3,
    badge: 'Essential',
  },
  {
    id: 'histogram',
    title: 'Transaction Size Histogram',
    shortTitle: 'Histogram',
    description: 'Frequency distribution of transaction sizes into value brackets',
    icon: BarChart2,
    badge: 'Distribution',
  },
  {
    id: 'trend',
    title: 'Cumulative Spending Trend',
    shortTitle: 'Line Trend',
    description: 'Timeline trajectory showing how shared expenses grow over time',
    icon: TrendingUp,
    badge: 'Timeline',
  },
  {
    id: 'area',
    title: 'Expense Velocity Area Flow',
    shortTitle: 'Area Flow',
    description: 'Smooth gradient area chart highlighting peak spending surges',
    icon: Activity,
    badge: 'Velocity',
  },
  {
    id: 'radar',
    title: 'Lifestyle Spider / Radar Chart',
    shortTitle: 'Radar Grid',
    description: 'Multidimensional polygon showing balance across lifestyle categories',
    icon: Compass,
    badge: 'Habits',
  },
  {
    id: 'payer_split',
    title: 'Grouped Payer Split Comparison',
    shortTitle: 'Payer Split',
    description: 'Who paid for what: You vs Friend side-by-side contributions',
    icon: Users,
    badge: 'Comparison',
  },
  {
    id: 'day_of_week',
    title: 'Day-of-Week Spending Heatmap',
    shortTitle: 'Day of Week',
    description: 'Identifies which days of the week have the heaviest spending',
    icon: Calendar,
    badge: 'Weekly',
  },
  {
    id: 'waterfall',
    title: 'Balance Waterfall Reconciliation',
    shortTitle: 'Waterfall Flow',
    description: 'Step-by-step breakdown from initial spends to current net balance',
    icon: GitCommit,
    badge: 'Ledger',
  },
  {
    id: 'scatter',
    title: 'Transaction Scatter & Outliers Plot',
    shortTitle: 'Scatter Plot',
    description: 'Magnitude and outlier detection across every single transaction',
    icon: Sparkles,
    badge: 'Outliers',
  },
];

export const CATEGORY_HEX_COLORS: Record<string, string> = {
  food: '#f59e0b',       // amber-500
  drinks: '#fb923c',     // orange-400
  transport: '#38bdf8',  // sky-400
  groceries: '#10b981',  // emerald-500
  entertainment: '#a855f7', // purple-500
  shopping: '#ec4899',   // pink-500
  rent: '#06b6d4',       // cyan-500
  loan: '#22c55e',       // green-500
  settlement: '#14b8a6', // teal-500
  other: '#94a3b8',      // slate-400
};

export const PALETTE = [
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#a855f7', // purple
  '#f59e0b', // amber
  '#ec4899', // pink
  '#3b82f6', // blue
  '#14b8a6', // teal
  '#f97316', // orange
  '#8b5cf6', // violet
  '#64748b', // slate
];
