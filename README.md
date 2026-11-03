# ⚖️ NetZero

> An ultra-fast, zero-friction money tracker designed specifically for best friends who lend, borrow, and split expenses frequently. Get your balance down to net zero!

Never let forgotten loans or awkward *"hey, did you ever pay me back for that?"* conversations happen again.

---

## ⚡ Features

- **🎯 Zero-Mental-Math Hero Dashboard**: One giant number at the top shows exactly who owes whom and by how much (`+ $45.00 Sam owes you` or `- $20.00 You owe Sam`).
- **⚡ 3-Tap Quick Logging**:
  - `I Lent Friend` (100% friend's share)
  - `Split 50/50` (Equal halves)
  - `Friend Paid for Me`
  - `Custom Split`
- **💬 One-Click WhatsApp / Text Ping**: Generates a friendly, casual reminder with full breakdown and settlement links so you never have to feel awkward asking.
- **🤝 Instant Settlement & QR Codes**:
  - Generate instant UPI intent / QR codes.
  - Direct PayPal.me links.
  - Cash / Bank settlement records with instant balance clearing.
- **🔄 Perspective Switcher**: Switch view between *"Alex"* and *"Sam"* in 1-click so both friends can verify balances or use it on either device.
- **📊 Visual Analytics**: Category breakdowns, total shared spend, and upfront payer comparison graphs.
- **🌍 Multi-Currency**: Switch effortlessly between $, ₹, €, £, C$, A$, ¥.
- **💾 Offline & Privacy First**: Runs 100% locally in your browser with LocalStorage. Includes CSV export and JSON backup/restore.
- **📱 PWA Ready**: Install straight to your iOS or Android home screen with zero app store hassle.

---

## 🚀 Running the App Locally

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

## 📱 How to Use on Your Phone

1. Run `npm run dev -- --host` on your computer on the same Wi-Fi.
2. Open the URL on your mobile phone browser (e.g. `http://192.168.x.x:5173`).
3. Tap **Share** (Safari on iOS) or **Menu (⋮)** (Chrome on Android) &rarr; **"Add to Home Screen"**.
4. The app will launch full-screen just like a native app from the App Store!
