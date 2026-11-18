import React, { useState, useMemo } from 'react';
import { Currency, Transaction } from '../../types';
import { formatMoney } from '../../utils/formatters';

interface HistogramChartProps {
  transactions: Transaction[];
  currency: Currency;
}

interface BinData {
  label: string;
  min: number;
  max: number;
  count: number;
  totalAmount: number;
  percentage: number;
  items: Transaction[];
}

export const HistogramChart: React.FC<HistogramChartProps> = ({ transactions, currency }) => {
  const [hoveredBin, setHoveredBin] = useState<number | null>(null);

  // Compute bins from transactions
  const { bins, maxCount, modalBin } = useMemo(() => {
    const expenses = transactions.filter((t) => !t.isSettlement && t.amount > 0);
    if (expenses.length === 0) {
      return { bins: [], maxCount: 0, modalBin: null };
    }

    const amounts = expenses.map((t) => t.amount);
    const maxVal = Math.max(...amounts);

    // Dynamic bracket thresholds tailored to spending scale
    let thresholds: { label: string; min: number; max: number }[];
    if (maxVal <= 50) {
      thresholds = [
        { label: '0–10', min: 0, max: 10 },
        { label: '10–20', min: 10, max: 20 },
        { label: '20–30', min: 20, max: 30 },
        { label: '30–40', min: 30, max: 40 },
        { label: '40+', min: 40, max: Infinity },
      ];
    } else if (maxVal <= 150) {
      thresholds = [
        { label: '0–15', min: 0, max: 15 },
        { label: '15–35', min: 15, max: 35 },
        { label: '35–65', min: 35, max: 65 },
        { label: '65–100', min: 65, max: 100 },
        { label: '100+', min: 100, max: Infinity },
      ];
    } else {
      thresholds = [
        { label: '0–25', min: 0, max: 25 },
        { label: '25–60', min: 25, max: 60 },
        { label: '60–120', min: 60, max: 120 },
        { label: '120–250', min: 120, max: 250 },
        { label: '250+', min: 250, max: Infinity },
      ];
    }

    const computedBins: BinData[] = thresholds.map((t) => ({
      ...t,
      count: 0,
      totalAmount: 0,
      percentage: 0,
      items: [],
    }));

    expenses.forEach((tx) => {
      for (let i = 0; i < computedBins.length; i++) {
        const b = computedBins[i];
        if (tx.amount >= b.min && (tx.amount < b.max || i === computedBins.length - 1)) {
          b.count += 1;
          b.totalAmount += tx.amount;
          b.items.push(tx);
          break;
        }
      }
    });

    const totalCount = expenses.length;
    computedBins.forEach((b) => {
      b.percentage = totalCount > 0 ? (b.count / totalCount) * 100 : 0;
    });

    const highestCount = Math.max(...computedBins.map((b) => b.count), 1);
    const modal = computedBins.reduce(
      (prev, current) => (current.count > prev.count ? current : prev),
      computedBins[0]
    );

    return { bins: computedBins, maxCount: highestCount, modalBin: modal };
  }, [transactions]);

  if (bins.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
        No expense transactions recorded to build frequency histogram.
      </div>
    );
  }

  const svgWidth = 560;
  const svgHeight = 240;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 45;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const binSpacing = chartWidth / bins.length;
  const barWidth = binSpacing - 12;

  const active = hoveredBin !== null ? bins[hoveredBin] : null;

  return (
    <div className="w-full space-y-3">
      {/* Insight Tag */}
      {modalBin && modalBin.count > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span>
            Most common ticket size:{' '}
            <strong className="text-cyan-400 font-mono">
              {currency.symbol}
              {modalBin.label}
            </strong>{' '}
            ({modalBin.count} events, {modalBin.percentage.toFixed(0)}% of transactions)
          </span>
          <span className="text-[11px] font-mono">
            {transactions.filter((t) => !t.isSettlement).length} Total Events
          </span>
        </div>
      )}

      {/* SVG Histogram */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-64 min-w-[460px] overflow-visible select-none"
        >
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((step) => {
            const y = paddingTop + chartHeight - step * chartHeight;
            const countLabel = Math.round(maxCount * step);
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
                  {countLabel}
                </text>
              </g>
            );
          })}

          {/* Histogram Bins */}
          {bins.map((bin, idx) => {
            const barHeight = Math.max((bin.count / maxCount) * chartHeight, bin.count > 0 ? 6 : 2);
            const x = paddingLeft + idx * binSpacing + 6;
            const y = paddingTop + chartHeight - barHeight;
            const isHovered = hoveredBin === idx;
            const isModal = bin === modalBin && bin.count > 0;

            const fillColor = isModal ? '#06b6d4' : '#10b981';

            return (
              <g
                key={bin.label}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredBin(idx)}
                onMouseLeave={() => setHoveredBin(null)}
              >
                {/* Background column highlight on hover */}
                <rect
                  x={x - 2}
                  y={paddingTop}
                  width={barWidth + 4}
                  height={chartHeight}
                  rx="6"
                  className={`transition-colors ${
                    isHovered ? 'fill-slate-100/60 dark:fill-slate-800/40' : 'fill-transparent'
                  }`}
                />

                {/* Histogram Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="4"
                  fill={fillColor}
                  opacity={isHovered ? 1 : 0.82}
                  stroke={fillColor}
                  strokeWidth={isHovered ? 2 : 1}
                  style={{
                    filter: isHovered
                      ? `drop-shadow(0 0 12px ${fillColor}cc)`
                      : isModal
                      ? `drop-shadow(0 0 8px ${fillColor}66)`
                      : 'none',
                  }}
                  className="transition-all duration-150"
                />

                {/* Count badge on top of bar */}
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  className={`text-[11px] font-bold font-mono transition-opacity ${
                    isHovered
                      ? 'fill-slate-900 dark:fill-white'
                      : 'fill-slate-500 dark:fill-slate-400'
                  }`}
                >
                  {bin.count}
                </text>

                {/* Bin Range Label */}
                <text
                  x={x + barWidth / 2}
                  y={paddingTop + chartHeight + 18}
                  textAnchor="middle"
                  className={`text-[10px] font-mono font-bold ${
                    isHovered
                      ? 'fill-cyan-400'
                      : isModal
                      ? 'fill-cyan-500/90'
                      : 'fill-slate-500 dark:fill-slate-400'
                  }`}
                >
                  {currency.symbol}
                  {bin.label}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={paddingTop + chartHeight + 30}
                  textAnchor="middle"
                  className="text-[9px] fill-slate-400 dark:fill-slate-500 font-mono"
                >
                  {bin.percentage.toFixed(0)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bin Details Footer */}
      {active && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-cyan-500/30 flex items-center justify-between text-xs animate-in fade-in">
          <div>
            <span className="font-bold text-slate-800 dark:text-white">
              Range: {currency.symbol}
              {active.label}
            </span>
            <span className="text-slate-400 ml-2 font-mono">
              ({active.count} transactions, {active.percentage.toFixed(1)}%)
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 mr-2">Total Volume:</span>
            <span className="font-black text-cyan-400 font-mono">
              {formatMoney(active.totalAmount, currency)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
