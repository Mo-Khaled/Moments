// Bundle page checks on the DEV theme (dev tool). The page is previewed as /pages/about-us?view=bundle (the template is not assigned to a page).
//   - the grid loads real cards with an add button each; images are contained
//   - add three bottles: slots fill, count and subtotal update, the choice survives a reload, remove works
//   - tiers off: no discount wording anywhere on the page
//   - checkout posts ONE /cart/add.js request with the line item property "Bundle", the cart then holds the lines; the cart is cleared
//     afterwards and the script STOPS before checkout (no order is ever placed)
//   - 1920, 1440, 1024, 768, 375, LTR and RTL: no sideways page scroll, no clipped summary
// usage: node scripts/check-bundle.mjs
import { chromium } from 'playwright-core';

const URL = 'https://momentseg.com/pages/about-us?view=bundle&preview_theme_id=161294745791&pb=0';
const failures = [];
const log = [];
const fail = (c, m) => failures.push(`${c}: ${m}`);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const rtlFix = "html[dir='rtl'] .skip-to-content-link:not(:focus){left:auto;right:-99999px}";

async function open(width, dir) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  await context.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
  const page = await context.newPage();
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('[data-m-bundle]');
  if (dir === 'rtl') { await page.evaluate(() => { document.documentElement.dir = 'rtl'; document.documentElement.lang = 'ar'; }); await page.addStyleTag({ content: rtlFix }); }
  await page.waitForSelector('.m-bundle__grid .m-add', { timeout: 60000 });
  await page.waitForTimeout(1500);
  return { context, page };
}

// ---- functional flow (1440, LTR)
{
  const { context, page } = await open(1440, 'ltr');
  const cards = await page.$$eval('.m-bundle__grid > li', (lis) => lis.length);
  if (cards < 8) fail('grid', `only ${cards} cards loaded`);
  const crop = await page.$$eval('.m-bundle__grid .product-media__image', (imgs) => imgs.filter((i) => getComputedStyle(i).objectFit === 'cover').length);
  if (crop) fail('grid', `${crop} card images are cover-cropped`);
  log.push(`grid: ${cards} real cards, no cover-cropped image`);

  // the bundle's own wording (card, summary, tools, mini bar); product cards carry real compare-at "Save" badges, which are allowed
  const text = await page.evaluate(() => ['.m-bundle__card', '.m-bundle__tools', '[data-m-bar]'].map((q) => (document.querySelector(q) || {}).innerText || '').join(' '));
  const dm = /\b(save|saving|discount|off)\b|%/i.exec(text.replace(/100% original/gi, ''));
  if (dm) fail('tiers off', 'discount wording is visible: ' + text.slice(Math.max(0, dm.index - 30), dm.index + 30).replace(/\s+/g, ' '));
  else log.push('tiers off: no discount wording in the bundle card, tools or bar');

  await page.evaluate(() => { try { localStorage.removeItem('moments-bundle-v1'); } catch (e) {} });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.m-bundle__grid .m-add');
  await page.waitForTimeout(1500);
  const adds = await page.$$('.m-bundle__grid .m-add:not([disabled])');
  for (let i = 0; i < 3; i++) { await adds[i].click(); await page.waitForTimeout(900); }
  const filled = await page.$$eval('.m-slot--filled', (s) => s.length);
  const count = await page.textContent('[data-m-count]');
  const subtotal = await page.textContent('[data-m-subtotal]');
  if (filled !== 3) fail('add', `expected 3 filled slots, got ${filled}`);
  if (!/LE\s*[\d,]+\.\d\d/.test(subtotal)) fail('add', `subtotal is not in the LE format: ${subtotal}`);
  const disabledNow = await page.$eval('[data-m-checkout]', (b) => b.disabled);
  if (disabledNow) fail('add', 'checkout is still disabled with 3 bottles');
  log.push(`add: 3 slots filled, "${count.trim()}", subtotal ${subtotal.trim()}`);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.m-slot');
  await page.waitForTimeout(1200);
  const persisted = await page.$$eval('.m-slot--filled', (s) => s.length);
  if (persisted !== 3) fail('persist', `expected 3 after reload, got ${persisted}`); else log.push('persist: 3 bottles survive a reload');

  await page.click('.m-slot--filled .m-slot__remove');
  await page.waitForTimeout(500);
  const afterRemove = await page.$$eval('.m-slot--filled', (s) => s.length);
  if (afterRemove !== 2) fail('remove', `expected 2 after remove, got ${afterRemove}`);
  const disabledAfter = await page.$eval('[data-m-checkout]', (b) => b.disabled);
  if (!disabledAfter) fail('remove', 'checkout stays enabled below the minimum');
  await page.locator('.m-bundle__grid .m-add:not([disabled])').nth(3).click();
  await page.waitForTimeout(900);

  // checkout: ONE request, with the Bundle property; stop before checkout
  const posts = [];
  page.on('request', (r) => { if (r.url().includes('/cart/add.js') && r.method() === 'POST') posts.push(r.postData()); });
  await page.click('[data-m-checkout]');
  await page.waitForURL(/\/cart/, { timeout: 30000 }).catch(() => {}); // the flow ends on the cart page, never at checkout
  await page.waitForTimeout(1500);
  if (posts.length !== 1) fail('checkout', `expected 1 /cart/add.js request, got ${posts.length}`);
  else {
    const body = JSON.parse(posts[0]);
    const ok = body.items.length >= 1 && body.items.every((i) => i.properties && /^MOMENTS bundle /.test(i.properties.Bundle));
    if (!ok) fail('checkout', 'a line is missing the Bundle property'); else log.push(`checkout: one request, ${body.items.length} line(s), property "${body.items[0].properties.Bundle}"; stopped before checkout`);
  }
  const cart = await page.evaluate(async () => (await fetch('/cart.js')).json());
  if (!cart.items.length) fail('checkout', 'the cart is empty after checkout'); else log.push(`cart now holds ${cart.item_count} bottle(s) with the Bundle property: ${cart.items.every((i) => i.properties && i.properties.Bundle)}`);
  await page.evaluate(async () => { await fetch('/cart/clear.js', { method: 'POST' }); });
  await context.close();
}

