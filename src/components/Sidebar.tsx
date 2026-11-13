import React from 'react';
import { 
  Home, 
  Users, 
  ArrowLeftRight, 
  BarChart3, 
  CheckCircle2, 
  Tag, 
  Settings, 
  Crown,
  ArrowRight
} from 'lucide-react';

export type NavItemKey = 
  | 'dashboard' 
  | 'friends' 
  | 'transactions' 
  | 'analytics' 
  | 'settlements' 
  | 'categories' 
  | 'settings';

interface SidebarProps {
  activeNav: NavItemKey;
  onSelectNav: (key: NavItemKey) => void;
  onOpenUpgrade?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onSelectNav,
  onOpenUpgrade,
}) => {
  return (
    <aside className="w-56 min-w-[220px] shrink-0 min-h-screen flex flex-col justify-between p-5 z-20 select-none">
      <div>
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 mb-8 pl-1">
          {/* Exact Stylized 3D Neon Ribbon "N" Mark */}
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <svg 
              viewBox="0 0 46 46" 
              fill="none" 
              className="w-10 h-10 drop-shadow-[0_0_14px_rgba(0,240,255,0.75)]"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="ribbonLeftLimb" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#00f0ff" />
                  <stop offset="100%" stopColor="#38bdf8" />
                </linearGradient>
                <linearGradient id="ribbonDiagonal" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00f0ff" />
                  <stop offset="45%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient id="ribbonRightLimb" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#e879f9" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              {/* Left upright limb */}
              <path
                d="M 10 36 C 8 36 7 34.5 7 32.5 L 7 14 C 7 10 11 8.5 14 10 L 17 12 L 17 33 C 17 35 15.5 36 13.5 36 Z"
                fill="url(#ribbonLeftLimb)"
              />
              {/* Diagonal folded ribbon connecting */}
              <path
                d="M 11 10 C 13.5 8 17.5 10 24 19.5 L 29.5 28 C 31.5 31 33.5 32 35.5 31 L 34 35.5 C 31 37.5 27.5 35 21 25.5 L 14.5 16 Z"
                fill="url(#ribbonDiagonal)"
              />
              {/* Right upright limb */}
              <path
                d="M 28 35.5 L 34.5 12 C 35.5 9.5 38 8.5 40 10.5 L 40 33 C 40 35.5 38 37 36 37 Z"
                fill="url(#ribbonRightLimb)"
              />
            </svg>
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">
              NetZero
            </h1>
            <p className="text-[10px] font-medium text-slate-400 mt-1 tracking-wider">
              Split • Track • Settle
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          {/* Dashboard */}
          <button
            onClick={() => onSelectNav('dashboard')}
            className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 ${
              activeNav === 'dashboard'
                ? 'nav-pill-active text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Home className="w-5 h-5 stroke-[2] text-white" />
            <span>Dashboard</span>
          </button>

          {/* Friends */}
          <button
            onClick={() => onSelectNav('friends')}
            className={`w-full flex items-center gap-3.5 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
              activeNav === 'friends'
                ? 'nav-pill-active text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-5 h-5 stroke-[1.8]" />
            <span>Friends</span>
          </button>

          {/* Transactions */}
          <button
            onClick={() => onSelectNav('transactions')}
            className={`w-full flex items-center gap-3.5 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
              activeNav === 'transactions'
                ? 'nav-pill-active text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ArrowLeftRight className="w-5 h-5 stroke-[1.8]" />
            <span>Transactions</span>
          </button>

          {/* Analytics */}
          <button
            onClick={() => onSelectNav('analytics')}
            className={`w-full flex items-center gap-3.5 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
              activeNav === 'analytics'
                ? 'nav-pill-active text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-5 h-5 stroke-[1.8]" />
            <span>Analytics</span>
          </button>

          {/* Settlements */}
          <button
            onClick={() => onSelectNav('settlements')}
            className={`w-full flex items-center gap-3.5 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
              activeNav === 'settlements'
                ? 'nav-pill-active text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 stroke-[1.8]" />
            <span>Settlements</span>
          </button>

          {/* Spacer */}
          <div className="h-4" />

          {/* Categories */}
          <button
            onClick={() => onSelectNav('categories')}
            className={`w-full flex items-center gap-3.5 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
              activeNav === 'categories'
                ? 'nav-pill-active text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Tag className="w-5 h-5 stroke-[1.8]" />
            <span>Categories</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => onSelectNav('settings')}
            className={`w-full flex items-center gap-3.5 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
              activeNav === 'settings'
                ? 'nav-pill-active text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-5 h-5 stroke-[1.8]" />
            <span>Settings</span>
          </button>
        </nav>
      </div>

      {/* NetZero Pro Card at bottom of sidebar */}
      <div className="rounded-3xl p-4 bg-[#140d25]/90 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)] flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-[0_0_14px_rgba(168,85,247,0.5)] shrink-0">
            <Crown className="w-5 h-5 stroke-[2] fill-purple-400/25" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white leading-tight">
              NetZero Pro
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Backups • Insights • More
            </p>
          </div>
        </div>

        <button
          onClick={onOpenUpgrade}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-full btn-neon-cyan font-bold text-xs uppercase tracking-wider"
        >
          <span>Upgrade</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </aside>
  );
};
