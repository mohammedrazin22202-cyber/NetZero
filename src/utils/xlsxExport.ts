import ExcelJS from 'exceljs';
import { AppState } from '../types';
import { CATEGORIES } from './categories';
import { formatDate, formatMoney } from './formatters';
import { computeStatementData, getTxStatusLabel } from '../components/PrintableStatement';

const THIN_GRID_BORDER: Partial<ExcelJS.Border> = {
  style: 'thin',
  color: { argb: 'FF94A3B8' },
};

const MED_DIVIDER_BORDER: Partial<ExcelJS.Border> = {
  style: 'medium',
  color: { argb: 'FF475569' },
};

const DOUBLE_BOTTOM_BORDER: Partial<ExcelJS.Border> = {
  style: 'double',
  color: { argb: 'FF0F172A' },
};

const HEADER_GREEN_BORDER: Partial<ExcelJS.Border> = {
  style: 'thin',
  color: { argb: 'FF14532D' },
};

function solidFill(argb: string): ExcelJS.Fill {
  return {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb },
  };
}

function styleRange(
  row: ExcelJS.Row,
  startCol: number,
  endCol: number,
  apply: (cell: ExcelJS.Cell, col: number) => void
) {
  for (let col = startCol; col <= endCol; col++) {
    apply(row.getCell(col), col);
  }
}

