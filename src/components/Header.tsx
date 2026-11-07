import React from 'react';
import { AppState, UserProfile } from '../types';
import { FriendSelector } from './FriendSelector';
import { ArrowLeftRight, Settings, BarChart3, Receipt, Moon, Sun, Repeat } from 'lucide-react';

interface HeaderProps {
  state: AppState;
  activeTab: 'activity' | 'analytics';
  setActiveTab: (tab: 'activity' | 'analytics') => void;
  onTogglePerspective: () => void;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
  onSelectFriend: (friendId: string) => void;
  onAddFriend: (friend: Omit<UserProfile, 'id'>) => void;
  onOpenRecurring: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  activeTab,
  setActiveTab,
  onTogglePerspective,
  onOpenSettings,
  onToggleTheme,
  onSelectFriend,
  onAddFriend,
  onOpenRecurring,
}) => {
  const activeUser = state.activeUserId === state.user1.id ? state.user1 : state.user2;
  const otherUser = state.activeUserId === state.user1.id ? state.user2 : state.user1;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/85 dark:bg-slate-900/80 border-b border-slate-200/90 dark:border-slate-800/80 px-4 py-3 transition-colors">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
        {/* Left: Brand & Friend Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
              <span className="text-lg sm:text-xl">⚖️</span>
            </div>
            <div className="hidden xs:block">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                NetZero
              </h1>
            </div>
          </div>

          {/* Friend Ledger Selector */}
          <FriendSelector
            state={state}
            onSelectFriend={onSelectFriend}
            onAddFriend={onAddFriend}
          />
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Perspective Switcher */}
          <button
            onClick={onTogglePerspective}
            title={`Switch view to ${otherUser.name} (Press P)`}
            className="group flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/60 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all active:scale-95 shadow-sm"
          >
            <span className="text-sm">{activeUser.avatar}</span>
            <span className="inline max-w-[70px] sm:max-w-[85px] truncate font-medium">
              {activeUser.name.split(' ')[0]}
            </span>
            <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 group-hover:rotate-180 transition-transform duration-300" />
          </button>

          {/* Recurring Shared Bills Button */}
          <button
            onClick={onOpenRecurring}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent transition-all"
            title="Manage Recurring Bills & Subscriptions"
          >
            <Repeat className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </button>

          {/* Navigation Pill (Activity vs Analytics) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <button
              onClick={() => setActiveTab('activity')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'activity'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              title="Activity Feed"
            >
              <Receipt className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              title="Analytics & Breakdown"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>

          {/* Dark / Light toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent transition-all"
            title="Toggle theme (Press T)"
          >
            {state.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Settings Modal */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent transition-all"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};