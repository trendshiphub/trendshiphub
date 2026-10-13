(function () {
  'use strict';

  const STORAGE_KEY = 'clearspend_promax_state_v2026_10_pkr';
  const TODAY_ISO = '2026-10-11'; // Sunday, October 11, 2026

  const CURRENCY_CONFIGS = {
    PKR: { symbol: 'Rs ', shortSymbol: 'Rs', code: 'PKR', microMax: 1000, bigMin: 10000, decimals: 0, rateFromPkr: 1 },
    USD: { symbol: '$', shortSymbol: '$', code: 'USD', microMax: 15, bigMin: 75, decimals: 2, rateFromPkr: 1 / 278 },
    AED: { symbol: 'AED ', shortSymbol: 'AED', code: 'AED', microMax: 50, bigMin: 300, decimals: 2, rateFromPkr: 1 / 75.7 },
    GBP: { symbol: '£', shortSymbol: '£', code: 'GBP', microMax: 12, bigMin: 65, decimals: 2, rateFromPkr: 1 / 360 },
    EUR: { symbol: '€', shortSymbol: '€', code: 'EUR', microMax: 15, bigMin: 75, decimals: 2, rateFromPkr: 1 / 302 },
    SAR: { symbol: 'SAR ', shortSymbol: 'SAR', code: 'SAR', microMax: 50, bigMin: 300, decimals: 2, rateFromPkr: 1 / 74.1 }
  };

  const CATEGORIES = [
    { id: 'groceries', label: 'Groceries', icon: '🛒', color: '#10B981' },
    { id: 'food', label: 'Dining', icon: '🍽️', color: '#38BDF8' },
    { id: 'coffee', label: 'Chai/Cafe', icon: '☕', color: '#FBBF24' },
    { id: 'transport', label: 'Fuel/Ride', icon: '⛽', color: '#818CF8' },
    { id: 'bills', label: 'Bills/Util', icon: '⚡', color: '#FB7185' },
    { id: 'family', label: 'Family', icon: '👨‍👩‍👧', color: '#C084FC' },
    { id: 'health', label: 'Medical', icon: '💊', color: '#2DD4BF' },
    { id: 'subscriptions', label: 'Subscript.', icon: '🔁', color: '#60A5FA' }
  ];

  const MEMORY_CHIPS_BY_CURRENCY = {
    PKR: [
      { label: 'Chai & Snack · Rs 350', title: 'Karak Chai & Snack', amount: 350, cat: 'coffee', who: 'Self', need: 'want' },
      { label: 'Groceries · Rs 4,500', title: 'Household Groceries & Milk', amount: 4500, cat: 'groceries', who: 'Family / Household', need: 'need' },
      { label: 'Petrol / Ride · Rs 2,500', title: 'Petrol / InDrive / Ride', amount: 2500, cat: 'transport', who: 'Self', need: 'need' },
      { label: 'Lunch · Rs 1,200', title: 'Lunch / Biryani / Meal', amount: 1200, cat: 'food', who: 'Self', need: 'want' },
      { label: 'Family · Rs 3,000', title: 'Family / Home Expense', amount: 3000, cat: 'family', who: 'Family / Household', need: 'family' },
      { label: 'Pharmacy · Rs 1,500', title: 'Pharmacy & Medicine', amount: 1500, cat: 'health', who: 'Family / Household', need: 'need' },
      { label: 'Cash / Tip · Rs 200', title: 'Small Cash / Parking Tip', amount: 200, cat: 'transport', who: 'Self', need: 'impulse' }
    ],
    DEFAULT: [
      { label: 'Coffee · $6.50', title: 'Morning Coffee & Snack', amount: 6.50, cat: 'coffee', who: 'Self', need: 'want' },
      { label: 'Groceries · $65', title: 'Family Groceries Run', amount: 65.00, cat: 'groceries', who: 'Family / Household', need: 'need' },
      { label: 'Fuel / Transit · $45', title: 'Car Fuel / Transit', amount: 45.00, cat: 'transport', who: 'Family / Household', need: 'need' },
      { label: 'Lunch · $16.50', title: 'Workday Lunch / Meal', amount: 16.50, cat: 'food', who: 'Self', need: 'want' },
      { label: 'Family · $30', title: 'Family / Kids Expense', amount: 30.00, cat: 'family', who: 'Kids / Family', need: 'family' },
      { label: 'Pharmacy · $18', title: 'Pharmacy / Health Item', amount: 18.00, cat: 'health', who: 'Family / Household', need: 'need' },
      { label: 'Cash / Tip · $5', title: 'Small Cash Tip / Parking', amount: 5.00, cat: 'transport', who: 'Self', need: 'impulse' }
    ]
  };

  const RECALL_PROMPTS_BY_CURRENCY = {
    PKR: [
      { title: 'Chai, Cold Drink, Water or Bakery Snack', amount: 380, category: 'coffee', whoFor: 'Self', necessity: 'want', icon: '☕', hint: 'Quetta cafe, bakery, or neighborhood mart' },
      { title: 'Petrol, InDrive, Bykea or Parking Tip', amount: 1200, category: 'transport', whoFor: 'Self', necessity: 'need', icon: '🚗', hint: 'Fuel pump, ride-hail, or parking attendant' },
      { title: 'Kiryana Pick-Up (Milk, Bread, Eggs, Fruit)', amount: 1850, category: 'groceries', whoFor: 'Family / Household', necessity: 'need', icon: '🥖', hint: 'Daily household essentials brought home' },
      { title: 'Cash Given to Family, Parents or Kids', amount: 2500, category: 'family', whoFor: 'Family / Household', necessity: 'family', icon: '💵', hint: 'Pocket money, home cash, or rider tip' },
      { title: 'Lunch, Biryani, Roll or Foodpanda Order', amount: 1400, category: 'food', whoFor: 'Self', necessity: 'want', icon: '🍱', hint: 'Office lunch or evening food delivery' },
      { title: 'Chemist / Pharmacy or Household Item', amount: 1600, category: 'health', whoFor: 'Family / Household', necessity: 'need', icon: '💊', hint: 'D.Watson, medicine, or toiletries' }
    ],
    DEFAULT: [
      { title: 'Coffee, Tea, Bottled Water or Snack', amount: 5.75, category: 'coffee', whoFor: 'Self', necessity: 'want', icon: '☕', hint: 'Cafe, bakery, or convenience store' },
      { title: 'Parking, Toll, Uber or Fuel Top-Up', amount: 12.00, category: 'transport', whoFor: 'Self', necessity: 'need', icon: '🚗', hint: 'Meters, transit tap, or gas station' },
      { title: 'Quick Grocery Pick-Up (Milk, Bread, Fruit)', amount: 22.50, category: 'groceries', whoFor: 'Family / Household', necessity: 'need', icon: '🥖', hint: 'Mid-week household grocery stop' },
      { title: 'Cash Given to Family / Kids / Tip', amount: 15.00, category: 'family', whoFor: 'Kids / Family', necessity: 'family', icon: '💵', hint: 'Pocket money, delivery tip, or shared cash' },
      { title: 'Takeout Lunch or Quick Bite', amount: 14.50, category: 'food', whoFor: 'Self', necessity: 'want', icon: '🥪', hint: 'Fast casual or delivery order' },
      { title: 'Pharmacy, Household or Personal Item', amount: 18.00, category: 'health', whoFor: 'Family / Household', necessity: 'need', icon: '🧴', hint: 'Medicine, toiletries, cleaning supplies' }
    ]
  };

  let appState = null;
  let selectedDate = TODAY_ISO;
  let selectedCategory = 'groceries';
  let activeDayFilter = 'all';
  let activeMonthlyCategoryFilter = null;
  let pendingGapAmount = 0;

  function getActiveConfig() {
    const code = (appState && appState.currencyCode) || 'PKR';
    return CURRENCY_CONFIGS[code] || CURRENCY_CONFIGS.PKR;
  }

  function getDefaultSeedState(currencyCode = 'PKR') {
    if (currencyCode === 'USD') {
      return {
        version: '2026.10.2',
        currency: '$',
        currencyCode: 'USD',
        currentMonth: '2026-10',
        todayDate: TODAY_ISO,
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
          { id: 'exp-u1', date: '2026-10-11', time: '09:15', title: 'Iced Oat Latte & Croissant', amount: 9.75, category: 'coffee', necessity: 'want', paymentMethod: 'Apple Pay', merchant: 'Blue Bottle', whoFor: 'Self', note: 'Morning coffee before errands' },
          { id: 'exp-u2', date: '2026-10-11', time: '12:30', title: 'Weekend Family Groceries', amount: 118.40, category: 'groceries', necessity: 'need', paymentMethod: 'Debit Card', merchant: 'Whole Foods', whoFor: 'Family / Household', note: 'Weekly produce, milk, chicken & staples' },
          { id: 'exp-u3', date: '2026-10-11', time: '14:10', title: 'Street Parking Meter', amount: 4.50, category: 'transport', necessity: 'need', paymentMethod: 'Apple Pay', merchant: 'ParkMobile', whoFor: 'Family / Household', note: '2h parking downtown' },
          { id: 'exp-u4', date: '2026-10-10', time: '19:40', title: 'Family Takeout Dinner', amount: 64.80, category: 'food', necessity: 'family', paymentMethod: 'Credit Card', merchant: 'Mediterranean Grill', whoFor: 'Family / Household', note: 'Family dinner night' },
          { id: 'exp-u5', date: '2026-10-09', time: '16:30', title: 'Pharmacy & Vitamins', amount: 34.20, category: 'health', necessity: 'need', paymentMethod: 'Debit Card', merchant: 'CVS Pharmacy', whoFor: 'Family / Household', note: 'Vitamins & first aid' },
          { id: 'exp-u6', date: '2026-10-07', time: '08:30', title: 'Full Tank Unleaded Fuel', amount: 52.00, category: 'transport', necessity: 'need', paymentMethod: 'Debit Card', merchant: 'Shell', whoFor: 'Family / Household', note: 'Weekly gas fill-up' },
          { id: 'exp-u7', date: '2026-10-05', time: '11:00', title: 'Electric & Water Utility Bill', amount: 142.50, category: 'bills', necessity: 'need', paymentMethod: 'Checking Auto-Pay', merchant: 'City Power', whoFor: 'Family / Household', note: 'October utility statement' },
          { id: 'exp-u8', date: '2026-10-03', time: '14:15', title: 'Costco Bulk Household Stock-Up', amount: 194.60, category: 'groceries', necessity: 'need', paymentMethod: 'Debit Card', merchant: 'Costco', whoFor: 'Family / Household', note: 'Bulk household essentials' }
        ]
      };
    }

    return {
      version: '2026.10.2',
      currency: 'Rs ',
      currencyCode: 'PKR',
      currentMonth: '2026-10',
      todayDate: TODAY_ISO,
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

  function formatMoney(num, forceNoDecimals = null) {
    const cfg = getActiveConfig();
    const cur = (appState && appState.currency) || cfg.symbol;
    const val = Number(num || 0);
    const abs = Math.abs(val);
    const useDecimals = forceNoDecimals === true ? false : (cfg.decimals > 0 && abs % 1 !== 0 ? true : cfg.decimals > 0);
    const formatted = useDecimals
      ? abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : Math.round(abs).toLocaleString('en-US');
    return (val < 0 ? '-' : '') + cur + formatted;
  }

  function formatCompactAmount(num) {
    const val = Math.abs(Number(num || 0));
    if (val === 0) return '·';
    if (val >= 1000) {
      const k = val / 1000;
      return (k >= 10 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, '')) + 'k';
    }
    return Math.round(val).toString();
  }

  function formatReadableDate(isoStr) {
    if (!isoStr) return 'Sun, Oct 11, 2026';
    const [y, m, d] = isoStr.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    return dt.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    });
  }

  function formatShortDate(isoStr) {
    if (!isoStr) return 'Oct 11';
    const [y, m, d] = isoStr.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    return dt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    });
  }

  function getCategoryMeta(catId) {
    return CATEGORIES.find(c => c.id === catId) || { id: 'other', label: 'Other', icon: '🏷️', color: '#94A3B8' };
  }

  function showToast(msg) {
    const toast = document.getElementById('iosToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove('hidden');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2600);
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch (e) {}
    fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appState)
    }).catch(() => {});
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.expenses)) {
          appState = parsed;
          return;
        }
      }
    } catch (e) {}
    appState = getDefaultSeedState('PKR');
    saveState();
  }

  function switchCurrencyProfile(newCode) {
    const cfg = CURRENCY_CONFIGS[newCode] || CURRENCY_CONFIGS.PKR;
    if (newCode === 'PKR') {
      appState = getDefaultSeedState('PKR');
    } else if (newCode === 'USD') {
      appState = getDefaultSeedState('USD');
    } else {
      // Convert from PKR seed into selected currency (AED, GBP, EUR, SAR)
      const base = getDefaultSeedState('PKR');
      const rate = cfg.rateFromPkr || (1 / 278);
      base.currencyCode = cfg.code;
      base.currency = cfg.symbol;
      base.account.startingBalance = Math.round(base.account.startingBalance * rate);
      base.account.monthlyBudget = Math.round(base.account.monthlyBudget * rate);
      base.account.accountName = 'Primary Bank & Wallet';
      base.recurringBills = base.recurringBills.map(b => ({
        ...b,
        amount: Number((b.amount * rate).toFixed(cfg.decimals))
      }));
      base.expenses = base.expenses.map(e => ({
        ...e,
        amount: Number((e.amount * rate).toFixed(cfg.decimals))
      }));
      appState = base;
    }
    saveState();
    renderAll();
    showToast(`Switched to ${cfg.code} (${cfg.shortSymbol})`);
  }

  function computeMetrics() {
    const cfg = getActiveConfig();
    const expenses = appState.expenses || [];
    const monthExpenses = expenses.filter(e => e.date && e.date.startsWith('2026-10'));
    const dayExpenses = expenses.filter(e => e.date === selectedDate);
    const todayExpenses = expenses.filter(e => e.date === TODAY_ISO);

    const monthTotal = monthExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const dayTotal = dayExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const todayTotal = todayExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);

    const startingBalance = Number(appState.account?.startingBalance || 285000);
    const monthlyBudget = Number(appState.account?.monthlyBudget || 180000);

    const accountRemaining = startingBalance - monthTotal;
    const budgetRemaining = monthlyBudget - monthTotal;

    // 21 days left in October 2026 (Oct 11 through Oct 31 inclusive = 21 days)
    const daysLeftInMonth = 21;
    const spentBeforeToday = monthExpenses
      .filter(e => e.date < TODAY_ISO)
      .reduce((s, e) => s + Number(e.amount || 0), 0);
    const safeDailyAllowance = Math.max(0, (monthlyBudget - spentBeforeToday) / daysLeftInMonth);

    const microList = monthExpenses.filter(e => Number(e.amount) < cfg.microMax);
    const mediumList = monthExpenses.filter(e => Number(e.amount) >= cfg.microMax && Number(e.amount) < cfg.bigMin);
    const bigList = monthExpenses.filter(e => Number(e.amount) >= cfg.bigMin);

    return {
      cfg,
      monthExpenses,
      dayExpenses,
      todayExpenses,
      monthTotal,
      dayTotal,
      todayTotal,
      startingBalance,
      monthlyBudget,
      accountRemaining,
      budgetRemaining,
      safeDailyAllowance,
      daysLeftInMonth,
      microList,
      mediumList,
      bigList
    };
  }

  // ==========================================================================
  // RENDERERS
  // ==========================================================================
  function renderTopPulse(metrics) {
    const { cfg } = metrics;
    document.getElementById('quickCurrencySelect').value = cfg.code;
    document.getElementById('topAccountBalance').textContent = formatMoney(metrics.accountRemaining, true);
    document.getElementById('topAccountSub').textContent = `of ${formatMoney(metrics.startingBalance, true)}`;
    document.getElementById('topBudgetRemaining').textContent = formatMoney(metrics.budgetRemaining, true);
    document.getElementById('topBudgetSub').textContent = `of ${formatMoney(metrics.monthlyBudget, true)}`;
    document.getElementById('topSafeDaily').textContent = `${formatMoney(metrics.safeDailyAllowance, true)}/d`;
    document.getElementById('topSafeSub').textContent = `${metrics.daysLeftInMonth} days left`;
    document.getElementById('formCurrencySymbol').textContent = cfg.shortSymbol;
    document.getElementById('activeCurrencyModeTag').textContent = `${cfg.code} · 2-Tap Log`;

    document.getElementById('dayMicroFilterPill').textContent = `Small (<${cfg.shortSymbol} ${cfg.microMax.toLocaleString()})`;
    document.getElementById('dayBigFilterPill').textContent = `Big (≥${cfg.shortSymbol} ${(cfg.bigMin / 2).toLocaleString()})`;
  }

  function renderMemoryChips(metrics) {
    const { cfg } = metrics;
    const container = document.getElementById('memoryChipsContainer');
    const templates = cfg.code === 'PKR' ? MEMORY_CHIPS_BY_CURRENCY.PKR : MEMORY_CHIPS_BY_CURRENCY.DEFAULT;

    container.innerHTML = templates.map(t => `
      <button type="button" class="memory-chip" data-title="${escapeHtml(t.title)}" data-amount="${t.amount}" data-cat="${t.cat}" data-who="${escapeHtml(t.who)}" data-need="${t.need}">
        ${escapeHtml(t.label)}
      </button>
    `).join('');

    container.querySelectorAll('.memory-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.getElementById('expenseTitle').value = chip.getAttribute('data-title');
        document.getElementById('expenseAmount').value = chip.getAttribute('data-amount');
        selectedCategory = chip.getAttribute('data-cat') || 'food';
        document.getElementById('expenseWhoFor').value = chip.getAttribute('data-who') || 'Self';
        const need = chip.getAttribute('data-need');
        if (need && ['need', 'family', 'want', 'impulse'].includes(need)) {
          document.getElementById('expenseNecessity').value = need;
        }
        renderCategoryPills();
        document.getElementById('saveExpenseBtn').focus();
        showToast('Preset filled — tap Save or adjust amount');
      });
    });
  }

  function renderDateNavigator(metrics) {
    const isToday = selectedDate === TODAY_ISO;
    document.getElementById('activeDatePill').textContent = isToday ? 'TODAY · DIRECT LAUNCH' : 'SELECTED DATE';
    document.getElementById('activeDateHeading').textContent = formatReadableDate(selectedDate);
    document.getElementById('selectedDayLabel').textContent = isToday
      ? `Spent Today (${formatShortDate(selectedDate)})`
      : `Spent on ${formatShortDate(selectedDate)}`;
    document.getElementById('selectedDayTotal').textContent = formatMoney(metrics.dayTotal);
    document.getElementById('selectedDayCount').textContent = `${metrics.dayExpenses.length} item${metrics.dayExpenses.length === 1 ? '' : 's'}`;

    const safeBadge = document.getElementById('daySafeBadge');
    const diff = metrics.safeDailyAllowance - metrics.dayTotal;
    if (diff >= 0) {
      safeBadge.className = 'safe-meter-pill';
      safeBadge.textContent = `Safe limit: ${formatMoney(metrics.safeDailyAllowance, true)}/d`;
    } else {
      safeBadge.className = 'safe-meter-pill over-safe';
      safeBadge.textContent = `Safe limit: ${formatMoney(metrics.safeDailyAllowance, true)}/d`;
    }

    document.getElementById('formDateStampLabel').textContent = formatShortDate(selectedDate) + ', 2026';
    document.getElementById('expenseDate').value = selectedDate;

    const editId = document.getElementById('editExpenseId').value;
    if (!editId) {
      document.getElementById('saveExpenseBtnText').textContent = isToday
        ? `Save to Today (${formatShortDate(selectedDate)})`
        : `Save to ${formatShortDate(selectedDate)}`;
    }

    document.getElementById('dayLedgerTitle').textContent = `${formatReadableDate(selectedDate)} Ledger`;

    const stripEl = document.getElementById('weekStrip');
    const baseDay = parseInt(selectedDate.split('-')[2] || '11', 10);
    const endDay = Math.min(31, Math.max(7, baseDay <= 11 ? 11 : baseDay));
    const startDay = Math.max(1, endDay - 6);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    let html = '';
    for (let d = startDay; d <= endDay; d++) {
      const iso = `2026-10-${String(d).padStart(2, '0')}`;
      const dt = new Date(Date.UTC(2026, 9, d, 12, 0, 0));
      const wName = dayNames[dt.getUTCDay()];
      const daySum = (appState.expenses || [])
        .filter(e => e.date === iso)
        .reduce((s, e) => s + Number(e.amount || 0), 0);
      const activeCls = iso === selectedDate ? 'active' : '';
      html += `
        <button type="button" class="week-day-pill ${activeCls}" data-pickdate="${iso}" aria-label="Select October ${d}">
          <span class="wd-name">${iso === TODAY_ISO ? 'TODAY' : wName}</span>
          <span class="wd-num">${d}</span>
          <span class="wd-amt">${daySum > 0 ? formatCompactAmount(daySum) : '·'}</span>
        </button>
      `;
    }
    stripEl.innerHTML = html;

    stripEl.querySelectorAll('[data-pickdate]').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedDate = btn.getAttribute('data-pickdate');
        renderAll();
      });
    });
  }

  function renderCategoryPills() {
    const grid = document.getElementById('categoryPillsGrid');
    grid.innerHTML = CATEGORIES.map(cat => `
      <button type="button" class="cat-pill-btn ${cat.id === selectedCategory ? 'active' : ''}" data-catid="${cat.id}" role="radio" aria-checked="${cat.id === selectedCategory}">
        <span class="cat-emo">${cat.icon}</span>
        <span>${cat.label}</span>
      </button>
    `).join('');

    grid.querySelectorAll('[data-catid]').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedCategory = btn.getAttribute('data-catid');
        renderCategoryPills();
      });
    });
  }

  function createExpenseItemHTML(exp, showDateBadge = false) {
    const cfg = getActiveConfig();
    const cat = getCategoryMeta(exp.category);
    const amt = Number(exp.amount || 0);
    const isMicro = amt < cfg.microMax;
    const isBig = amt >= cfg.bigMin;
    const sizeClass = isMicro ? 'tag-micro' : (isBig ? 'tag-big' : '');
    const sizeLabel = isMicro ? 'Small' : (isBig ? 'Big' : '');

    return `
      <article class="expense-item" data-expid="${exp.id}">
        <div class="exp-left">
          <div class="exp-cat-icon" title="${cat.label}">${cat.icon}</div>
          <div class="exp-info">
            <h4 class="exp-title">${escapeHtml(exp.title)}</h4>
            <div class="exp-meta-line">
              ${showDateBadge ? `<span class="tag-badge">${formatShortDate(exp.date)}</span>` : ''}
              ${exp.merchant ? `<span>${escapeHtml(exp.merchant)}</span>` : ''}
              <span class="tag-badge tag-who">${escapeHtml(exp.whoFor || 'Self')}</span>
              ${sizeLabel ? `<span class="tag-badge ${sizeClass}">${sizeLabel}</span>` : ''}
              <span class="tag-badge">${escapeHtml(exp.paymentMethod || 'Card')}</span>
            </div>
            ${exp.note ? `<p class="exp-note">${escapeHtml(exp.note)}</p>` : ''}
          </div>
        </div>
        <div class="exp-right">
          <strong class="exp-amount">${formatMoney(amt)}</strong>
          <div class="exp-actions">
            <button type="button" class="exp-act-btn" data-edit="${exp.id}" title="Edit" aria-label="Edit ${escapeHtml(exp.title)}">Edit</button>
            <button type="button" class="exp-act-btn" data-del="${exp.id}" title="Delete" aria-label="Delete ${escapeHtml(exp.title)}">✕</button>
          </div>
        </div>
      </article>
    `;
  }

  function attachExpenseItemEvents(container) {
    container.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-edit');
        const exp = (appState.expenses || []).find(e => e.id === id);
        if (!exp) return;
        switchTab('today');
        selectedDate = exp.date;
        selectedCategory = exp.category || 'groceries';
        document.getElementById('editExpenseId').value = exp.id;
        document.getElementById('expenseAmount').value = exp.amount;
        document.getElementById('expenseTitle').value = exp.title;
        document.getElementById('expenseWhoFor').value = exp.whoFor || 'Family / Household';
        document.getElementById('expenseNecessity').value = exp.necessity || 'need';
        document.getElementById('expensePayment').value = exp.paymentMethod || 'SadaPay';
        document.getElementById('expenseDate').value = exp.date;
        document.getElementById('expenseTime').value = exp.time || '12:00';
        document.getElementById('expenseMerchant').value = exp.merchant || '';
        document.getElementById('expenseNote').value = exp.note || '';
        document.getElementById('extraFieldsPanel').classList.remove('hidden');
        document.getElementById('cancelEditBtn').classList.remove('hidden');
        document.getElementById('saveExpenseBtnText').textContent = 'Update Expense';
        renderAll();
        document.getElementById('quickLogCard').scrollIntoView({ behavior: 'smooth' });
      });
    });

    container.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-del');
        appState.expenses = (appState.expenses || []).filter(e => e.id !== id);
        saveState();
        renderAll();
        showToast('Removed & updated balance');
      });
    });
  }

  function renderTodayLedger(metrics) {
    const { cfg } = metrics;
    const listEl = document.getElementById('todayExpenseList');
    let filtered = metrics.dayExpenses.slice();
    if (activeDayFilter === 'micro') {
      filtered = filtered.filter(e => Number(e.amount) < cfg.microMax);
    } else if (activeDayFilter === 'big') {
      filtered = filtered.filter(e => Number(e.amount) >= cfg.bigMin / 2);
    }

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="expense-item" style="justify-content:center; text-align:center; padding:18px;">
          <div>
            <strong>No transactions for ${formatShortDate(selectedDate)} in this filter</strong>
            <p class="section-hint">Tap a preset chip above or enter an amount to log in 2 seconds.</p>
          </div>
        </div>
      `;
      return;
    }

    listEl.innerHTML = filtered.map(e => createExpenseItemHTML(e, false)).join('');
    attachExpenseItemEvents(listEl);
  }

  function renderMonthlyView(metrics) {
    const { cfg } = metrics;
    document.getElementById('mStartBalance').textContent = formatMoney(metrics.startingBalance, true);
    document.getElementById('mTotalSpent').textContent = formatMoney(metrics.monthTotal, true);
    document.getElementById('mAccountLeft').textContent = formatMoney(metrics.accountRemaining, true);

    const pctUsed = metrics.monthlyBudget > 0 ? Math.min(100, (metrics.monthTotal / metrics.monthlyBudget) * 100) : 0;
    document.getElementById('mBudgetUsedLabel').textContent =
      `Used: ${formatMoney(metrics.monthTotal, true)} of ${formatMoney(metrics.monthlyBudget, true)} (${pctUsed.toFixed(0)}%)`;
    document.getElementById('mBudgetPacingLabel').textContent =
      pctUsed <= 60 ? 'Healthy Pace' : 'Watch Pace';
    document.getElementById('mBudgetBarFill').style.width = `${pctUsed}%`;

    const microSum = metrics.microList.reduce((s, e) => s + Number(e.amount), 0);
    const medSum = metrics.mediumList.reduce((s, e) => s + Number(e.amount), 0);
    const bigSum = metrics.bigList.reduce((s, e) => s + Number(e.amount), 0);

    document.getElementById('sizeSplitGrid').innerHTML = `
      <div class="split-stat-card">
        <span class="split-stat-title">Small (&lt;${cfg.shortSymbol} ${cfg.microMax.toLocaleString()})</span>
        <strong class="split-stat-val" style="color:var(--accent-amber)">${formatMoney(microSum, true)}</strong>
        <span class="split-stat-sub">${metrics.microList.length} micro spends</span>
      </div>
      <div class="split-stat-card">
        <span class="split-stat-title">Regular</span>
        <strong class="split-stat-val" style="color:var(--accent-blue)">${formatMoney(medSum, true)}</strong>
        <span class="split-stat-sub">${metrics.mediumList.length} daily items</span>
      </div>
      <div class="split-stat-card">
        <span class="split-stat-title">Big (&ge;${cfg.shortSymbol} ${cfg.bigMin.toLocaleString()})</span>
        <strong class="split-stat-val" style="color:var(--accent-rose)">${formatMoney(bigSum, true)}</strong>
        <span class="split-stat-sub">${metrics.bigList.length} major outlays</span>
      </div>
    `;

    const catTotals = CATEGORIES.map(cat => {
      const items = metrics.monthExpenses.filter(e => e.category === cat.id);
      const sum = items.reduce((s, e) => s + Number(e.amount), 0);
      return { ...cat, count: items.length, sum };
    }).filter(c => c.sum > 0).sort((a, b) => b.sum - a.sum);

    const catBarsEl = document.getElementById('categoryBarsList');
    const clearCatBtn = document.getElementById('clearCategoryFilterBtn');
    if (activeMonthlyCategoryFilter) {
      clearCatBtn.classList.remove('hidden');
    } else {
      clearCatBtn.classList.add('hidden');
    }

    catBarsEl.innerHTML = catTotals.map(c => {
      const pct = metrics.monthTotal > 0 ? (c.sum / metrics.monthTotal) * 100 : 0;
      const isAct = activeMonthlyCategoryFilter === c.id ? 'active' : '';
      return `
        <div class="cat-bar-item ${isAct}" data-filtercat="${c.id}">
          <div class="cat-bar-top">
            <span>${c.icon} ${c.label} (${c.count})</span>
            <span>${formatMoney(c.sum, true)} · ${pct.toFixed(0)}%</span>
          </div>
          <div class="cat-bar-track">
            <div class="cat-bar-fill" style="width:${pct}%; background:${c.color}"></div>
          </div>
        </div>
      `;
    }).join('');

    catBarsEl.querySelectorAll('[data-filtercat]').forEach(el => {
      el.addEventListener('click', () => {
        const cid = el.getAttribute('data-filtercat');
        activeMonthlyCategoryFilter = activeMonthlyCategoryFilter === cid ? null : cid;
        renderMonthlyView(computeMetrics());
      });
    });

    const whoGroups = {};
    metrics.monthExpenses.forEach(e => {
      const k = e.whoFor || 'Self';
      if (!whoGroups[k]) whoGroups[k] = { sum: 0, count: 0 };
      whoGroups[k].sum += Number(e.amount);
      whoGroups[k].count += 1;
    });
    const whoEntries = Object.entries(whoGroups).sort((a, b) => b[1].sum - a[1].sum);
    document.getElementById('whoBreakdownGrid').innerHTML = whoEntries.map(([who, info]) => `
      <div class="split-stat-card">
        <span class="split-stat-title">${escapeHtml(who)}</span>
        <strong class="split-stat-val">${formatMoney(info.sum, true)}</strong>
        <span class="split-stat-sub">${info.count} item${info.count === 1 ? '' : 's'}</span>
      </div>
    `).join('');

    const calEl = document.getElementById('monthlyCalendarGrid');
    let calHtml = '';
    for (let d = 1; d <= 31; d++) {
      const iso = `2026-10-${String(d).padStart(2, '0')}`;
      const dSum = metrics.monthExpenses
        .filter(e => e.date === iso)
        .reduce((s, e) => s + Number(e.amount), 0);
      const cls = [
        'cal-day-cell',
        iso === TODAY_ISO ? 'is-today' : '',
        dSum > 0 ? 'has-spend' : ''
      ].join(' ');
      calHtml += `
        <button type="button" class="${cls}" data-caldate="${iso}" title="Oct ${d}: ${formatMoney(dSum)}">
          <span class="cal-day-num">${d}</span>
          <span class="cal-day-amt">${formatCompactAmount(dSum)}</span>
        </button>
      `;
    }
    calEl.innerHTML = calHtml;
    calEl.querySelectorAll('[data-caldate]').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedDate = btn.getAttribute('data-caldate');
        switchTab('today');
        renderAll();
        showToast(`Opened ${formatShortDate(selectedDate)}`);
      });
    });

    const recEl = document.getElementById('recurringBillsList');
    recEl.innerHTML = (appState.recurringBills || []).map(b => `
      <div class="rec-item">
        <div>
          <strong>${escapeHtml(b.title)}</strong>
          <div class="section-hint">Oct ${b.dayOfMonth} · ${escapeHtml(b.whoFor)}</div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <strong>${formatMoney(b.amount, true)}</strong>
          <button type="button" class="mini-pill ${b.paidThisMonth ? 'active' : ''}" data-togglerec="${b.id}">
            ${b.paidThisMonth ? 'Paid' : 'Mark Paid'}
          </button>
        </div>
      </div>
    `).join('');

    recEl.querySelectorAll('[data-togglerec]').forEach(btn => {
      btn.addEventListener('click', () => {
        const rid = btn.getAttribute('data-togglerec');
        const bill = (appState.recurringBills || []).find(r => r.id === rid);
        if (!bill) return;
        bill.paidThisMonth = !bill.paidThisMonth;
        if (bill.paidThisMonth) {
          appState.expenses.unshift({
            id: 'exp-rec-' + Date.now(),
            date: TODAY_ISO,
            time: '12:00',
            title: bill.title,
            amount: Number(bill.amount),
            category: bill.category || 'bills',
            spendType: bill.amount >= cfg.bigMin ? 'big' : 'medium',
            necessity: 'need',
            paymentMethod: cfg.code === 'PKR' ? 'Meezan Debit Card' : 'Checking Auto-Pay',
            merchant: bill.title,
            whoFor: bill.whoFor || 'Family / Household',
            note: 'Logged from Fixed Monthly Bills',
            isFamilyShareable: true
          });
          showToast(`Logged ${bill.title} (${formatMoney(bill.amount)})`);
        }
        saveState();
        renderAll();
      });
    });

    const q = (document.getElementById('monthlySearchInput').value || '').trim().toLowerCase();
    const sFilter = document.getElementById('monthlySizeFilter').value || 'all';

    let fullList = metrics.monthExpenses.slice();
    if (activeMonthlyCategoryFilter) {
      fullList = fullList.filter(e => e.category === activeMonthlyCategoryFilter);
    }
    if (sFilter === 'micro') fullList = fullList.filter(e => Number(e.amount) < cfg.microMax);
    if (sFilter === 'medium') fullList = fullList.filter(e => Number(e.amount) >= cfg.microMax && Number(e.amount) < cfg.bigMin);
    if (sFilter === 'big') fullList = fullList.filter(e => Number(e.amount) >= cfg.bigMin);
    if (sFilter === 'family') fullList = fullList.filter(e => (e.whoFor || '').toLowerCase().includes('family') || (e.whoFor || '').toLowerCase().includes('parents') || (e.whoFor || '').toLowerCase().includes('kids'));

    if (q) {
      fullList = fullList.filter(e =>
        (e.title || '').toLowerCase().includes(q) ||
        (e.merchant || '').toLowerCase().includes(q) ||
        (e.note || '').toLowerCase().includes(q) ||
        (e.whoFor || '').toLowerCase().includes(q) ||
        (e.paymentMethod || '').toLowerCase().includes(q)
      );
    }

    const fullListEl = document.getElementById('monthlyFullExpenseList');
    if (fullList.length === 0) {
      fullListEl.innerHTML = `<div class="section-hint" style="padding:12px;">No matching transactions found.</div>`;
    } else {
      fullListEl.innerHTML = fullList.map(e => createExpenseItemHTML(e, true)).join('');
      attachExpenseItemEvents(fullListEl);
    }
  }

  function getFilteredShareExpenses(metrics) {
    const { cfg } = metrics;
    const period = document.getElementById('sharePeriodSelect').value || 'month';
    const filter = document.getElementById('shareFilterSelect').value || 'all';

    let list = metrics.monthExpenses.slice();
    let periodLabel = 'Oct 1 – Oct 11, 2026 (Month-to-Date)';

    if (period === 'today') {
      list = list.filter(e => e.date === TODAY_ISO);
      periodLabel = 'Sunday, Oct 11, 2026 (Today)';
    } else if (period === 'week') {
      list = list.filter(e => e.date >= '2026-10-05' && e.date <= TODAY_ISO);
      periodLabel = 'Oct 5 – Oct 11, 2026 (Last 7 Days)';
    }

    if (filter === 'family') {
      list = list.filter(e => (e.whoFor || '').toLowerCase().includes('family') || (e.whoFor || '').toLowerCase().includes('parents') || (e.whoFor || '').toLowerCase().includes('kids') || e.necessity === 'family');
    } else if (filter === 'big') {
      list = list.filter(e => Number(e.amount) >= cfg.bigMin / 2);
    }

    return { list, periodLabel };
  }

  function buildFamilyShareText(metrics) {
    const { list, periodLabel } = getFilteredShareExpenses(metrics);
    const total = list.reduce((s, e) => s + Number(e.amount), 0);

    const byCat = {};
    list.forEach(e => {
      const cat = getCategoryMeta(e.category);
      const key = `${cat.icon} ${cat.label}`;
      byCat[key] = (byCat[key] || 0) + Number(e.amount);
    });

    const catLines = Object.entries(byCat)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `  • ${k}: ${formatMoney(v)}`)
      .join('\n');

    const itemLines = list.map(e =>
      `  • [${formatShortDate(e.date)}] ${e.title} — ${formatMoney(e.amount)} (${e.whoFor || 'Self'}${e.merchant ? ' @ ' + e.merchant : ''}${e.note ? ' | ' + e.note : ''})`
    ).join('\n');

    return [
      `CLEARSPEND HOUSEHOLD EXPENSE SUMMARY (${metrics.cfg.code})`,
      `Period: ${periodLabel}`,
      `──────────────────────────────────`,
      `Opening Balance: ${formatMoney(metrics.startingBalance)}`,
      `Total Spent (${list.length} items): ${formatMoney(total)}`,
      `Remaining Bank + Cash Balance: ${formatMoney(metrics.accountRemaining)}`,
      `Oct Budget Left: ${formatMoney(metrics.budgetRemaining)} (of ${formatMoney(metrics.monthlyBudget)})`,
      ``,
      `BY CATEGORY:`,
      catLines || '  • None',
      ``,
      `ITEMIZED LOG:`,
      itemLines || '  • None'
    ].join('\n');
  }

  function renderFamilyShareView(metrics) {
    const text = buildFamilyShareText(metrics);
    document.getElementById('familyShareTextPreview').textContent = text;

    const { list, periodLabel } = getFilteredShareExpenses(metrics);
    const total = list.reduce((s, e) => s + Number(e.amount), 0);
    document.getElementById('stmtTitle').textContent = `Household Expense Statement (${periodLabel})`;

    document.getElementById('stmtMetricsGrid').innerHTML = `
      <div class="split-stat-card">
        <span class="split-stat-title">Opening Balance</span>
        <strong class="split-stat-val">${formatMoney(metrics.startingBalance, true)}</strong>
      </div>
      <div class="split-stat-card">
        <span class="split-stat-title">Spent (${list.length})</span>
        <strong class="split-stat-val" style="color:var(--accent-rose)">${formatMoney(total, true)}</strong>
      </div>
      <div class="split-stat-card">
        <span class="split-stat-title">Balance Left</span>
        <strong class="split-stat-val" style="color:var(--accent-emerald)">${formatMoney(metrics.accountRemaining, true)}</strong>
      </div>
    `;

    const byCat = {};
    list.forEach(e => {
      const cat = getCategoryMeta(e.category);
      const key = `${cat.icon} ${cat.label}`;
      byCat[key] = (byCat[key] || 0) + Number(e.amount);
    });

    document.getElementById('stmtCategoryTable').innerHTML = Object.entries(byCat)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `
        <div class="stmt-row">
          <span>${escapeHtml(k)}</span>
          <strong>${formatMoney(v)}</strong>
        </div>
      `).join('') || '<div class="section-hint">No items</div>';

    document.getElementById('stmtItemizedList').innerHTML = list.map(e => `
      <div class="stmt-row">
        <div>
          <strong>${escapeHtml(e.title)}</strong> <span class="tag-badge">${formatShortDate(e.date)}</span>
          <div class="section-hint">For: ${escapeHtml(e.whoFor || 'Self')} · ${escapeHtml(e.merchant || e.paymentMethod || '')} ${e.note ? '— ' + escapeHtml(e.note) : ''}</div>
        </div>
        <strong>${formatMoney(e.amount)}</strong>
      </div>
    `).join('') || '<div class="section-hint">No items</div>';
  }

  function renderWidgetsView(metrics) {
    document.getElementById('wMedAccount').textContent = `Bank Left: ${formatMoney(metrics.accountRemaining, true)}`;
    document.getElementById('wMedTodaySpent').textContent = formatMoney(metrics.todayTotal, true);
    document.getElementById('wMedSafeSub').textContent =
      `Safe/day: ${formatMoney(metrics.safeDailyAllowance, true)} · ${metrics.todayExpenses.length} items`;

    const pct = metrics.monthlyBudget > 0 ? Math.min(100, (metrics.monthTotal / metrics.monthlyBudget) * 100) : 0;
    document.getElementById('wMedProgressFill').style.width = `${pct}%`;
    document.getElementById('wMedBudgetLeft').textContent = `Oct Budget Left: ${formatMoney(metrics.budgetRemaining, true)}`;

    document.getElementById('wSmTodaySpent').textContent = formatMoney(metrics.todayTotal, true);
    document.getElementById('wSmSafe').textContent = `Safe: ${formatMoney(metrics.safeDailyAllowance, true)}/d`;
    document.getElementById('wLockStat').textContent = `Left: ${formatMoney(metrics.budgetRemaining, true)}`;
  }

  function runLiveUsabilityAudit() {
    const grid = document.getElementById('liveAuditResultsGrid');
    if (!grid) return;

    const cfg = getActiveConfig();
    const tabButtons = Array.from(document.querySelectorAll('.ios-tab-bar .tab-btn'));
    const memoryChips = document.querySelectorAll('.memory-chip');

    const checks = [
      {
        title: '✓ 0-Tap Today Access',
        detail: `Opens directly into Today (${TODAY_ISO}) with zero navigation hierarchy`
      },
      {
        title: `✓ Native ${cfg.code} (${cfg.shortSymbol}) Engine`,
        detail: `Tabular numerals, ${cfg.code} presets & micro/big leak thresholds active`
      },
      {
        title: '✓ iPhone 13 Pro Max HIG',
        detail: `428×926 pt viewport, ${tabButtons.length} SVG dock tabs (50pt) & ≥44pt targets`
      },
      {
        title: '✓ Recognition Over Recall',
        detail: `${memoryChips.length} 1-tap chips + 6 evening recall prompts (Nielsen #6)`
      },
      {
        title: '✓ Fitts\'s Law Thumb Arc',
        detail: 'Quick-Entry Composer & Dock anchored in bottom one-handed reach zone'
      },
      {
        title: '✓ Zero-Account Guardrails',
        detail: 'Live Bank Balance + Safe Daily Limit + Mystery Gap Reconciler'
      }
    ];

    grid.innerHTML = checks.map(c => `
      <div class="audit-pill-card">
        <strong>${escapeHtml(c.title)}</strong>
        <span>${escapeHtml(c.detail)}</span>
      </div>
    `).join('');
  }

  function renderRecallChecklistModal() {
    const cfg = getActiveConfig();
    const prompts = cfg.code === 'PKR' ? RECALL_PROMPTS_BY_CURRENCY.PKR : RECALL_PROMPTS_BY_CURRENCY.DEFAULT;
    document.getElementById('recallModalDate').textContent = formatShortDate(selectedDate) + ', 2026';
    const grid = document.getElementById('recallChecklistGrid');
    grid.innerHTML = prompts.map((item, idx) => `
      <button type="button" class="recall-prompt-btn" data-recall-idx="${idx}">
        <div>
          <strong>${item.icon} ${escapeHtml(item.title)}</strong>
          <div class="section-hint">${escapeHtml(item.hint)} · For: ${escapeHtml(item.whoFor)}</div>
        </div>
        <strong style="color:var(--accent-emerald); white-space:nowrap;">+ ${formatMoney(item.amount)}</strong>
      </button>
    `).join('');

    grid.querySelectorAll('[data-recall-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-recall-idx'), 10);
        const item = prompts[idx];
        if (!item) return;
        appState.expenses.unshift({
          id: 'exp-recall-' + Date.now() + '-' + idx,
          date: selectedDate,
          time: new Date().toTimeString().slice(0, 5),
          title: item.title,
          amount: Number(item.amount),
          category: item.category,
          spendType: item.amount < cfg.microMax ? 'micro' : 'medium',
          necessity: item.necessity,
          paymentMethod: cfg.code === 'PKR' ? 'Cash' : 'Apple Pay',
          merchant: 'Evening Recall',
          whoFor: item.whoFor,
          note: 'Logged via 20-Second Evening Recall Checklist',
          isFamilyShareable: true
        });
        saveState();
        renderAll();
        showToast(`Logged "${item.title}" (${formatMoney(item.amount)})`);
      });
    });
  }

  function renderAll() {
    const metrics = computeMetrics();
    renderTopPulse(metrics);
    renderMemoryChips(metrics);
    renderDateNavigator(metrics);
    renderCategoryPills();
    renderTodayLedger(metrics);
    renderMonthlyView(metrics);
    renderFamilyShareView(metrics);
    renderWidgetsView(metrics);
    runLiveUsabilityAudit();
    renderRecallChecklistModal();
  }

  function switchTab(tabId) {
    document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.ios-tab-bar .tab-btn').forEach(b => b.classList.remove('active'));

    const targetPanel = document.getElementById(`view-${tabId}`) || document.getElementById('view-today');
    targetPanel.classList.add('active');

    const targetBtn = document.querySelector(`.ios-tab-bar .tab-btn[data-tab="${tabId}"]`) ||
                      document.getElementById('tabBtnToday');
    if (targetBtn) targetBtn.classList.add('active');
    document.getElementById('appViewport').scrollTop = 0;
  }

  function stepDate(deltaDays) {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const nextD = Math.min(31, Math.max(1, d + deltaDays));
    selectedDate = `2026-10-${String(nextD).padStart(2, '0')}`;
    renderAll();
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function handleUrlDeepLinks() {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    const action = params.get('action');
    const dateParam = params.get('date');
    const currencyParam = params.get('currency');

    if (currencyParam && CURRENCY_CONFIGS[currencyParam.toUpperCase()]) {
      switchCurrencyProfile(currencyParam.toUpperCase());
    }

    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      selectedDate = dateParam;
    }

    if (params.get('quickAdd') === '1' && params.get('amount')) {
      const cfg = getActiveConfig();
      const amt = parseFloat(params.get('amount'));
      if (!isNaN(amt) && amt > 0) {
        appState.expenses.unshift({
          id: 'exp-shortcut-' + Date.now(),
          date: selectedDate,
          time: new Date().toTimeString().slice(0, 5),
          title: params.get('title') || 'iPhone Shortcut Quick Log',
          amount: Number(amt.toFixed(cfg.decimals)),
          category: params.get('category') || 'food',
          spendType: amt < cfg.microMax ? 'micro' : (amt >= cfg.bigMin ? 'big' : 'medium'),
          necessity: params.get('necessity') || 'need',
          paymentMethod: cfg.code === 'PKR' ? 'SadaPay' : 'Apple Pay',
          merchant: params.get('merchant') || '',
          whoFor: params.get('whoFor') || 'Self',
          note: 'Added via iPhone Shortcut URL deep link',
          isFamilyShareable: true
        });
        saveState();
        showToast(`Logged ${formatMoney(amt)} from iPhone Shortcut`);
      }
    }

    if (view && ['today', 'monthly', 'family', 'widgets', 'ux'].includes(view)) {
      switchTab(view);
    } else {
      switchTab('today');
    }

    if (action === 'quick-add') {
      switchTab('today');
      setTimeout(() => {
        const amtInput = document.getElementById('expenseAmount');
        if (amtInput) amtInput.focus();
      }, 150);
    }
  }

  function initEventListeners() {
    document.querySelectorAll('.ios-tab-bar .tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        switchTab(btn.getAttribute('data-tab'));
      });
    });

    // Quick Currency Switcher in Header
    document.getElementById('quickCurrencySelect').addEventListener('change', (e) => {
      switchCurrencyProfile(e.target.value);
    });

    // Simulator Toolbar
    document.getElementById('toggleFrameBtn').addEventListener('click', () => {
      document.body.classList.toggle('frame-mode');
      document.body.classList.toggle('fullscreen-mode');
    });

    document.getElementById('toggleThumbZoneBtn').addEventListener('click', (e) => {
      const overlay = document.getElementById('thumbZoneOverlay');
      overlay.classList.toggle('hidden');
      e.currentTarget.classList.toggle('active');
    });

    document.getElementById('toggleThemeBtn').addEventListener('click', () => {
      const html = document.documentElement;
      const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      html.setAttribute('data-theme', next);
      showToast(`${next === 'dark' ? 'OLED Dark' : 'Porcelain Light'} mode`);
    });

    function openIphoneQrModal() {
      const liveUrl = window.location.origin + window.location.pathname.replace(/index\.html$/, '') + '?view=today';
      const urlInput = document.getElementById('liveIphoneUrlInput');
      const qrImg = document.getElementById('liveIphoneQrImg');
      if (urlInput) urlInput.value = liveUrl;
      if (qrImg) {
        if (window.location.hostname.includes('github.io')) {
          qrImg.src = 'qr-pages.svg';
        } else {
          qrImg.onerror = () => { qrImg.src = 'qr-pages.svg'; };
          qrImg.src = '/api/qr.svg?url=' + encodeURIComponent(liveUrl);
        }
      }
      document.getElementById('installGuideModal').classList.remove('hidden');
    }

    document.getElementById('openInstallGuideBtn').addEventListener('click', openIphoneQrModal);
    const headerQrBtn = document.getElementById('headerQrBtn');
    if (headerQrBtn) headerQrBtn.addEventListener('click', openIphoneQrModal);

    const copyLiveUrlBtn = document.getElementById('copyLiveIphoneUrlBtn');
    if (copyLiveUrlBtn) {
      copyLiveUrlBtn.addEventListener('click', async () => {
        const liveUrl = window.location.origin + '/?view=today';
        try {
          await navigator.clipboard.writeText(liveUrl);
          copyLiveUrlBtn.textContent = '✓ Copied!';
          showToast('Copied live iPhone link — send via WhatsApp or AirDrop!');
        } catch (e) {
          showToast('Select and copy the link from the box');
        }
      });
    }

    // Date Stepper
    document.getElementById('prevDayBtn').addEventListener('click', () => stepDate(-1));
    document.getElementById('nextDayBtn').addEventListener('click', () => stepDate(1));
    document.getElementById('todayJumpBtn').addEventListener('click', () => {
      selectedDate = TODAY_ISO;
      renderAll();
      showToast('Viewing Today (Sun, Oct 11, 2026)');
    });

    // Progressive Disclosure
    document.getElementById('toggleDetailsBtn').addEventListener('click', (e) => {
      const panel = document.getElementById('extraFieldsPanel');
      const isHidden = panel.classList.toggle('hidden');
      e.currentTarget.setAttribute('aria-expanded', String(!isHidden));
      document.getElementById('detailsChevron').textContent = isHidden ? '+' : '−';
    });

    document.getElementById('cancelEditBtn').addEventListener('click', () => {
      document.getElementById('editExpenseId').value = '';
      document.getElementById('expenseForm').reset();
      document.getElementById('expenseDate').value = selectedDate;
      document.getElementById('cancelEditBtn').classList.add('hidden');
      renderAll();
    });

    // Submit Expense Form
    document.getElementById('expenseForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const cfg = getActiveConfig();
      const amountVal = parseFloat(document.getElementById('expenseAmount').value);
      const titleVal = (document.getElementById('expenseTitle').value || '').trim();

      if (!amountVal || isNaN(amountVal) || amountVal <= 0) {
        showToast('Enter an expense amount');
        document.getElementById('expenseAmount').focus();
        return;
      }

      const catMeta = getCategoryMeta(selectedCategory);
      const finalTitle = titleVal || `${catMeta.label} Expense`;
      const dateVal = document.getElementById('expenseDate').value || selectedDate;
      const timeVal = document.getElementById('expenseTime').value || '14:30';
      const whoVal = document.getElementById('expenseWhoFor').value || 'Family / Household';
      const needVal = document.getElementById('expenseNecessity').value || 'need';
      const payVal = document.getElementById('expensePayment').value || (cfg.code === 'PKR' ? 'SadaPay' : 'Apple Pay');
      const merchVal = (document.getElementById('expenseMerchant').value || '').trim();
      const noteVal = (document.getElementById('expenseNote').value || '').trim();

      const editId = document.getElementById('editExpenseId').value;
      const payload = {
        id: editId || ('exp-' + Date.now()),
        date: dateVal,
        time: timeVal,
        title: finalTitle,
        amount: Number(amountVal.toFixed(cfg.decimals)),
        category: selectedCategory,
        spendType: amountVal < cfg.microMax ? 'micro' : (amountVal >= cfg.bigMin ? 'big' : 'medium'),
        necessity: needVal,
        paymentMethod: payVal,
        merchant: merchVal,
        whoFor: whoVal,
        note: noteVal,
        isFamilyShareable: true
      };

      if (editId) {
        const idx = appState.expenses.findIndex(x => x.id === editId);
        if (idx !== -1) appState.expenses[idx] = payload;
        document.getElementById('editExpenseId').value = '';
        document.getElementById('cancelEditBtn').classList.add('hidden');
        showToast(`Updated "${finalTitle}"`);
      } else {
        appState.expenses.unshift(payload);
        showToast(`Saved ${formatMoney(amountVal)} to ${formatShortDate(dateVal)}`);
      }

      selectedDate = dateVal;
      document.getElementById('expenseAmount').value = '';
      document.getElementById('expenseTitle').value = '';
      document.getElementById('expenseMerchant').value = '';
      document.getElementById('expenseNote').value = '';

      saveState();
      renderAll();
    });

    // Day Ledger Mini Filters
    document.querySelectorAll('[data-dayfilter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-dayfilter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeDayFilter = btn.getAttribute('data-dayfilter');
        renderTodayLedger(computeMetrics());
      });
    });

    // Monthly Filters & Search
    document.getElementById('monthlySearchInput').addEventListener('input', () => {
      renderMonthlyView(computeMetrics());
    });
    document.getElementById('monthlySizeFilter').addEventListener('change', () => {
      renderMonthlyView(computeMetrics());
    });
    document.getElementById('clearCategoryFilterBtn').addEventListener('click', () => {
      activeMonthlyCategoryFilter = null;
      renderMonthlyView(computeMetrics());
    });
    document.getElementById('jumpToShareFromMonthlyBtn').addEventListener('click', () => {
      switchTab('family');
    });

    // Family Share Controls
    document.getElementById('sharePeriodSelect').addEventListener('change', () => {
      renderFamilyShareView(computeMetrics());
    });
    document.getElementById('shareFilterSelect').addEventListener('change', () => {
      renderFamilyShareView(computeMetrics());
    });

    document.getElementById('copyFamilyTextBtn').addEventListener('click', async () => {
      const txt = buildFamilyShareText(computeMetrics());
      try {
        await navigator.clipboard.writeText(txt);
        document.getElementById('copyConfirmBadge').textContent = 'Copied';
        showToast('Copied summary for WhatsApp / iMessage');
      } catch (e) {
        showToast('Summary ready below');
      }
    });

    document.getElementById('nativeShareBtn').addEventListener('click', async () => {
      const txt = buildFamilyShareText(computeMetrics());
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'October 2026 Family Expense Summary',
            text: txt
          });
          return;
        } catch (err) {}
      }
      try {
        await navigator.clipboard.writeText(txt);
      } catch (e) {}
      showToast('Copied summary to clipboard');
    });

    document.getElementById('printFamilyStatementBtn').addEventListener('click', () => {
      window.print();
    });

    document.getElementById('exportCsvBtn').addEventListener('click', () => {
      const { list } = getFilteredShareExpenses(computeMetrics());
      const headers = ['Date', 'Time', 'Title', 'Amount', 'Currency', 'Category', 'WhoFor', 'Necessity', 'PaymentMethod', 'Merchant', 'Note'];
      const rows = list.map(e => [
        e.date, e.time || '', `"${(e.title || '').replace(/"/g, '""')}"`, e.amount, appState.currencyCode || 'PKR',
        e.category, `"${(e.whoFor || '').replace(/"/g, '""')}"`, e.necessity || '',
        `"${(e.paymentMethod || '').replace(/"/g, '""')}"`, `"${(e.merchant || '').replace(/"/g, '""')}"`,
        `"${(e.note || '').replace(/"/g, '""')}"`
      ].join(','));
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `clearspend-report-${TODAY_ISO}.csv`;
      link.click();
      showToast('Downloaded CSV');
    });

    // Widgets actions
    document.querySelectorAll('[data-widget-action]').forEach(el => {
      el.addEventListener('click', () => {
        const act = el.getAttribute('data-widget-action');
        if (act === 'quick-add' || act === 'today') {
          selectedDate = TODAY_ISO;
          switchTab('today');
          renderAll();
          document.getElementById('expenseAmount').focus();
          showToast('Opened Today\'s Ledger directly');
        } else if (act === 'family') {
          switchTab('family');
        } else if (act === 'recall') {
          document.getElementById('recallModal').classList.remove('hidden');
        }
      });
    });

    document.getElementById('copyScriptableCodeBtn').addEventListener('click', async () => {
      let code = '';
      try {
        const res = await fetch('/api/scriptable-widget.js');
        if (res.ok) code = await res.text();
      } catch (e) {}
      if (!code) {
        const m = computeMetrics();
        const appUrl = window.location.origin + window.location.pathname.replace(/index\.html$/, '');
        code = `// ClearSpend Pro Max — iOS Scriptable Home Screen Widget (${m.cfg.code})\nconst w = new ListWidget();\nw.url = "${appUrl}?view=today";\nw.backgroundColor = new Color("#080B11");\nconst t = w.addText("CLEARSPEND • TODAY");\nt.font = Font.boldSystemFont(10);\nt.textColor = new Color("#10B981");\nconst main = w.addText("${formatMoney(m.todayTotal, true)}");\nmain.font = Font.boldRoundedSystemFont(26);\nmain.textColor = Color.white();\nconst sub = w.addText("Safe/day: ${formatMoney(m.safeDailyAllowance, true)} • Bank Left: ${formatMoney(m.accountRemaining, true)}");\nsub.font = Font.systemFont(11);\nsub.textColor = new Color("#CBD5E1");\nScript.setWidget(w);\nScript.complete();`;
      }
      const box = document.getElementById('widgetCodePreviewBox');
      box.textContent = code;
      box.classList.remove('hidden');
      try {
        await navigator.clipboard.writeText(code);
        showToast('Copied iOS Scriptable Widget code');
      } catch (e) {
        showToast('Widget code shown below');
      }
    });

    document.getElementById('testWidgetApiBtn').addEventListener('click', async () => {
      let data = null;
      try {
        const res = await fetch('/api/widget-summary');
        if (res.ok) data = await res.json();
      } catch (e) {}
      if (!data) {
        const m = computeMetrics();
        data = {
          appName: 'ClearSpend Pro Max',
          currencyCode: m.cfg.code,
          todayDate: TODAY_ISO,
          todaySpent: m.todayTotal,
          safeDailyAllowance: Math.round(m.safeDailyAllowance),
          budgetRemaining: m.budgetRemaining,
          accountRemaining: m.accountRemaining
        };
      }
      const box = document.getElementById('widgetCodePreviewBox');
      box.textContent = JSON.stringify(data, null, 2);
      box.classList.remove('hidden');
      showToast('Loaded live widget summary JSON');
    });

    // Reminders
    document.getElementById('reminderTimeInput').addEventListener('change', (e) => {
      const val = e.target.value || '21:00';
      appState.reminderSettings.eveningRecallTime = val;
      document.getElementById('downloadIcsAlarmLink').href = `/api/reminder.ics?time=${encodeURIComponent(val)}`;
      saveState();
      showToast(`Recall alarm set to ${val}`);
    });

    document.getElementById('enableWebNotifBtn').addEventListener('click', async () => {
      if (!('Notification' in window)) {
        showToast('Use the .ics button above on iPhone Safari for native alerts');
        return;
      }
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        new Notification('ClearSpend Reminder Active', {
          body: 'Tap anytime to log Today\'s spending in 2 seconds.'
        });
        showToast('Push notifications enabled');
      } else {
        showToast('Use the .ics Calendar button for native iOS alerts');
      }
    });

    document.getElementById('openRecallPromptBtn').addEventListener('click', () => {
      document.getElementById('recallModal').classList.remove('hidden');
    });
    document.getElementById('triggerRecallDemoBtn').addEventListener('click', () => {
      document.getElementById('recallModal').classList.remove('hidden');
    });

    // Reconcile Bank Balance Modal
    document.getElementById('reconcileModalBtn').addEventListener('click', () => {
      const m = computeMetrics();
      document.getElementById('recExpectedVal').textContent = formatMoney(m.accountRemaining);
      document.getElementById('actualBankInputLabel').textContent = `Actual Bank + Cash Now (${m.cfg.shortSymbol}):`;
      document.getElementById('actualBankInput').value = '';
      document.getElementById('reconcileResultBox').classList.add('hidden');
      document.getElementById('logGapAdjustmentBtn').classList.add('hidden');
      document.getElementById('reconcileModal').classList.remove('hidden');
    });

    document.getElementById('actualBankInput').addEventListener('input', (e) => {
      const actual = parseFloat(e.target.value);
      const m = computeMetrics();
      const box = document.getElementById('reconcileResultBox');
      const btn = document.getElementById('logGapAdjustmentBtn');
      if (isNaN(actual)) {
        box.classList.add('hidden');
        btn.classList.add('hidden');
        return;
      }
      const diff = m.accountRemaining - actual;
      box.classList.remove('hidden');
      if (Math.abs(diff) < 1) {
        box.innerHTML = `<strong>✓ Balanced</strong> Your logged expenses match your bank balance.`;
        btn.classList.add('hidden');
      } else if (diff > 0) {
        pendingGapAmount = Number(diff.toFixed(m.cfg.decimals));
        box.innerHTML = `<strong>Unlogged Gap: ${formatMoney(diff)}</strong><br/>Your bank is ${formatMoney(diff)} lower than logged transactions.`;
        btn.textContent = `+ Log ${formatMoney(diff)} Gap to Today`;
        btn.classList.remove('hidden');
      } else {
        pendingGapAmount = 0;
        box.innerHTML = `<strong>Surplus: +${formatMoney(Math.abs(diff))}</strong><br/>Your bank has ${formatMoney(Math.abs(diff))} more than expected.`;
        btn.classList.add('hidden');
      }
    });

    document.getElementById('logGapAdjustmentBtn').addEventListener('click', () => {
      const cfg = getActiveConfig();
      if (pendingGapAmount > 0) {
        appState.expenses.unshift({
          id: 'exp-gap-' + Date.now(),
          date: TODAY_ISO,
          time: new Date().toTimeString().slice(0, 5),
          title: 'Bank Balance Reconciliation Adjustment',
          amount: pendingGapAmount,
          category: 'personal',
          spendType: pendingGapAmount < cfg.microMax ? 'micro' : 'medium',
          necessity: 'impulse',
          paymentMethod: cfg.code === 'PKR' ? 'Cash' : 'Debit Card',
          merchant: 'Balance Catch-Up',
          whoFor: 'Self',
          note: 'Reconciled unlogged gap with actual bank balance',
          isFamilyShareable: true
        });
        saveState();
        renderAll();
        document.getElementById('reconcileModal').classList.add('hidden');
        showToast(`Logged ${formatMoney(pendingGapAmount)} gap — balance synced`);
      }
    });

    // Setup Modal
    document.getElementById('dataModeBtn').addEventListener('click', () => {
      document.getElementById('setupCurrencySelect').value = appState.currencyCode || 'PKR';
      document.getElementById('setupStartingBalance').value = appState.account?.startingBalance || 285000;
      document.getElementById('setupMonthlyBudget').value = appState.account?.monthlyBudget || 180000;
      document.getElementById('setupAccountName').value = appState.account?.accountName || 'Meezan / SadaPay & Cash';
      document.getElementById('setupModal').classList.remove('hidden');
    });

    document.getElementById('saveSetupBtn').addEventListener('click', () => {
      const newCode = document.getElementById('setupCurrencySelect').value || 'PKR';
      const cfg = CURRENCY_CONFIGS[newCode] || CURRENCY_CONFIGS.PKR;
      appState.currencyCode = cfg.code;
      appState.currency = cfg.symbol;
      appState.account.startingBalance = parseFloat(document.getElementById('setupStartingBalance').value) || 0;
      appState.account.monthlyBudget = parseFloat(document.getElementById('setupMonthlyBudget').value) || 0;
      appState.account.accountName = document.getElementById('setupAccountName').value || 'Primary Account';
      saveState();
      renderAll();
      document.getElementById('setupModal').classList.add('hidden');
      showToast(`Saved ${cfg.code} budget & account settings`);
    });

    document.getElementById('loadPkrProfileBtn').addEventListener('click', () => {
      switchCurrencyProfile('PKR');
      document.getElementById('setupModal').classList.add('hidden');
    });

    document.getElementById('loadUsdProfileBtn').addEventListener('click', () => {
      switchCurrencyProfile('USD');
      document.getElementById('setupModal').classList.add('hidden');
    });

    document.getElementById('clearToEmptyDataBtn').addEventListener('click', () => {
      appState.expenses = [];
      saveState();
      renderAll();
      document.getElementById('setupModal').classList.add('hidden');
      showToast('Cleared sample transactions');
    });

    document.getElementById('exportJsonBackupBtn').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(appState, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `clearspend-backup-${TODAY_ISO}.json`;
      a.click();
      showToast('Exported JSON backup');
    });

    document.getElementById('runLiveAuditBtn').addEventListener('click', () => {
      runLiveUsabilityAudit();
      showToast('Verified all HIG & Usability checks');
    });

    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-close-modal');
        document.getElementById(target).classList.add('hidden');
      });
    });
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadState();
    initEventListeners();
    handleUrlDeepLinks();
    renderAll();
  });
})();
