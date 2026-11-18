import React, { useState, useMemo } from 'react';
import { Currency, Transaction } from '../../types';
import { formatMoney, formatDate } from '../../utils/formatters';

interface TrendLineChartProps {
  transactions: Transaction[];
  currency: Currency;
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({ transactions, currency }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const dataPoints = useMemo(() => {
    const expenses = transactions
      .filter((t) => !t.isSettlement && t.amount > 0 && t.date)
      .sort((a, b) => (a.date > b.date ? 1 : -1));

    if (expenses.length === 0) return [];

    let runningTotal = 0;
    return expenses.map((tx) => {
      runningTotal += tx.amount;
      return {
        id: tx.id,
        date: tx.date,
        title: tx.title,
        amount: tx.amount,
        cumulative: runningTotal,
      };
    });
  }, [transactions]);

  if (dataPoints.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
        No dated expenses found to generate cumulative spending trend.
      </div>
    );
  }

  const svgWidth = 560;
  const svgHeight = 240;
  const paddingLeft = 45;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const maxCumulative = dataPoints[dataPoints.length - 1].cumulative;
  const niceMax = Math.ceil(maxCumulative / 10) * 10 || 50;

  // Compute (x, y) for each point
  const points = dataPoints.map((pt, idx) => {
    const x =
      dataPoints.length === 1
        ? paddingLeft + chartWidth / 2
        : paddingLeft + (idx / (dataPoints.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (pt.cumulative / niceMax) * chartHeight;
    return { ...pt, x, y };
  });

  // Build bezier curve SVG path
  let pathD = '';
  if (points.length === 1) {
    pathD = `M ${points[0].x} ${points[0].y} h 1`;
  } else {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      pathD += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
  }

  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <div className="w-full space-y-3">
      {/* SVG Canvas */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-64 min-w-[460px] overflow-visible select-none"
        >
          <defs>
            <linearGradient id="trend-line-glow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>

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

          {/* Smooth Trend Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#trend-line-glow)"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="filter drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]"
          />

          {/* Vertical guideline for active point */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={paddingTop}
              x2={activePoint.x}
              y2={paddingTop + chartHeight}
              stroke="#06b6d4"
              strokeDasharray="3 3"
              strokeWidth="1.5"
              className="opacity-75"
            />
          )}

          {/* Markers */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g
                key={pt.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Touch / Click target */}
                <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />

                {/* Point halo */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 8 : 4.5}
                  fill="#06b6d4"
                  stroke="#ffffff"
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  style={{
                    filter: isHovered
                      ? 'drop-shadow(0 0 10px #06b6d4)'
                      : 'drop-shadow(0 0 4px #06b6d488)',
                  }}
                  className="transition-all duration-150"
                />

                {/* Date label on X-axis (sample points to prevent crowding) */}
                {(idx === 0 ||
                  idx === points.length - 1 ||
                  idx % Math.ceil(points.length / 5) === 0) && (
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

      {/* Point Tooltip Bar */}
      {activePoint ? (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-cyan-500/30 flex items-center justify-between text-xs animate-in fade-in">
          <div>
            <span className="font-bold text-slate-800 dark:text-white mr-2">
              {activePoint.title}
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              {formatDate(activePoint.date)} • Spend: {formatMoney(activePoint.amount, currency)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 mr-2">Cumulative Total:</span>
            <span className="font-black text-cyan-400 font-mono text-sm">
              {formatMoney(activePoint.cumulative, currency)}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
          Hover over any point along the curve to inspect transaction details and running total.
        </p>
      )}
    </div>
  );
};
