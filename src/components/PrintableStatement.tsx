import React from 'react';
import { AppState, Category, Transaction } from '../types';
import { CATEGORIES } from '../utils/categories';
import { calculateBalance, formatDate, formatMoney } from '../utils/formatters';

interface PrintableStatementProps {
  state: AppState;
}

export interface TAccountLine {
  label: string;
  sublabel?: string;
  amount: number;
  isHighlight?: 'positive' | 'negative' | 'neutral';
}

export interface LedgerRow {
  tx: Transaction;
  approved: boolean;
  settlement: boolean;
  drAmt: number;
  crAmt: number;
  runningBal: number;
}

const EXCEL_COL_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

export function isApprovedTx(t: Transaction): boolean {
  return (
    t.approvalStatus !== 'pending_approval' &&
    t.approvalStatus !== 'on_hold' &&
    t.approvalStatus !== 'disputed_review' &&
    t.approvalStatus !== 'rejected'
  );
}

export function isSettlementTx(t: Transaction): boolean {
  return Boolean(t.isSettlement || t.category === 'settlement' || t.type === 'settlement');
}

export function isLoanTx(t: Transaction): boolean {
  return Boolean(t.isLoan || t.category === 'loan' || t.type === 'loan');
}

export function getTxStatusLabel(t: Transaction): string {
  if (!t.approvalStatus || t.approvalStatus === 'approved') return 'Approved';
  if (t.approvalStatus === 'pending_approval') return 'Pending';
  if (t.approvalStatus === 'on_hold') return 'On Hold';
  if (t.approvalStatus === 'disputed_review') return 'Review';
  return 'Rejected';
}

