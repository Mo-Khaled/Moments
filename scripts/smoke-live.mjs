// Post-push smoke test on the LIVE storefront (no orders are placed). usage: node scripts/smoke-live.mjs
import { chromium } from 'playwright-core';
const BASE = 'https://momentseg.com';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
let bad = 0;
const fail = (m) => { bad++; console.log('FAIL', m); };
for (const [w, h, tag] of [[1440, 900, 'desktop'], [375, 800, 'mobile']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
  const page = await ctx.newPage();
  const errors = [];
  // the aborted analytics routes above make fetch() reject: that is the test, not the site
  page.on('pageerror', (e) => { if (!/Failed to fetch/.test(String(e))) errors.push(String(e).slice(0, 120)); });
  const visit = async (path, what) => {
    const r = await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(1500);
    if (!r || r.status() >= 400) fail(`${tag} ${path} status ${r && r.status()}`); else console.log(`ok ${tag} ${path} (${what})`);
  };
  await visit('/', 'home');
  await visit('/collections/all', 'collection');
  await visit('/pages/about-us', 'about');
  await visit('/search?q=oud', 'search');
  await visit('/products/9-pm-night-out', 'product');
  const add = page.locator('form[action*="/cart/add"] button[type=submit]:not([disabled])').first();
  if (await add.count()) {
    await add.click({ timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(2500);
    const cart = await page.evaluate(() => fetch('/cart.js').then((r) => r.json()));
    if (cart.item_count > 0) console.log(`ok ${tag} add to cart (${cart.item_count})`); else fail(`${tag} add to cart`);
    await visit('/cart', 'cart');
    const co = await page.evaluate(() => fetch('/checkout', { redirect: 'manual' }).then((r) => r.type));
    console.log(`ok ${tag} checkout reachable (${co})`);
  } else fail(`${tag} no add-to-cart button`);
  const text = await page.evaluate(() => document.body.innerText);
  for (const rx of [/\bTODO/i, /harama/i, /exchange policy/i]) if (rx.test(text)) fail(`${tag} banned/old text ${rx}`);
  if (errors.length) fail(`${tag} console errors: ${errors.join(' | ')}`);
  await ctx.close();
}
await browser.close();
console.log(bad ? `SMOKE FAILED (${bad})` : 'SMOKE PASSED');
process.exit(bad ? 1 : 0);
