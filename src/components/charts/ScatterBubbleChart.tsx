import React, { useState, useMemo } from 'react';
import { Currency, Transaction } from '../../types';
import { CATEGORIES } from '../../utils/categories';
import { formatMoney, formatDate } from '../../utils/formatters';
import { CATEGORY_HEX_COLORS } from './chartTypes';

interface ScatterBubbleChartProps {
  transactions: Transaction[];
  currency: Currency;
}

export const ScatterBubbleChart: React.FC<ScatterBubbleChartProps> = ({ transactions, currency }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const points = useMemo(() => {
    const expenses = transactions
      .filter((t) => !t.isSettlement && t.amount > 0 && t.date)
      .sort((a, b) => (a.date > b.date ? 1 : -1));

    return expenses.map((tx, idx) => ({
      ...tx,
      idx,
    }));
  }, [transactions]);

  if (points.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
        No transaction data found for scatter plot.
      </div>
    );
  }

  const svgWidth = 560;
  const svgHeight = 250;
  const paddingLeft = 45;
  const paddingRight = 35;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const maxAmount = Math.max(...points.map((p) => p.amount), 10);
  const niceMax = Math.ceil(maxAmount / 10) * 10 || 50;

  const plottedPoints = points.map((p, idx) => {
    const x =
      points.length === 1
        ? paddingLeft + chartWidth / 2
        : paddingLeft + (idx / (points.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (p.amount / niceMax) * chartHeight;
    // Radius scaled smoothly by square root of amount
    const radius = Math.min(Math.max(Math.sqrt(p.amount) * 2.2, 5), 22);
    const color = CATEGORY_HEX_COLORS[p.category] || '#06b6d4';

    return {
      ...p,
      x,
      y,
      radius,
      color,
    };
  });

  const active = hoveredIdx !== null ? plottedPoints[hoveredIdx] : null;

  return (
    <div className="w-full space-y-3">
      {/* Outlier Legend */}
      <div className="flex items-center justify-between text-xs px-1">
        <span className="text-slate-500 dark:text-slate-400">
          Bubble size corresponds to transaction amount
        </span>
        <span className="text-[11px] font-mono text-slate-400">
          {plottedPoints.length} Transactions Plotted
        </span>
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

          {/* Bubbles */}
          {plottedPoints.map((pt, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g
                key={pt.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? pt.radius + 3 : pt.radius}
                  fill={pt.color}
                  fillOpacity={isHovered ? 0.9 : 0.65}
                  stroke={pt.color}
                  strokeWidth={isHovered ? 2.5 : 1}
                  style={{
                    filter: isHovered
                      ? `drop-shadow(0 0 12px ${pt.color})`
                      : `drop-shadow(0 0 4px ${pt.color}66)`,
                  }}
                  className="transition-all duration-150"
                />

                {/* X-axis date labels for first, last, and intermediate */}
                {(idx === 0 ||
                  idx === plottedPoints.length - 1 ||
                  idx % Math.ceil(plottedPoints.length / 5) === 0) && (
                  <text
                    x={pt.x}
                    y={paddingTop + chartHeight + 20}
                    textAnchor="middle"
                    className="text-[9px] font-mono fill-slate-400 dark:fill-slate-500"
                  >
                    {formatDate(pt.date).slice(0, 6)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Bubble Details */}
      {active && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-cyan-500/30 flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="text-base">{CATEGORIES[active.category]?.emoji || '📦'}</span>
            <div>
              <span className="font-bold text-slate-800 dark:text-white mr-2">{active.title}</span>
              <span className="text-slate-400 text-[11px] font-mono">
                {formatDate(active.date)} • {CATEGORIES[active.category]?.label}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-black text-cyan-400 font-mono text-sm">
              {formatMoney(active.amount, currency)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
