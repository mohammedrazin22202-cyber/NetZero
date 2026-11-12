import React from 'react';

export const AmbientNeonBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Deep dark ambient radial glow points */}
      <div 
        className="absolute -top-[12%] -left-[8%] w-[680px] h-[680px] rounded-full opacity-50 blur-[140px]"
        style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(139, 92, 246, 0.2) 50%, transparent 80%)' }}
      />
      <div 
        className="absolute top-[15%] right-[5%] w-[550px] h-[550px] rounded-full opacity-35 blur-[150px]"
        style={{ background: 'radial-gradient(circle, rgba(0, 240, 255, 0.3) 0%, rgba(168, 85, 247, 0.15) 60%, transparent 80%)' }}
      />
      <div 
        className="absolute -bottom-[12%] -left-[6%] w-[700px] h-[700px] rounded-full opacity-45 blur-[160px]"
        style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.45) 0%, rgba(0, 240, 255, 0.25) 60%, transparent 85%)' }}
      />
      <div 
        className="absolute -bottom-[18%] -right-[8%] w-[750px] h-[750px] rounded-full opacity-40 blur-[170px]"
        style={{ background: 'radial-gradient(circle, rgba(0, 240, 255, 0.4) 0%, rgba(168, 85, 247, 0.22) 50%, transparent 80%)' }}
      />

      {/* Bioluminescent organic curved neon tubes / glass loops matching screenshot exactly */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="neonLeftRibbonExact" x1="0%" y1="0%" x2="60%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.95" />
            <stop offset="30%" stopColor="#a855f7" stopOpacity="0.85" />
            <stop offset="65%" stopColor="#00f0ff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.6" />
          </linearGradient>

          <linearGradient id="neonLeftLoopExact" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#e879f9" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="neonBottomRightWaveExact" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="80%" stopColor="#a855f7" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.5" />
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
          opacity="0.9"
        />

        {/* 2. Bottom-left organic loop wrapping behind NetZero Pro card */}
        <path
          d="M 0,640 C 140,650 240,730 250,840 C 258,940 140,1020 0,1040"
          fill="none"
          stroke="url(#neonLeftLoopExact)"
          strokeWidth="5"
          filter="url(#intenseNeonGlow)"
          opacity="0.95"
        />

        {/* 3. Bottom-right sweeping wave under Friends card */}
        <path
          d="M 1050,1080 C 1140,960 1300,940 1460,990 C 1600,1030 1760,980 1920,890"
          fill="none"
          stroke="url(#neonBottomRightWaveExact)"
          strokeWidth="5"
          filter="url(#intenseNeonGlow)"
          opacity="0.95"
        />
      </svg>
    </div>
  );
};