export function computeStatementData(state: AppState) {
  const activeUser = state.activeUserId === state.user1.id ? state.user1 : state.user2;
  const friend = state.activeUserId === state.user1.id ? state.user2 : state.user1;
  const activeName = activeUser.name.split(' ')[0] || 'You';
  const friendName = friend.name.split(' ')[0] || 'Friend';

  const validTxs = state.transactions.filter(isApprovedTx);
  const { netBalance, owedToActiveUser, owedByActiveUser, settledTotal } = calculateBalance(
    state.transactions,
    activeUser.id,
    friend.id
  );

  let totalGroupExpenses = 0;
  let expensesPaidByYou = 0;
  let expensesPaidByFriend = 0;
  let totalYourExpenseShare = 0;
  let totalFriendExpenseShare = 0;
  let loansGiven = 0;
  let loansTaken = 0;
  let settlementsPaidByYou = 0;
  let settlementsReceivedFromFriend = 0;

  const yourShareByCategory: Partial<Record<Category, number>> = {};
  const paidByYouByCategory: Partial<Record<Category, number>> = {};

  for (const t of validTxs) {
    if (isSettlementTx(t)) {
      if (t.paidBy === activeUser.id) settlementsPaidByYou += t.amount;
      else if (t.paidBy === friend.id) settlementsReceivedFromFriend += t.amount;
      continue;
    }

    if (isLoanTx(t)) {
      if (t.paidBy === activeUser.id) loansGiven += t.payerOwedAmount;
      else if (t.paidBy === friend.id) loansTaken += t.payerOwedAmount;
      continue;
    }

    totalGroupExpenses += t.amount;
    if (t.paidBy === activeUser.id) {
      expensesPaidByYou += t.amount;
      const yourShare = t.amount - t.payerOwedAmount;
      const friendShare = t.payerOwedAmount;
      totalYourExpenseShare += yourShare;
      totalFriendExpenseShare += friendShare;
      if (yourShare > 0.001) {
        yourShareByCategory[t.category] = (yourShareByCategory[t.category] || 0) + yourShare;
      }
      paidByYouByCategory[t.category] = (paidByYouByCategory[t.category] || 0) + t.amount;
    } else if (t.paidBy === friend.id) {
      expensesPaidByFriend += t.amount;
      const yourShare = t.payerOwedAmount;
      const friendShare = t.amount - t.payerOwedAmount;
      totalYourExpenseShare += yourShare;
      totalFriendExpenseShare += friendShare;
      if (yourShare > 0.001) {
        yourShareByCategory[t.category] = (yourShareByCategory[t.category] || 0) + yourShare;
      }
    }
  }

  const drLines: TAccountLine[] = [];
  const crLines: TAccountLine[] = [];

  const sortedShareCats = Object.entries(yourShareByCategory)
    .map(([cat, amt]) => ({ cat: cat as Category, amt: amt || 0 }))
    .filter((x) => x.amt > 0.001)
    .sort((a, b) => b.amt - a.amt);

  if (sortedShareCats.length > 0) {
    for (const item of sortedShareCats) {
      drLines.push({
        label: `To ${CATEGORIES[item.cat]?.label || item.cat}`,
        sublabel: `${activeName}'s Share`,
        amount: item.amt,
      });
    }
  } else {
    drLines.push({ label: 'To Shared Expenses (Share)', amount: 0 });
  }

  if (loansTaken > 0.001) {
    drLines.push({ label: 'To Cash Loans Borrowed', sublabel: `From ${friendName}`, amount: loansTaken });
  }
  if (settlementsReceivedFromFriend > 0.001) {
    drLines.push({
      label: 'To Settlements Received',
      sublabel: `Paid by ${friendName}`,
      amount: settlementsReceivedFromFriend,
    });
  }

  const sortedPaidCats = Object.entries(paidByYouByCategory)
    .map(([cat, amt]) => ({ cat: cat as Category, amt: amt || 0 }))
    .filter((x) => x.amt > 0.001)
    .sort((a, b) => b.amt - a.amt);

  if (sortedPaidCats.length > 0) {
    for (const item of sortedPaidCats) {
      crLines.push({
        label: `By ${CATEGORIES[item.cat]?.label || item.cat}`,
        sublabel: `Paid by ${activeName}`,
        amount: item.amt,
      });
    }
  } else {
    crLines.push({ label: `By Direct Outlays Paid by ${activeName}`, amount: 0 });
  }

  if (loansGiven > 0.001) {
    crLines.push({ label: 'By Cash Loans Advanced', sublabel: `Lent to ${friendName}`, amount: loansGiven });
  }
  if (settlementsPaidByYou > 0.001) {
    crLines.push({
      label: 'By Settlements Paid',
      sublabel: `Paid to ${friendName}`,
      amount: settlementsPaidByYou,
    });
  }

  if (netBalance > 0.005) {
    drLines.push({
      label: 'To Net Receivable Balance c/d',
      sublabel: `${friendName} owes ${activeName}`,
      amount: netBalance,
      isHighlight: 'positive',
    });
  } else if (netBalance < -0.005) {
    crLines.push({
      label: 'By Net Payable Balance c/d',
      sublabel: `${activeName} owes ${friendName}`,
      amount: Math.abs(netBalance),
      isHighlight: 'negative',
    });
  }

  const maxTAccountRows = Math.max(drLines.length, crLines.length);
  const totalDr = drLines.reduce((sum, l) => sum + l.amount, 0);
  const totalCr = crLines.reduce((sum, l) => sum + l.amount, 0);

  const chronologicalTxs = [...state.transactions].sort((a, b) => {
    const dateDiff = (a.date || '').localeCompare(b.date || '');
    if (dateDiff !== 0) return dateDiff;
    return (a.createdAt || 0) - (b.createdAt || 0);
  });

  const periodStart = chronologicalTxs.length > 0 ? formatDate(chronologicalTxs[0].date) : '—';
  const periodEnd =
    chronologicalTxs.length > 0
      ? formatDate(chronologicalTxs[chronologicalTxs.length - 1].date)
      : '—';

  let runningBal = 0;
  let totalDrLedger = 0;
  let totalCrLedger = 0;
  let totalGrossLedger = 0;

  const ledgerRows: LedgerRow[] = chronologicalTxs.map((tx) => {
    const approved = isApprovedTx(tx);
    const settlement = isSettlementTx(tx);
    let drAmt = 0;
    let crAmt = 0;

    if (approved) {
      totalGrossLedger += tx.amount;
      if (settlement) {
        if (tx.paidBy === activeUser.id) {
          crAmt = tx.amount;
          runningBal += tx.amount;
        } else if (tx.paidBy === friend.id) {
          drAmt = tx.amount;
          runningBal -= tx.amount;
        }
      } else {
        if (tx.paidBy === activeUser.id) {
          crAmt = tx.payerOwedAmount;
          runningBal += tx.payerOwedAmount;
        } else if (tx.paidBy === friend.id) {
          drAmt = tx.payerOwedAmount;
          runningBal -= tx.payerOwedAmount;
        }
      }
      totalDrLedger += drAmt;
      totalCrLedger += crAmt;
    }

    return {
      tx,
      approved,
      settlement,
      drAmt,
      crAmt,
      runningBal: Math.round(runningBal * 100) / 100,
    };
  });

  return {
    activeUser,
    friend,
    activeName,
    friendName,
    validTxs,
    netBalance,
    owedToActiveUser,
    owedByActiveUser,
    settledTotal,
    totalGroupExpenses,
    expensesPaidByYou,
    expensesPaidByFriend,
    totalYourExpenseShare,
    totalFriendExpenseShare,
    drLines,
    crLines,
    maxTAccountRows,
    totalDr,
    totalCr,
    periodStart,
    periodEnd,
    ledgerRows,
    totalDrLedger,
    totalCrLedger,
    totalGrossLedger,
  };
}

