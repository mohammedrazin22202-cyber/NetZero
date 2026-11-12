import React from 'react';
import { X, Crown, Check } from 'lucide-react';

interface ProModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProModal: React.FC<ProModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-[#140d25] border border-purple-500/40 p-6 sm:p-7 shadow-[0_0_50px_rgba(168,85,247,0.35)] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Crown Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 via-fuchsia-600 to-cyan-400 flex items-center justify-center text-white mb-4 shadow-[0_0_25px_rgba(168,85,247,0.5)]">
          <Crown className="w-7 h-7 stroke-[2.2] fill-white/20" />
        </div>

        <h3 className="text-2xl font-bold text-white tracking-tight">
          NetZero Pro
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Take your shared finances to the next level with premium superpowers.
        </p>

        {/* Perks */}
        <div className="mt-5 flex flex-col gap-3">
          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-200">
            <div className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span>Unlimited friends and group balances</span>
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-200">
            <div className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span>Automatic cloud backups & device sync</span>
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-200">
            <div className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span>AI receipt scanner & itemized bill OCR</span>
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-200">
            <div className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0">
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
            className="w-full py-2.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};
