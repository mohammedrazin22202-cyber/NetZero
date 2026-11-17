import React, { useState, useEffect } from 'react';
import { X, UserPlus } from 'lucide-react';
import { UserProfile } from '../types';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFriend: (friend: Omit<UserProfile, 'id'>) => void;
}

export const AddFriendModal: React.FC<AddFriendModalProps> = ({
  isOpen,
  onClose,
  onAddFriend,
}) => {
  const [name, setName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [paypalUser, setPaypalUser] = useState('');

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddFriend({
      name: name.trim(),
      avatar: name.trim().charAt(0).toUpperCase(),
      color: 'purple',
      upiId: upiId.trim() || undefined,
      paypalUser: paypalUser.trim() || undefined,
    });

    setName('');
    setUpiId('');
    setPaypalUser('');
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#140d25] border border-purple-200 dark:border-purple-500/40 p-6 shadow-2xl text-slate-900 dark:text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 border border-purple-300 dark:border-purple-500/40 text-purple-700 dark:text-purple-400 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.3)]">
            <UserPlus className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Add New Friend</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Start a dedicated shared balance ledger</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Friend's Name
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex, Jordan, Sarah"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#1b1233] border border-purple-200 dark:border-purple-500/30 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#38bdf8] dark:focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              UPI ID or Phone (Optional)
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="friend@upi or phone"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#1b1233] border border-purple-200 dark:border-purple-500/30 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#38bdf8] dark:focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              PayPal / Venmo Username (Optional)
            </label>
            <input
              type="text"
              value={paypalUser}
              onChange={(e) => setPaypalUser(e.target.value)}
              placeholder="e.g. username"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#1b1233] border border-purple-200 dark:border-purple-500/30 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#38bdf8] dark:focus:border-cyan-400"
            />
          </div>

          <div className="mt-4 flex items-center justify-end gap-3 pt-2 border-t border-purple-100 dark:border-purple-500/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-5 py-2.5 rounded-xl btn-neon-cyan text-xs font-bold uppercase tracking-wider disabled:opacity-50"
            >
              Add Friend
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
