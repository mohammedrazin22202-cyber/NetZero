import React, { useState, useEffect, useCallback } from 'react';
import { X, Keyboard, RotateCcw, Check, AlertCircle, Edit2 } from 'lucide-react';
import { DEFAULT_KEYBOARD_SHORTCUTS, KeyboardShortcuts } from '../types';
import { SHORTCUT_ITEMS, formatKeyDisplay } from '../utils/shortcuts';
import { triggerHaptic } from '../utils/haptics';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts?: KeyboardShortcuts;
  onUpdateShortcut?: (id: keyof KeyboardShortcuts, newKey: string) => void;
  onResetShortcuts?: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
  shortcuts = DEFAULT_KEYBOARD_SHORTCUTS,
  onUpdateShortcut,
  onResetShortcuts,
}) => {
  const [recordingAction, setRecordingAction] = useState<keyof KeyboardShortcuts | null>(null);
  const [notification, setNotification] = useState<{ type: 'info' | 'success' | 'warning'; message: string } | null>(null);

  // Clear transient notifications after 3 seconds
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  // Handle closing modal with Escape when not recording
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (recordingAction) return; // Ignore modal close if user is recording a key
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, recordingAction]);

  // Key recording listener
  useEffect(() => {
    if (!recordingAction) return;

    const handleRecordKey = (e: KeyboardEvent) => {
      // Ignore standalone modifier keys so user can press combinations if desired
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Fn', 'NumLock'].includes(e.key)) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      // Cancel on Escape if not explicitly recording the 'closeModal' action
      if (e.key === 'Escape' && recordingAction !== 'closeModal') {
        setRecordingAction(null);
        setNotification({ type: 'info', message: 'Key assignment cancelled' });
        triggerHaptic('light');
        return;
      }

      let capturedKey = e.key;
      if (capturedKey === ' ') capturedKey = 'Space';
      else if (capturedKey.length === 1) capturedKey = capturedKey.toUpperCase();

      // Check if another action already uses this key
      const conflictingEntry = SHORTCUT_ITEMS.find(
        (item) => item.id !== recordingAction && shortcuts[item.id]?.toUpperCase() === capturedKey.toUpperCase()
      );

      if (onUpdateShortcut) {
        onUpdateShortcut(recordingAction, capturedKey);
      }

      if (conflictingEntry) {
        setNotification({
          type: 'warning',
          message: `Bound "${capturedKey}". Note: "${conflictingEntry.label}" also uses this key.`,
        });
      } else {
        setNotification({
          type: 'success',
          message: `Shortcut updated to "${formatKeyDisplay(capturedKey)}"`,
        });
      }

      triggerHaptic('success');
      setRecordingAction(null);
    };

    window.addEventListener('keydown', handleRecordKey, true);
    return () => window.removeEventListener('keydown', handleRecordKey, true);
  }, [recordingAction, shortcuts, onUpdateShortcut]);

  const handleStartRecording = useCallback((id: keyof KeyboardShortcuts) => {
    setRecordingAction(id);
    setNotification(null);
    triggerHaptic('medium');
  }, []);

  const handleResetSingle = useCallback(
    (id: keyof KeyboardShortcuts, defaultKey: string) => {
      if (onUpdateShortcut) {
        onUpdateShortcut(id, defaultKey);
        setNotification({ type: 'info', message: `Reset to default key "${formatKeyDisplay(defaultKey)}"` });
        triggerHaptic('light');
      }
    },
    [onUpdateShortcut]
  );

  const handleResetAll = useCallback(() => {
    if (onResetShortcuts) {
      onResetShortcuts();
      setNotification({ type: 'success', message: 'All shortcuts restored to defaults' });
      triggerHaptic('medium');
    }
  }, [onResetShortcuts]);

  if (!isOpen) return null;

  const isAnyCustomized = SHORTCUT_ITEMS.some(
    (item) => shortcuts[item.id]?.toUpperCase() !== item.defaultKey.toUpperCase()
  );

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (recordingAction) {
            setRecordingAction(null);
          } else {
            onClose();
          }
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 text-slate-900 dark:text-white transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-sm">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight">Keyboard Shortcuts</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Customizable
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Click any key to rebind to your preference
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status / Instruction Notification Banner */}
        {recordingAction ? (
          <div className="mt-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-between text-xs animate-pulse shadow-sm">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold">
                Press any key for &ldquo;{SHORTCUT_ITEMS.find((s) => s.id === recordingAction)?.label}&rdquo;...
              </span>
            </div>
            <button
              onClick={() => setRecordingAction(null)}
              className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 transition-colors"
            >
              Cancel (Esc)
            </button>
          </div>
        ) : notification ? (
          <div
            className={`mt-3 p-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all ${
              notification.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                : notification.type === 'warning'
                ? 'bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400'
                : 'bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400'
            }`}
          >
            {notification.type === 'success' ? (
              <Check className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            )}
            <span className="truncate">{notification.message}</span>
          </div>
        ) : null}

        {/* Shortcuts List */}
        <div className="mt-3.5 space-y-2">
          {SHORTCUT_ITEMS.map((item) => {
            const currentKey = shortcuts[item.id] || item.defaultKey;
            const isRecording = recordingAction === item.id;
            const isCustomized = currentKey.toUpperCase() !== item.defaultKey.toUpperCase();

            return (
              <div
                key={item.id}
                className={`group flex items-center justify-between p-2.5 rounded-2xl transition-all ${
                  isRecording
                    ? 'bg-emerald-500/10 border-2 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-50/80 dark:bg-slate-950/50 hover:bg-slate-100/80 dark:hover:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60'
                }`}
              >
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-700 dark:text-slate-200 font-medium">
                      {item.label}
                    </span>
                    {isCustomized && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        custom
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1">
                    {item.description}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Reset single shortcut to default if customized */}
                  {isCustomized && !isRecording && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResetSingle(item.id, item.defaultKey);
                      }}
                      title={`Reset to default (${formatKeyDisplay(item.defaultKey)})`}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Interactive Shortcut Key Badge */}
                  <button
                    onClick={() => handleStartRecording(item.id)}
                    title={isRecording ? 'Listening for key...' : 'Click to customize this key'}
                    className={`relative min-w-[36px] px-2.5 py-1 text-xs font-mono font-bold rounded-xl transition-all select-none flex items-center justify-center gap-1 ${
                      isRecording
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 scale-105'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300/80 dark:border-slate-700/80 shadow-sm hover:border-emerald-500 dark:hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:scale-105 active:scale-95'
                    }`}
                  >
                    {isRecording ? (
                      <span className="text-[11px] font-sans tracking-wide">Press key...</span>
                    ) : (
                      <>
                        <span>{formatKeyDisplay(currentKey)}</span>
                        <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 transition-opacity ml-0.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Bottom Actions */}
        <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
          {isAnyCustomized && (
            <button
              onClick={handleResetAll}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-all active:scale-[0.98]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-[0.98] text-center"
          >
            Got it
          </button>
        </div>

        {/* Pro Tip */}
        <p className="mt-3 text-center text-[10px] text-slate-400 dark:text-slate-500">
          💡 Click on any key badge above to customize it to your keyboard workflow
        </p>
      </div>
    </div>
  );
};
