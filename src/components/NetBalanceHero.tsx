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
    <div className="relative w-full h-[195px] select-none flex items-center justify-between">
      {/* Background SVG defining the exact organic undulating wave card shape and glowing gradient border */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_25px_rgba(0,240,255,0.22)]"
        viewBox="0 0 460 195"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Card Body Gradient Fill */}
          <linearGradient id="heroCardBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#150d28" stopOpacity="0.94" />
            <stop offset="60%" stopColor="#100922" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0c071c" stopOpacity="0.97" />
          </linearGradient>

          {/* Border Stroke Gradient: Purple top/left -> Cyan bottom/right */}
          <linearGradient id="heroCardBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#a855f7" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#7c3aed" stopOpacity="0.5" />
            <stop offset="80%" stopColor="#00f0ff" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#00f0ff" stopOpacity="1" />
          </linearGradient>

          {/* Neon Glow Filter */}
          <filter id="heroCardNeonGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Card Perimeter with Organic Undulating Wave along Bottom */}
        <path
          d="
            M 24 2
            L 436 2
            Q 458 2 458 24
            L 458 148
            Q 458 168 440 172
            C 385 186 345 138 270 148
            C 195 158 135 192 40 192
            Q 2 192 2 170
            L 2 24
            Q 2 2 24 2
            Z
          "
          fill="url(#heroCardBgGrad)"
          stroke="url(#heroCardBorderGrad)"
          strokeWidth="2.5"
          filter="url(#heroCardNeonGlow)"
        />
      </svg>

      {/* Ambient Radial Colored Light inside the card */}
      <div 
        className="absolute right-0 top-0 w-44 h-44 rounded-full opacity-50 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0, 240, 255, 0.4) 0%, rgba(168, 85, 247, 0.2) 60%, transparent 80%)' }}
      />
      <div 
        className="absolute left-0 bottom-0 w-36 h-36 rounded-full opacity-40 blur-2xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.45) 0%, transparent 70%)' }}
      />

      {/* Card Content (HTML Overlay) */}
      <div className="relative z-10 w-full h-full px-6 py-5 flex items-start justify-between">
        {/* Left Side: Label, Big Cyan Amount, Status Pill */}
        <div className="flex flex-col justify-between h-full py-1">
          <div>
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
            <div className="mt-1 text-4xl sm:text-[44px] font-extrabold tracking-tight text-[#00f0ff] glow-text-cyan">
              {formattedAmount}
            </div>
          </div>

          {/* Status Badge Pill: [ ↗ In your favour ] */}
          <div className="flex items-center mb-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#20103c]/90 border border-purple-500/50 text-purple-300 text-xs font-semibold shadow-[0_0_12px_rgba(168,85,247,0.3)]">
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5] text-purple-400" />
              <span>{isPositive ? 'In your favour' : 'You owe balance'}</span>
            </div>
          </div>
        </div>

        {/* Right Side: 3D Isometric Glowing Neon Glass Wallet Illustration */}
        <div className="relative w-32 h-28 sm:w-38 sm:h-32 flex items-center justify-center shrink-0 pr-1 mt-1">
          <svg
            viewBox="0 0 135 100"
            fill="none"
            className="w-full h-full drop-shadow-[0_0_22px_rgba(168,85,247,0.75)]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="walletBackBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#190d2e" stopOpacity="0.85" />
              </linearGradient>

              <linearGradient id="walletMainStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="55%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#00f0ff" />
              </linearGradient>

              <linearGradient id="walletFrontBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2c174f" stopOpacity="0.85" />
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
              d="M 40 18 L 105 26 C 110 26.5 113 30 112 35 L 106 68 C 105 72 101 74 97 73 L 32 64 C 27 63 24 59 25 54 L 31 23 C 32 19 36 17.5 40 18 Z"
              fill="url(#walletBackBodyGrad)"
              stroke="url(#walletMainStrokeGrad)"
              strokeWidth="2"
              opacity="0.9"
            />

            {/* Inner Glowing Card Lip */}
            <path
              d="M 46 21 L 101 27"
              stroke="#00f0ff"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.95"
            />

            {/* Main Front Body (Rounded isometric pocket) */}
            <rect
              x="24"
              y="32"
              width="84"
              height="52"
              rx="12"
              fill="url(#walletFrontBodyGrad)"
              stroke="url(#walletMainStrokeGrad)"
              strokeWidth="2.5"
            />

            {/* Top Cyan Lip of Front Pocket */}
            <path
              d="M 30 38 L 100 38"
              stroke="#00f0ff"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.95"
            />

            {/* Front Pocket Curved Stitching/Contour */}
            <path
              d="M 24 58 C 38 58 48 64 66 64 C 84 64 94 58 108 58"
              stroke="rgba(192, 132, 252, 0.7)"
              strokeWidth="1.8"
              fill="none"
            />

            {/* Glowing Cyan Snap Button / Clasp */}
            <circle
              cx="66"
              cy="64"
              r="5"
              fill="#00f0ff"
              stroke="#ffffff"
              strokeWidth="1.8"
              filter="url(#neonSnapGlowExact)"
            />
            {/* Inner highlight dot */}
            <circle
              cx="64.5"
              cy="62.5"
              r="1.5"
              fill="#ffffff"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};
