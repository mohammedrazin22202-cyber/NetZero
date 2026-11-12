import React from 'react';
import { Search, Bell, Sun, Moon, ChevronDown } from 'lucide-react';
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
    <header className="w-full flex items-center justify-between gap-4 py-3 select-none">
      {/* Search Input Container */}
      <div className="relative flex-1 max-w-xl">
        <div className="relative flex items-center w-full">
          <div className="absolute left-4 text-slate-400 pointer-events-none flex items-center">
            <Search className="w-4 h-4 stroke-[2]" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search friends, expenses, notes..."
            className="w-full h-11 pl-11 pr-20 rounded-full bg-[#130b22]/90 border border-purple-500/30 text-white text-xs sm:text-sm placeholder:text-slate-400 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 shadow-[0_0_15px_rgba(168,85,247,0.12)] transition-all"
          />

          <div className="absolute right-3.5 flex items-center gap-1 pointer-events-none">
            <kbd className="px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-white/5 border border-white/10 rounded-md">
              Ctrl + K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Icons: Notifications, Theme Toggle, Profile */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          title="Notifications"
          className="relative w-10 h-10 rounded-full bg-[#150d27]/90 border border-purple-500/30 flex items-center justify-center text-slate-200 hover:text-white hover:border-purple-400/60 shadow-[0_0_12px_rgba(168,85,247,0.18)] transition-all active:scale-95"
        >
          <Bell className="w-4 h-4 stroke-[2]" />
          {/* Cyan Notification Dot */}
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" />
        </button>

        {/* Theme Toggle Button (Sun icon in golden yellow) */}
        <button
          onClick={onToggleTheme}
          title="Toggle Theme"
          className="w-10 h-10 rounded-full bg-[#150d27]/90 border border-purple-500/30 flex items-center justify-center text-amber-400 hover:text-amber-300 hover:border-amber-400/60 shadow-[0_0_15px_rgba(251,191,36,0.25)] transition-all active:scale-95"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 stroke-[2.2] text-amber-400 fill-amber-400/20" />
          ) : (
            <Moon className="w-4 h-4 stroke-[2.2] text-purple-400" />
          )}
        </button>

        {/* Profile Avatar Dropdown */}
        <button
          onClick={onOpenProfile}
          title="Profile & Settings"
          className="flex items-center gap-1.5 pl-1 pr-1.5 py-1 rounded-full hover:bg-white/5 transition-all group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-700 via-purple-600 to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_15px_rgba(168,85,247,0.45)]">
            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'M'}
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
        </button>
      </div>
    </header>
  );
};
