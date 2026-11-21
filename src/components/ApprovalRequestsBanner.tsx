import React from 'react';
import { Transaction, UserProfile, Currency } from '../types';
import { triggerHaptic } from '../utils/haptics';
import { triggerConfetti } from '../utils/confetti';
import { AlertCircle, Clock, Check, X, ShieldAlert, FastForward, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { formatMoney } from '../utils/formatters';

interface ApprovalRequestsBannerProps {
  transactions: Transaction[];
  currentUser: UserProfile;
  activeFriend: UserProfile;
  currency: Currency;
  onAccept: (txId: string) => void;
  onDeny: (txId: string) => void;
  onVoteReview: (txId: string, isTrue: boolean) => void;
  onFastForwardHold?: (txId: string) => void;
  onApproveDeletion?: (txId: string) => void;
  onRejectDeletion?: (txId: string) => void;
}

export const ApprovalRequestsBanner: React.FC<ApprovalRequestsBannerProps> = ({
  transactions,
  currentUser,
  activeFriend,
  currency,
  onAccept,
  onDeny,
  onVoteReview,
  onFastForwardHold,
  onApproveDeletion,
  onRejectDeletion,
}) => {
  const now = Date.now();

  // Find transactions that need attention:
  // 1. deletionStatus === 'pending_deletion'
  // 2. pending_approval where respondent is currentUser
  // 3. pending_approval where requester is currentUser (informational)
  // 4. on_hold (either active or ready for review)
  // 5. disputed_review
  const relevantTxs = transactions.filter((t) => {
    if (t.deletionStatus === 'pending_deletion') {
      return true;
    }
    if (!t.approvalStatus || t.approvalStatus === 'approved' || t.approvalStatus === 'rejected') {
      return false;
    }
    return true;
  });

  if (relevantTxs.length === 0) return null;

  const formatLockDate = (timestamp?: number) => {
    if (!timestamp) return '72 hours';
    const d = new Date(timestamp);
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${timeStr} on ${day}/${month}/${year}`;
  };

  return (
    <div className="w-full flex flex-col gap-2.5 my-2 select-none animate-fadeIn">
      {relevantTxs.map((t) => {
        const isRespondent = t.approvalRespondentId === currentUser.id;
        const isRequester = t.approvalRequestedBy === currentUser.id;
        const partnerName = activeFriend.name.split(' ')[0];
        const isHoldExpired = t.lockedUntil ? now >= t.lockedUntil : false;
        const isReadyForDualReview = t.approvalStatus === 'disputed_review' || (t.approvalStatus === 'on_hold' && isHoldExpired);

        // CASE 0: Deletion Approval Request
        if (t.deletionStatus === 'pending_deletion') {
          const isDeletionRespondent = t.deletionRespondentId === currentUser.id;
          const isDeletionRequester = t.deletionRequestedBy === currentUser.id;

          if (isDeletionRespondent) {
            return (
              <div
                key={`del-${t.id}`}
                className="rounded-2xl p-4 bg-gradient-to-r from-rose-950/40 via-red-950/50 to-rose-900/40 border border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white animate-fadeIn"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shrink-0 mt-0.5">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-rose-300">
                      Deletion Approval Required
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5">
                      <strong>{partnerName}</strong> requested to delete "{t.title}" ({formatMoney(t.amount, currency)})
                    </h4>
                    <p className="text-xs text-rose-200/80 mt-0.5">
                      Approving will permanently remove this record from the ledger.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => onApproveDeletion?.(t.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/30 transition-all hover:scale-105 active:scale-95"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Approve Deletion</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRejectDeletion?.(t.id)}
                    className="px-3 py-1.5 rounded-xl border border-rose-400/30 bg-white/5 hover:bg-white/10 text-rose-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Keep Transaction</span>
                  </button>
                </div>
              </div>
            );
          }

          if (isDeletionRequester) {
            return (
              <div
                key={`del-${t.id}`}
                className="rounded-2xl p-3.5 bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 flex items-center justify-between gap-3 text-xs text-slate-700 dark:text-slate-300 animate-fadeIn"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
                  <span>
                    Awaiting deletion approval from <strong>{partnerName}</strong> for "{t.title}" ({formatMoney(t.amount, currency)}).
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onRejectDeletion?.(t.id)}
                  className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline shrink-0"
                >
                  Cancel Request
                </button>
              </div>
            );
          }
        }

        // CASE 1: 72-Hour Hold Completed -> Dual Party Review ("Is this transaction true or not?")
        if (isReadyForDualReview) {
          const userVote = t.reviewVotes?.[currentUser.id];
          const partnerVote = t.reviewVotes?.[activeFriend.id];
          const hasUserVoted = userVote !== undefined;

          return (
            <div
              key={t.id}
              className="rounded-2xl p-4 bg-gradient-to-r from-purple-900/40 via-indigo-950/50 to-purple-950/40 border border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.2)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-purple-300">
                      72-Hour Hold Ended • Verification Required
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-0.5">
                    Is "{t.title}" ({formatMoney(t.amount, currency)}) true or false?
                  </h4>
                  <p className="text-xs text-purple-200/80 mt-1">
                    Both parties must confirm. If both say <strong className="text-emerald-400">True</strong>, it will be recorded into the ledger. If either says <strong className="text-rose-400">False</strong>, it is discarded.
                  </p>

                  {/* Voting status indicators */}
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span>You ({currentUser.name.split(' ')[0]}):</span>
                      {userVote === true ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> True
                        </span>
                      ) : userVote === false ? (
                        <span className="text-rose-400 font-bold flex items-center gap-0.5">
                          <XCircle className="w-3.5 h-3.5" /> False
                        </span>
                      ) : (
                        <span className="text-amber-400 font-semibold italic">Waiting for your vote</span>
                      )}
                    </span>

                    <span className="flex items-center gap-1.5 font-medium">
                      <span>{partnerName}:</span>
                      {partnerVote === true ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> True
                        </span>
                      ) : partnerVote === false ? (
                        <span className="text-rose-400 font-bold flex items-center gap-0.5">
                          <XCircle className="w-3.5 h-3.5" /> False
                        </span>
                      ) : (
                        <span className="text-slate-400 font-semibold italic">Pending</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vote Buttons (if current user hasn't voted yet) */}
              {!hasUserVoted ? (
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('success');
                      onVoteReview(t.id, true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>It is True</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('error');
                      onVoteReview(t.id, false);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/25 active:scale-95 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4 stroke-[3]" />
                    <span>It is False</span>
                  </button>
                </div>
              ) : (
                <div className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-xs font-semibold text-purple-200 shrink-0 self-end sm:self-center">
                  Vote recorded! Waiting for {partnerName}
                </div>
              )}
            </div>
          );
        }

        // CASE 2: Transaction is ON HOLD (Locked for 72 hours)
        if (t.approvalStatus === 'on_hold') {
          const lockDateString = formatLockDate(t.lockedUntil);

          return (
            <div
              key={t.id}
              className="rounded-2xl p-4 bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/40 text-amber-900 dark:text-amber-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      🔒 Transaction On Hold (72h Lock)
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    "{t.title}" ({formatMoney(t.amount, currency)}) was denied and is on hold.
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Locked on hold until <strong className="font-bold text-amber-700 dark:text-amber-300">{lockDateString}</strong>.
                    It will not affect the ledger balance during this lock. After 72 hours, both parties will be asked if it is true.
                  </p>
                </div>
              </div>

              {/* Fast Forward 72h Test Button */}
              {onFastForwardHold && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    onFastForwardHold(t.id);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs font-bold shrink-0 self-end sm:self-center transition-all cursor-pointer"
                  title="Simulate 72 hours passing for instant testing"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>Fast-Forward 72h (Test)</span>
                </button>
              )}
            </div>
          );
        }

        // CASE 3: Transaction is PENDING APPROVAL
        if (t.approvalStatus === 'pending_approval') {
          // If respondent is current user: needs to Accept or Deny
          if (isRespondent) {
            const requester = t.approvalRequestedBy === activeFriend.id ? partnerName : 'Your friend';

            return (
              <div
                key={t.id}
                className="rounded-2xl p-4 bg-gradient-to-r from-cyan-500/15 via-teal-500/10 to-emerald-500/15 border border-cyan-400/50 dark:border-cyan-500/40 shadow-[0_0_20px_rgba(56,189,248,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-900 dark:text-white"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-[#0284c7] dark:text-cyan-400 border border-cyan-500/40 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertCircle className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#0284c7] dark:text-cyan-300">
                      Action Required • Transaction Approval
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                      {requester} recorded "{t.title}" for {formatMoney(t.amount, currency)}. Is this correct?
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {t.note ? `Note: "${t.note}" • ` : ''}
                      Accepting records this into your shared ledger. Denying places it on a 72-hour hold.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('success');
                      triggerConfetti();
                      onAccept(t.id);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Accept</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('error');
                      onDeny(t.id);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4 stroke-[3]" />
                    <span>Deny (Hold 72h)</span>
                  </button>
                </div>
              </div>
            );
          }

          // If requester is current user: show waiting state
          if (isRequester) {
            return (
              <div
                key={t.id}
                className="rounded-2xl p-3.5 bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-500/30 flex items-center justify-between gap-3 text-xs text-slate-700 dark:text-slate-300"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                  <span>
                    Awaiting approval from <strong>{partnerName}</strong> for "{t.title}" ({formatMoney(t.amount, currency)}).
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                  Ask your friend {partnerName} to approve this transaction
                </span>
              </div>
            );
          }
        }

        return null;
      })}
    </div>
  );
};
