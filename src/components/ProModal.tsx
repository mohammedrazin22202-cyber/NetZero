import React, { useEffect } from 'react';
import { X, Crown, Check } from 'lucide-react';

interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProModal: React.FC<ProModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#140d25] border border-purple-200 dark:border-purple-500/40 p-6 sm:p-7 shadow-2xl flex flex-col text-slate-900 dark:text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Crown Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#8b5cf6] via-[#c084fc] to-[#38bdf8] dark:from-purple-700 dark:via-fuchsia-600 dark:to-cyan-400 flex items-center justify-center text-white mb-4 shadow-[0_0_25px_rgba(168,85,247,0.4)]">
          <Crown className="w-7 h-7 stroke-[2.2] fill-white/20" />
        </div>

        <h3 className="text-2xl font-bold tracking-tight">
          NetZero Pro
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Take your shared finances to the next level with premium superpowers.
        </p>

        {/* Perks */}
        <div className="mt-5 flex flex-col gap-3">
          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
            <div className="w-5 h-5 rounded-full bg-[#e0f2fe] dark:bg-cyan-950 border border-[#7dd3fc] dark:border-cyan-500/40 text-[#0284c7] dark:text-cyan-400 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span>Unlimited friends and group balances</span>
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
            <div className="w-5 h-5 rounded-full bg-[#e0f2fe] dark:bg-cyan-950 border border-[#7dd3fc] dark:border-cyan-500/40 text-[#0284c7] dark:text-cyan-400 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span>Automatic cloud backups & device sync</span>
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
            <div className="w-5 h-5 rounded-full bg-[#e0f2fe] dark:bg-cyan-950 border border-[#7dd3fc] dark:border-cyan-500/40 text-[#0284c7] dark:text-cyan-400 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span>AI receipt scanner & itemized bill OCR</span>
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
            <div className="w-5 h-5 rounded-full bg-[#e0f2fe] dark:bg-cyan-950 border border-[#7dd3fc] dark:border-cyan-500/40 text-[#0284c7] dark:text-cyan-400 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span>Advanced financial analytics & export</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-7 flex flex-col gap-2">
          <button
            onClick={() => {
              alert('Thank you for choosing NetZero Pro! Premium features unlocked for your session.');
              onClose();
            }}
            className="w-full py-3.5 rounded-full btn-neon-cyan font-bold text-sm tracking-wide"
          >
            Upgrade Now • $2.99 / mo
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};
