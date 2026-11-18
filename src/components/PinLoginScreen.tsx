import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { triggerHaptic } from '../utils/haptics';
import { Delete, Lock, ShieldAlert, Clock } from 'lucide-react';

interface PinLoginScreenProps {
  currentUser: UserProfile;
  friends: UserProfile[];
  onLoginSuccess: (user: UserProfile) => void;
  sessionTerminatedReason?: string | null;
  onClearTerminatedReason?: () => void;
}

export const PinLoginScreen: React.FC<PinLoginScreenProps> = ({
  currentUser,
  friends,
  onLoginSuccess,
  sessionTerminatedReason,
  onClearTerminatedReason,
}) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [shake, setShake] = useState(false);

  // Listen to physical keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        setPin('');
        setErrorMsg('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin]);

  const verifyPin = (enteredPin: string) => {
    // Check against currentUser (e.g. 8181)
    if (currentUser.pin === enteredPin) {
      triggerHaptic('success');
      onLoginSuccess(currentUser);
      return;
    }

    // Check against friends (e.g. 1234)
    const matchingFriend = friends.find((f) => f.pin === enteredPin);
    if (matchingFriend) {
      triggerHaptic('success');
      onLoginSuccess(matchingFriend);
      return;
    }

    // Invalid PIN
    triggerHaptic('error');
    setShake(true);
    setErrorMsg('Invalid 4-digit User ID. Please check and try again.');
    setTimeout(() => {
      setShake(false);
      setPin('');
    }, 600);
  };

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    triggerHaptic('light');
    setErrorMsg('');
    onClearTerminatedReason?.();
    const nextPin = pin + digit;
    setPin(nextPin);
    if (nextPin.length === 4) {
      verifyPin(nextPin);
    }
  };

  const handleBackspace = () => {
    triggerHaptic('light');
    setErrorMsg('');
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    triggerHaptic('light');
    setPin('');
    setErrorMsg('');
  };

  const handleQuickLogin = (user: UserProfile) => {
    if (user.pin) {
      setPin(user.pin);
      verifyPin(user.pin);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn select-none text-slate-900 dark:text-white">
      <div
        className={`w-full max-w-sm rounded-3xl p-6 sm:p-8 bg-white/95 dark:bg-[#130b22]/95 border border-purple-200 dark:border-purple-500/30 shadow-[0_20px_50px_rgba(168,85,247,0.25)] flex flex-col items-center text-center transition-transform duration-150 ${
          shake ? 'translate-x-[-10px] animate-pulse' : ''
        }`}
      >
        {/* App Icon */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-[0_0_24px_rgba(168,85,247,0.4)] mb-4 flex items-center justify-center">
          <div className="w-full h-full rounded-[14px] bg-white dark:bg-[#0d071a] flex items-center justify-center">
            <Lock className="w-6 h-6 text-purple-600 dark:text-cyan-400 stroke-[2.2]" />
          </div>
        </div>

        <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
          NetZero Security
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[260px]">
          Enter your 4-digit User ID to log in
        </p>

        {/* Session Terminated / Auto-Lock Alert */}
        {sessionTerminatedReason && (
          <div className="w-full mt-3 mb-1 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2.5 text-left animate-fadeIn">
            {sessionTerminatedReason.toLowerCase().includes('inactivity') ? (
              <Clock className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
            ) : (
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-bold text-[11px] uppercase tracking-wider text-amber-700 dark:text-amber-300">
                {sessionTerminatedReason.toLowerCase().includes('inactivity')
                  ? 'Auto-Lock (Inactivity)'
                  : 'Single-Device Security'}
              </p>
              <p className="text-[11px] leading-relaxed mt-0.5 text-amber-800 dark:text-amber-200">
                {sessionTerminatedReason}
              </p>
            </div>
          </div>
        )}

        {/* PIN Dots Display */}
        <div className="flex items-center justify-center gap-3.5 my-6">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-gradient-to-r from-cyan-400 to-teal-400 scale-125 shadow-[0_0_12px_#38bdf8]'
                    : 'bg-purple-100 dark:bg-purple-950/80 border border-purple-300 dark:border-purple-500/40'
                }`}
              />
            );
          })}
        </div>

        {/* Error message if any */}
        {errorMsg ? (
          <p className="text-xs font-semibold text-rose-500 dark:text-rose-400 mb-4 animate-shake">
            {errorMsg}
          </p>
        ) : (
          <div className="h-4 mb-2" />
        )}

        {/* Numeric Keypad Grid */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[240px] mb-5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 border border-purple-100 dark:border-purple-500/20 text-lg font-bold text-slate-800 dark:text-slate-100 active:scale-95 transition-all shadow-sm"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-2xl text-[11px] font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 active:scale-95 transition-all"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 border border-purple-100 dark:border-purple-500/20 text-lg font-bold text-slate-800 dark:text-slate-100 active:scale-95 transition-all shadow-sm"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 active:scale-95 transition-all"
            title="Backspace"
          >
            <Delete className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Quick User Selection Pills */}
        <div className="w-full pt-4 border-t border-purple-100 dark:border-purple-500/20">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Accounts:
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleQuickLogin(currentUser)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-300 text-xs font-bold hover:scale-105 transition-all"
            >
              <span>👑 {currentUser.name || 'You'}</span>
            </button>
            {friends.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => handleQuickLogin(f)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-500/40 text-purple-800 dark:text-purple-300 text-xs font-bold hover:scale-105 transition-all"
              >
                <span>🤝 {f.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