export async function buildXlsxWorkbook(state: AppState): Promise<ArrayBuffer> {
  const d = computeStatementData(state);
  const c = state.currency;
  const sym = c.symbol.replace(/"/g, '');
  const fmtMoney = `"${sym}"#,##0.00;"-${sym}"#,##0.00;"${sym}"0.00`;
  const fmtSignedMoney = `"+${sym}"#,##0.00;"-${sym}"#,##0.00;"${sym}"0.00`;
  const generatedStr = new Date().toLocaleDateString(undefined, { dateStyle: 'medium' });

  const wb = new ExcelJS.Workbook();
  wb.creator = 'NetZero';
  wb.created = new Date();

  const ws = wb.addWorksheet('Trading & P&L', {
    views: [{ showGridLines: true }],
    pageSetup: {
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      paperSize: 9, // A4
      margins: { left: 0.35, right: 0.35, top: 0.45, bottom: 0.45, header: 0.25, footer: 0.25 },
    },
  });

  const longestDesc = d.ledgerRows.reduce((max, row) => {
    const desc = row.tx.note ? `${row.tx.title} — ${row.tx.note}` : row.tx.title;
    return Math.max(max, desc.length);
  }, 34);
  const col2Width = Math.min(54, Math.max(36, longestDesc + 4));

  ws.columns = [
    { key: 'a', width: 14 },
    { key: 'b', width: col2Width },
    { key: 'c', width: 20 },
    { key: 'd', width: 16 },
    { key: 'e', width: 14 },
    { key: 'f', width: 15 },
    { key: 'g', width: 16 },
    { key: 'h', width: 16 },
    { key: 'i', width: 18 },
  ];

  let r = 1;

  // --------------------------------------------------------------------------
  // 1. Top Formula Strip (matches PDF header strip)
  // --------------------------------------------------------------------------
  const fxRow = ws.getRow(r);
  fxRow.height = 22;
  ws.mergeCells(r, 1, r, 4);
  ws.mergeCells(r, 5, r, 9);
  const netPrefix = d.netBalance >= 0 ? '+' : '-';
  fxRow.getCell(1).value = `XLSX   fx =SUM(CREDITS) - SUM(DEBITS) => ${netPrefix}${formatMoney(
    Math.abs(d.netBalance),
    c
  )}`;
  fxRow.getCell(5).value = `Sheet: Trading & P&L   •   Generated ${generatedStr}`;
  styleRange(fxRow, 1, 9, (cell, col) => {
    cell.fill = solidFill('FFF1F5F9');
    cell.border = {
      top: THIN_GRID_BORDER,
      bottom: THIN_GRID_BORDER,
      left: col === 1 ? THIN_GRID_BORDER : undefined,
      right: col === 9 ? THIN_GRID_BORDER : undefined,
    };
    cell.font = { name: 'Calibri', size: 10, bold: col === 1, color: { argb: 'FF334155' } };
    cell.alignment = {
      vertical: 'middle',
      horizontal: col >= 5 ? 'right' : 'left',
      indent: col === 1 ? 1 : 0,
    };
  });
  r += 1;

  // Small spacer
  ws.getRow(r).height = 7;
  r += 1;

  // --------------------------------------------------------------------------
  // 2. Trading & Profit & Loss Banner + Metadata Bar
  // --------------------------------------------------------------------------
  const titleRow = ws.getRow(r);
  titleRow.height = 28;
  ws.mergeCells(r, 1, r, 9);
  titleRow.getCell(1).value = `NETZERO — TRADING & PROFIT & LOSS ACCOUNT (${d.activeUser.name} ↔ ${d.friend.name})`;
  styleRange(titleRow, 1, 9, (cell) => {
    cell.fill = solidFill('FF166534');
    cell.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: HEADER_GREEN_BORDER,
      bottom: HEADER_GREEN_BORDER,
      left: HEADER_GREEN_BORDER,
      right: HEADER_GREEN_BORDER,
    };
  });
  r += 1;

  const metaRow = ws.getRow(r);
  metaRow.height = 22;
  ws.mergeCells(r, 1, r, 4);
  ws.mergeCells(r, 5, r, 9);
  metaRow.getCell(1).value = `Accounting Period: ${d.periodStart} to ${d.periodEnd}`;
  metaRow.getCell(5).value = `Currency: ${c.code} (${c.symbol})   •   Basis: Approved (${d.validTxs.length}/${state.transactions.length})`;
  styleRange(metaRow, 1, 9, (cell, col) => {
    cell.fill = solidFill('FFECFDF5');
    cell.font = { name: 'Calibri', size: 10, bold: col === 1, color: { argb: 'FF0F172A' } };
    cell.border = {
      top: THIN_GRID_BORDER,
      bottom: THIN_GRID_BORDER,
      left: THIN_GRID_BORDER,
      right: THIN_GRID_BORDER,
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: col >= 5 ? 'right' : 'left',
      indent: col === 1 ? 1 : 0,
    };
  });
  r += 1;

  // --------------------------------------------------------------------------
  // 3. T-Account Table (Dr. | Cr.)
  // --------------------------------------------------------------------------
  const tHeadRow = ws.getRow(r);
  tHeadRow.height = 23;
  ws.mergeCells(r, 1, r, 3);
  ws.mergeCells(r, 5, r, 8);
  tHeadRow.getCell(1).value = 'Dr.   Particulars (Expenses / Shares / Borrowings)';
  tHeadRow.getCell(4).value = `Amount (${c.symbol})`;
  tHeadRow.getCell(5).value = 'Cr.   Particulars (Outlays Paid / Loans / Credits)';
  tHeadRow.getCell(9).value = `Amount (${c.symbol})`;
  styleRange(tHeadRow, 1, 9, (cell, col) => {
    cell.fill = solidFill('FFF1F5F9');
    cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FF0F172A' } };
    cell.border = {
      top: THIN_GRID_BORDER,
      bottom: THIN_GRID_BORDER,
      left: col === 5 ? MED_DIVIDER_BORDER : THIN_GRID_BORDER,
      right: THIN_GRID_BORDER,
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: col === 4 || col === 9 ? 'right' : 'left',
      indent: col === 1 || col === 5 ? 1 : 0,
    };
  });
  r += 1;

  const tStartRow = r;
  for (let idx = 0; idx < d.maxTAccountRows; idx++) {
    const dr = d.drLines[idx];
    const cr = d.crLines[idx];
    const isZebra = idx % 2 === 1;
    const baseBg = isZebra ? 'FFF8FAFC' : 'FFFFFFFF';

    const drText = dr ? (dr.sublabel ? `${dr.label} (${dr.sublabel})` : dr.label) : '';
    const crText = cr ? (cr.sublabel ? `${cr.label} (${cr.sublabel})` : cr.label) : '';

    const row = ws.getRow(r);
    row.height = drText.length > 48 || crText.length > 44 ? 30 : 22;
    ws.mergeCells(r, 1, r, 3);
    ws.mergeCells(r, 5, r, 8);

    row.getCell(1).value = drText;
    if (dr) row.getCell(4).value = Number(dr.amount.toFixed(2));
    row.getCell(5).value = crText;
    if (cr) row.getCell(9).value = Number(cr.amount.toFixed(2));

    const drPos = dr?.isHighlight === 'positive';
    const crNeg = cr?.isHighlight === 'negative';

    styleRange(row, 1, 4, (cell, col) => {
      cell.fill = solidFill(drPos ? 'FFDCFCE7' : baseBg);
      cell.font = {
        name: 'Calibri',
        size: 10.5,
        bold: drPos,
        color: { argb: drPos ? 'FF14532D' : 'FF0F172A' },
      };
      cell.border = {
        top: THIN_GRID_BORDER,
        bottom: THIN_GRID_BORDER,
        left: THIN_GRID_BORDER,
        right: THIN_GRID_BORDER,
      };
      if (col === 4) {
        cell.numFmt = fmtMoney;
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      } else {
        cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1, wrapText: true };
      }
    });

    styleRange(row, 5, 9, (cell, col) => {
      cell.fill = solidFill(crNeg ? 'FFFFE4E6' : baseBg);
      cell.font = {
        name: 'Calibri',
        size: 10.5,
        bold: crNeg,
        color: { argb: crNeg ? 'FF881337' : 'FF0F172A' },
      };
      cell.border = {
        top: THIN_GRID_BORDER,
        bottom: THIN_GRID_BORDER,
        left: col === 5 ? MED_DIVIDER_BORDER : THIN_GRID_BORDER,
        right: THIN_GRID_BORDER,
      };
      if (col === 9) {
        cell.numFmt = fmtMoney;
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
      } else {
        cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1, wrapText: true };
      }
    });

    r += 1;
  }
  const tEndRow = r - 1;

  // T-Account Totals Row (Double Underline)
  const tTotalRow = ws.getRow(r);
  tTotalRow.height = 24;
  ws.mergeCells(r, 1, r, 3);
  ws.mergeCells(r, 5, r, 8);
  tTotalRow.getCell(1).value = 'TOTAL (Dr.)';
  tTotalRow.getCell(4).value = {
    formula: `SUM(D${tStartRow}:D${tEndRow})`,
    result: Number(d.totalDr.toFixed(2)),
  };
  tTotalRow.getCell(5).value = 'TOTAL (Cr.)';
  tTotalRow.getCell(9).value = {
    formula: `SUM(I${tStartRow}:I${tEndRow})`,
    result: Number(d.totalCr.toFixed(2)),
  };
  styleRange(tTotalRow, 1, 9, (cell, col) => {
    cell.fill = solidFill('FFE2E8F0');
    cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: 'FF0F172A' } };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF64748B' } },
      bottom: DOUBLE_BOTTOM_BORDER,
      left: col === 5 ? MED_DIVIDER_BORDER : THIN_GRID_BORDER,
      right: THIN_GRID_BORDER,
    };
    if (col === 4 || col === 9) {
      cell.numFmt = fmtMoney;
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
    } else {
      cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    }
  });
  r += 1;

  // Spacer
  ws.getRow(r).height = 10;
  r += 1;

  // --------------------------------------------------------------------------
  // 4. Account Position Summary (Matches PDF 5-Block Layout!)
  // --------------------------------------------------------------------------
  const kpiHeadRow = ws.getRow(r);
  kpiHeadRow.height = 22;
  ws.mergeCells(r, 1, r, 2);
  ws.mergeCells(r, 3, r, 4);
  ws.mergeCells(r, 5, r, 6);
  ws.mergeCells(r, 8, r, 9);
  kpiHeadRow.getCell(1).value = 'TOTAL GROUP TURNOVER';
  kpiHeadRow.getCell(3).value = `PAID BY ${d.activeName.toUpperCase()} / ${d.friendName.toUpperCase()}`;
  kpiHeadRow.getCell(5).value = 'GROSS LENT / BORROWED';
  kpiHeadRow.getCell(7).value = 'SETTLED';
  kpiHeadRow.getCell(8).value = 'CLOSING NET POSITION';
  styleRange(kpiHeadRow, 1, 9, (cell, col) => {
    cell.fill = solidFill('FFF1F5F9');
    cell.font = { name: 'Calibri', size: 9.5, bold: true, color: { argb: 'FF334155' } };
    cell.border = {
      top: THIN_GRID_BORDER,
      bottom: THIN_GRID_BORDER,
      left: THIN_GRID_BORDER,
      right: THIN_GRID_BORDER,
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: col >= 8 ? 'right' : 'left',
      indent: col === 1 || col === 3 || col === 5 || col === 7 ? 1 : 0,
    };
  });
  r += 1;

  const kpiValRow = ws.getRow(r);
  kpiValRow.height = 34;
  ws.mergeCells(r, 1, r, 2);
  ws.mergeCells(r, 3, r, 4);
  ws.mergeCells(r, 5, r, 6);
  ws.mergeCells(r, 8, r, 9);

  kpiValRow.getCell(1).value = `${formatMoney(d.totalGroupExpenses, c)}\nShare: ${
    d.activeName
  } ${formatMoney(d.totalYourExpenseShare, c)} • ${d.friendName} ${formatMoney(
    d.totalFriendExpenseShare,
    c
  )}`;
  kpiValRow.getCell(3).value = `${formatMoney(d.expensesPaidByYou, c)} / ${formatMoney(
    d.expensesPaidByFriend,
    c
  )}`;
  kpiValRow.getCell(5).value = `+${formatMoney(d.owedToActiveUser, c)} / -${formatMoney(
    d.owedByActiveUser,
    c
  )}`;
  kpiValRow.getCell(7).value = Number(d.settledTotal.toFixed(2));
  kpiValRow.getCell(8).value =
    d.netBalance > 0.005
      ? `${d.friendName} owes ${d.activeName}: ${formatMoney(d.netBalance, c)}`
      : d.netBalance < -0.005
      ? `${d.activeName} owes ${d.friendName}: ${formatMoney(Math.abs(d.netBalance), c)}`
      : `NET ZERO (${formatMoney(0, c)})`;

  const closingBg =
    d.netBalance > 0.005 ? 'FFDCFCE7' : d.netBalance < -0.005 ? 'FFFFE4E6' : 'FFF1F5F9';
  const closingFg =
    d.netBalance > 0.005 ? 'FF14532D' : d.netBalance < -0.005 ? 'FF881337' : 'FF0F172A';

  styleRange(kpiValRow, 1, 9, (cell, col) => {
    cell.fill = solidFill(col >= 8 ? closingBg : 'FFFFFFFF');
    cell.font = {
      name: 'Calibri',
      size: 10.5,
      bold: true,
      color: { argb: col >= 8 ? closingFg : 'FF0F172A' },
    };
    cell.border = {
      top: THIN_GRID_BORDER,
      bottom: THIN_GRID_BORDER,
      left: THIN_GRID_BORDER,
      right: THIN_GRID_BORDER,
    };
    if (col === 7) {
      cell.numFmt = fmtMoney;
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
    } else if (col >= 8) {
      cell.alignment = { horizontal: 'right', vertical: 'middle', wrapText: true };
    } else {
      cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1, wrapText: true };
    }
  });
  r += 1;

  // Spacer
  ws.getRow(r).height = 10;
  r += 1;

  // --------------------------------------------------------------------------
  // 5. General Ledger Schedule
  // --------------------------------------------------------------------------
  const ledgerBanner = ws.getRow(r);
  ledgerBanner.height = 24;
  ws.mergeCells(r, 1, r, 9);
  ledgerBanner.getCell(1).value =
    'GENERAL LEDGER SCHEDULE — CHRONOLOGICAL TRANSACTIONS & RUNNING BALANCE';
  styleRange(ledgerBanner, 1, 9, (cell) => {
    cell.fill = solidFill('FF166534');
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    cell.border = {
      top: HEADER_GREEN_BORDER,
      bottom: HEADER_GREEN_BORDER,
      left: HEADER_GREEN_BORDER,
      right: HEADER_GREEN_BORDER,
    };
  });
  r += 1;

  const ledgerHead = ws.getRow(r);
  ledgerHead.height = 23;
  const headers = [
    'Date',
    'Particulars',
    'Category',
    'Paid By',
    'Status',
    'Gross',
    'Dr. (You Owe)',
    'Cr. (You Lent)',
    'Running Bal.',
  ];
  headers.forEach((h, i) => {
    const col = i + 1;
    const cell = ledgerHead.getCell(col);
    cell.value = h;
    cell.fill = solidFill('FFF1F5F9');
    cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0F172A' } };
    cell.border = {
      top: THIN_GRID_BORDER,
      bottom: THIN_GRID_BORDER,
      left: THIN_GRID_BORDER,
      right: THIN_GRID_BORDER,
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: col === 5 ? 'center' : col >= 6 ? 'right' : 'left',
      indent: col <= 4 ? 1 : 0,
    };
  });
  r += 1;

  const ledgerStartRow = r;
  if (d.ledgerRows.length === 0) {
    const emptyRow = ws.getRow(r);
    emptyRow.height = 24;
    ws.mergeCells(r, 1, r, 9);
    emptyRow.getCell(1).value = 'No transactions recorded in this ledger yet.';
    styleRange(emptyRow, 1, 9, (cell) => {
      cell.fill = solidFill('FFF8FAFC');
      cell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF64748B' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: THIN_GRID_BORDER,
        bottom: THIN_GRID_BORDER,
        left: THIN_GRID_BORDER,
        right: THIN_GRID_BORDER,
      };
    });
    r += 1;
  } else {
    d.ledgerRows.forEach(({ tx, approved, settlement, drAmt, crAmt, runningBal }, idx) => {
      const catLabel = settlement ? 'Settlement' : CATEGORIES[tx.category]?.label || tx.category;
      const payerName = tx.paidBy === d.activeUser.id ? d.activeName : d.friendName;
      const statusLabel = getTxStatusLabel(tx);
      const desc = tx.note ? `${tx.title}\n${tx.note}` : tx.title;
      const isZebra = idx % 2 === 1;
      const rowBg = !approved ? 'FFF1F5F9' : isZebra ? 'FFF8FAFC' : 'FFFFFFFF';

      const row = ws.getRow(r);
      const titleLines = Math.max(1, Math.ceil(tx.title.length / Math.max(24, col2Width - 4)));
      const noteLines = tx.note ? Math.max(1, Math.ceil(tx.note.length / Math.max(24, col2Width - 4))) : 0;
      row.height = Math.max(22, (titleLines + noteLines) * 15 + 6);

      row.getCell(1).value = formatDate(tx.date);
      row.getCell(2).value = desc;
      row.getCell(3).value = catLabel;
      row.getCell(4).value = payerName;
      row.getCell(5).value = statusLabel;
      row.getCell(6).value = Number(tx.amount.toFixed(2));

      if (approved && drAmt > 0) {
        row.getCell(7).value = Number(drAmt.toFixed(2));
      } else {
        row.getCell(7).value = '—';
      }

      if (approved && crAmt > 0) {
        row.getCell(8).value = Number(crAmt.toFixed(2));
      } else {
        row.getCell(8).value = '—';
      }

      if (!approved) {
        row.getCell(9).value = 'Excluded';
      } else {
        row.getCell(9).value = {
          formula: `SUM($H$${ledgerStartRow}:H${r})-SUM($G$${ledgerStartRow}:G${r})`,
          result: Number(runningBal.toFixed(2)),
        };
      }

      styleRange(row, 1, 9, (cell, col) => {
        cell.fill = solidFill(rowBg);
        cell.border = {
          top: THIN_GRID_BORDER,
          bottom: THIN_GRID_BORDER,
          left: THIN_GRID_BORDER,
          right: THIN_GRID_BORDER,
        };

        if (!approved) {
          cell.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF64748B' } };
          cell.alignment = {
            vertical: 'middle',
            horizontal: col === 5 ? 'center' : col >= 6 ? 'right' : 'left',
            indent: col <= 4 ? 1 : 0,
            wrapText: col === 2,
          };
          if (col === 6) cell.numFmt = fmtMoney;
          return;
        }

        if (col <= 5) {
          cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF0F172A' } };
          cell.alignment = {
            vertical: 'middle',
            horizontal: col === 5 ? 'center' : 'left',
            indent: col <= 4 ? 1 : 0,
            wrapText: col === 2,
          };
        } else if (col === 6) {
          cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF0F172A' } };
          cell.numFmt = fmtMoney;
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
        } else if (col === 7) {
          cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF881337' } };
          if (drAmt > 0) cell.numFmt = fmtMoney;
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
        } else if (col === 8) {
          cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF14532D' } };
          if (crAmt > 0) cell.numFmt = fmtMoney;
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
        } else if (col === 9) {
          const balArgb =
            runningBal > 0.005 ? 'FF14532D' : runningBal < -0.005 ? 'FF881337' : 'FF0F172A';
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: balArgb } };
          cell.numFmt = Math.abs(runningBal) < 0.005 ? fmtMoney : fmtSignedMoney;
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
        }
      });

      r += 1;
    });
  }

  const ledgerEndRow = Math.max(ledgerStartRow, r - 1);
  const ledgerTotalRow = r;

  // Ledger Totals Row
  const lTot = ws.getRow(r);
  lTot.height = 24;
  ws.mergeCells(r, 1, r, 5);
  lTot.getCell(1).value = 'TOTAL APPROVED LEDGER (=SUM)';

  if (d.ledgerRows.length > 0) {
    lTot.getCell(6).value = {
      formula: `SUMIF(E${ledgerStartRow}:E${ledgerEndRow},"Approved",F${ledgerStartRow}:F${ledgerEndRow})`,
      result: Number(d.totalGrossLedger.toFixed(2)),
    };
    lTot.getCell(7).value = {
      formula: `SUM(G${ledgerStartRow}:G${ledgerEndRow})`,
      result: Number(d.totalDrLedger.toFixed(2)),
    };
    lTot.getCell(8).value = {
      formula: `SUM(H${ledgerStartRow}:H${ledgerEndRow})`,
      result: Number(d.totalCrLedger.toFixed(2)),
    };
    lTot.getCell(9).value = {
      formula: `H${ledgerTotalRow}-G${ledgerTotalRow}`,
      result: Number(d.netBalance.toFixed(2)),
    };
  } else {
    lTot.getCell(6).value = 0;
    lTot.getCell(7).value = 0;
    lTot.getCell(8).value = 0;
    lTot.getCell(9).value = 0;
  }

  styleRange(lTot, 1, 9, (cell, col) => {
    cell.fill = solidFill('FFE2E8F0');
    const colorArgb = col === 7 ? 'FF881337' : col === 8 ? 'FF14532D' : 'FF0F172A';
    cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: colorArgb } };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF64748B' } },
      bottom: DOUBLE_BOTTOM_BORDER,
      left: THIN_GRID_BORDER,
      right: THIN_GRID_BORDER,
    };
    if (col >= 6) {
      cell.numFmt = col === 9 && Math.abs(d.netBalance) >= 0.005 ? fmtSignedMoney : fmtMoney;
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
    } else {
      cell.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
    }
  });
  r += 1;

  // Footer note
  const footRow = ws.getRow(r);
  footRow.height = 20;
  ws.mergeCells(r, 1, r, 9);
  footRow.getCell(1).value =
    'NetZero Automated Accounting Statement • Note: Pending, On-Hold, Disputed, and Rejected entries are excluded from P&L and Closing Balance.';
  footRow.getCell(1).font = { name: 'Calibri', size: 9.5, italic: true, color: { argb: 'FF64748B' } };
  footRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };

  return await wb.xlsx.writeBuffer();
}
