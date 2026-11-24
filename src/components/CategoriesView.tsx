import React, { useState } from 'react';
import { Filter, Trash2, PieChart as PieChartIcon, RotateCcw } from 'lucide-react';
import { AppState, Category, Transaction } from '../types';
import { CATEGORIES } from '../utils/categories';
import { formatMoney } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';

interface CategoriesViewProps {
  state: AppState;
  onSelectTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
  onBackToDashboard: () => void;
  onAddNewExpense: (category?: Category) => void;
}

const CATEGORY_HEX_COLORS: Record<string, string> = {
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

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  state,
  onSelectTransaction,
  onDeleteTransaction,
  onBackToDashboard,
  onAddNewExpense,
}) => {
  const [selectedCat, setSelectedCat] = useState<Category | 'all'>('all');
  const [hoveredCat, setHoveredCat] = useState<Category | null>(null);

  // Exclude settlements, loans, and unapproved transactions for spending metrics
  const expenseTxs = state.transactions.filter((t) => {
    if (t.isSettlement || t.category === 'settlement' || t.type === 'settlement') return false;
    if (t.isLoan || t.category === 'loan' || t.type === 'loan') return false;
    if (
      t.approvalStatus === 'pending_approval' ||
      t.approvalStatus === 'on_hold' ||
      t.approvalStatus === 'disputed_review' ||
      t.approvalStatus === 'rejected'
    ) {
      return false;
    }
    return true;
  });
  const totalSpent = expenseTxs.reduce((sum, t) => sum + t.amount, 0);

  // Group by category - show only categories with actual contribution (>0)
  const categoryStats = Object.values(CATEGORIES)
    .map((cat) => {
      const txsInCat = expenseTxs.filter((t) => t.category === cat.id);
      const amount = txsInCat.reduce((sum, t) => sum + t.amount, 0);
      const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
      return {
        ...cat,
        amount,
        count: txsInCat.length,
        percentage,
      };
    })
    .filter((cat) => cat.amount > 0 && cat.count > 0)
    .sort((a, b) => b.amount - a.amount);

  // Filtered transactions for the selected category
  const displayedTxs =
    selectedCat === 'all'
      ? expenseTxs
      : expenseTxs.filter((t) => t.category === selectedCat);

  // Pie / Donut Chart Geometry
  const size = 260;
  const center = size / 2;
  const radius = 95;
  const innerRadius = 58;

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad),
    };
  };

  let cumulativeAngle = 0;
  const slices = categoryStats.map((cat, idx) => {
    const sliceAngle = (cat.percentage / 100) * 360;
    const startAngle = cumulativeAngle;
    const effectiveAngle = categoryStats.length === 1 ? 359.99 : Math.max(sliceAngle - 1.5, 0.1);
    const endAngle = startAngle + effectiveAngle;
    cumulativeAngle += sliceAngle;

    const outerStart = polarToCartesian(center, center, radius, startAngle);
    const outerEnd = polarToCartesian(center, center, radius, endAngle);
    const innerStart = polarToCartesian(center, center, innerRadius, endAngle);
    const innerEnd = polarToCartesian(center, center, innerRadius, startAngle);

    const isLargeArc = sliceAngle > 180 ? 1 : 0;

    const pathData = [
      `M ${outerStart.x} ${outerStart.y}`,
      `A ${radius} ${radius} 0 ${isLargeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
      `L ${innerStart.x} ${innerStart.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${isLargeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
      'Z',
    ].join(' ');

    const color = CATEGORY_HEX_COLORS[cat.id] || '#94a3b8';

    return {
      ...cat,
      pathData,
      color,
      index: idx,
    };
  });

  const activeFocusCat =
    hoveredCat !== null
      ? categoryStats.find((c) => c.id === hoveredCat)
      : selectedCat !== 'all'
      ? categoryStats.find((c) => c.id === selectedCat)
      : null;

  const handleSliceClick = (catId: Category) => {
    triggerHaptic('light');
    setSelectedCat((prev) => (prev === catId ? 'all' : catId));
  };

  const partner = state.activeUserId === state.user2.id ? state.currentUser : state.user2;
  const partnerName = partner.name.replace(/\s*\([Bb]estie\)/gi, '').trim() || 'Friend';

  return (
    <div className="w-full max-w-4xl mx-auto py-4 animate-fadeIn select-none text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Spending by Category</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Total spending breakdown across categories with {partnerName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToDashboard}
            className="px-3.5 py-2 rounded-xl border border-purple-200 dark:border-purple-500/30 text-xs font-semibold hover:bg-purple-50 dark:hover:bg-white/5 transition-colors"
          >
            ← Dashboard
          </button>
          <button
            type="button"
            onClick={() => onAddNewExpense(selectedCat !== 'all' ? selectedCat : undefined)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl btn-neon-cyan text-xs font-bold uppercase tracking-wider"
          >
            <span>+ Add Expense</span>
          </button>
        </div>
      </div>

      {/* Interactive Pie Chart Card (Replacing boxes) */}
      {categoryStats.length > 0 ? (
        <div className="neon-glass-card rounded-3xl p-5 sm:p-6 mb-6">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-purple-200/40 dark:border-purple-500/20">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                Category Contribution Breakdown
              </h3>
            </div>
            {selectedCat !== 'all' && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCat('all');
                  triggerHaptic('light');
                }}
                className="flex items-center gap-1 text-xs font-semibold text-cyan-500 hover:text-cyan-400 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filter</span>
              </button>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Donut / Pie SVG */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg
                viewBox={`0 0 ${size} ${size}`}
                className="w-56 h-56 sm:w-64 sm:h-64 drop-shadow-xl select-none"
              >
                {slices.map((slice) => {
                  const isHovered = hoveredCat === slice.id;
                  const isSelected = selectedCat === slice.id;
                  const isDimmed =
                    (hoveredCat !== null && !isHovered) ||
                    (hoveredCat === null && selectedCat !== 'all' && !isSelected);

                  return (
                    <path
                      key={slice.id}
                      d={slice.pathData}
                      fill={slice.color}
                      opacity={isDimmed ? 0.35 : 1}
                      className="transition-all duration-200 cursor-pointer"
                      style={{
                        transformOrigin: `${center}px ${center}px`,
                        transform: isHovered || isSelected ? 'scale(1.05)' : 'scale(1)',
                        filter:
                          isHovered || isSelected
                            ? `drop-shadow(0 0 12px ${slice.color}bb)`
                            : 'none',
                      }}
                      onMouseEnter={() => setHoveredCat(slice.id)}
                      onMouseLeave={() => setHoveredCat(null)}
                      onClick={() => handleSliceClick(slice.id)}
                    />
                  );
                })}
              </svg>

              {/* Center Donut Readout */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 cursor-pointer select-none"
                onClick={() => {
                  if (selectedCat !== 'all') {
                    setSelectedCat('all');
                    triggerHaptic('light');
                  }
                }}
              >
                {activeFocusCat ? (
                  <>
                    <span className="text-2xl mb-0.5">{activeFocusCat.emoji}</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[110px]">
                      {activeFocusCat.label}
                    </span>
                    <span className="text-base font-black text-cyan-400 mt-0.5">
                      {formatMoney(activeFocusCat.amount, state.currency)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {activeFocusCat.percentage.toFixed(0)}% • {activeFocusCat.count}{' '}
                      {activeFocusCat.count === 1 ? 'expense' : 'expenses'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                      Total Spend
                    </span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {formatMoney(totalSpent, state.currency)}
                    </span>
                    <span className="text-[10px] text-cyan-400 font-semibold mt-0.5">
                      {categoryStats.length} {categoryStats.length === 1 ? 'Category' : 'Categories'}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Interactive Category Legend */}
            <div className="flex-1 w-full space-y-2">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-2">
                Click any slice or category below to filter the activity list:
              </p>

              <div className="space-y-2">
                {categoryStats.map((cat) => {
                  const color = CATEGORY_HEX_COLORS[cat.id] || '#94a3b8';
                  const isSelected = selectedCat === cat.id;
                  const isHovered = hoveredCat === cat.id;

                  return (
                    <div
                      key={cat.id}
                      onClick={() => handleSliceClick(cat.id)}
                      onMouseEnter={() => setHoveredCat(cat.id)}
                      onMouseLeave={() => setHoveredCat(null)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-400 text-cyan-400 ring-2 ring-cyan-500/30 shadow-md shadow-cyan-500/10'
                          : isHovered
                          ? 'bg-white/10 dark:bg-slate-800/80 border-purple-400/50 shadow-sm'
                          : 'bg-white/5 dark:bg-slate-950/40 border-purple-200/40 dark:border-purple-500/20 hover:bg-white/10 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xl">{cat.emoji}</span>
                        <div>
                          <span className="text-xs font-bold block text-slate-900 dark:text-white">
                            {cat.label}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {cat.count} {cat.count === 1 ? 'outlay' : 'outlays'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black block text-slate-900 dark:text-white">
                          {formatMoney(cat.amount, state.currency)}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-cyan-400">
                          {cat.percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-2xl neon-glass-card text-center text-slate-400 dark:text-slate-500 text-xs mb-6">
          No categories with spending contributions yet.
        </div>
      )}

      {/* Filter status header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Filter className="w-4 h-4 text-purple-500" />
          <span>
            {selectedCat === 'all'
              ? `All Expenses (${displayedTxs.length})`
              : `${CATEGORIES[selectedCat]?.label || selectedCat} Expenses (${displayedTxs.length})`}
          </span>
        </h3>
        {selectedCat !== 'all' && (
          <button
            type="button"
            onClick={() => {
              setSelectedCat('all');
              triggerHaptic('light');
            }}
            className="text-xs text-[#0284c7] dark:text-cyan-400 hover:underline font-semibold"
          >
            Show All
          </button>
        )}
      </div>

      {/* Transactions List */}
      {displayedTxs.length > 0 ? (
        <div className="space-y-2">
          {displayedTxs.map((tx) => (
            <div
              key={tx.id}
              onClick={() => onSelectTransaction?.(tx)}
              className="neon-glass-card rounded-2xl p-3.5 flex items-center justify-between gap-3 cursor-pointer hover:border-purple-400/60 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xl">{CATEGORIES[tx.category]?.emoji || '🧾'}</span>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold truncate group-hover:text-[#0284c7] dark:group-hover:text-cyan-300 transition-colors">
                    {tx.title}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {tx.date} • Paid by {tx.paidBy === state.activeUserId ? 'You' : partnerName}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {formatMoney(tx.amount, state.currency)}
                </span>
                {onDeleteTransaction && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTransaction(tx.id);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete expense"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="neon-glass-card rounded-3xl p-8 text-center text-xs text-slate-500 dark:text-slate-400">
          No expenses recorded for this category yet.
        </div>
      )}
    </div>
  );
};
