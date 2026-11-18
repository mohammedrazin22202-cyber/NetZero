import React, { useState } from 'react';
import { Currency, Category } from '../../types';
import { CATEGORIES } from '../../utils/categories';
import { formatMoney } from '../../utils/formatters';

interface CategorySlice {
  category: Category;
  amount: number;
  percentage: number;
}

interface RadarSpiderChartProps {
  categories: CategorySlice[];
  currency: Currency;
}

export const RadarSpiderChart: React.FC<RadarSpiderChartProps> = ({ categories, currency }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // We need at least 3 axes for a radar chart. If fewer, supplement with other core categories.
  const displayCategories = React.useMemo(() => {
    const existing = [...categories];
    const defaultAxes: Category[] = [
      'food',
      'entertainment',
      'transport',
      'groceries',
      'shopping',
      'rent',
    ];

    defaultAxes.forEach((cat) => {
      if (!existing.some((e) => e.category === cat) && existing.length < 6) {
        existing.push({ category: cat, amount: 0, percentage: 0 });
      }
    });

    return existing.slice(0, 8); // At most 8 axes for clarity
  }, [categories]);

  if (displayCategories.length < 3) {
    return (
      <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
        Need at least 3 categories to construct a radar chart.
      </div>
    );
  }

  const size = 320;
  const center = size / 2;
  const maxRadius = 105;
  const numAxes = displayCategories.length;

  const maxVal = Math.max(...displayCategories.map((c) => c.amount), 1);

  // Grid levels (25%, 50%, 75%, 100%)
  const levels = [0.25, 0.5, 0.75, 1];

  const getCoordinates = (index: number, radius: number) => {
    const angle = (index / numAxes) * 2 * Math.PI - Math.PI / 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  // Build polygon path for the actual data
  const dataPoints = displayCategories.map((cat, idx) => {
    // Normalization with a minimum radius for zero values so polygon looks clean
    const ratio = cat.amount > 0 ? (cat.amount / maxVal) : 0.04;
    const r = ratio * maxRadius;
    const coords = getCoordinates(idx, r);
    return { ...cat, ...coords, radius: r };
  });

  const polygonPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  const activeCategory = hoveredIdx !== null ? displayCategories[hoveredIdx] : null;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-2">
      {/* Spider SVG */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-64 h-64 sm:w-72 sm:h-72 overflow-visible select-none">
          <defs>
            <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
              <stop offset="80%" stopColor="#06b6d4" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </radialGradient>
          </defs>

          {/* Concentric Web Polygons */}
          {levels.map((lvl) => {
            const levelRadius = lvl * maxRadius;
            const webPoints = Array.from({ length: numAxes })
              .map((_, i) => {
                const c = getCoordinates(i, levelRadius);
                return `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`;
              })
              .join(' ') + ' Z';

            return (
              <path
                key={lvl}
                d={webPoints}
                fill="none"
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="1"
                strokeDasharray={lvl === 1 ? 'none' : '3 3'}
              />
            );
          })}

          {/* Radial Spokes */}
          {Array.from({ length: numAxes }).map((_, i) => {
            const edge = getCoordinates(i, maxRadius);
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={edge.x}
                y2={edge.y}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800/80"
                strokeWidth="1"
              />
            );
          })}

          {/* Filled Data Polygon */}
          <path
            d={polygonPath}
            fill="url(#radar-glow)"
            stroke="#10b981"
            strokeWidth="2.5"
            className="filter drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-300"
          />

          {/* Axis Labels & Vertex Nodes */}
          {dataPoints.map((pt, idx) => {
            const labelCoords = getCoordinates(idx, maxRadius + 22);
            const meta = CATEGORIES[pt.category] || CATEGORIES.other;
            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={pt.category}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Data Vertex Circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 7 : 4.5}
                  fill={isHovered ? '#06b6d4' : '#10b981'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="transition-all duration-150"
                  style={{
                    filter: isHovered ? 'drop-shadow(0 0 8px #06b6d4)' : 'none',
                  }}
                />

                {/* Outer Axis Label */}
                <text
                  x={labelCoords.x}
                  y={labelCoords.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-xs transition-transform duration-150"
                >
                  {meta.emoji}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Side Details / Axis Info */}
      <div className="flex-1 w-full space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
          Lifestyle Category Matrix
        </h4>

        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {displayCategories
            .filter((cat) => cat.amount > 0)
            .map((cat, idx) => {
            const meta = CATEGORIES[cat.category] || CATEGORIES.other;
            const isHovered = hoveredIdx === idx;

            return (
              <div
                key={cat.category}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`p-2 rounded-xl border flex items-center justify-between text-xs transition-all cursor-pointer ${
                  isHovered
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'bg-slate-50/70 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{meta.emoji}</span>
                  <span>{meta.label}</span>
                </div>
                <span className="font-mono font-bold">
                  {formatMoney(cat.amount, currency)}
                </span>
              </div>
            );
          })}
        </div>

        {activeCategory && (
          <div className="mt-3 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {CATEGORIES[activeCategory.category]?.label}
            </span>
            <span className="font-mono font-bold text-emerald-500">
              {formatMoney(activeCategory.amount, currency)} ({activeCategory.percentage.toFixed(1)}%)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
