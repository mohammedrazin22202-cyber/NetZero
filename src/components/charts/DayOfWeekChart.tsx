import React, { useState, useMemo } from 'react';
import { Currency, Transaction } from '../../types';
import { formatMoney } from '../../utils/formatters';

interface DayOfWeekChartProps {
  transactions: Transaction[];
  currency: Currency;
}

export const DayOfWeekChart: React.FC<DayOfWeekChartProps> = ({ transactions, currency }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const daysData = useMemo(() => {
    const days = [
      { key: 1, name: 'Monday', short: 'Mon' },
      { key: 2, name: 'Tuesday', short: 'Tue' },
      { key: 3, name: 'Wednesday', short: 'Wed' },
      { key: 4, name: 'Thursday', short: 'Thu' },
      { key: 5, name: 'Friday', short: 'Fri' },
      { key: 6, name: 'Saturday', short: 'Sat' },
      { key: 0, name: 'Sunday', short: 'Sun' },
    ];

    const stats = days.map((d) => ({
      ...d,
      totalAmount: 0,
      count: 0,
    }));

    const expenses = transactions.filter((t) => !t.isSettlement && t.amount > 0 && t.date);

    expenses.forEach((tx) => {
      // Parse YYYY-MM-DD
      const [y, m, day] = tx.date.split('-').map((v) => parseInt(v, 10));
      if (!isNaN(y) && !isNaN(m) && !isNaN(day)) {
        const dt = new Date(y, m - 1, day);
        const dayIdx = dt.getDay(); // 0 is Sunday
        const target = stats.find((s) => s.key === dayIdx);
        if (target) {
          target.totalAmount += tx.amount;
          target.count += 1;
        }
      }
    });

    return stats;
  }, [transactions]);

  const maxSpend = Math.max(...daysData.map((d) => d.totalAmount), 1);
  const niceMax = Math.ceil(maxSpend / 10) * 10 || 50;

  const peakDay = daysData.reduce(
    (prev, cur) => (cur.totalAmount > prev.totalAmount ? cur : prev),
    daysData[0]
  );

  const svgWidth = 560;
  const svgHeight = 240;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 45;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const barSpacing = chartWidth / 7;
  const barWidth = Math.min(barSpacing * 0.6, 36);

  const active = hoveredIdx !== null ? daysData[hoveredIdx] : null;

  return (
    <div className="w-full space-y-3">
      {/* Peak Day Insight Banner */}
      {peakDay && peakDay.totalAmount > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span>
            Peak Outing Day:{' '}
            <strong className="text-amber-400 font-semibold">{peakDay.name}</strong> (
            {formatMoney(peakDay.totalAmount, currency)} across {peakDay.count} events)
          </span>
          <span className="text-[11px] font-mono">Weekly Spending Cycle</span>
        </div>
      )}

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

          {/* Day Bars */}
          {daysData.map((d, idx) => {
            const barHeight = Math.max((d.totalAmount / niceMax) * chartHeight, d.totalAmount > 0 ? 6 : 2);
            const x = paddingLeft + idx * barSpacing + (barSpacing - barWidth) / 2;
            const y = paddingTop + chartHeight - barHeight;
            const isHovered = hoveredIdx === idx;
            const isPeak = d === peakDay && d.totalAmount > 0;

            const barColor = isPeak ? '#f59e0b' : '#06b6d4';

            return (
              <g
                key={d.short}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Column background hover */}
                <rect
                  x={x - 4}
                  y={paddingTop}
                  width={barWidth + 8}
                  height={chartHeight}
                  rx="6"
                  className={`transition-colors ${
                    isHovered ? 'fill-slate-100/60 dark:fill-slate-800/30' : 'fill-transparent'
                  }`}
                />

                {/* Day Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="5"
                  fill={barColor}
                  className="transition-all duration-200"
                  style={{
                    filter: isHovered
                      ? `drop-shadow(0 0 10px ${barColor})`
                      : isPeak
                      ? `drop-shadow(0 0 6px ${barColor}88)`
                      : 'none',
                  }}
                />

                {/* Amount on top of bar */}
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  className={`text-[10px] font-mono font-bold ${
                    isHovered
                      ? 'fill-slate-900 dark:fill-white'
                      : 'fill-slate-500 dark:fill-slate-400'
                  }`}
                >
                  {d.totalAmount > 0 ? formatMoney(d.totalAmount, currency) : ''}
                </text>

                {/* Day label on X-axis */}
                <text
                  x={x + barWidth / 2}
                  y={paddingTop + chartHeight + 18}
                  textAnchor="middle"
                  className={`text-[10px] font-bold ${
                    isHovered
                      ? 'fill-slate-900 dark:fill-white'
                      : isPeak
                      ? 'fill-amber-400'
                      : 'fill-slate-500 dark:fill-slate-400'
                  }`}
                >
                  {d.short}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={paddingTop + chartHeight + 30}
                  textAnchor="middle"
                  className="text-[9px] fill-slate-400 dark:fill-slate-500 font-mono"
                >
                  {d.count} outings
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {active && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-amber-500/30 flex items-center justify-between text-xs animate-in fade-in">
          <div>
            <span className="font-bold text-slate-800 dark:text-white mr-2">{active.name}</span>
            <span className="text-slate-400 font-mono text-[11px]">
              {active.count} transactions recorded
            </span>
          </div>
          <div className="font-black text-amber-400 font-mono text-sm">
            {formatMoney(active.totalAmount, currency)}
          </div>
        </div>
      )}
    </div>
  );
};
