import React, { useState } from 'react';
import { Currency, Category } from '../../types';
import { CATEGORIES } from '../../utils/categories';
import { formatMoney } from '../../utils/formatters';
import { CATEGORY_HEX_COLORS } from './chartTypes';

interface CategorySlice {
  category: Category;
  amount: number;
  percentage: number;
}

interface BarChartDiagramProps {
  categories: CategorySlice[];
  currency: Currency;
}

export const BarChartDiagram: React.FC<BarChartDiagramProps> = ({ categories, currency }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (categories.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
        No expense data available for bar diagram.
      </div>
    );
  }

  // Layout parameters
  const svgWidth = 560;
  const svgHeight = 250;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 45;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const maxAmount = Math.max(...categories.map((c) => c.amount), 1);
  // Round up max for clean grid ticks
  const niceMax = Math.ceil(maxAmount / 10) * 10 || 50;

  const numBars = categories.length;
  const barSpacing = chartWidth / numBars;
  const barWidth = Math.min(Math.max(barSpacing * 0.58, 22), 52);

  const gridSteps = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="w-full space-y-3">
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-64 min-w-[460px] overflow-visible select-none"
        >
          {/* Background Grid Lines & Y-axis labels */}
          {gridSteps.map((step) => {
            const y = paddingTop + chartHeight - step * chartHeight;
            const value = niceMax * step;
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
                  {value === 0 ? '0' : Math.round(value)}
                </text>
              </g>
            );
          })}

          {/* Vertical Bars */}
          {categories.map((cat, idx) => {
            const barHeight = Math.max((cat.amount / niceMax) * chartHeight, 4);
            const x = paddingLeft + idx * barSpacing + (barSpacing - barWidth) / 2;
            const y = paddingTop + chartHeight - barHeight;
            const color = CATEGORY_HEX_COLORS[cat.category] || '#10b981';
            const meta = CATEGORIES[cat.category] || CATEGORIES.other;
            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={cat.category}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Bar Glow Defs */}
                <defs>
                  <linearGradient id={`bar-grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="1" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.45" />
                  </linearGradient>
                </defs>

                {/* Hover backdrop pill */}
                <rect
                  x={x - 4}
                  y={paddingTop}
                  width={barWidth + 8}
                  height={chartHeight}
                  rx="8"
                  className={`transition-colors ${
                    isHovered ? 'fill-slate-100/60 dark:fill-slate-800/40' : 'fill-transparent'
                  }`}
                />

                {/* Vertical Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="6"
                  fill={`url(#bar-grad-${idx})`}
                  stroke={color}
                  strokeWidth={isHovered ? 2 : 1}
                  style={{
                    filter: isHovered ? `drop-shadow(0 0 12px ${color}aa)` : 'none',
                    transformOrigin: `${x + barWidth / 2}px ${paddingTop + chartHeight}px`,
                    transform: isHovered ? 'scaleY(1.02)' : 'scaleY(1)',
                  }}
                  className="transition-all duration-150"
                />

                {/* Top Amount Badge */}
                <text
                  x={x + barWidth / 2}
                  y={y - 8}
                  textAnchor="middle"
                  className={`text-[10px] font-bold font-mono transition-opacity ${
                    isHovered
                      ? 'fill-slate-900 dark:fill-white opacity-100'
                      : 'fill-slate-500 dark:fill-slate-400 opacity-90'
                  }`}
                >
                  {formatMoney(cat.amount, currency)}
                </text>

                {/* Bottom X-axis Emoji & Label */}
                <text
                  x={x + barWidth / 2}
                  y={paddingTop + chartHeight + 18}
                  textAnchor="middle"
                  className="text-xs select-none"
                >
                  {meta.emoji}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={paddingTop + chartHeight + 33}
                  textAnchor="middle"
                  className={`text-[9px] font-medium truncate select-none ${
                    isHovered
                      ? 'fill-emerald-500 font-bold'
                      : 'fill-slate-500 dark:fill-slate-400'
                  }`}
                  style={{ maxWidth: barSpacing }}
                >
                  {meta.label.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Bar Information Footer */}
      {hoveredIdx !== null && categories[hoveredIdx] && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-emerald-500/30 flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="text-base">{CATEGORIES[categories[hoveredIdx].category]?.emoji}</span>
            <span className="font-bold text-slate-800 dark:text-white">
              {CATEGORIES[categories[hoveredIdx].category]?.label}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-500 dark:text-slate-400 font-mono">
              Share: {categories[hoveredIdx].percentage.toFixed(1)}%
            </span>
            <span className="text-sm font-black text-emerald-500">
              {formatMoney(categories[hoveredIdx].amount, currency)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