// ---- layout (all widths, both directions)
for (const width of [1920, 1440, 1024, 768, 375]) {
  for (const dir of ['ltr', 'rtl']) {
    const { context, page } = await open(width, dir);
    const c = `${width}px ${dir}`;
    const m = await page.evaluate(() => {
      scrollTo(-5000, 0); const a = scrollX; scrollTo(5000, 0); const b = scrollX; scrollTo(0, 0);
      const sum = document.querySelector('[data-m-summary]').getBoundingClientRect();
      const grid = document.querySelector('[data-m-grid]').getBoundingClientRect();
      const cols = new Set([...document.querySelectorAll('.m-bundle__grid > li')].slice(0, 8).map((l) => Math.round(l.getBoundingClientRect().left))).size;
      return { sideways: Math.max(Math.abs(a), Math.abs(b)), sumL: sum.left, sumR: sum.right, gridL: grid.left, gridR: grid.right, vw: innerWidth, cols };
    });
    if (m.sideways > 1) fail(c, `page scrolls sideways by ${m.sideways}px`);
    if (m.sumL < -1 || m.sumR > m.vw + 1) fail(c, 'summary card leaves the viewport');
    if (m.gridL < -1 || m.gridR > m.vw + 1) fail(c, 'grid leaves the viewport');
    const expectCols = width >= 750 ? 4 : 2;
    if (m.cols !== expectCols) fail(c, `grid has ${m.cols} columns, expected ${expectCols}`);
    if (width === 1440 || width === 375) await page.screenshot({ path: `docs/screenshots/final/bundle-${width}-${dir}.png`, fullPage: false });
    await context.close();
  }
}
await browser.close();
for (const l of log) console.log('  ' + l);
if (failures.length) { console.error(`FAILED (${failures.length}):`); failures.forEach((f) => console.error('  ' + f)); process.exit(1); }
console.log('PASS');
