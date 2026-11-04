import React, { useState, useEffect } from 'react';
import { AppState } from '../types';
import { calculateBalance, generateWhatsAppMessage } from '../utils/formatters';
import { X, Copy, Check, MessageSquare, ExternalLink } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, state }) => {
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const activeUser = state.activeUserId === state.user1.id ? state.user1 : state.user2;
  const friend = state.activeUserId === state.user1.id ? state.user2 : state.user1;

  const { netBalance } = calculateBalance(state.transactions, activeUser.id, friend.id);

  if (!isOpen) return null;

  const encodedMsg = generateWhatsAppMessage(
    netBalance,
    activeUser,
    friend,
    state.currency,
    state.transactions
  );
  const plainText = decodeURIComponent(encodedMsg);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(plainText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = plainText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Could not copy to clipboard. Please copy manually from the preview box.');
    }
  };

  const handleOpenWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodedMsg}`, '_blank');
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">💬</span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Share Balance Summary
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Send a friendly update to {friend.name} so neither of you forgets:
          </p>

          {/* Message Preview Box */}
          <div className="relative p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
            {plainText}
          </div>

          {/* Quick Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleOpenWhatsApp}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send via WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>

            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700/60 active:scale-[0.98] transition-all"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary Text'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
