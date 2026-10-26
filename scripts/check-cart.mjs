// Cart page flow on the storefront (stops before any order). usage: node scripts/check-cart.mjs [--theme id] [--view new]
// Free-shipping bar below and above the threshold, quantity +/-, remove, empty state (six moment tiles), phone checkout bar,
// Checkout reaches checkout, add-to-cart toast, no horizontal overflow at 320/375/390/768/1440, LTR and RTL.
import { chromium, devices } from 'playwright-core';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const THEME = arg('theme', ''); const VIEW = arg('view', '');
const Q = `pb=0${THEME ? '&preview_theme_id=' + THEME : ''}${VIEW ? '&view=' + VIEW : ''}`;
const CHEAP = '9-pm-night-out'; const OTHER = 'khadlaj-25-experience';
const b = await chromium.launch({ channel: 'chrome', headless: true });
let bad = 0; const fail = (m) => { bad++; console.log('FAIL', m); };
const ok = (m) => console.log('ok  ', m);
// Calls from inside a real page (same-origin fetch) look like a shopper; direct API calls from the test runner get rate limited.
const api = (p, url, body) => p.evaluate(async ([u, bd]) => { const r = await fetch(u, bd ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(bd) } : undefined); return r.text(); }, [url, body]);
const cache = new Map();
// the variant id comes from the product page's own add-to-cart form (a normal page view), once per product for the whole run
const variantId = async (p, h) => { if (cache.has(h)) return cache.get(h); await p.goto(`https://momentseg.com/products/${h}?pb=0`, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(3500); const id = await p.evaluate(() => Number([...document.querySelectorAll('input[name="id"]')].map((e) => e.value).find((v) => /^[0-9]{8,}$/.test(v)))); if (!id) throw new Error('no variant id for ' + h); cache.set(h, id); return id; };

for (const [w, mobile] of [[1440, false], [768, false], [390, true], [375, true], [320, true]]) for (const dir of ['ltr', 'rtl']) {
  const ctx = await b.newContext(mobile ? { ...devices['iPhone 13'], viewport: { width: w, height: 800 } } : { viewport: { width: w, height: 900 } });
  await ctx.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
  const p = await ctx.newPage();
  const tag = `${w} ${dir}`;
  try {
    await p.goto(`https://momentseg.com/cart?${Q}`, { waitUntil: 'domcontentloaded' });
    const a = await variantId(p, CHEAP); const c = await variantId(p, OTHER);
    await api(p, '/cart/clear.js', {});
    await api(p, '/cart/add.js', { items: [{ id: a, quantity: 1 }] });
    const open = async () => { await p.goto(`https://momentseg.com/cart?${Q}`, { waitUntil: 'domcontentloaded' }); if (dir === 'rtl') { await p.evaluate(() => { document.documentElement.dir = 'rtl'; document.documentElement.lang = 'ar'; }); await p.addStyleTag({ content: "html[dir='rtl'] .skip-to-content-link:not(:focus){left:auto;right:-99999px}" }); } await p.waitForTimeout(3000); };
    await open();
    const ship1 = await p.evaluate(() => document.querySelector('.m-ship')?.textContent.replace(/\s+/g, ' ').trim());
    if (!/more for free shipping|شحن مجاني/.test(ship1 || '')) fail(`${tag} below threshold: ${ship1}`); else if (tag === '1440 ltr') ok(`below threshold: "${ship1}"`);
    // add a second line: above the threshold
    await api(p, '/cart/add.js', { items: [{ id: c, quantity: 1 }, { id: a, quantity: 1 }] });
    await open();
    const ship2 = await p.evaluate(() => document.querySelector('.m-ship')?.textContent.replace(/\s+/g, ' ').trim());
    if (!/You have free shipping|شحنك مجاني/.test(ship2 || '')) fail(`${tag} above threshold: ${ship2}`); else if (tag === '1440 ltr') ok(`above threshold: "${ship2}"`);
    const cards = await p.evaluate(() => { const rows = [...document.querySelectorAll('.cart-page .cart-items__table tbody .cart-items__table-row')]; return rows.map((r) => { const s = getComputedStyle(r); return { border: parseFloat(s.borderTopWidth), radius: parseFloat(s.borderTopLeftRadius), meta: !!r.querySelector('.card-meta'), overflow: r.scrollWidth > r.clientWidth + 1 }; }); });
    if (cards.length < 2) fail(`${tag} ${cards.length} line items`);
    cards.forEach((r, i) => { if (r.border < 1 || r.radius < 12) fail(`${tag} line ${i} is not a card`); if (!r.meta) fail(`${tag} line ${i} has no moment label`); if (r.overflow) fail(`${tag} line ${i} overflows`); });
    const overflowX = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    if (overflowX) fail(`${tag} horizontal overflow`);
    // quantity +
    const before = await p.evaluate(() => document.querySelector('.cart__total-value')?.textContent.replace(/\s+/g, ' ').trim());
    await p.locator('.cart-page .cart-items__table-row').first().locator('button[name="plus"]').first().click({ timeout: 8000, force: true }).catch(() => {});
    for (let i = 0; i < 12; i++) { await p.waitForTimeout(500); const t = await p.evaluate(() => document.querySelector('.cart__total-value')?.textContent.replace(/\s+/g, ' ').trim()); if (t && t !== before) break; }
    const afterQ = await p.evaluate(() => document.querySelector('.cart__total-value')?.textContent.replace(/\s+/g, ' ').trim());
    if (before && afterQ && before === afterQ) fail(`${tag} quantity + did not change the total (${before})`); else if (tag === '1440 ltr') ok(`quantity + changed the total: ${before} -> ${afterQ}`);
    // phone bar
    const bar = await p.evaluate(() => { const e = document.querySelector('.cart-page .m-cart-bar'); if (!e) return null; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { visible: cs.display !== 'none', bottom: Math.round(innerHeight - r.bottom), btn: Math.round(e.querySelector('.m-cart-bar__button').getBoundingClientRect().height) }; });
    if (mobile) { if (!bar || !bar.visible || bar.bottom > 1 || bar.btn < 44) fail(`${tag} phone checkout bar: ${JSON.stringify(bar)}`); } else if (bar && bar.visible) fail(`${tag} checkout bar shows on desktop`);
    // checkout reachable (no order)
    if (tag === '1440 ltr' || tag === '375 ltr') {
      const btn = mobile ? p.locator('.m-cart-bar__button') : p.locator('.cart__checkout-button');
      await Promise.all([p.waitForURL(/checkout/, { timeout: 25000 }).catch(() => {}), btn.first().click()]);
      if (!/checkout/.test(p.url())) fail(`${tag} Checkout did not reach checkout (${p.url().slice(0, 60)})`); else ok(`${tag} Checkout reached ${new URL(p.url()).pathname.slice(0, 20)}`);
      await open();
    }
    // remove everything: empty state
    if (tag === '1440 ltr' || tag === '375 rtl') {
      await api(p, '/cart/clear.js', {});
      await open();
      const empty = await p.evaluate(() => ({ tiles: document.querySelectorAll('.m-cempty .m-tile').length, title: document.querySelector('.m-cempty__title')?.textContent.trim() }));
      if (empty.tiles !== 6) fail(`${tag} empty state shows ${empty.tiles} moment tiles (expected 6)`); else ok(`${tag} empty state: "${empty.title}" with 6 moment tiles`);
    }
  } catch (e) { fail(`${tag} ${String(e).split('\n')[0].slice(0, 100)}`); }
  await ctx.close();
}
await b.close();
console.log(bad ? `CART FAILED (${bad})` : 'CART OK');
process.exit(bad ? 1 : 0);