export const PrintableStatement: React.FC<PrintableStatementProps> = ({ state }) => {
  const d = computeStatementData(state);
  let excelRowNum = 1;

  return (
    <div
      id="printable-excel-statement"
      className="hidden print:block bg-white text-slate-900 font-sans text-[10px] leading-tight w-full"
    >
      {/* Top Workbook Bar */}
      <div className="border border-slate-400 bg-slate-100 px-2.5 py-1.5 flex items-center justify-between text-[10px] mb-2">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 bg-[#166534] text-white font-bold rounded-sm text-[9px] tracking-wider">
            XLSX
          </span>
          <span className="font-mono text-slate-700">
            fx =SUM(CREDITS) - SUM(DEBITS) =&gt;{' '}
            <strong className="text-slate-900">
              {d.netBalance >= 0 ? '+' : '-'}
              {formatMoney(Math.abs(d.netBalance), state.currency)}
            </strong>
          </span>
        </div>
        <div className="text-slate-600 font-medium">
          Sheet: <strong className="text-slate-900">Trading &amp; P&amp;L</strong> • Generated{' '}
          {new Date().toLocaleDateString(undefined, { dateStyle: 'medium' })}
        </div>
      </div>

      {/* Unified 9-Column Excel Sheet Grid */}
      <table className="w-full border-collapse border border-slate-400 text-[9.5px]">
        <thead>
          <tr className="bg-slate-200 text-slate-600 font-bold text-[9px]">
            <th className="border border-slate-400 w-7 py-0.5 text-center bg-slate-300" />
            {EXCEL_COL_LETTERS.map((col) => (
              <th key={col} className="border border-slate-400 py-0.5 text-center">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Row 1: Title */}
          <tr>
            <td className="border border-slate-400 bg-slate-200 text-center text-[9px] font-bold text-slate-600 py-1.5">
              {excelRowNum++}
            </td>
            <td
              colSpan={9}
              className="border border-slate-400 bg-[#166534] text-white text-center font-bold py-2 text-xs tracking-wide uppercase"
            >
              NETZERO — TRADING &amp; PROFIT &amp; LOSS ACCOUNT ({d.activeUser.name} ↔ {d.friend.name})
            </td>
          </tr>

          {/* Row 2: Metadata */}
          <tr className="bg-emerald-50 text-slate-800">
            <td className="border border-slate-400 bg-slate-200 text-center text-[9px] font-bold text-slate-600 py-1">
              {excelRowNum++}
            </td>
            <td colSpan={4} className="border border-slate-400 px-2 py-1">
              <span className="text-slate-500 font-semibold">Accounting Period: </span>
              <strong>
                {d.periodStart} to {d.periodEnd}
              </strong>
            </td>
            <td colSpan={5} className="border border-slate-400 px-2 py-1 text-right">
              <span className="text-slate-500 font-semibold">Currency: </span>
              <strong>
                {state.currency.code} ({state.currency.symbol})
              </strong>{' '}
              • Basis: Approved ({d.validTxs.length}/{state.transactions.length})
            </td>
          </tr>

          {/* Row 3: T-Account Column Headers */}
          <tr className="bg-slate-100 font-bold text-slate-900">
            <td className="border border-slate-400 bg-slate-200 text-center text-[9px] text-slate-600 py-1">
              {excelRowNum++}
            </td>
            <td colSpan={3} className="border border-slate-400 px-2 py-1">
              Dr. &nbsp; Particulars (Expenses / Shares / Borrowings)
            </td>
            <td className="border border-slate-400 px-2 py-1 text-right whitespace-nowrap">
              Amount ({state.currency.symbol})
            </td>
            <td colSpan={4} className="border border-slate-400 px-2 py-1 border-l-2 border-l-slate-600">
              Cr. &nbsp; Particulars (Outlays Paid / Loans / Credits)
            </td>
            <td className="border border-slate-400 px-2 py-1 text-right whitespace-nowrap">
              Amount ({state.currency.symbol})
            </td>
          </tr>

          {/* T-Account Body */}
          {Array.from({ length: d.maxTAccountRows }).map((_, idx) => {
            const dr = d.drLines[idx];
            const cr = d.crLines[idx];
            const rowBg = idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white';
            const drHighlight =
              dr?.isHighlight === 'positive' ? 'bg-emerald-50 font-bold text-emerald-900' : '';
            const crHighlight =
              cr?.isHighlight === 'negative' ? 'bg-rose-50 font-bold text-rose-900' : '';

            return (
              <tr key={idx} className={rowBg}>
                <td className="border border-slate-400 bg-slate-200 text-center text-[9px] font-bold text-slate-600 py-1">
                  {excelRowNum++}
                </td>
                <td colSpan={3} className={`border border-slate-400 px-2 py-1 ${drHighlight}`}>
                  {dr ? (
                    <div className="flex items-center justify-between gap-2">
                      <span>{dr.label}</span>
                      {dr.sublabel && (
                        <span className="text-[8.5px] text-slate-500 font-normal">
                          ({dr.sublabel})
                        </span>
                      )}
                    </div>
                  ) : (
                    <span>&nbsp;</span>
                  )}
                </td>
                <td
                  className={`border border-slate-400 px-2 py-1 text-right font-mono tabular-nums ${drHighlight}`}
                >
                  {dr ? formatMoney(dr.amount, state.currency) : ''}
                </td>
                <td
                  colSpan={4}
                  className={`border border-slate-400 border-l-2 border-l-slate-600 px-2 py-1 ${crHighlight}`}
                >
                  {cr ? (
                    <div className="flex items-center justify-between gap-2">
                      <span>{cr.label}</span>
                      {cr.sublabel && (
                        <span className="text-[8.5px] text-slate-500 font-normal">
                          ({cr.sublabel})
                        </span>
                      )}
                    </div>
                  ) : (
                    <span>&nbsp;</span>
                  )}
                </td>
                <td
                  className={`border border-slate-400 px-2 py-1 text-right font-mono tabular-nums ${crHighlight}`}
                >
                  {cr ? formatMoney(cr.amount, state.currency) : ''}
                </td>
              </tr>
            );
          })}

          {/* T-Account Totals */}
          <tr className="bg-slate-200/80 font-black text-slate-900">
            <td className="border border-slate-400 bg-slate-200 text-center text-[9px] font-bold text-slate-600 py-1.5">
              {excelRowNum++}
            </td>
            <td colSpan={3} className="border border-slate-400 px-2 py-1.5 uppercase">
              Total (Dr.)
            </td>
            <td className="border border-slate-400 px-2 py-1.5 text-right font-mono tabular-nums border-b-4 border-b-double border-slate-800">
              {formatMoney(d.totalDr, state.currency)}
            </td>
            <td colSpan={4} className="border border-slate-400 border-l-2 border-l-slate-600 px-2 py-1.5 uppercase">
              Total (Cr.)
            </td>
            <td className="border border-slate-400 px-2 py-1.5 text-right font-mono tabular-nums border-b-4 border-b-double border-slate-800">
              {formatMoney(d.totalCr, state.currency)}
            </td>
          </tr>

          {/* Spacer Row */}
          <tr>
            <td className="border border-slate-400 bg-slate-200 text-center text-[9px] font-bold text-slate-600 py-1">
              {excelRowNum++}
            </td>
            <td colSpan={9} className="border border-slate-400 bg-white h-2.5" />
          </tr>

          {/* Account Position Summary Header */}
          <tr className="bg-slate-100 font-bold text-slate-700 text-[8.5px] uppercase">
            <td className="border border-slate-400 bg-slate-200 text-center text-[9px] text-slate-600 py-1">
              {excelRowNum++}
            </td>
            <td colSpan={2} className="border border-slate-400 px-2 py-1">
              Total Group Turnover
            </td>
            <td colSpan={2} className="border border-slate-400 px-2 py-1">
              Paid by {d.activeName} / {d.friendName}
            </td>
            <td colSpan={2} className="border border-slate-400 px-2 py-1">
              Gross Lent / Borrowed
            </td>
            <td className="border border-slate-400 px-2 py-1">Settled</td>
            <td colSpan={2} className="border border-slate-400 px-2 py-1 text-right">
              Closing Net Position
            </td>
          </tr>

          {/* Account Position Summary Values */}
          <tr className="bg-white font-semibold">
            <td className="border border-slate-400 bg-slate-200 text-center text-[9px] font-bold text-slate-600 py-1.5">
              {excelRowNum++}
            </td>
            <td colSpan={2} className="border border-slate-400 px-2 py-1.5 font-mono tabular-nums">
              {formatMoney(d.totalGroupExpenses, state.currency)}
              <span className="block text-[8px] font-sans font-normal text-slate-500 mt-0.5">
                Share: {d.activeName} {formatMoney(d.totalYourExpenseShare, state.currency)} •{' '}
                {d.friendName} {formatMoney(d.totalFriendExpenseShare, state.currency)}
              </span>
            </td>
            <td colSpan={2} className="border border-slate-400 px-2 py-1.5 font-mono tabular-nums">
              {formatMoney(d.expensesPaidByYou, state.currency)} /{' '}
              {formatMoney(d.expensesPaidByFriend, state.currency)}
            </td>
            <td colSpan={2} className="border border-slate-400 px-2 py-1.5 font-mono tabular-nums">
              +{formatMoney(d.owedToActiveUser, state.currency)} / -
              {formatMoney(d.owedByActiveUser, state.currency)}
            </td>
            <td className="border border-slate-400 px-2 py-1.5 font-mono tabular-nums">
              {formatMoney(d.settledTotal, state.currency)}
            </td>
            <td
              colSpan={2}
              className={`border border-slate-400 px-2 py-1.5 text-right font-mono font-black tabular-nums ${
                d.netBalance > 0.005
                  ? 'bg-emerald-100 text-emerald-900'
                  : d.netBalance < -0.005
                  ? 'bg-rose-100 text-rose-900'
                  : 'bg-slate-100 text-slate-900'
              }`}
            >
              {d.netBalance > 0.005
                ? `${d.friendName} owes ${d.activeName}: ${formatMoney(d.netBalance, state.currency)}`
                : d.netBalance < -0.005
                ? `${d.activeName} owes ${d.friendName}: ${formatMoney(
                    Math.abs(d.netBalance),
                    state.currency
                  )}`
                : `NET ZERO (${formatMoney(0, state.currency)})`}
            </td>
          </tr>

          {/* Spacer Row */}
          <tr>
            <td className="border border-slate-400 bg-slate-200 text-center text-[9px] font-bold text-slate-600 py-1">
              {excelRowNum++}
            </td>
            <td colSpan={9} className="border border-slate-400 bg-white h-2.5" />
          </tr>

          {/* General Ledger Section Banner */}
          <tr>
            <td className="border border-slate-400 bg-slate-200 text-center text-[9px] font-bold text-slate-600 py-1">
              {excelRowNum++}
            </td>
            <td
              colSpan={9}
              className="border border-slate-400 bg-[#166534] text-white font-bold px-2 py-1.5 uppercase tracking-wide"
            >
              GENERAL LEDGER SCHEDULE — CHRONOLOGICAL TRANSACTIONS &amp; RUNNING BALANCE
            </td>
          </tr>

          {/* General Ledger Column Headers */}
          <tr className="bg-slate-100 text-slate-800 font-bold">
            <td className="border border-slate-400 bg-slate-200 text-center text-[9px] text-slate-600 py-1">
              {excelRowNum++}
            </td>
            <th className="border border-slate-400 px-1.5 py-1 text-left whitespace-nowrap">Date</th>
            <th className="border border-slate-400 px-1.5 py-1 text-left">Particulars</th>
            <th className="border border-slate-400 px-1.5 py-1 text-left">Category</th>
            <th className="border border-slate-400 px-1.5 py-1 text-left">Paid By</th>
            <th className="border border-slate-400 px-1.5 py-1 text-center">Status</th>
            <th className="border border-slate-400 px-1.5 py-1 text-right">Gross</th>
            <th className="border border-slate-400 px-1.5 py-1 text-right">Dr. (You Owe)</th>
            <th className="border border-slate-400 px-1.5 py-1 text-right">Cr. (You Lent)</th>
            <th className="border border-slate-400 px-1.5 py-1 text-right">Running Bal.</th>
          </tr>

          {d.ledgerRows.length === 0 ? (
            <tr>
              <td className="border border-slate-400 bg-slate-200 text-center text-[9px] font-bold text-slate-600 py-2">
                {excelRowNum++}
              </td>
              <td colSpan={9} className="border border-slate-400 px-2 py-3 text-center text-slate-500 italic">
                No transactions recorded in this ledger yet.
              </td>
            </tr>
          ) : (
            d.ledgerRows.map(({ tx, approved, settlement, drAmt, crAmt, runningBal: rowBal }, idx) => {
              const catLabel = CATEGORIES[tx.category]?.label || tx.category;
              const payerName = tx.paidBy === d.activeUser.id ? d.activeName : d.friendName;
              const statusLabel = getTxStatusLabel(tx);
              const rowBg = !approved
                ? 'bg-slate-100/80 text-slate-500 italic'
                : idx % 2 === 1
                ? 'bg-slate-50/70'
                : 'bg-white';

              return (
                <tr key={tx.id} className={rowBg}>
                  <td className="border border-slate-400 bg-slate-200 text-center text-[9px] font-bold text-slate-600 py-1 not-italic">
                    {excelRowNum++}
                  </td>
                  <td className="border border-slate-400 px-1.5 py-1 whitespace-nowrap font-mono">
                    {formatDate(tx.date)}
                  </td>
                  <td className="border border-slate-400 px-1.5 py-1 font-medium">
                    {tx.title}
                    {tx.note && (
                      <span className="block text-[8.5px] text-slate-500 font-normal">
                        {tx.note}
                      </span>
                    )}
                  </td>
                  <td className="border border-slate-400 px-1.5 py-1 capitalize">
                    {settlement ? 'Settlement' : catLabel}
                  </td>
                  <td className="border border-slate-400 px-1.5 py-1">{payerName}</td>
                  <td className="border border-slate-400 px-1.5 py-1 text-center text-[8.5px]">
                    {statusLabel}
                  </td>
                  <td className="border border-slate-400 px-1.5 py-1 text-right font-mono tabular-nums">
                    {formatMoney(tx.amount, state.currency)}
                  </td>
                  <td className="border border-slate-400 px-1.5 py-1 text-right font-mono tabular-nums text-rose-800">
                    {approved && drAmt > 0 ? formatMoney(drAmt, state.currency) : '—'}
                  </td>
                  <td className="border border-slate-400 px-1.5 py-1 text-right font-mono tabular-nums text-emerald-800">
                    {approved && crAmt > 0 ? formatMoney(crAmt, state.currency) : '—'}
                  </td>
                  <td
                    className={`border border-slate-400 px-1.5 py-1 text-right font-mono font-bold tabular-nums ${
                      !approved
                        ? 'text-slate-400'
                        : rowBal > 0.005
                        ? 'text-emerald-900'
                        : rowBal < -0.005
                        ? 'text-rose-900'
                        : 'text-slate-800'
                    }`}
                  >
                    {!approved
                      ? 'Excluded'
                      : `${rowBal > 0 ? '+' : rowBal < 0 ? '-' : ''}${formatMoney(
                          Math.abs(rowBal),
                          state.currency
                        )}`}
                  </td>
                </tr>
              );
            })
          )}

          {/* Ledger Total Row */}
          <tr className="bg-slate-200/80 font-black text-slate-900">
            <td className="border border-slate-400 bg-slate-200 text-center text-[9px] font-bold text-slate-600 py-1.5">
              {excelRowNum++}
            </td>
            <td colSpan={5} className="border border-slate-400 px-2 py-1.5 uppercase">
              Total Approved Ledger (=SUM)
            </td>
            <td className="border border-slate-400 px-1.5 py-1.5 text-right font-mono tabular-nums border-b-4 border-b-double border-slate-800">
              {formatMoney(d.totalGrossLedger, state.currency)}
            </td>
            <td className="border border-slate-400 px-1.5 py-1.5 text-right font-mono tabular-nums text-rose-900 border-b-4 border-b-double border-slate-800">
              {formatMoney(d.totalDrLedger, state.currency)}
            </td>
            <td className="border border-slate-400 px-1.5 py-1.5 text-right font-mono tabular-nums text-emerald-900 border-b-4 border-b-double border-slate-800">
              {formatMoney(d.totalCrLedger, state.currency)}
            </td>
            <td className="border border-slate-400 px-1.5 py-1.5 text-right font-mono tabular-nums border-b-4 border-b-double border-slate-800">
              {d.netBalance > 0 ? '+' : d.netBalance < 0 ? '-' : ''}
              {formatMoney(Math.abs(d.netBalance), state.currency)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Footer Audit Stamp */}
      <div className="mt-2.5 pt-2 border-t border-slate-300 flex items-center justify-between text-[9px] text-slate-500">
        <span>
          NetZero Automated Accounting Statement • Formula Verified: Dr. Total = Cr. Total (
          {formatMoney(d.totalDr, state.currency)})
        </span>
        <span>
          Note: Pending, On-Hold, Disputed, and Rejected entries are excluded from P&amp;L and Closing Balance.
        </span>
      </div>
    </div>
  );
};
