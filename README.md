# ClearSpend Pro Max — iPhone 13 Pro Max Personal Expense, Budget & Family Transparency App (October 2026)

**ClearSpend Pro Max** is an installable iOS Progressive Web App (PWA) and live widget-enabled personal finance ledger designed specifically for the **iPhone 13 Pro Max (`428 × 926 pt` logical viewport, 6.7" Super Retina XDR display)**.

---

## 1. Direct Use on iPhone 13 Pro Max (Web-Based PWA vs. Native Binary)

- **Immediate Smartphone Use & Home Screen Installation:** Open the live app URL in **Safari** on your iPhone 13 Pro Max, tap **Share (⬆️) → Add to Home Screen**. It installs with a custom app icon and launches in **full-screen standalone iOS mode** (`apple-mobile-web-app-capable="yes"`, no browser address bar or Safari chrome) with full offline support via Service Worker (`sw.js`) and local storage.
- **0-Tap Direct Launch to Today's Spending (`Sat, Oct 10, 2026`):** Unlike traditional finance apps that force you through `Home → Monthly → Daily → Date Picker`, ClearSpend sets `start_url: "/?view=today"` and opens **directly on Today's Spending** with the current date (`2026-10-10`) pre-selected and ready for a 2-tap expense entry.
- **iPhone 13 Pro Max Home Screen Widgets & Quick Actions:**
  1. **Home Screen Icon Long-Press Shortcuts:** Direct deep links to *Today's Spending*, *+ Quick Log Expense*, *Share Family Summary*, and *Monthly Review*.
  2. **Native iOS Scriptable Home Screen Widget (`/api/scriptable-widget.js` & `/api/widget-summary`):** Ready-to-paste Scriptable widget script that renders a live Small (`2×2`) or Medium (`4×2`) widget on your iPhone 13 Pro Max Home Screen showing Today's Spend, Safe Daily Allowance, Remaining Account Balance, and a 1-tap deep link to Today's Ledger.
  3. **Apple Shortcuts 1-Tap URL Logging (`/?quickAdd=1&amount=...`):** Log expenses directly from an iOS Home Screen or Lock Screen Shortcut widget.

---

## 2. Core Features Built for Your Exact Use Case

1. **Direct Today Launch & 3-Second Express Logger (`/?view=today`):**
   - Pre-stamped to Today (`Oct 10, 2026`).
   - **1-Tap Memory Chips** (*Coffee $6.50*, *Groceries $65*, *Lunch $16.50*, *Fuel $45*, *Family $30*, *Pharmacy $18*, *Cash/Tip $5*) + expandable complete recall fields (*Who Was This For*, *Spend Necessity*, *Payment Account*, *Merchant/Store*, *Memory Note*).
2. **"Why Did My Account Hit $0?" Protection:**
   - **Live Account Balance Waterfall:** Tracks `Starting Account Balance ($3,850) − Month Spent = Actual Account Balance Left` alongside your `Monthly Budget` and dynamic **Safe Daily Spend Allowance** for the remaining days of October 2026.
   - **Small "Silent Leaks" (<$15) vs. Big Spendings (≥$75) Analyzer:** Separates micro-spends (coffee, snacks, parking, tips) from regular expenses and major household bills.
   - **Bank Balance "Mystery Gap" Detector:** Enter your real bank balance at any time to immediately spot unlogged spending gaps and reconcile them in 1 tap.
3. **1-Tap Family Sharing & Printable Statement (`/?view=family`):**
   - Share a clean, itemized summary via **iPhone Share Sheet (WhatsApp / iMessage / SMS)**, **1-Tap Copy Text**, **Printable / Save-as-PDF Household Statement Card**, or **CSV / JSON Export**.
   - Filter by *Full Month*, *Today Only*, *Last 7 Days*, *Family/Household Only*, or *Big Spendings*.
4. **Super Easy-to-Remember Habits & Native iOS Reminders (`/?view=widgets`):**
   - **20-Second Evening Recall Checklist:** Guided recognition prompts for the 6 most commonly forgotten daily spend leaks.
   - **Native iPhone Calendar / Reminder Alarm (`/api/reminder.ics`):** Downloads a standard RFC 5545 `.ics` daily recurring alarm for iOS Calendar/Reminders.

---

## 3. Verified & Authentic UI/UX Frameworks Applied

- **Apple Human Interface Guidelines (iOS HIG — 6.7" iPhone 13 Pro Max):** `428×926 pt` geometry, safe-area insets (`47pt` notch, `34pt` home indicator), `≥44×44 pt` minimum touch targets, OLED dark & high-contrast light modes.
- **Jakob Nielsen's 10 Usability Heuristics (Nielsen Norman Group):** *#1 Visibility of System Status* (top financial pulse strip) and *#6 Recognition Rather Than Recall* (1-tap memory chips + 20-second evening recall checklist).
- **Fitts's Law (Paul Fitts, 1954) & Steven Hoober's Mobile Thumb-Zone Research:** High-frequency interactive controls anchored in the bottom one-handed thumb arc (includes an interactive **Thumb-Zone Map overlay** in the toolbar).
- **Hick's Law (1952) & Don Norman's Progressive Disclosure:** 0-tap direct launch to Today + 2-stage progressive form disclosure.
- **Behavioral Economics — Richard Thaler & Daniel Kahneman (Mental Accounting):** Dynamic Safe-to-Spend daily pacing and Micro-Spend Leak isolation.

---

## Running & Testing

```bash
npm start   # Starts server on http://0.0.0.0:3000
npm test    # Runs the 7-part functional & usability verification suite
```
