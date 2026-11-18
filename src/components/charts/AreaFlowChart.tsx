import React, { useState, useMemo } from 'react';
import { Currency, Transaction } from '../../types';
import { formatMoney, formatDate } from '../../utils/formatters';

interface AreaFlowChartProps {
  transactions: Transaction[];
  currency: Currency;
}

export const AreaFlowChart: React.FC<AreaFlowChartProps> = ({ transactions, currency }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Group transactions by date
  const dateSeries = useMemo(() => {
    const dailyMap: Record<string, { total: number; titles: string[]; count: number }> = {};
    const expenses = transactions.filter((t) => !t.isSettlement && t.amount > 0 && t.date);

    expenses.forEach((tx) => {
      if (!dailyMap[tx.date]) {
        dailyMap[tx.date] = { total: 0, titles: [], count: 0 };
      }
      dailyMap[tx.date].total += tx.amount;
      dailyMap[tx.date].titles.push(tx.title);
      dailyMap[tx.date].count += 1;
    });

    const dates = Object.keys(dailyMap).sort();
    return dates.map((d) => ({
      date: d,
      amount: dailyMap[d].total,
      titles: dailyMap[d].titles,
      count: dailyMap[d].count,
    }));
  }, [transactions]);

  if (dateSeries.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
        No expense data recorded to construct area flow.
      </div>
    );
  }

  const svgWidth = 560;
  const svgHeight = 240;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const baselineY = paddingTop + chartHeight;

  const maxVal = Math.max(...dateSeries.map((d) => d.amount), 10);
  const niceMax = Math.ceil(maxVal / 10) * 10 || 50;

  const points = dateSeries.map((d, idx) => {
    const x =
      dateSeries.length === 1
        ? paddingLeft + chartWidth / 2
        : paddingLeft + (idx / (dateSeries.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.amount / niceMax) * chartHeight;
    return { ...d, x, y };
  });

  // Construct Area Path (Curve + Floor)
  let lineD = '';
  let areaD = '';

  if (points.length === 1) {
    lineD = `M ${points[0].x - 20} ${points[0].y} L ${points[0].x + 20} ${points[0].y}`;
    areaD = `M ${points[0].x - 20} ${baselineY} L ${points[0].x - 20} ${points[0].y} L ${
      points[0].x + 20
    } ${points[0].y} L ${points[0].x + 20} ${baselineY} Z`;
  } else {
    lineD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      lineD += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    const last = points[points.length - 1];
    const first = points[0];
    areaD = `${lineD} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
  }

  const active = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <div className="w-full space-y-3">
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-64 min-w-[460px] overflow-visible select-none"
        >
          <defs>
            <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="area-stroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#38bdf8" />
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

          {/* Area Fill */}
          <path d={areaD} fill="url(#area-gradient)" />

          {/* Top Edge Stroke */}
          <path
            d={lineD}
            fill="none"
            stroke="url(#area-stroke)"
            strokeWidth="3"
            strokeLinecap="round"
            className="filter drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
          />

          {/* Markers & Interaction Targets */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g
                key={pt.date}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />

                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 7 : 4}
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  style={{
                    filter: isHovered ? 'drop-shadow(0 0 10px #10b981)' : 'none',
                  }}
                  className="transition-all duration-150"
                />

                {(idx === 0 ||
                  idx === points.length - 1 ||
                  idx % Math.ceil(points.length / 5) === 0) && (
                  <text
                    x={pt.x}
                    y={baselineY + 20}
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

      {active && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-emerald-500/30 flex items-center justify-between text-xs animate-in fade-in">
          <div>
            <span className="font-bold text-slate-800 dark:text-white mr-2">
              {formatDate(active.date)}
            </span>
            <span className="text-slate-400">
              {active.titles.join(', ')} ({active.count} spend events)
            </span>
          </div>
          <div className="font-black text-emerald-500 font-mono text-sm">
            {formatMoney(active.amount, currency)}
          </div>
        </div>
      )}
    </div>
  );
};
