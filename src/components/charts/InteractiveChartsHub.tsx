import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AppState, Category } from '../../types';
import { CHART_OPTIONS, ChartType } from './chartTypes';
import { PieChartDonut } from './PieChartDonut';
import { BarChartDiagram } from './BarChartDiagram';
import { HistogramChart } from './HistogramChart';
import { TrendLineChart } from './TrendLineChart';
import { AreaFlowChart } from './AreaFlowChart';
import { RadarSpiderChart } from './RadarSpiderChart';
import { PayerSplitChart } from './PayerSplitChart';
import { DayOfWeekChart } from './DayOfWeekChart';
import { WaterfallBalanceChart } from './WaterfallBalanceChart';
import { ScatterBubbleChart } from './ScatterBubbleChart';
import { triggerHaptic } from '../../utils/haptics';
import { ChevronDown, Check, Filter, BarChart } from 'lucide-react';

interface InteractiveChartsHubProps {
  state: AppState;
}

export const InteractiveChartsHub: React.FC<InteractiveChartsHubProps> = ({ state }) => {
  const [selectedChart, setSelectedChart] = useState<ChartType>('bar');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [timeframe, setTimeframe] = useState<'all' | 'month' | '30days'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeUser = state.activeUserId === state.user1.id ? state.user1 : state.user2;
  const friend = state.activeUserId === state.user1.id ? state.user2 : state.user1;

  // Filter transactions by timeframe (excluding settlements, loans, and unapproved transactions)
  const isApprovedExpense = (t: any) => {
    if (t.isSettlement || t.category === 'settlement' || t.type === 'settlement') return false;
    if (t.isLoan || t.category === 'loan' || t.type === 'loan') return false;
    if (
      t.approvalStatus === 'pending_approval' ||
      t.approvalStatus === 'on_hold' ||
      t.approvalStatus === 'disputed_review' ||
      t.approvalStatus === 'rejected'
    ) {
      return false;
    }
    return true;
  };

  const filteredTransactions = useMemo(() => {
    const allExpenses = state.transactions.filter(isApprovedExpense);
    if (timeframe === 'all') return allExpenses;

    const now = new Date();
    if (timeframe === 'month') {
      const curYear = now.getFullYear();
      const curMonth = now.getMonth();
      return allExpenses.filter((t) => {
        if (!t.date) return false;
        const [y, m] = t.date.split('-').map((v) => parseInt(v, 10));
        return y === curYear && m - 1 === curMonth;
      });
    }

    if (timeframe === '30days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const threshold = thirtyDaysAgo.toISOString().slice(0, 10);
      return allExpenses.filter((t) => t.date && t.date >= threshold);
    }

    return allExpenses;
  }, [state.transactions, timeframe]);

  // Prepared data for charts
  const expenseTransactions = useMemo(
    () => filteredTransactions.filter(isApprovedExpense),
    [filteredTransactions]
  );

  const totalSpentTogether = useMemo(
    () => expenseTransactions.reduce((acc, t) => acc + t.amount, 0),
    [expenseTransactions]
  );

  const categoryTotals = useMemo(() => {
    const map: Partial<Record<Category, number>> = {};
    for (const t of expenseTransactions) {
      map[t.category] = (map[t.category] || 0) + t.amount;
    }
    return Object.entries(map)
      .map(([cat, amount]) => ({
        category: cat as Category,
        amount,
        percentage: totalSpentTogether > 0 ? (amount / totalSpentTogether) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenseTransactions, totalSpentTogether]);

  const currentOption = CHART_OPTIONS.find((c) => c.id === selectedChart) || CHART_OPTIONS[0];

  const handleSelectChart = (id: ChartType) => {
    setSelectedChart(id);
    setIsDropdownOpen(false);
    triggerHaptic('light');
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-500">
              <BarChart className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Multi-Chart Analytics Suite
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  10 Visual Modes
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Explore your shared spending from 10 distinct analytical dimensions
              </p>
            </div>
          </div>
        </div>

        {/* Timeframe Filter Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
          {(['all', 'month', '30days'] as const).map((tf) => {
            const isSelected = timeframe === tf;
            const labels = { all: 'All Time', month: 'This Month', '30days': 'Last 30D' };
            return (
              <button
                key={tf}
                onClick={() => {
                  setTimeframe(tf);
                  triggerHaptic('light');
                }}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                  isSelected
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {labels[tf]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Prominent Scroll-Down Chart Dropdown Selector */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1" ref={dropdownRef}>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 block">
            Select Chart View (Scroll Down Menu)
          </label>

          {/* Trigger Button */}
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700/80 hover:border-cyan-500 dark:hover:border-cyan-500 text-left transition-all shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0 border border-cyan-500/20">
                <currentOption.icon className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {currentOption.title}
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {currentOption.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {currentOption.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pl-2 text-slate-400 group-hover:text-cyan-500">
              <span className="text-[11px] font-semibold hidden sm:inline">Change</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180 text-cyan-500' : ''
                }`}
              />
            </div>
          </button>

          {/* Scroll Down Menu (With custom scrollbar and 10 rich options) */}
          {isDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 z-30 max-h-80 overflow-y-auto p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150 divide-y divide-slate-100 dark:divide-slate-800">
              <div className="p-2 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider flex items-center justify-between">
                <span>10 Available Chart Visualizations</span>
                <span>Scroll to browse ↓</span>
              </div>
              <div className="space-y-1 pt-1">
                {CHART_OPTIONS.map((opt) => {
                  const isSelected = opt.id === selectedChart;
                  const Icon = opt.icon;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectChart(opt.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                        isSelected
                          ? 'bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-cyan-500 text-slate-950 font-bold'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs">{opt.title}</span>
                            <span className="text-[9px] font-normal px-1 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                              {opt.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-normal line-clamp-1">
                            {opt.description}
                          </p>
                        </div>
                      </div>

                      {isSelected && <Check className="w-4 h-4 text-cyan-500 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Chart Render Container */}
      <div className="pt-2">
        {selectedChart === 'pie' && (
          <PieChartDonut
            categories={categoryTotals}
            totalAmount={totalSpentTogether}
            currency={state.currency}
          />
        )}

        {selectedChart === 'bar' && (
          <BarChartDiagram categories={categoryTotals} currency={state.currency} />
        )}

        {selectedChart === 'histogram' && (
          <HistogramChart transactions={filteredTransactions} currency={state.currency} />
        )}

        {selectedChart === 'trend' && (
          <TrendLineChart transactions={filteredTransactions} currency={state.currency} />
        )}

        {selectedChart === 'area' && (
          <AreaFlowChart transactions={filteredTransactions} currency={state.currency} />
        )}

        {selectedChart === 'radar' && (
          <RadarSpiderChart categories={categoryTotals} currency={state.currency} />
        )}

        {selectedChart === 'payer_split' && (
          <PayerSplitChart
            transactions={filteredTransactions}
            activeUser={activeUser}
            friend={friend}
            currency={state.currency}
          />
        )}

        {selectedChart === 'day_of_week' && (
          <DayOfWeekChart transactions={filteredTransactions} currency={state.currency} />
        )}

        {selectedChart === 'waterfall' && (
          <WaterfallBalanceChart
            transactions={filteredTransactions}
            activeUser={activeUser}
            friend={friend}
            currency={state.currency}
          />
        )}

        {selectedChart === 'scatter' && (
          <ScatterBubbleChart transactions={filteredTransactions} currency={state.currency} />
        )}
      </div>
    </div>
  );
};
