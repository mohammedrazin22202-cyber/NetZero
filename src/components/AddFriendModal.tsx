import React, { useState } from 'react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl bg-[#140d25] border border-purple-500/40 p-6 shadow-[0_0_40px_rgba(168,85,247,0.3)]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-purple-950 border border-purple-500/40 text-purple-400 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.4)]">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Add New Friend</h3>
            <p className="text-xs text-slate-400">Start a dedicated shared ledger</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Friend's Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex, Jordan, Sarah"
              className="w-full px-4 py-2.5 rounded-xl bg-[#1b1233] border border-purple-500/30 text-white text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              UPI ID or Phone (Optional)
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="friend@upi or phone"
              className="w-full px-4 py-2.5 rounded-xl bg-[#1b1233] border border-purple-500/30 text-white text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              PayPal / Venmo Username (Optional)
            </label>
            <input
              type="text"
              value={paypalUser}
              onChange={(e) => setPaypalUser(e.target.value)}
              placeholder="username"
              className="w-full px-4 py-2.5 rounded-xl bg-[#1b1233] border border-purple-500/30 text-white text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl btn-neon-cyan text-xs font-bold uppercase tracking-wider"
            >
              Add Friend
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
