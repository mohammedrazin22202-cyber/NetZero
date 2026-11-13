import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

interface GreetingRowProps {
  userName: string;
  selectedPeriod?: string;
  onPeriodChange?: () => void;
}

export const GreetingRow: React.FC<GreetingRowProps> = ({
  userName,
  selectedPeriod = 'This Month',
  onPeriodChange,
}) => {
  return (
    <div className="w-full flex items-center justify-between gap-4 my-2 select-none flex-wrap sm:flex-nowrap">
      <div>
        <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-white flex items-center gap-2">
          <span>Good Morning, {userName || 'MegaTron'}</span>
          <span className="text-2xl sm:text-[26px] select-none">👋</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Here's your money at a glance
        </p>
      </div>

      <button
        onClick={onPeriodChange}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#150d27]/90 border border-purple-500/35 text-white text-xs font-semibold hover:border-purple-400/60 shadow-[0_0_12px_rgba(168,85,247,0.18)] transition-all active:scale-95 shrink-0"
      >
        <Calendar className="w-3.5 h-3.5 text-purple-400 stroke-[2]" />
        <span>{selectedPeriod}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 stroke-[2]" />
      </button>
    </div>
  );
};
