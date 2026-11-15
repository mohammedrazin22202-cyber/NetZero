import React from 'react';
import { Search, Bell, ChevronDown, Moon } from 'lucide-react';
import { UserProfile } from '../types';

interface TopBarProps {
  currentUser: UserProfile;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenNotifications?: () => void;
  onToggleTheme?: () => void;
  onOpenProfile?: () => void;
  theme?: 'dark' | 'light';
}

export const TopBar: React.FC<TopBarProps> = ({
  currentUser,
  searchQuery,
  onSearchChange,
  onOpenNotifications,
  onToggleTheme,
  onOpenProfile,
  theme = 'dark',
}) => {
  return (
    <header className="w-full flex items-center justify-between gap-4 py-2 select-none">
      {/* Search Input Container */}
      <div className="relative w-[460px] max-w-full">
        <div className="relative flex items-center w-full">
          <div className="absolute left-4 text-slate-400 pointer-events-none flex items-center">
            <Search className="w-4 h-4 stroke-[2]" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search friends, expenses, notes..."
            className="w-full h-10 pl-11 pr-20 rounded-full bg-white/95 dark:bg-[#130b22]/90 border border-purple-200 dark:border-purple-500/30 text-slate-900 dark:text-white text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#38bdf8] dark:focus:border-purple-400 focus:ring-1 focus:ring-[#38bdf8]/50 dark:focus:ring-purple-400/50 shadow-[0_2px_10px_rgba(56,189,248,0.08)] dark:shadow-[0_0_15px_rgba(168,85,247,0.12)] transition-all"
          />

          <div className="absolute right-3.5 flex items-center gap-1 pointer-events-none">
            <kbd className="px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-purple-50 dark:bg-white/5 border border-purple-200 dark:border-white/10 rounded-md">
              Ctrl + K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Icons: Notifications, Theme Toggle, Profile */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button
          type="button"
          onClick={onOpenNotifications}
          title="Notifications"
          className="relative w-10 h-10 rounded-full bg-white dark:bg-[#150d27]/90 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:border-[#38bdf8] dark:hover:border-purple-400/60 shadow-[0_2px_10px_rgba(56,189,248,0.1)] dark:shadow-[0_0_12px_rgba(168,85,247,0.18)] transition-all active:scale-95"
        >
          <Bell className="w-4 h-4 stroke-[2]" />
          {/* Notification Dot */}
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[#38bdf8] dark:bg-[#00f0ff] shadow-[0_0_8px_#38bdf8] dark:shadow-[0_0_8px_#00f0ff]" />
        </button>

        {/* Theme Toggle: Sun in Dark mode, Moon in Light mode */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 ${
            theme === 'dark'
              ? 'bg-[#150d27]/90 border border-purple-500/30 text-amber-400 hover:text-amber-300 hover:border-amber-400/60 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
              : 'bg-[#fff4ed] border border-[#fed7aa] text-[#f97316] hover:text-[#ea580c] hover:border-[#fb923c] shadow-[0_0_15px_rgba(251,146,60,0.35)]'
          }`}
        >
          {theme === 'dark' ? (
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-amber-400">
              <circle cx="12" cy="12" r="4.5" fill="#fbbf24" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <Moon className="w-5 h-5 text-[#f97316] stroke-[2] fill-[#fed7aa]/50" />
          )}
        </button>

        {/* Profile Avatar Dropdown */}
        <button
          type="button"
          onClick={onOpenProfile}
          title="Profile & Settings"
          className="flex items-center gap-1.5 pl-1 pr-1 py-1 rounded-full hover:bg-purple-100/50 dark:hover:bg-white/5 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#8b5cf6] via-[#c084fc] to-[#fb923c] dark:from-purple-700 dark:via-purple-600 dark:to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(192,132,252,0.45)] dark:shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'M'}
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
        </button>
      </div>
    </header>
  );
};
