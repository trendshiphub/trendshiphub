const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
let QRCode = null;
try {
  QRCode = require('qrcode');
} catch (e) {
  QRCode = null;
}

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.ics': 'text/calendar; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

const CURRENCY_CONFIGS = {
  PKR: { symbol: 'Rs ', code: 'PKR', microMax: 1000, bigMin: 10000, decimals: 0 },
  USD: { symbol: '$', code: 'USD', microMax: 15, bigMin: 75, decimals: 2 },
  AED: { symbol: 'AED ', code: 'AED', microMax: 50, bigMin: 300, decimals: 2 },
  GBP: { symbol: '£', code: 'GBP', microMax: 12, bigMin: 65, decimals: 2 },
  EUR: { symbol: '€', code: 'EUR', microMax: 15, bigMin: 75, decimals: 2 },
  SAR: { symbol: 'SAR ', code: 'SAR', microMax: 50, bigMin: 300, decimals: 2 }
};

function getInitialSeedState(currencyCode = 'PKR') {
  if (currencyCode === 'USD') {
    return {
      version: '2026.10.2',
      currency: '$',
      currencyCode: 'USD',
      currentMonth: '2026-10',
      todayDate: '2026-10-11',
      account: {
        startingBalance: 3850.00,
        monthlyBudget: 2400.00,
        lastReconciledBankBalance: null,
        accountName: 'Primary Checking & Apple Pay'
      },
      reminderSettings: {
        eveningRecallTime: '21:00',
        lowBalanceThreshold: 300,
        microSpendAlertThreshold: 15
      },
      recurringBills: [
        { id: 'rec-u1', title: 'Home Fiber Internet', amount: 65.00, category: 'bills', dayOfMonth: 3, paidThisMonth: true, whoFor: 'Family / Household' },
        { id: 'rec-u2', title: 'Electric & Water Utility', amount: 142.50, category: 'bills', dayOfMonth: 5, paidThisMonth: true, whoFor: 'Family / Household' },
        { id: 'rec-u3', title: 'iCloud+ & Apple One Family', amount: 25.95, category: 'subscriptions', dayOfMonth: 8, paidThisMonth: true, whoFor: 'Family / Household' },
        { id: 'rec-u4', title: 'Mobile Family Plan', amount: 110.00, category: 'bills', dayOfMonth: 18, paidThisMonth: false, whoFor: 'Family / Household' }
      ],
      expenses: [
        { id: 'exp-u1', date: '2026-10-11', time: '09:15', title: 'Iced Oat Latte & Croissant', amount: 9.75, category: 'coffee', necessity: 'want', paymentMethod: 'Apple Pay', merchant: 'Blue Bottle', whoFor: 'Self', note: 'Morning coffee before work' },
        { id: 'exp-u2', date: '2026-10-11', time: '12:30', title: 'Weekend Family Groceries', amount: 118.40, category: 'groceries', necessity: 'need', paymentMethod: 'Debit Card', merchant: 'Whole Foods', whoFor: 'Family / Household', note: 'Weekly produce, milk, chicken & staples' },
        { id: 'exp-u3', date: '2026-10-11', time: '14:10', title: 'Street Parking Meter', amount: 4.50, category: 'transport', necessity: 'need', paymentMethod: 'Apple Pay', merchant: 'ParkMobile', whoFor: 'Family / Household', note: '2h parking downtown' },
        { id: 'exp-u4', date: '2026-10-10', time: '19:40', title: 'Family Takeout Dinner', amount: 64.80, category: 'food', necessity: 'family', paymentMethod: 'Credit Card', merchant: 'Mediterranean Grill', whoFor: 'Family / Household', note: 'Dinner with family' },
        { id: 'exp-u5', date: '2026-10-08', time: '16:30', title: 'Pharmacy & Vitamins', amount: 34.20, category: 'health', necessity: 'need', paymentMethod: 'Debit Card', merchant: 'CVS Pharmacy', whoFor: 'Family / Household', note: 'Home medicine kit' },
        { id: 'exp-u6', date: '2026-10-05', time: '11:00', title: 'Electric & Water Utility Bill', amount: 142.50, category: 'bills', necessity: 'need', paymentMethod: 'Checking Auto-Pay', merchant: 'City Power', whoFor: 'Family / Household', note: 'Monthly utility bill' }
      ]
    };
  }

  return {
    version: '2026.10.2',
    currency: 'Rs ',
    currencyCode: 'PKR',
    currentMonth: '2026-10',
    todayDate: '2026-10-11',
    account: {
      startingBalance: 285000,
      monthlyBudget: 180000,
      lastReconciledBankBalance: null,
      accountName: 'Meezan / SadaPay & Cash'
    },
    reminderSettings: {
      eveningRecallTime: '21:00',
      lowBalanceThreshold: 25000,
      microSpendAlertThreshold: 1000
    },
    recurringBills: [
      { id: 'rec-1', title: 'PTCL / StormFiber Home Internet', amount: 6800, category: 'bills', dayOfMonth: 3, paidThisMonth: true, whoFor: 'Family / Household' },
      { id: 'rec-2', title: 'Electricity & SNGPL Gas Bill', amount: 24500, category: 'bills', dayOfMonth: 5, paidThisMonth: true, whoFor: 'Family / Household' },
      { id: 'rec-3', title: 'iCloud+ & Family Subscriptions', amount: 2900, category: 'subscriptions', dayOfMonth: 8, paidThisMonth: true, whoFor: 'Family / Household' },
      { id: 'rec-4', title: 'School Fee / Tuition Installment', amount: 22000, category: 'family', dayOfMonth: 15, paidThisMonth: false, whoFor: 'Kids / Family' },
      { id: 'rec-5', title: 'Mobile Postpaid / Packages', amount: 4500, category: 'bills', dayOfMonth: 20, paidThisMonth: false, whoFor: 'Family / Household' }
    ],
    expenses: [
      {
        id: 'exp-1011-1',
        date: '2026-10-11',
        time: '09:30',
        title: 'Halwa Puri, Chai & Fresh Bakery',
        amount: 1450,
        category: 'food',
        spendType: 'medium',
        necessity: 'family',
        paymentMethod: 'Cash',
        merchant: 'Tehzeeb / Local Bakers',
        whoFor: 'Family / Household',
        note: 'Sunday morning family breakfast',
        isFamilyShareable: true
      },
      {
        id: 'exp-1011-2',
        date: '2026-10-11',
        time: '12:15',
        title: 'Weekly Household Groceries, Meat & Fruit',
        amount: 14800,
        category: 'groceries',
        spendType: 'big',
        necessity: 'need',
        paymentMethod: 'Meezan Debit Card',
        merchant: 'Imtiaz / Carrefour',
        whoFor: 'Family / Household',
        note: 'Cooking oil, rice, chicken, vegetables, milk & snacks',
        isFamilyShareable: true
      },
      {
        id: 'exp-1011-3',
        date: '2026-10-11',
        time: '15:40',
        title: 'Afternoon Karak Chai & Samosa',
        amount: 420,
        category: 'coffee',
        spendType: 'micro',
        necessity: 'want',
        paymentMethod: 'SadaPay',
        merchant: 'Quetta Cafe',
        whoFor: 'Self',
        note: 'Quick evening tea stop',
        isFamilyShareable: true
      },
      {
        id: 'exp-1010-1',
        date: '2026-10-10',
        time: '10:20',
        title: 'Car Petrol Fill-Up',
        amount: 8500,
        category: 'transport',
        spendType: 'medium',
        necessity: 'need',
        paymentMethod: 'SadaPay',
        merchant: 'PSO Station',
        whoFor: 'Family / Household',
        note: 'Weekly fuel tank refill',
        isFamilyShareable: true
      },
      {
        id: 'exp-1010-2',
        date: '2026-10-10',
        time: '20:30',
        title: 'Saturday Family BBQ & Karahi Dinner',
        amount: 7600,
        category: 'food',
        spendType: 'medium',
        necessity: 'family',
        paymentMethod: 'Meezan Debit Card',
        merchant: 'Monal / Butt Karahi',
        whoFor: 'Family / Household',
        note: 'Weekend dinner out with family',
        isFamilyShareable: true
      },
      {
        id: 'exp-1010-3',
        date: '2026-10-10',
        time: '22:15',
        title: 'Parking & Attendant Tip',
        amount: 250,
        category: 'transport',
        spendType: 'micro',
        necessity: 'need',
        paymentMethod: 'Cash',
        merchant: 'Parking Plaza',
        whoFor: 'Family / Household',
        note: 'Small cash tip for parking',
        isFamilyShareable: true
      },
      {
        id: 'exp-1009-1',
        date: '2026-10-09',
        time: '14:10',
        title: 'Parents Medicine & Multivitamins',
        amount: 4200,
        category: 'health',
        spendType: 'medium',
        necessity: 'need',
        paymentMethod: 'Raast Transfer',
        merchant: 'D.Watson Chemist',
        whoFor: 'Parents / Relatives',
        note: 'Monthly BP tablets & vitamins for home',
        isFamilyShareable: true
      },
      {
        id: 'exp-1009-2',
        date: '2026-10-09',
        time: '18:05',
        title: 'Cold Drink & Biscuits from Kiryana',
        amount: 580,
        category: 'coffee',
        spendType: 'micro',
        necessity: 'impulse',
        paymentMethod: 'EasyPaisa / JazzCash',
        merchant: 'Neighborhood Mart',
        whoFor: 'Self',
        note: 'Small evening snack',
        isFamilyShareable: true
      },
      {
        id: 'exp-1008-1',
        date: '2026-10-08',
        time: '11:00',
        title: 'iCloud+ 2TB & Family Subscriptions',
        amount: 2900,
        category: 'subscriptions',
        spendType: 'medium',
        necessity: 'need',
        paymentMethod: 'NayaPay',
        merchant: 'Apple Services',
        whoFor: 'Family / Household',
        note: 'iPhone 13 Pro Max backup & family storage',
        isFamilyShareable: true
      },
      {
        id: 'exp-1005-1',
        date: '2026-10-05',
        time: '11:30',
        title: 'Electricity & SNGPL Monthly Utility Bill',
        amount: 24500,
        category: 'bills',
        spendType: 'big',
        necessity: 'need',
        paymentMethod: 'Meezan Debit Card',
        merchant: 'IESCO / KE & SNGPL',
        whoFor: 'Family / Household',
        note: 'October electricity and gas bill paid online',
        isFamilyShareable: true
      },
      {
        id: 'exp-1005-2',
        date: '2026-10-05',
        time: '17:20',
        title: 'Kids School Shoes & Stationery',
        amount: 9200,
        category: 'family',
        spendType: 'medium',
        necessity: 'family',
        paymentMethod: 'Meezan Debit Card',
        merchant: 'Bata / Book Corner',
        whoFor: 'Kids / Family',
        note: 'New school shoes, notebooks & pens',
        isFamilyShareable: true
      },
      {
        id: 'exp-1003-1',
        date: '2026-10-03',
        time: '09:45',
        title: 'StormFiber / PTCL FlashFiber Internet',
        amount: 6800,
        category: 'bills',
        spendType: 'medium',
        necessity: 'need',
        paymentMethod: 'Raast Transfer',
        merchant: 'StormFiber',
        whoFor: 'Family / Household',
        note: 'Monthly home Wi-Fi bill',
        isFamilyShareable: true
      },
      {
        id: 'exp-1003-2',
        date: '2026-10-03',
        time: '16:30',
        title: 'Monthly Bulk Ration & Household Supplies',
        amount: 18400,
        category: 'groceries',
        spendType: 'big',
        necessity: 'need',
        paymentMethod: 'Meezan Debit Card',
        merchant: 'Metro Cash & Carry',
        whoFor: 'Family / Household',
        note: 'Atta, basmati rice, ghee, surf, tea pack & pulses',
        isFamilyShareable: true
      },
      {
        id: 'exp-1001-1',
        date: '2026-10-01',
        time: '13:15',
        title: 'Iced Coffee & Sandwich',
        amount: 850,
        category: 'coffee',
        spendType: 'micro',
        necessity: 'want',
        paymentMethod: 'SadaPay',
        merchant: 'Gloria Jean\'s / CBTL',
        whoFor: 'Self',
        note: 'Quick lunch coffee',
        isFamilyShareable: true
      }
    ]
  };
}

