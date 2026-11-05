import { Currency, Transaction, UserProfile } from '../types';

export function formatMoney(amount: number, currency: Currency): string {
  const safeAmount = isNaN(amount) ? 0 : Math.abs(amount);
  const formatted = safeAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency.symbol}${formatted}`;
}

export interface BalanceSummary {
  netBalance: number; // Positive: friend owes activeUser; Negative: activeUser owes friend
  owedToActiveUser: number; // Total amount lent to friend by activeUser (excluding settlements)
  owedByActiveUser: number; // Total amount borrowed from friend by activeUser (excluding settlements)
  settledTotal: number;
}

export function calculateBalance(
  transactions: Transaction[],
  activeUserId: string,
  friendId: string
): BalanceSummary {
  let netBalance = 0;
  let owedToActiveUser = 0;
  let owedByActiveUser = 0;
  let settledTotal = 0;

  for (const t of transactions) {
    if (t.isSettlement) {
      settledTotal += t.amount;
      // When a settlement occurs:
      // If active user paid: active user paid friend to reduce what active user owes
      // => net balance increases (moves from negative toward zero or positive)
      if (t.paidBy === activeUserId) {
        netBalance += t.amount;
      } else if (t.paidBy === friendId) {
        // If friend paid: friend paid active user to reduce what friend owes
        // => net balance decreases (moves from positive toward zero or negative)
        netBalance -= t.amount;
      }
      // Note: settlements do NOT increase "Total Lent" or "Total Borrowed" expenses
    } else {
      // Regular expense:
      if (t.paidBy === activeUserId) {
        // Active user paid upfront, friend owes activeUser
        netBalance += t.payerOwedAmount;
        owedToActiveUser += t.payerOwedAmount;
      } else if (t.paidBy === friendId) {
        // Friend paid upfront, active user owes friend
        netBalance -= t.payerOwedAmount;
        owedByActiveUser += t.payerOwedAmount;
      }
    }
  }

  // Round to 2 decimal places and avoid negative zero (-0)
  const round2 = (num: number) => {
    const val = Math.round(num * 100) / 100;
    return Object.is(val, -0) || Math.abs(val) < 0.005 ? 0 : val;
  };

  return {
    netBalance: round2(netBalance),
    owedToActiveUser: round2(owedToActiveUser),
    owedByActiveUser: round2(owedByActiveUser),
    settledTotal: round2(settledTotal),
  };
}

export function generateWhatsAppMessage(
  netBalance: number,
  activeUser: UserProfile,
  friend: UserProfile,
  currency: Currency,
  recentTransactions: Transaction[]
): string {
  const dateStr = new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  let text = `Hey ${friend.name}! 👋\n`;
  text += `Here is our current balance on NetZero (${dateStr}):\n\n`;

  if (netBalance > 0.005) {
    text += `💰 *You currently owe me:* ${formatMoney(netBalance, currency)}\n`;
  } else if (netBalance < -0.005) {
    text += `💰 *I currently owe you:* ${formatMoney(Math.abs(netBalance), currency)}\n`;
  } else {
    text += `🎉 *We are completely all settled up!* Balance is ${formatMoney(0, currency)}.\n`;
  }

  if (recentTransactions.length > 0) {
    text += `\n*Recent activity:*\n`;
    // Sort recent transactions newest first
    const sorted = [...recentTransactions]
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, 3);

    sorted.forEach((t) => {
      const payerName = t.paidBy === activeUser.id ? 'You' : friend.name;
      text += `• ${t.title} (${formatMoney(t.amount, currency)}) - paid by ${payerName}\n`;
    });
  }

  if (netBalance > 0.005) {
    const paymentMethods: string[] = [];
    if (activeUser.upiId) {
      paymentMethods.push(`💳 *UPI:* ${activeUser.upiId}`);
    }
    if (activeUser.paypalUser) {
      paymentMethods.push(
        `💳 *PayPal:* https://paypal.me/${activeUser.paypalUser}/${netBalance.toFixed(2)}`
      );
    }
    if (activeUser.venmoUser) {
      paymentMethods.push(
        `💳 *Venmo:* https://venmo.com/${activeUser.venmoUser}`
      );
    }
    if (paymentMethods.length > 0) {
      text += `\n*Settle Up Details:*\n` + paymentMethods.join('\n') + `\n`;
    }
  }

  text += `\nSent via NetZero ⚡`;
  return encodeURIComponent(text);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'Today';
  try {
    const parts = dateString.split('-').map(Number);
    if (parts.length < 3 || parts.some(isNaN)) return dateString;
    const [year, month, day] = parts;
    const d = new Date(year, month - 1, day);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return dateString;
  }
}

export function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
