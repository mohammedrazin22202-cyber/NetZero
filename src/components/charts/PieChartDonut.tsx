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

interface PieChartDonutProps {
  categories: CategorySlice[];
  totalAmount: number;
  currency: Currency;
}

export const PieChartDonut: React.FC<PieChartDonutProps> = ({
  categories,
  totalAmount,
  currency,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (categories.length === 0 || totalAmount === 0) {
    return (
      <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
        No expense data available for pie chart.
      </div>
    );
  }

  // Svg geometry
  const size = 260;
  const center = size / 2;
  const radius = 95;
  const innerRadius = 58;

  // Polar to Cartesian conversion
  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad),
    };
  };

  // Generate donut slices
  let cumulativeAngle = 0;
  const slices = categories.map((cat, idx) => {
    const sliceAngle = (cat.percentage / 100) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + Math.max(sliceAngle - 1.5, 0.1); // Small gap between slices
    cumulativeAngle += sliceAngle;

    const outerStart = polarToCartesian(center, cy_center(idx), radius, startAngle);
    const outerEnd = polarToCartesian(center, cy_center(idx), radius, endAngle);
    const innerStart = polarToCartesian(center, cy_center(idx), innerRadius, endAngle);
    const innerEnd = polarToCartesian(center, cy_center(idx), innerRadius, startAngle);

    const isLargeArc = sliceAngle > 180 ? 1 : 0;

    const pathData = [
      `M ${outerStart.x} ${outerStart.y}`,
      `A ${radius} ${radius} 0 ${isLargeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
      `L ${innerStart.x} ${innerStart.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${isLargeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
      'Z',
    ].join(' ');

    const color = CATEGORY_HEX_COLORS[cat.category] || '#94a3b8';

    return {
      ...cat,
      pathData,
      color,
      index: idx,
    };
  });

  function cy_center(_idx: number) {
    return center;
  }

  const activeCategory = hoveredIndex !== null ? categories[hoveredIndex] : null;

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-6 py-2">
      {/* Donut SVG Visual */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-56 h-56 sm:w-64 sm:h-64 drop-shadow-xl"
        >
          {slices.map((slice) => {
            const isHovered = hoveredIndex === slice.index;
            return (
              <path
                key={slice.category}
                d={slice.pathData}
                fill={slice.color}
                opacity={hoveredIndex === null || isHovered ? 1 : 0.4}
                className="transition-all duration-200 cursor-pointer hover:opacity-100"
                style={{
                  transformOrigin: `${center}px ${center}px`,
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                  filter: isHovered ? `drop-shadow(0 0 10px ${slice.color}88)` : 'none',
                }}
                onMouseEnter={() => setHoveredIndex(slice.index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Center Donut Hole Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center p-4">
          {activeCategory ? (
            <>
              <span className="text-xl mb-0.5">
                {CATEGORIES[activeCategory.category]?.emoji || '📦'}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[100px]">
                {CATEGORIES[activeCategory.category]?.label || activeCategory.category}
              </span>
              <span className="text-sm font-black text-emerald-500">
                {formatMoney(activeCategory.amount, currency)}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {activeCategory.percentage.toFixed(1)}%
              </span>
            </>
          ) : (
            <>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                Total Spend
              </span>
              <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {formatMoney(totalAmount, currency)}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                {categories.length} categories
              </span>
            </>
          )}
        </div>
      </div>

      {/* Interactive Legend Grid */}
      <div className="flex-1 w-full space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
          Category Distribution Breakdown
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
          {categories.map((cat, idx) => {
            const meta = CATEGORIES[cat.category] || CATEGORIES.other;
            const color = CATEGORY_HEX_COLORS[cat.category] || '#94a3b8';
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={cat.category}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isHovered
                    ? 'bg-slate-100 dark:bg-slate-800 border-emerald-500/50 shadow-sm'
                    : 'bg-slate-50/70 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm shrink-0">{meta.emoji}</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {meta.label}
                  </span>
                </div>
                <div className="text-right shrink-0 pl-2">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {formatMoney(cat.amount, currency)}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {cat.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
