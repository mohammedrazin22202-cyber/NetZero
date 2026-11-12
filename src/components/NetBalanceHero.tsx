import React from 'react';
import { Info, ArrowUpRight } from 'lucide-react';
import { Currency } from '../types';

interface NetBalanceHeroProps {
  netBalance: number;
  currency: Currency;
  onInfoClick?: () => void;
}

export const NetBalanceHero: React.FC<NetBalanceHeroProps> = ({
  netBalance,
  currency,
  onInfoClick,
}) => {
  const isPositive = netBalance >= 0;
  const formattedAmount = `${currency.symbol}${Math.abs(netBalance).toFixed(2)}`;

  return (
    <div className="relative w-full overflow-hidden neon-hero-card p-6 sm:p-7 flex flex-col justify-between min-h-[195px] select-none">
      {/* Background Ambient Radial Lighting */}
      <div 
        className="absolute -right-8 -top-8 w-44 h-44 rounded-full opacity-50 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0, 240, 255, 0.4) 0%, rgba(168, 85, 247, 0.2) 60%, transparent 80%)' }}
      />
      <div 
        className="absolute -left-6 -bottom-6 w-36 h-36 rounded-full opacity-40 blur-2xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.45) 0%, transparent 70%)' }}
      />

      {/* Bioluminescent Flowing Neon Wave Contour at Bottom */}
      <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none overflow-hidden">
        <svg 
          viewBox="0 0 400 60" 
          fill="none" 
          preserveAspectRatio="none" 
          className="w-full h-full opacity-80"
        >
          <defs>
            <linearGradient id="waveGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
              <stop offset="75%" stopColor="#00f0ff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#00f0ff" stopOpacity="1" />
            </linearGradient>
            <filter id="cyanGlowEffect" x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M 0 52 C 80 50 120 40 180 48 C 240 56 280 20 400 32"
            stroke="url(#waveGlowGrad)"
            strokeWidth="3.5"
            fill="none"
            filter="url(#cyanGlowEffect)"
          />
        </svg>
      </div>

      {/* Card Content Row */}
      <div className="relative z-10 flex items-start justify-between">
        {/* Left Side: Label, Big Cyan Amount, Status Pill */}
        <div className="flex flex-col">
          {/* Label + Info icon */}
          <div className="flex items-center gap-1.5 text-slate-300 text-xs sm:text-sm font-medium">
            <span>Net Balance</span>
            <button
              onClick={onInfoClick}
              title="Balance calculation details"
              className="hover:text-white transition-colors"
            >
              <Info className="w-4 h-4 stroke-[1.8] text-slate-400 hover:text-white" />
            </button>
          </div>

          {/* Huge Glowing Cyan Amount */}
          <div className="mt-2 text-4xl sm:text-5xl font-extrabold tracking-tight text-cyan-400 drop-shadow-[0_0_20px_rgba(0,240,255,0.45)]">
            {formattedAmount}
          </div>

          {/* Status Badge Pill */}
          <div className="mt-4 flex items-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-semibold shadow-[0_0_12px_rgba(168,85,247,0.25)]">
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5] text-purple-400" />
              <span>{isPositive ? 'In your favour' : 'You owe balance'}</span>
            </div>
          </div>
        </div>

        {/* Right Side: 3D Isometric Neon Glass Wallet Illustration */}
        <div className="relative w-28 h-24 sm:w-36 sm:h-28 flex items-center justify-center shrink-0">
          <svg
            viewBox="0 0 120 90"
            fill="none"
            className="w-full h-full drop-shadow-[0_0_18px_rgba(168,85,247,0.6)]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="walletBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#1e1035" stopOpacity="0.8" />
              </linearGradient>

              <linearGradient id="walletStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="70%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#00f0ff" />
              </linearGradient>

              <linearGradient id="walletFlapGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
              </linearGradient>

              <filter id="neonSnapGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Back Fold / Rear Card Lip */}
            <path
              d="M 35 15 L 95 24 C 99 25 102 28 101 32 L 95 62 C 94 65 91 67 87 66 L 27 57 C 23 56 20 53 21 49 L 27 19 C 28 16 31 14 35 15 Z"
              fill="rgba(35, 18, 65, 0.6)"
              stroke="#a855f7"
              strokeWidth="2"
              opacity="0.8"
            />

            {/* Main Front Body (Isometric tilted wallet) */}
            <path
              d="M 28 28 L 88 28 C 94 28 98 32 98 38 L 98 68 C 98 74 94 78 88 78 L 28 78 C 22 78 18 74 18 68 L 18 38 C 18 32 22 28 28 28 Z"
              fill="url(#walletBodyGrad)"
              stroke="url(#walletStrokeGrad)"
              strokeWidth="2.5"
            />

            {/* Inner Card Slit / Top Cyan Glowing Line */}
            <path
              d="M 26 38 L 90 38"
              stroke="#00f0ff"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.9"
            />

            {/* Front Pocket Lip Contour */}
            <path
              d="M 18 52 C 32 52 40 58 58 58 C 76 58 84 52 98 52"
              stroke="rgba(192, 132, 252, 0.6)"
              strokeWidth="1.5"
              fill="none"
            />

            {/* Glowing Cyan Snap Button / Clasp */}
            <circle
              cx="58"
              cy="58"
              r="4.5"
              fill="#00f0ff"
              stroke="#ffffff"
              strokeWidth="1.5"
              filter="url(#neonSnapGlow)"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
