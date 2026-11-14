# ⚡ NetZero

> A futuristic, zero-friction expense splitter and financial balancer with bioluminescent neon glassmorphic design. Split, track, and balance shared expenses down to net zero!

![NetZero Dashboard Preview](public/preview.png)

Never let forgotten loans or awkward *"hey, did you ever pay me back for that?"* conversations happen again.

---

## ✨ Features

- **🎯 Futuristic Neon Glassmorphic UI**:
  - Deep midnight canvas with ambient bioluminescent 3D neon glass ribbons and fluid glowing wave contours.
  - Isometric 3D glowing glass wallet artwork with ambient purple/cyan specular highlights.
  - Claymorphic action buttons with tactile beveling and intense cyan bloom.
- **📊 Real-Time Financial Overview**:
  - **Net Balance Hero Card**: Clear indication of balance in your favor or owed, with quick insight tooltips.
  - **2×2 Quick Metrics**: Real-time totals for *You Lent*, *Settled*, *You Borrowed*, and *Total Transactions*.
  - **Spending Overview Donut Chart**: High-contrast neon donut breakdown across Food & Dining, Entertainment, and Transport.
  - **Monthly Comparison Bar Chart**: Dual 3D glass pill bars comparing current vs. previous month spending with percentage delta badges.
- **⚡ 1-Tap Quick Actions**:
  - `⊕ Add Expense`: Custom or itemized expense logging with instant share calculation.
  - `👥 Split Bill`: 50/50 equal splits with receipt notes.
  - `✓ Record Payment`: Record offline or cash transfers.
  - `⇄ Settle Up`: One-tap balance clearing and instant WhatsApp ping generation.
  - `🎚 Custom Split`: Percentage or itemized split per friend.
- **👥 Multi-Friend Ledger**:
  - Switch ledgers seamlessly between friends.
  - Add new friends with custom payment IDs (UPI, PayPal, Venmo).
- **⌨️ Power Keyboard Shortcuts**:
  - `Ctrl + K`: Quick search across friends, expenses, and notes.
  - `N`: Open new expense logger.
  - `S`: Trigger instant settle up modal.
  - `P`: Toggle active perspective between friends.
  - `T`: Toggle light / dark mode.
  - `?`: Open keyboard shortcuts cheat sheet.
- **💾 Offline & Privacy First**:
  - Runs 100% locally in your browser with LocalStorage.
  - Complete data privacy with zero external telemetry.
  - Full CSV export and JSON backup/restore capabilities.

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Build for production
npm run build
```

Then open `http://localhost:5173` in your browser.

---

## 🛠 Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom neon color palettes, claymorphic lighting, and glow filters
- **Icons**: [Lucide React](https://lucide.dev/)
- **Typography**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)
