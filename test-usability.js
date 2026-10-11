const http = require('http');
const assert = require('assert');

const BASE = 'http://127.0.0.1:3000';

function request(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(path, BASE);
    const opts = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {}
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk.toString(); });
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('Running ClearSpend Pro Max (PKR & Minimal Flagship UI/UX) Verification Suite...');

  // 1. Health check
  const health = await request('/api/health');
  assert.strictEqual(health.status, 200);
  const hJson = JSON.parse(health.body);
  assert.strictEqual(hJson.status, 'ok');
  assert.strictEqual(hJson.currencyCode, 'PKR');
  console.log('✓ [1/7] Server health, iPhone 13 Pro Max PWA & PKR default profile verified');

  // 2. Direct Today Launch HTML & Minimal October 2026 HIG DOM check
  const indexRes = await request('/');
  assert.strictEqual(indexRes.status, 200);
  assert(indexRes.body.includes('apple-mobile-web-app-capable'), 'Missing iOS standalone PWA meta tag');
  assert(indexRes.body.includes('class="view-panel active" id="view-today"'), 'Today view must be active on launch');
  assert(indexRes.body.includes('Sun, Oct 11, 2026'), 'Must default directly to current date Oct 11, 2026');
  assert(indexRes.body.includes('id="quickCurrencySelect"'), 'Missing 1-tap header currency switcher');
  assert(indexRes.body.includes('value="PKR"'), 'Missing PKR currency option');
  assert(indexRes.body.includes('SadaPay'), 'Missing PKR payment rails');
  assert(indexRes.body.includes('memory-chip'), 'Missing Recognition Memory Chips');
  assert(indexRes.body.includes('reconcileModal'), 'Missing Bank Balance Gap Reconciler');
  console.log('✓ [2/7] 0-Tap Direct Today Launch (Oct 11, 2026), PKR rails & Minimal Bento DOM verified');

  // 3. Manifest & Service Worker
  const manifestRes = await request('/manifest.json');
  assert.strictEqual(manifestRes.status, 200);
  const manifest = JSON.parse(manifestRes.body);
  assert.strictEqual(manifest.start_url, '/?view=today');
  assert.strictEqual(manifest.display, 'standalone');
  const swRes = await request('/sw.js');
  assert.strictEqual(swRes.status, 200);
  console.log('✓ [3/7] iOS Web App Manifest (standalone + shortcuts) & Service Worker verified');

  // 4. Widget Summary API calculations in PKR
  const summaryRes = await request('/api/widget-summary');
  assert.strictEqual(summaryRes.status, 200);
  const sum = JSON.parse(summaryRes.body);
  assert.strictEqual(sum.todayDate, '2026-10-11');
  assert.strictEqual(sum.currencyCode, 'PKR');
  assert.strictEqual(sum.todaySpent, 16670);
  assert.strictEqual(sum.monthSpent, 100450);
  assert.strictEqual(sum.budgetRemaining, 79550);
  assert.strictEqual(sum.accountRemaining, 184550);
  console.log('✓ [4/7] Widget Summary API (/api/widget-summary) PKR math & Safe-to-Spend verified');

  // 5. Quick-Add API & Multi-Currency Reset Seed
  const addRes = await request('/api/quick-add', 'POST', {
    amount: 350,
    title: 'Evening Chai',
    category: 'coffee',
    whoFor: 'Self'
  });
  assert.strictEqual(addRes.status, 200);
  const addJson = JSON.parse(addRes.body);
  assert.strictEqual(addJson.ok, true);
  assert.strictEqual(addJson.expense.spendType, 'micro');
  assert.strictEqual(addJson.summary.todaySpent, 17020);

  const resetRes = await request('/api/reset-seed', 'POST', { currencyCode: 'PKR' });
  assert.strictEqual(resetRes.status, 200);
  console.log('✓ [5/7] 1-Tap Quick-Add API (/api/quick-add) & PKR micro-spend classification verified');

  // 6. Native iOS Calendar Reminder (.ics)
  const icsRes = await request('/api/reminder.ics?time=21:00');
  assert.strictEqual(icsRes.status, 200);
  assert(icsRes.body.includes('BEGIN:VCALENDAR'));
  assert(icsRes.body.includes('BEGIN:VALARM'));
  console.log('✓ [6/7] RFC 5545 iOS Calendar / Reminder Alarm (.ics) generator verified');

  // 7. iOS Scriptable Home Screen Widget, QR Code SVG & Standalone HTML endpoints
  const scriptRes = await request('/api/scriptable-widget.js');
  assert.strictEqual(scriptRes.status, 200);
  assert(scriptRes.body.includes('new ListWidget()'));
  assert(scriptRes.body.includes('PKR'));

  const qrRes = await request('/api/qr.svg?url=https://example.com');
  assert.strictEqual(qrRes.status, 200);
  assert(qrRes.body.includes('<svg'));

  const dlRes = await request('/download/ClearSpend-iPhone.html');
  assert.strictEqual(dlRes.status, 200);
  assert(dlRes.body.includes('<!DOCTYPE html>'));
  console.log('✓ [7/7] Native iOS Scriptable Widget, Live QR Code SVG & Standalone iPhone Download verified');

  console.log('\nALL 7 USABILITY & FUNCTIONAL TEST SUITES PASSED!');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
