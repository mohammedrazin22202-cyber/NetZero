import React, { useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({ isOpen, onClose }) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute right-12 top-16 z-50 w-80 rounded-2xl bg-[#140d25] border border-purple-500/30 p-4 shadow-[0_0_30px_rgba(168,85,247,0.3)] animate-fadeIn select-none"
    >
      <div className="flex items-center justify-between pb-3 border-b border-purple-500/20 mb-3">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          <span>Notifications</span>
        </h4>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-semibold">
          3 New
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20 hover:border-purple-400/50 transition-colors">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">Dinner logged</span>
            <span className="text-[10px] text-slate-400">Nov 12</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1">
            You added $25.00 for Dinner with Sam.
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20 hover:border-purple-400/50 transition-colors">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">Cab expense recorded</span>
            <span className="text-[10px] text-slate-400">Nov 08</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1">
            Sam paid $9.25 for Cab.
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/20 hover:border-purple-400/50 transition-colors">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white">Monthly Statement Ready</span>
            <span className="text-[10px] text-slate-400">Nov 01</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1">
            October ledger closed at net zero balance.
          </p>
        </div>
      </div>
    </div>
  );
};
