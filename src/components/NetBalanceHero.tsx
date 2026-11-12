import React from 'react';
import { Info, ArrowUpRight } from 'lucide-react';
import { Currency } from '../types';

interface NetBalanceHeroProps {
  netBalance: number;
  currency: Currency;
  onInfoClick?: () => void;
}

export const NetBalanceHero: React.FC<NetBalanceHeroProps> = ({
  netBalance = 46.75,
  currency,
  onInfoClick,
}) => {
  const isPositive = netBalance >= 0;
  const formattedAmount = `${currency.symbol}${Math.abs(netBalance).toFixed(2)}`;

  return (
    <div className="relative w-full overflow-hidden neon-hero-card p-6 sm:p-7 flex flex-col justify-between min-h-[200px] select-none">
      {/* Background Ambient Radial Lighting */}
      <div 
        className="absolute -right-8 -top-8 w-48 h-48 rounded-full opacity-60 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0, 240, 255, 0.45) 0%, rgba(168, 85, 247, 0.25) 60%, transparent 80%)' }}
      />
      <div 
        className="absolute -left-6 -bottom-6 w-40 h-40 rounded-full opacity-50 blur-2xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, transparent 70%)' }}
      />

      {/* Bioluminescent Flowing Neon Wave Contour at Bottom */}
      <div className="absolute inset-x-0 bottom-0 h-16 pointer-events-none overflow-hidden">
        <svg 
          viewBox="0 0 400 65" 
          fill="none" 
          preserveAspectRatio="none" 
          className="w-full h-full opacity-90"
        >
          <defs>
            <linearGradient id="waveGlowGradExact" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
              <stop offset="45%" stopColor="#8b5cf6" stopOpacity="0.6" />
              <stop offset="70%" stopColor="#00f0ff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#00f0ff" stopOpacity="1" />
            </linearGradient>
            <filter id="cyanGlowWaveFilter" x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            d="M 0 54 C 80 52 130 42 190 48 C 250 54 290 18 400 30"
            stroke="url(#waveGlowGradExact)"
            strokeWidth="3.5"
            fill="none"
            filter="url(#cyanGlowWaveFilter)"
          />
        </svg>
      </div>

      {/* Top Details & Wallet Row */}
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
              <Info className="w-3.5 h-3.5 stroke-[2] text-slate-400 hover:text-white" />
            </button>
          </div>

          {/* Huge Glowing Cyan Amount */}
          <div className="mt-2 text-4xl sm:text-5xl font-extrabold tracking-tight text-[#00f0ff] glow-text-cyan">
            {formattedAmount}
          </div>

          {/* Status Badge Pill: [ ↗ In your favour ] */}
          <div className="mt-4 flex items-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#20103c]/90 border border-purple-500/50 text-purple-300 text-xs font-semibold shadow-[0_0_12px_rgba(168,85,247,0.3)]">
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5] text-purple-400" />
              <span>{isPositive ? 'In your favour' : 'You owe balance'}</span>
            </div>
          </div>
        </div>

        {/* Right Side: 3D Isometric Glowing Neon Glass Wallet Illustration */}
        <div className="relative w-32 h-24 sm:w-40 sm:h-28 flex items-center justify-center shrink-0 pr-2">
          <svg
            viewBox="0 0 130 95"
            fill="none"
            className="w-full h-full drop-shadow-[0_0_20px_rgba(168,85,247,0.7)]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="walletBackBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#190d2e" stopOpacity="0.85" />
              </linearGradient>

              <linearGradient id="walletMainStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="60%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#00f0ff" />
              </linearGradient>

              <linearGradient id="walletFrontBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2a164d" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#140a26" stopOpacity="0.95" />
              </linearGradient>

              <filter id="neonSnapGlowExact" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Back Flap (Isometric angled rear) */}
            <path
              d="M 38 16 L 102 24 C 107 24.5 110 28 109 33 L 103 66 C 102 70 98 72 94 71 L 30 62 C 25 61 22 57 23 52 L 29 21 C 30 17 34 15.5 38 16 Z"
              fill="url(#walletBackBodyGrad)"
              stroke="url(#walletMainStrokeGrad)"
              strokeWidth="2"
              opacity="0.85"
            />

            {/* Inner Glowing Card Lip */}
            <path
              d="M 44 19 L 98 25"
              stroke="#00f0ff"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.9"
            />

            {/* Main Front Body (Rounded isometric pocket) */}
            <rect
              x="22"
              y="30"
              width="82"
              height="52"
              rx="12"
              fill="url(#walletFrontBodyGrad)"
              stroke="url(#walletMainStrokeGrad)"
              strokeWidth="2.5"
            />

            {/* Top Cyan Lip of Front Pocket */}
            <path
              d="M 28 36 L 98 36"
              stroke="#00f0ff"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.95"
            />

            {/* Front Pocket Curved Stitching/Contour */}
            <path
              d="M 22 56 C 36 56 46 62 63 62 C 80 62 90 56 104 56"
              stroke="rgba(192, 132, 252, 0.7)"
              strokeWidth="1.8"
              fill="none"
            />

            {/* Glowing Cyan Snap Button / Clasp */}
            <circle
              cx="63"
              cy="62"
              r="5"
              fill="#00f0ff"
              stroke="#ffffff"
              strokeWidth="1.8"
              filter="url(#neonSnapGlowExact)"
            />
            {/* Inner highlight dot */}
            <circle
              cx="61.5"
              cy="60.5"
              r="1.5"
              fill="#ffffff"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
