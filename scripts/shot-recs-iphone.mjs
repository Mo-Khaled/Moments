import { chromium, webkit, devices } from 'playwright-core';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const TAG = arg('tag', 'recs');
for (const [name, eng] of [['chromium', () => chromium.launch({ channel: 'chrome', headless: true })], ['webkit', () => webkit.launch({ headless: true })]]) {
  const b = await eng();
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  await ctx.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
  const p = await ctx.newPage();
  await p.goto('https://momentseg.com/products/9-pm-night-out?pb=0', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForTimeout(3000);
  for (let i = 0; i < 12; i++) { await p.evaluate(() => window.scrollBy({ top: 700, behavior: 'instant' })); await p.waitForTimeout(500); }
  const found = await p.evaluate(() => { const c = [...document.querySelectorAll('product-card')].find((e) => { const r = e.getBoundingClientRect(); return r.width > 100; }); if (!c) return null; c.scrollIntoView({ block: 'center', behavior: 'instant' }); const r = c.getBoundingClientRect(); const btn = c.querySelector('.quick-add__button'); const br = btn && btn.getBoundingClientRect(); return { card: [Math.round(r.width), Math.round(r.height)], btn: br && [Math.round(br.width), Math.round(br.height)], align: getComputedStyle(c.querySelector('.card-meta') || c).textAlign }; });
  await p.waitForTimeout(600);
  await p.screenshot({ path: `docs/screenshots/cards/${TAG}-${name}.png` });
  console.log(name, JSON.stringify(found));
  await ctx.close(); await b.close();
}
