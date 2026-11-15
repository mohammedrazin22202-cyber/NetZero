import React from 'react';

interface AmbientNeonBackgroundProps {
  theme?: 'dark' | 'light';
}

export const AmbientNeonBackground: React.FC<AmbientNeonBackgroundProps> = ({
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  return (
    <div className="ambient-neon-bg fixed inset-0 pointer-events-none overflow-hidden z-0 select-none transition-opacity duration-500">
      {/* Ambient radial glow points */}
      {/* 1. Top-Left: Powder Blue */}
      <div 
        className="absolute -top-[12%] -left-[8%] w-[680px] h-[680px] rounded-full blur-[140px] transition-all duration-500"
        style={{
          background: isLight
            ? 'radial-gradient(circle, rgba(56, 189, 248, 0.45) 0%, rgba(186, 230, 253, 0.25) 50%, transparent 80%)'
            : 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(139, 92, 246, 0.2) 50%, transparent 80%)',
          opacity: isLight ? 0.7 : 0.5,
        }}
      />

      {/* 2. Top-Right: Soft Lavender */}
      <div 
        className="absolute top-[15%] right-[5%] w-[550px] h-[550px] rounded-full blur-[150px] transition-all duration-500"
        style={{
          background: isLight
            ? 'radial-gradient(circle, rgba(192, 132, 252, 0.4) 0%, rgba(233, 213, 255, 0.25) 60%, transparent 80%)'
            : 'radial-gradient(circle, rgba(0, 240, 255, 0.3) 0%, rgba(168, 85, 247, 0.15) 60%, transparent 80%)',
          opacity: isLight ? 0.65 : 0.35,
        }}
      />

      {/* 3. Bottom-Left: Powder Blue & Warm Sunset Peach Blend */}
      <div 
        className="absolute -bottom-[12%] -left-[6%] w-[700px] h-[700px] rounded-full blur-[160px] transition-all duration-500"
        style={{
          background: isLight
            ? 'radial-gradient(circle, rgba(125, 211, 252, 0.4) 0%, rgba(254, 215, 170, 0.3) 60%, transparent 85%)'
            : 'radial-gradient(circle, rgba(168, 85, 247, 0.45) 0%, rgba(0, 240, 255, 0.25) 60%, transparent 85%)',
          opacity: isLight ? 0.6 : 0.45,
        }}
      />

      {/* 4. Bottom-Right: Warm Sunset Peach */}
      <div 
        className="absolute -bottom-[18%] -right-[8%] w-[750px] h-[750px] rounded-full blur-[170px] transition-all duration-500"
        style={{
          background: isLight
            ? 'radial-gradient(circle, rgba(251, 146, 60, 0.45) 0%, rgba(254, 215, 170, 0.25) 50%, transparent 80%)'
            : 'radial-gradient(circle, rgba(0, 240, 255, 0.4) 0%, rgba(168, 85, 247, 0.22) 50%, transparent 80%)',
          opacity: isLight ? 0.7 : 0.4,
        }}
      />

      {/* Bioluminescent organic curved neon tubes / glass loops */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="neonLeftRibbonExact" x1="0%" y1="0%" x2="60%" y2="100%">
            <stop offset="0%" stopColor={isLight ? '#38bdf8' : '#c084fc'} stopOpacity={isLight ? 0.85 : 0.95} />
            <stop offset="30%" stopColor={isLight ? '#c084fc' : '#a855f7'} stopOpacity={isLight ? 0.8 : 0.85} />
            <stop offset="65%" stopColor={isLight ? '#fb923c' : '#00f0ff'} stopOpacity={isLight ? 0.85 : 0.9} />
            <stop offset="100%" stopColor={isLight ? '#38bdf8' : '#c084fc'} stopOpacity={isLight ? 0.5 : 0.6} />
          </linearGradient>

          <linearGradient id="neonLeftLoopExact" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isLight ? '#38bdf8' : '#00f0ff'} stopOpacity={isLight ? 0.85 : 0.95} />
            <stop offset="50%" stopColor={isLight ? '#c084fc' : '#a855f7'} stopOpacity={isLight ? 0.8 : 0.85} />
            <stop offset="100%" stopColor={isLight ? '#fb923c' : '#e879f9'} stopOpacity={isLight ? 0.85 : 0.9} />
          </linearGradient>

          <linearGradient id="neonBottomRightWaveExact" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isLight ? '#fb923c' : '#00f0ff'} stopOpacity={isLight ? 0.85 : 0.95} />
            <stop offset="45%" stopColor={isLight ? '#38bdf8' : '#38bdf8'} stopOpacity={isLight ? 0.8 : 0.8} />
            <stop offset="80%" stopColor={isLight ? '#c084fc' : '#a855f7'} stopOpacity={isLight ? 0.8 : 0.85} />
            <stop offset="100%" stopColor={isLight ? '#fb923c' : '#c084fc'} stopOpacity={isLight ? 0.5 : 0.5} />
          </linearGradient>

          <filter id="intenseNeonGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="22" result="blurWide" />
            <feGaussianBlur stdDeviation="10" result="blurMid" />
            <feGaussianBlur stdDeviation="3.5" result="blurSharp" />
            <feMerge>
              <feMergeNode in="blurWide" />
              <feMergeNode in="blurMid" />
              <feMergeNode in="blurSharp" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Top-left to middle-left curved ribbon wrapping outside sidebar */}
        <path
          d="M 290,0 C 230,40 180,90 170,180 C 158,280 220,380 180,510 C 150,600 50,660 30,780"
          fill="none"
          stroke="url(#neonLeftRibbonExact)"
          strokeWidth="4.5"
          filter="url(#intenseNeonGlow)"
          opacity={isLight ? 0.85 : 0.9}
        />

        {/* 2. Bottom-left organic loop wrapping behind NetZero Pro card */}
        <path
          d="M 0,640 C 140,650 240,730 250,840 C 258,940 140,1020 0,1040"
          fill="none"
          stroke="url(#neonLeftLoopExact)"
          strokeWidth="5"
          filter="url(#intenseNeonGlow)"
          opacity={isLight ? 0.9 : 0.95}
        />

        {/* 3. Bottom-right sweeping wave under Friends card */}
        <path
          d="M 1050,1080 C 1140,960 1300,940 1460,990 C 1600,1030 1760,980 1920,890"
          fill="none"
          stroke="url(#neonBottomRightWaveExact)"
          strokeWidth="5"
          filter="url(#intenseNeonGlow)"
          opacity={isLight ? 0.9 : 0.95}
        />
      </svg>
    </div>
  );
};