let serverState = getInitialSeedState('PKR');

function getActiveCurrencyConfig(state) {
  const code = state?.currencyCode || 'PKR';
  return CURRENCY_CONFIGS[code] || CURRENCY_CONFIGS.PKR;
}

function computeWidgetSummary(state) {
  const today = state.todayDate || '2026-10-11';
  const monthPrefix = state.currentMonth || '2026-10';
  const cfg = getActiveCurrencyConfig(state);
  const monthExpenses = (state.expenses || []).filter(e => e.date && e.date.startsWith(monthPrefix));
  const todayExpenses = monthExpenses.filter(e => e.date === today);

  const todaySpent = todayExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const monthSpent = monthExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const monthlyBudget = Number(state.account?.monthlyBudget || 180000);
  const startingBalance = Number(state.account?.startingBalance || 285000);
  const budgetRemaining = Math.max(0, monthlyBudget - monthSpent);
  const accountRemaining = startingBalance - monthSpent;

  const dayOfMonth = parseInt(today.split('-')[2] || '11', 10);
  const daysRemaining = Math.max(1, 31 - dayOfMonth + 1);
  const safeDailyAllowance = Math.max(0, (monthlyBudget - (monthSpent - todaySpent)) / daysRemaining);
  const safeRemainingToday = safeDailyAllowance - todaySpent;

  const microSpends = monthExpenses.filter(e => Number(e.amount) < cfg.microMax);
  const microTotal = microSpends.reduce((s, e) => s + Number(e.amount || 0), 0);

  return {
    appName: 'ClearSpend Pro Max',
    deviceTarget: 'iPhone 13 Pro Max (428×926 pt)',
    todayDate: today,
    currency: state.currency || cfg.symbol,
    currencyCode: cfg.code,
    todaySpent: Number(todaySpent.toFixed(cfg.decimals)),
    todayCount: todayExpenses.length,
    safeDailyAllowance: Number(safeDailyAllowance.toFixed(cfg.decimals)),
    safeRemainingToday: Number(safeRemainingToday.toFixed(cfg.decimals)),
    monthSpent: Number(monthSpent.toFixed(cfg.decimals)),
    monthlyBudget: Number(monthlyBudget.toFixed(cfg.decimals)),
    budgetRemaining: Number(budgetRemaining.toFixed(cfg.decimals)),
    accountRemaining: Number(accountRemaining.toFixed(cfg.decimals)),
    microSpendCount: microSpends.length,
    microSpendTotal: Number(microTotal.toFixed(cfg.decimals)),
    deepLinks: {
      todayView: '/?view=today',
      quickAdd: '/?action=quick-add',
      familyShare: '/?view=family',
      monthlyReview: '/?view=monthly'
    }
  };
}

