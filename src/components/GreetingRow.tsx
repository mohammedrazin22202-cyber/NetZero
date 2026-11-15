import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface GreetingRowProps {
  userName: string;
  selectedPeriod?: string;
  onPeriodChange?: (period: string) => void;
}

const PERIOD_OPTIONS = [
  { id: 'This Month', label: 'This Month' },
  { id: 'Last Month', label: 'Last Month' },
  { id: 'Last 30 Days', label: 'Last 30 Days' },
  { id: 'This Year', label: 'This Year' },
  { id: 'All Time', label: 'All Time' },
];

export const GreetingRow: React.FC<GreetingRowProps> = ({
  userName,
  selectedPeriod = 'This Month',
  onPeriodChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (periodId: string) => {
    triggerHaptic('light');
    onPeriodChange?.(periodId);
    setIsOpen(false);
  };

  return (
    <div className="w-full flex items-center justify-between gap-4 my-2 select-none flex-wrap sm:flex-nowrap">
      <div>
        <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <span>Good Morning, {userName || 'MegaTron'}</span>
          <span className="text-2xl sm:text-[26px] select-none">👋</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Here's your money at a glance
        </p>
      </div>

      {/* Period Dropdown Button */}
      <div className="relative shrink-0" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setIsOpen((prev) => !prev);
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#150d27]/90 border text-slate-900 dark:text-white text-xs font-semibold shadow-[0_2px_10px_rgba(251,146,60,0.12)] dark:shadow-[0_0_12px_rgba(168,85,247,0.18)] transition-all active:scale-95 shrink-0 ${
            isOpen
              ? 'border-[#38bdf8] dark:border-cyan-400 shadow-[0_0_16px_rgba(56,189,248,0.35)] dark:shadow-[0_0_16px_rgba(0,240,255,0.35)]'
              : 'border-purple-200 dark:border-purple-500/35 hover:border-[#fb923c] dark:hover:border-purple-400/60'
          }`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <Calendar className="w-3.5 h-3.5 text-[#ea580c] dark:text-purple-400 stroke-[2]" />
          <span>{selectedPeriod}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 stroke-[2] transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#0284c7] dark:text-cyan-400' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl bg-white/98 dark:bg-[#140b27]/95 backdrop-blur-2xl border border-purple-200/80 dark:border-purple-500/40 p-1.5 shadow-[0_12px_36px_rgba(192,132,252,0.2),0_4px_16px_rgba(251,146,60,0.1)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.85),0_0_20px_rgba(168,85,247,0.25)] z-50 animate-scaleIn origin-top-right">
            <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-purple-100 dark:border-purple-500/20 mb-1">
              Select Timeframe
            </div>
            <div className="flex flex-col gap-0.5" role="listbox">
              {PERIOD_OPTIONS.map((opt) => {
                const isSelected = selectedPeriod === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[#e0f2fe] text-[#0284c7] font-semibold border border-[#bae6fd] dark:bg-purple-900/50 dark:text-cyan-300 dark:border-purple-500/40 shadow-[0_0_10px_rgba(56,189,248,0.2)] dark:shadow-[0_0_10px_rgba(0,240,255,0.15)]'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-purple-50/80 dark:text-slate-300 dark:hover:text-white dark:hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#0284c7] dark:text-cyan-400 stroke-[2.5]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
