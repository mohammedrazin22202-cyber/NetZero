import React, { useState, useMemo } from 'react';
import { Currency, Transaction, UserProfile } from '../../types';
import { CATEGORIES } from '../../utils/categories';
import { formatMoney } from '../../utils/formatters';

interface PayerSplitChartProps {
  transactions: Transaction[];
  activeUser: UserProfile;
  friend: UserProfile;
  currency: Currency;
}

export const PayerSplitChart: React.FC<PayerSplitChartProps> = ({
  transactions,
  activeUser,
  friend,
  currency,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const categorySplits = useMemo(() => {
    const expenses = transactions.filter((t) => !t.isSettlement && t.amount > 0);
    const map: Record<string, { you: number; friend: number; total: number }> = {};

    expenses.forEach((tx) => {
      if (!map[tx.category]) {
        map[tx.category] = { you: 0, friend: 0, total: 0 };
      }
      if (tx.paidBy === activeUser.id) {
        map[tx.category].you += tx.amount;
      } else {
        map[tx.category].friend += tx.amount;
      }
      map[tx.category].total += tx.amount;
    });

    return Object.entries(map)
      .map(([cat, data]) => ({
        category: cat,
        you: data.you,
        friend: data.friend,
        total: data.total,
        meta: CATEGORIES[cat as keyof typeof CATEGORIES] || CATEGORIES.other,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6); // Top 6 categories
  }, [transactions, activeUser.id, friend.id]);

  if (categorySplits.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
        No expense data found to compare payer contributions.
      </div>
    );
  }

  const svgWidth = 560;
  const svgHeight = 250;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 45;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const maxVal = Math.max(
    ...categorySplits.map((c) => Math.max(c.you, c.friend)),
    10
  );
  const niceMax = Math.ceil(maxVal / 10) * 10 || 50;

  const groupWidth = chartWidth / categorySplits.length;
  const singleBarWidth = Math.min(groupWidth * 0.35, 24);

  const active = hoveredIdx !== null ? categorySplits[hoveredIdx] : null;

  return (
    <div className="w-full space-y-3">
      {/* Legend Header */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500 shrink-0 shadow-sm" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {activeUser.name.split(' ')[0]} (You)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-purple-500 shrink-0 shadow-sm" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {friend.name.split(' ')[0]}
            </span>
          </div>
        </div>
        <span className="text-[11px] text-slate-400">Side-by-side Upfront Spends</span>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-64 min-w-[460px] overflow-visible select-none"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((step) => {
            const y = paddingTop + chartHeight - step * chartHeight;
            const val = niceMax * step;
            return (
              <g key={step}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={paddingLeft + chartWidth}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800/80"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-slate-400 dark:fill-slate-500"
                >
                  {Math.round(val)}
                </text>
              </g>
            );
          })}

          {/* Grouped Bars */}
          {categorySplits.map((item, idx) => {
            const groupX = paddingLeft + idx * groupWidth;
            const youHeight = Math.max((item.you / niceMax) * chartHeight, item.you > 0 ? 4 : 1);
            const friendHeight = Math.max(
              (item.friend / niceMax) * chartHeight,
              item.friend > 0 ? 4 : 1
            );

            const youX = groupX + (groupWidth - singleBarWidth * 2 - 4) / 2;
            const friendX = youX + singleBarWidth + 4;

            const youY = paddingTop + chartHeight - youHeight;
            const friendY = paddingTop + chartHeight - friendHeight;

            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={item.category}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Group hover container */}
                <rect
                  x={groupX + 2}
                  y={paddingTop}
                  width={groupWidth - 4}
                  height={chartHeight}
                  rx="6"
                  className={`transition-colors ${
                    isHovered ? 'fill-slate-100/60 dark:fill-slate-800/30' : 'fill-transparent'
                  }`}
                />

                {/* You Bar (Emerald) */}
                <rect
                  x={youX}
                  y={youY}
                  width={singleBarWidth}
                  height={youHeight}
                  rx="4"
                  fill="#10b981"
                  className="transition-all duration-200"
                  style={{
                    filter: isHovered ? 'drop-shadow(0 0 8px #10b981aa)' : 'none',
                  }}
                />

                {/* Friend Bar (Purple) */}
                <rect
                  x={friendX}
                  y={friendY}
                  width={singleBarWidth}
                  height={friendHeight}
                  rx="4"
                  fill="#a855f7"
                  className="transition-all duration-200"
                  style={{
                    filter: isHovered ? 'drop-shadow(0 0 8px #a855f7aa)' : 'none',
                  }}
                />

                {/* Category Emoji & Label on X-axis */}
                <text
                  x={groupX + groupWidth / 2}
                  y={paddingTop + chartHeight + 18}
                  textAnchor="middle"
                  className="text-xs select-none"
                >
                  {item.meta.emoji}
                </text>
                <text
                  x={groupX + groupWidth / 2}
                  y={paddingTop + chartHeight + 32}
                  textAnchor="middle"
                  className={`text-[9px] font-medium truncate select-none ${
                    isHovered
                      ? 'fill-slate-900 dark:fill-white font-bold'
                      : 'fill-slate-500 dark:fill-slate-400'
                  }`}
                >
                  {item.meta.label.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Group Footer Details */}
      {active && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-purple-500/30 flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="text-base">{active.meta.emoji}</span>
            <span className="font-bold text-slate-800 dark:text-white">{active.meta.label}</span>
          </div>
          <div className="flex items-center gap-4 font-mono">
            <span className="text-emerald-500 font-bold">
              {activeUser.name.split(' ')[0]}: {formatMoney(active.you, currency)}
            </span>
            <span className="text-purple-400 font-bold">
              {friend.name.split(' ')[0]}: {formatMoney(active.friend, currency)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
