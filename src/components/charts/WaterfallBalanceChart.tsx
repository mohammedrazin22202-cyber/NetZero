import React, { useState, useMemo } from 'react';
import { Currency, Transaction, UserProfile } from '../../types';
import { formatMoney } from '../../utils/formatters';

interface WaterfallBalanceChartProps {
  transactions: Transaction[];
  activeUser: UserProfile;
  friend: UserProfile;
  currency: Currency;
}

export const WaterfallBalanceChart: React.FC<WaterfallBalanceChartProps> = ({
  transactions,
  activeUser,
  friend,
  currency,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const steps = useMemo(() => {
    let paidByYou = 0;
    let paidByFriend = 0;
    let settlementsPaidByYou = 0;
    let settlementsPaidByFriend = 0;
    let totalSharedLent = 0;
    let totalSharedBorrowed = 0;

    transactions.forEach((tx) => {
      if (tx.isSettlement) {
        if (tx.paidBy === activeUser.id) {
          settlementsPaidByYou += tx.amount;
        } else {
          settlementsPaidByFriend += tx.amount;
        }
      } else {
        if (tx.paidBy === activeUser.id) {
          paidByYou += tx.amount;
          totalSharedLent += tx.payerOwedAmount;
        } else {
          paidByFriend += tx.amount;
          totalSharedBorrowed += tx.payerOwedAmount;
        }
      }
    });

    const netOwed = totalSharedLent - totalSharedBorrowed - (settlementsPaidByFriend - settlementsPaidByYou);

    return [
      {
        name: 'Start',
        change: 0,
        start: 0,
        end: 0,
        type: 'base',
        desc: 'Initial baseline balance',
      },
      {
        name: 'You Paid',
        change: paidByYou,
        start: 0,
        end: paidByYou,
        type: 'positive',
        desc: `Total upfront expenses paid by ${activeUser.name.split(' ')[0]}`,
      },
      {
        name: 'Friend Paid',
        change: -paidByFriend,
        start: paidByYou,
        end: paidByYou - paidByFriend,
        type: 'negative',
        desc: `Total upfront expenses paid by ${friend.name.split(' ')[0]}`,
      },
      {
        name: 'Settled',
        change: settlementsPaidByFriend - settlementsPaidByYou,
        start: paidByYou - paidByFriend,
        end: (paidByYou - paidByFriend) + (settlementsPaidByFriend - settlementsPaidByYou),
        type: (settlementsPaidByFriend - settlementsPaidByYou) >= 0 ? 'positive' : 'negative',
        desc: 'Reimbursements and settlement payments cleared',
      },
      {
        name: 'Net Balance',
        change: netOwed,
        start: 0,
        end: netOwed,
        type: 'total',
        desc: netOwed >= 0 ? `${friend.name.split(' ')[0]} owes you` : `You owe ${friend.name.split(' ')[0]}`,
      },
    ];
  }, [transactions, activeUser, friend]);

  const svgWidth = 560;
  const svgHeight = 250;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 45;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Determine min and max across all steps
  const allValues = steps.flatMap((s) => [s.start, s.end]);
  const minVal = Math.min(...allValues, 0);
  const maxVal = Math.max(...allValues, 10);
  const valRange = maxVal - minVal || 50;

  const colWidth = chartWidth / steps.length;
  const barWidth = Math.min(colWidth * 0.58, 48);

  const getY = (val: number) => {
    return paddingTop + chartHeight - ((val - minVal) / valRange) * chartHeight;
  };

  const active = hoveredIdx !== null ? steps[hoveredIdx] : null;

  return (
    <div className="w-full space-y-3">
      {/* Legend */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-500 font-semibold">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Credit (+)
          </span>
          <span className="flex items-center gap-1.5 text-rose-500 font-semibold">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Debit (-)
          </span>
          <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400" /> Net Position
          </span>
        </div>
        <span className="text-[11px] text-slate-400">Ledger Waterfall Breakdown</span>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-64 min-w-[460px] overflow-visible select-none"
        >
          {/* Zero baseline */}
          <line
            x1={paddingLeft}
            y1={getY(0)}
            x2={paddingLeft + chartWidth}
            y2={getY(0)}
            stroke="currentColor"
            className="text-slate-300 dark:text-slate-700"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />

          {/* Steps & Floating Bars */}
          {steps.map((st, idx) => {
            const x = paddingLeft + idx * colWidth + (colWidth - barWidth) / 2;
            const topY = Math.min(getY(st.start), getY(st.end));
            const bottomY = Math.max(getY(st.start), getY(st.end));
            const height = Math.max(bottomY - topY, 4);

            let barColor = '#10b981'; // green for positive
            if (st.type === 'total') barColor = '#06b6d4'; // cyan for total
            else if (st.type === 'negative') barColor = '#f43f5e'; // rose for negative
            else if (st.type === 'base') barColor = '#94a3b8';

            const isHovered = hoveredIdx === idx;

            // Connector line to next step
            const nextStep = steps[idx + 1];
            const nextX = paddingLeft + (idx + 1) * colWidth + (colWidth - barWidth) / 2;
            const connectorY = getY(st.end);

            return (
              <g
                key={st.name}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Connector line to next bar */}
                {nextStep && (
                  <line
                    x1={x + barWidth}
                    y1={connectorY}
                    x2={nextX}
                    y2={connectorY}
                    stroke="currentColor"
                    className="text-slate-300 dark:text-slate-700"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Bar */}
                <rect
                  x={x}
                  y={topY}
                  width={barWidth}
                  height={height}
                  rx="4"
                  fill={barColor}
                  className="transition-all duration-200"
                  style={{
                    filter: isHovered ? `drop-shadow(0 0 10px ${barColor})` : 'none',
                  }}
                />

                {/* Amount label above / below bar */}
                <text
                  x={x + barWidth / 2}
                  y={topY - 6}
                  textAnchor="middle"
                  className={`text-[10px] font-mono font-bold ${
                    isHovered
                      ? 'fill-slate-900 dark:fill-white'
                      : 'fill-slate-500 dark:fill-slate-400'
                  }`}
                >
                  {st.type === 'base'
                    ? '$0'
                    : (st.change > 0 ? '+' : '') + formatMoney(st.change, currency)}
                </text>

                {/* Step label on X-axis */}
                <text
                  x={x + barWidth / 2}
                  y={paddingTop + chartHeight + 20}
                  textAnchor="middle"
                  className={`text-[10px] font-bold ${
                    isHovered
                      ? 'fill-slate-900 dark:fill-white'
                      : 'fill-slate-500 dark:fill-slate-400'
                  }`}
                >
                  {st.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {active && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-cyan-500/30 flex items-center justify-between text-xs animate-in fade-in">
          <div>
            <span className="font-bold text-slate-800 dark:text-white mr-2">{active.name}:</span>
            <span className="text-slate-400">{active.desc}</span>
          </div>
          <div className="font-mono font-black text-cyan-400 text-sm">
            {formatMoney(active.end, currency)}
          </div>
        </div>
      )}
    </div>
  );
};
