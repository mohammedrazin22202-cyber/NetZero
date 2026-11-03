import { Currency, Transaction, UserProfile } from '../types';

export function formatMoney(amount: number, currency: Currency): string {
  const formatted = Math.abs(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency.symbol}${formatted}`;
}

export interface BalanceSummary {
  netBalance: number; // Positive: friend owes activeUser; Negative: activeUser owes friend
  owedToActiveUser: number; // Total pending amount friend owes
  owedByActiveUser: number; // Total pending amount activeUser owes
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
    }

    if (t.paidBy === activeUserId) {
      // Active user paid, friend owes activeUser
      netBalance += t.payerOwedAmount;
      owedToActiveUser += t.payerOwedAmount;
    } else if (t.paidBy === friendId) {
      // Friend paid, active user owes friend
      netBalance -= t.payerOwedAmount;
      owedByActiveUser += t.payerOwedAmount;
    }
  }

  return {
    netBalance: Math.round(netBalance * 100) / 100,
    owedToActiveUser: Math.round(owedToActiveUser * 100) / 100,
    owedByActiveUser: Math.round(owedByActiveUser * 100) / 100,
    settledTotal: Math.round(settledTotal * 100) / 100,
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

  if (netBalance > 0) {
    text += `💰 *You currently owe me:* ${formatMoney(netBalance, currency)}\n`;
  } else if (netBalance < 0) {
    text += `💰 *I currently owe you:* ${formatMoney(Math.abs(netBalance), currency)}\n`;
  } else {
    text += `🎉 *We are completely all settled up!* Balance is $0.00.\n`;
  }

  if (recentTransactions.length > 0) {
    text += `\n*Recent activity:*\n`;
    recentTransactions.slice(0, 3).forEach((t) => {
      const payerName = t.paidBy === activeUser.id ? 'You' : friend.name;
      text += `• ${t.title} (${formatMoney(t.amount, currency)}) - paid by ${payerName}\n`;
    });
  }

  if (activeUser.upiId && netBalance > 0) {
    text += `\n💳 *Settle via UPI:* ${activeUser.upiId}\n`;
  } else if (activeUser.paypalUser && netBalance > 0) {
    text += `\n💳 *Settle via PayPal:* https://paypal.me/${activeUser.paypalUser}/${netBalance}\n`;
  }

  text += `\nSent via NetZero ⚡`;
  return encodeURIComponent(text);
}

export function formatDate(dateString: string): string {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return dateString;
  }
}
