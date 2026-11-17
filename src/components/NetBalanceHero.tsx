import React from 'react';
import { Info, ArrowUpRight, ArrowDownRight, Share2, Check } from 'lucide-react';
import { Currency } from '../types';

interface NetBalanceHeroProps {
  netBalance: number;
  currency: Currency;
  onInfoClick?: () => void;
  onShareClick?: () => void;
  theme?: 'dark' | 'light';
}

export const NetBalanceHero: React.FC<NetBalanceHeroProps> = ({
  netBalance = 0,
  currency,
  onInfoClick,
  onShareClick,
  theme = 'dark',
}) => {
  const isZero = Math.abs(netBalance) < 0.005;
  const isPositive = netBalance > 0.005;
  const isLight = theme === 'light';
  const formattedAmount = `${currency.symbol}${Math.abs(netBalance).toFixed(2)}`;

  return (
    <div className="relative w-full h-[195px] overflow-hidden neon-hero-card p-6 flex flex-col justify-between select-none">
      {/* Background Ambient Radial Lighting */}
      <div 
        className="absolute -right-8 -top-8 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-500"
        style={{
          background: isLight
            ? 'radial-gradient(circle, rgba(56, 189, 248, 0.35) 0%, rgba(254, 215, 170, 0.2) 60%, transparent 80%)'
            : 'radial-gradient(circle, rgba(0, 240, 255, 0.45) 0%, rgba(168, 85, 247, 0.25) 60%, transparent 80%)',
          opacity: isLight ? 0.7 : 0.6,
        }}
      />
      <div 
        className="absolute -left-6 -bottom-6 w-40 h-40 rounded-full blur-2xl pointer-events-none transition-all duration-500"
        style={{
          background: isLight
            ? 'radial-gradient(circle, rgba(192, 132, 252, 0.35) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, transparent 70%)',
          opacity: isLight ? 0.6 : 0.5,
        }}
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
              <stop offset="0%" stopColor={isLight ? '#c084fc' : '#a855f7'} stopOpacity="0.8" />
              <stop offset="45%" stopColor={isLight ? '#38bdf8' : '#8b5cf6'} stopOpacity="0.7" />
              <stop offset="70%" stopColor={isLight ? '#fb923c' : '#00f0ff'} stopOpacity="0.95" />
              <stop offset="100%" stopColor={isLight ? '#fb923c' : '#00f0ff'} stopOpacity="1" />
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
      <div className="relative z-10 flex items-start justify-between h-full">
        {/* Left Side: Label, Big Amount, Status Pill */}
        <div className="flex flex-col justify-between h-full">
          <div>
            {/* Label + Info icon + Share icon */}
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-medium">
              <span>Net Balance</span>
              <button
                type="button"
                onClick={onInfoClick}
                title="Balance calculation details"
                className="p-0.5 rounded-md hover:text-[#0284c7] dark:hover:text-cyan-400 hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors"
              >
                <Info className="w-3.5 h-3.5 stroke-[2] text-slate-400 hover:text-[#0284c7] dark:hover:text-cyan-400" />
              </button>
              {onShareClick && (
                <button
                  type="button"
                  onClick={onShareClick}
                  title="Share balance via WhatsApp or copy summary"
                  className="p-0.5 rounded-md hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 stroke-[2] text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400" />
                </button>
              )}
            </div>

            {/* Glowing Amount */}
            <div className="mt-1 text-4xl sm:text-[44px] font-extrabold tracking-tight text-[#0284c7] dark:text-[#00f0ff] glow-text-cyan">
              {formattedAmount}
            </div>
          </div>

          {/* Status Badge Pill */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff4ed] dark:bg-[#20103c]/90 border border-[#fed7aa] dark:border-purple-500/50 text-[#ea580c] dark:text-purple-300 text-xs font-semibold shadow-[0_0_12px_rgba(251,146,60,0.25)] dark:shadow-[0_0_12px_rgba(168,85,247,0.3)]">
              {isZero ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[2.5] text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">All Settled Up</span>
                </>
              ) : isPositive ? (
                <>
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5] text-[#0284c7] dark:text-cyan-400" />
                  <span className="text-[#0284c7] dark:text-cyan-400">In your favour</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5] text-[#ea580c] dark:text-purple-400" />
                  <span className="text-[#ea580c] dark:text-purple-300">You owe balance</span>
                </>
              )}
            </div>

            {onShareClick && (
              <button
                type="button"
                onClick={onShareClick}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-white/80 dark:hover:bg-white/5 transition-colors"
                title="Send balance to friend"
              >
                <Share2 className="w-3 h-3" />
                <span>Share</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Side: 3D Isometric Glowing Neon Glass Wallet Illustration */}
        <div className="relative w-32 h-28 sm:w-38 sm:h-32 flex items-center justify-center shrink-0 pr-1">
          <svg
            viewBox="0 0 135 100"
            fill="none"
            className="w-full h-full drop-shadow-[0_0_20px_rgba(192,132,252,0.4)] dark:drop-shadow-[0_0_22px_rgba(168,85,247,0.75)]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="walletBackBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={isLight ? '#bae6fd' : '#a855f7'} stopOpacity={isLight ? 0.7 : 0.45} />
                <stop offset="100%" stopColor={isLight ? '#f3e8ff' : '#190d2e'} stopOpacity={isLight ? 0.95 : 0.85} />
              </linearGradient>

              <linearGradient id="walletMainStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={isLight ? '#c084fc' : '#c084fc'} />
                <stop offset="55%" stopColor={isLight ? '#38bdf8' : '#a855f7'} />
                <stop offset="100%" stopColor={isLight ? '#fb923c' : '#00f0ff'} />
              </linearGradient>

              <linearGradient id="walletFrontBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={isLight ? '#ffffff' : '#2c174f'} stopOpacity={isLight ? 0.98 : 0.85} />
                <stop offset="100%" stopColor={isLight ? '#fff7ed' : '#140a26'} stopOpacity={isLight ? 0.95 : 0.95} />
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
              opacity="0.95"
            />

            {/* Glowing Bill Card sticking out of wallet pocket */}
            <path
              d="M 52 14 L 96 20 C 99 20.5 101 23 100.5 26 L 98 40 L 46 32 L 48 18 C 48.5 15.5 50 13.8 52 14 Z"
              fill={isLight ? 'rgba(56, 189, 248, 0.45)' : 'rgba(0, 240, 255, 0.35)'}
              stroke={isLight ? '#38bdf8' : '#00f0ff'}
              strokeWidth="1.5"
            />

            {/* Front Wallet Pocket & Body */}
            <path
              d="M 28 36 L 102 46 C 107 46.8 110 50.5 109 55 L 102 82 C 101 86 97 88.5 93 88 L 22 79 C 17 78.2 14 74.5 15 70 L 21 43 C 22 39 25 35.8 28 36 Z"
              fill="url(#walletFrontBodyGrad)"
              stroke="url(#walletMainStrokeGrad)"
              strokeWidth="2.2"
            />

            {/* Wallet Clasp / Glowing Cyan Snap Button */}
            <g filter="url(#neonSnapGlowExact)">
              <circle
                cx="68"
                cy="62"
                r="6"
                fill={isLight ? '#38bdf8' : '#00f0ff'}
              />
              <circle
                cx="68"
                cy="62"
                r="2.5"
                fill="#ffffff"
              />
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};