function generateIcsReminder(timeStr = '21:00') {
  const [hh, mm] = (timeStr || '21:00').split(':').map(v => v.padStart(2, '0'));
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ClearSpend Pro Max//iPhone 13 Pro Max Expense Recall//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:clearspend-daily-recall-2026@trendshiphub.app',
    'DTSTAMP:20261011T090000Z',
    `DTSTART:20261011T${hh}${mm}00`,
    'RRULE:FREQ=DAILY',
    'SUMMARY:ClearSpend: 20-Sec Today Expense Recall',
    'DESCRIPTION:Tap to open ClearSpend Pro Max directly to Today\'s Spending and log any small or big expenses before bed.',
    'BEGIN:VALARM',
    'TRIGGER:-PT0M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Log today\'s spending in ClearSpend Pro Max',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

function generateScriptableWidgetCode(baseUrl) {
  const origin = baseUrl || 'https://your-clearspend-url.e2b.app';
  return `// ============================================================================
// ClearSpend Pro Max — Native iOS Home Screen Widget for Scriptable (PKR & Multi-Currency)
// Designed for iPhone 13 Pro Max (Small 2x2 & Medium 4x2 iOS Home Screen)
// ============================================================================

const APP_URL = "${origin}";
const SUMMARY_API = APP_URL + "/api/widget-summary";

async function loadData() {
  try {
    const req = new Request(SUMMARY_API);
    req.timeoutInterval = 5;
    return await req.loadJSON();
  } catch (e) {
    return {
      currency: "Rs ",
      currencyCode: "PKR",
      todayDate: "2026-10-11",
      todaySpent: 16670,
      safeDailyAllowance: 4580,
      budgetRemaining: 79550,
      accountRemaining: 184550,
      todayCount: 3
    };
  }
}

const data = await loadData();
const w = new ListWidget();
w.url = APP_URL + "/?view=today";
w.backgroundColor = new Color("#090D16");
w.setPadding(14, 16, 14, 16);

const header = w.addStack();
header.layoutHorizontally();
const title = header.addText("CLEARSPEND • TODAY");
title.font = Font.boldSystemFont(10);
title.textColor = new Color("#10B981");
header.addSpacer();
const dateTxt = header.addText(data.todayDate);
dateTxt.font = Font.mediumSystemFont(10);
dateTxt.textColor = new Color("#94A3B8");

w.addSpacer(6);

const main = w.addText(data.currency + Number(data.todaySpent).toLocaleString());
main.font = Font.boldRoundedSystemFont(26);
main.textColor = Color.white();

const sub = w.addText(data.todayCount + " items today • Safe/day: " + data.currency + Number(data.safeDailyAllowance).toLocaleString());
sub.font = Font.systemFont(11);
sub.textColor = new Color("#CBD5E1");

w.addSpacer(8);

const footer = w.addStack();
footer.layoutHorizontally();
const acctBadge = footer.addText("Bank Left: " + data.currency + Number(data.accountRemaining).toLocaleString());
acctBadge.font = Font.semiboldSystemFont(11);
acctBadge.textColor = new Color("#34D399");
footer.addSpacer();
const cta = footer.addText("+ Log Now ›");
cta.font = Font.boldSystemFont(11);
cta.textColor = new Color("#38BDF8");

if (config.runsInWidget) {
  Script.setWidget(w);
} else {
  w.presentMedium();
}
Script.complete();
`;
}

function buildStandaloneIphoneHtml() {
  const html = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(PUBLIC_DIR, 'styles.css'), 'utf8');
  const js = fs.readFileSync(path.join(PUBLIC_DIR, 'app.js'), 'utf8');
  return html
    .replace(/<link rel="stylesheet" href="\/?styles\.css" \/>/, `<style>\n${css}\n</style>`)
    .replace(/<script src="\/?app\.js"><\/script>/, `<script>\n${js}\n</script>`)
    .replace('class="frame-mode"', 'class="fullscreen-mode"');
}

function setCommonHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-cache');
}

const server = http.createServer(async (req, res) => {
  setCommonHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname || '/';

  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      status: 'ok',
      date: '2026-10-11',
      currencyCode: serverState.currencyCode || 'PKR',
      device: 'iPhone 13 Pro Max PWA Ready'
    }));
    return;
  }

  if (pathname === '/api/qr.svg') {
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${PORT}`;
    const targetUrl = parsedUrl.query?.url || `${proto}://${host}/?view=today`;
    if (QRCode) {
      try {
        const svgStr = await QRCode.toString(targetUrl, {
          type: 'svg',
          margin: 1,
          width: 220,
          color: { dark: '#10B981', light: '#080B11' }
        });
        res.writeHead(200, { 'Content-Type': 'image/svg+xml; charset=utf-8' });
        res.end(svgStr);
        return;
      } catch (e) {}
    }
    res.writeHead(200, { 'Content-Type': 'image/svg+xml; charset=utf-8' });
    res.end('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#080B11"/></svg>');
    return;
  }

  if (pathname === '/download/ClearSpend-iPhone.html') {
    try {
      const standalone = buildStandaloneIphoneHtml();
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': 'attachment; filename="ClearSpend-iPhone-13-Pro-Max.html"'
      });
      res.end(standalone);
    } catch (e) {
      res.writeHead(500);
      res.end('Failed to build standalone file');
    }
    return;
  }

  if (pathname === '/api/state' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(serverState));
    return;
  }

  if (pathname === '/api/state' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 2 * 1024 * 1024) req.destroy();
    });
    req.on('end', () => {
      try {
        const incoming = JSON.parse(body);
        if (incoming && typeof incoming === 'object') {
          serverState = incoming;
        }
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true, summary: computeWidgetSummary(serverState) }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  if (pathname === '/api/reset-seed' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      let code = 'PKR';
      try {
        const parsed = JSON.parse(body || '{}');
        if (parsed.currencyCode) code = parsed.currencyCode;
      } catch (e) {}
      serverState = getInitialSeedState(code);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(serverState));
    });
    return;
  }

  if (pathname === '/api/widget-summary' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(computeWidgetSummary(serverState)));
    return;
  }

  if (pathname === '/api/quick-add' && (req.method === 'POST' || req.method === 'GET')) {
    const handleAdd = (params) => {
      const amount = parseFloat(params.amount);
      if (!amount || isNaN(amount) || amount <= 0) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: 'Valid positive amount required' }));
        return;
      }
      const cfg = getActiveCurrencyConfig(serverState);
      const newExpense = {
        id: 'exp-' + Date.now(),
        date: params.date || serverState.todayDate || '2026-10-11',
        time: params.time || '12:00',
        title: params.title || 'Quick iPhone Entry',
        amount: Number(amount.toFixed(cfg.decimals)),
        category: params.category || 'food',
        spendType: amount < cfg.microMax ? 'micro' : (amount >= cfg.bigMin ? 'big' : 'medium'),
        necessity: params.necessity || 'need',
        paymentMethod: params.paymentMethod || (cfg.code === 'PKR' ? 'SadaPay' : 'Apple Pay'),
        merchant: params.merchant || '',
        whoFor: params.whoFor || 'Self',
        note: params.note || 'Added via Quick-Launch / Shortcut',
        isFamilyShareable: true
      };
      serverState.expenses.unshift(newExpense);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        ok: true,
        expense: newExpense,
        summary: computeWidgetSummary(serverState)
      }));
    };

    if (req.method === 'GET') {
      handleAdd(parsedUrl.query || {});
    } else {
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', () => {
        try {
          handleAdd(JSON.parse(body || '{}'));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ ok: false, error: 'Invalid JSON' }));
        }
      });
    }
    return;
  }

  if (pathname === '/api/reminder.ics') {
    const timeParam = parsedUrl.query?.time || serverState.reminderSettings?.eveningRecallTime || '21:00';
    const ics = generateIcsReminder(timeParam);
    res.writeHead(200, {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="clearspend-daily-recall.ics"'
    });
    res.end(ics);
    return;
  }

  if (pathname === '/api/scriptable-widget.js') {
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${PORT}`;
    const script = generateScriptableWidgetCode(`${proto}://${host}`);
    res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
    res.end(script);
    return;
  }

  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '') {
    safePath = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, safePath);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      const indexFile = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(indexFile, (readErr, content) => {
        if (readErr) {
          res.writeHead(500);
          res.end('Server loading...');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(content);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500);
        res.end('Error reading file');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`ClearSpend Pro Max (PKR & Multi-Currency iPhone 13 Pro Max PWA) listening on http://${HOST}:${PORT}`);
});
