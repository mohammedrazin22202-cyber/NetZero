import React, { useState } from 'react';
import { AppState, UserProfile } from '../types';
import { calculateBalance, formatMoney } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';
import { Users, Plus, Check, ChevronDown, UserPlus, X } from 'lucide-react';

interface FriendSelectorProps {
  state: AppState;
  onSelectFriend: (friendId: string) => void;
  onAddFriend: (friend: Omit<UserProfile, 'id'>) => void;
}

const EMOJI_OPTIONS = ['🤝', '😎', '🚀', '⭐', '🍕', '🐱', '🦊', '🔥', '💎', '🎉', '🎸', '⚽'];

export const FriendSelector: React.FC<FriendSelectorProps> = ({
  state,
  onSelectFriend,
  onAddFriend,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('🤝');
  const [newUpi, setNewUpi] = useState('');
  const [newPaypal, setNewPaypal] = useState('');
  const [newVenmo, setNewVenmo] = useState('');

  const currentFriend = state.user2;

  const handleOpenAdd = () => {
    setIsAdding(true);
    setNewName('');
    setNewAvatar('🤝');
    setNewUpi('');
    setNewPaypal('');
    setNewVenmo('');
  };

  const handleSaveNewFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddFriend({
      name: newName.trim(),
      avatar: newAvatar,
      color: 'indigo',
      upiId: newUpi.trim() || undefined,
      paypalUser: newPaypal.trim() || undefined,
      venmoUser: newVenmo.trim() || undefined,
    });

    triggerHaptic('success');
    setIsAdding(false);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Current Friend Badge / Selector Button */}
      <button
        type="button"
        onClick={() => {
          triggerHaptic('light');
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 transition-all text-xs font-bold text-slate-900 dark:text-white"
      >
        <span className="text-base">{currentFriend.avatar}</span>
        <span className="hidden xs:inline max-w-[80px] sm:max-w-[100px] truncate">{currentFriend.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setIsOpen(false);
              setIsAdding(false);
            }}
          />

          <div className="absolute left-0 mt-2 w-72 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            {!isAdding ? (
              <div className="space-y-1">
                <div className="px-3 py-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Your Friends ({state.friends.length})</span>
                  </div>
                  <button
                    onClick={handleOpenAdd}
                    className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                  {state.friends.map((friend) => {
                    const friendTxs = state.friendTransactions[friend.id] || [];
                    const { netBalance } = calculateBalance(
                      friendTxs,
                      state.currentUser.id,
                      friend.id
                    );
                    const isSelected = friend.id === state.selectedFriendId;

                    return (
                      <button
                        key={friend.id}
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          onSelectFriend(friend.id);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-500/10 border border-emerald-500/30'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl shrink-0">{friend.avatar}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {friend.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {friendTxs.length} shared activities
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`text-xs font-bold ${
                              netBalance > 0.005
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : netBalance < -0.005
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-slate-400'
                            }`}
                          >
                            {formatMoney(netBalance, state.currency)}
                          </span>
                          {isSelected && <Check className="w-3 h-3 text-emerald-500 ml-auto mt-0.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleOpenAdd}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Track with another friend</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveNewFriend} className="p-2 space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Add Friend Ledger</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-3">
                    <label className="text-[10px] text-slate-400 font-semibold uppercase">
                      Friend's Name
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder="e.g. Jordan"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-semibold uppercase">
                      Avatar
                    </label>
                    <select
                      value={newAvatar}
                      onChange={(e) => setNewAvatar(e.target.value)}
                      className="w-full px-1.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                    >
                      {EMOJI_OPTIONS.map((em) => (
                        <option key={em} value={em}>
                          {em}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <input
                    type="text"
                    placeholder="UPI ID (optional)"
                    value={newUpi}
                    onChange={(e) => setNewUpi(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] text-slate-900 dark:text-white focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="PayPal username (optional)"
                    value={newPaypal}
                    onChange={(e) => setNewPaypal(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] text-slate-900 dark:text-white focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Venmo username (optional)"
                    value={newVenmo}
                    onChange={(e) => setNewVenmo(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newName.trim()}
                    className="flex-1 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs disabled:opacity-50"
                  >
                    Add Friend
                  </button>
                </div>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
};
