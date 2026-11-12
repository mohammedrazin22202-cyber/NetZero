import React from 'react';

export const AmbientNeonBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Deep dark ambient radial glow points */}
      <div 
        className="absolute -top-[10%] -left-[5%] w-[600px] h-[600px] rounded-full opacity-40 blur-[130px]"
        style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, rgba(139, 92, 246, 0.15) 50%, transparent 80%)' }}
      />
      <div 
        className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full opacity-30 blur-[140px]"
        style={{ background: 'radial-gradient(circle, rgba(0, 240, 255, 0.25) 0%, rgba(168, 85, 247, 0.1) 60%, transparent 80%)' }}
      />
      <div 
        className="absolute -bottom-[10%] -left-[5%] w-[650px] h-[650px] rounded-full opacity-40 blur-[150px]"
        style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(0, 240, 255, 0.2) 60%, transparent 85%)' }}
      />
      <div 
        className="absolute -bottom-[15%] -right-[5%] w-[700px] h-[700px] rounded-full opacity-35 blur-[160px]"
        style={{ background: 'radial-gradient(circle, rgba(0, 240, 255, 0.35) 0%, rgba(168, 85, 247, 0.2) 50%, transparent 80%)' }}
      />

      {/* Bioluminescent organic curved neon tubes / glass loops matching screenshot */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="neonLeftRibbon" x1="0%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#8b5cf6" stopOpacity="0.65" />
            <stop offset="70%" stopColor="#00f0ff" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.5" />
          </linearGradient>

          <linearGradient id="neonLeftLoop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#a855f7" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#d946ef" stopOpacity="0.85" />
          </linearGradient>

          <linearGradient id="neonBottomRightWave" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.7" />
            <stop offset="85%" stopColor="#a855f7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.4" />
          </linearGradient>

          <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="14" result="blur1" />
            <feGaussianBlur stdDeviation="6" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Top-left to middle-left curved ribbon behind sidebar */}
        <path
          d="M 280,0 C 240,40 180,70 170,160 C 158,260 210,340 180,480 C 160,560 60,620 40,740"
          fill="none"
          stroke="url(#neonLeftRibbon)"
          strokeWidth="3.5"
          filter="url(#softGlow)"
          opacity="0.85"
        />

        {/* 2. Bottom-left organic loop wrapping behind NetZero Pro card */}
        <path
          d="M 0,620 C 120,630 220,700 230,810 C 238,910 130,980 0,990"
          fill="none"
          stroke="url(#neonLeftLoop)"
          strokeWidth="4"
          filter="url(#softGlow)"
          opacity="0.9"
        />

        {/* 3. Bottom-right sweeping wave under Friends card */}
        <path
          d="M 1100,1050 C 1180,940 1320,930 1480,980 C 1600,1020 1750,960 1920,860"
          fill="none"
          stroke="url(#neonBottomRightWave)"
          strokeWidth="4.5"
          filter="url(#softGlow)"
          opacity="0.9"
        />
      </svg>
    </div>
  );
};
