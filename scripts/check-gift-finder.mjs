// Gift finder check on a LOCAL render (nothing is read from or written to the store).
// The real sections/gift-finder.liquid and snippets/gift-pick-card.liquid are rendered with liquidjs and a few SAMPLE products whose
// gift values exist only in this file, then served on localhost with the theme CSS and assets/gift-finder.js.
// Scenarios: strip, Wife + Anniversary, Friend + Birthday, Not sure (safest), no match, compare table, RTL, reduced motion,
// keyboard-only flow, axe (wcag2aa incl. colour contrast). Screenshots: docs/design/gift-finder/.
//   node scripts/check-gift-finder.mjs [--no-shots]
import { ROOT, engine, css, serve } from './lib/theme-fixture.mjs';
import { chromium } from 'playwright-core';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync, mkdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const OUT = join(ROOT, 'docs/design/gift-finder');
const shots = !process.argv.includes('--no-shots');
mkdirSync(OUT, { recursive: true });



// ---------- sample data (local only) ----------
const swatch = (hue) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><rect width="640" height="640" fill="#fffdfb"/><rect x="250" y="120" width="140" height="60" rx="10" fill="hsl(${hue} 30% 40%)"/><rect x="200" y="180" width="240" height="340" rx="40" fill="hsl(${hue} 40% 70%)"/></svg>`)}`;
const moment = (handle) => ({ handle, title: handle });
const P = (i, title, vendor, price, f) => ({
  id: 1000 + i, handle: `sample-${i}`, title, vendor, url: `/products/sample-${i}`, available: true,
  featured_media: { alt: '', preview_image: { src: swatch(i * 50) } },
  variants: [{}], selected_or_first_available_variant: { id: 5000 + i, available: true, price: price * 100, compare_at_price: f.compare ? f.compare * 100 : null },
  collections: (f.moments || []).map(moment),
  metafields: { moments: Object.fromEntries(Object.entries({ gift_feel: f.feel, gift_strength: f.strength, gift_why: f.why, gift_who: f.who, gift_occasion: f.occasion, gift_safe: f.safe, gift_ready: f.ready }).map(([k, v]) => [k, v === undefined ? undefined : { value: v }])) },
});
const products = [
  P(1, 'Sample Rose Evening', 'Sample Brand A', 1450, { feel: 'sweet', strength: 3, why: 'A romantic pick for an anniversary', who: ['her', 'partner'], occasion: ['anniversary', 'wedding'], safe: true, moments: ['love-moment'], compare: 1700, ready: true }),
  P(2, 'Sample Amber Night', 'Sample Brand B', 2200, { feel: 'warm', strength: 5, why: 'Rich and noticeable for an evening out', who: ['him', 'partner'], occasion: ['anniversary', 'eid'], safe: false, moments: ['night-moment'] }),
  P(3, 'Sample Morning Citrus', 'Sample Brand A', 900, { feel: 'fresh', strength: 2, why: 'Light enough for every day', who: ['friend', 'colleague', 'her', 'him'], occasion: ['birthday', 'thank_you'], safe: true, moments: ['fresh-moment'] }),
  P(4, 'Sample Cedar Walk', 'Sample Brand C', 1800, { feel: 'woody', strength: 4, why: 'A calm, grown-up choice', who: ['father', 'him', 'colleague'], occasion: ['birthday', 'eid'], safe: false, moments: ['all-day-moment'] }),
  P(5, 'Sample Cotton Air', 'Sample Brand B', 650, { feel: 'clean', strength: 1, why: 'Soft and easy, hard to get wrong', who: ['mother', 'friend', 'her'], occasion: ['birthday', 'new_baby', 'thank_you'], safe: true, moments: ['daily-moment'] }),
  P(6, 'Sample Untagged', 'Sample Brand C', 1200, {}),
];

const settings = { moments_handles: 'gift-moment,love-moment,night-moment,all-day-moment,fresh-moment,daily-moment', gift_budget_bands: '1000,2000', gift_show_ready: false };
async function page(layout, { dir = 'ltr', ready = false } = {}) {
  css.length = 0;
  const section = { id: `gf-${layout}`, settings: { layout, max_picks: 3, collection: { products } }, shopify_attributes: '' };
  // Shopify globals reach every snippet; liquidjs needs them as render globals
  const globals = { settings: { ...settings, gift_show_ready: ready }, routes: { root_url: '/', all_products_collection_url: '/collections/all' }, request: { design_mode: false }, collections: {}, paginate: {} };
  const body = await engine.renderFile('gift-finder', { section }, { globals });
  const sprite = await engine.renderFile('moment-marks-sprite', {}, { globals });
  return `<!doctype html><html lang="${dir === 'rtl' ? 'ar' : 'en'}" dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Gift finder fixture</title><link rel="stylesheet" href="/assets/base.css"><link rel="stylesheet" href="/assets/moments.css"><style>${css.join('\n')}</style>
<style>body{margin:0;background:var(--m-pearl);color:var(--m-plum);font-family:var(--font-body--family)}/* fixture only: the theme's button colours come from settings variables that this local page does not have */.button{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 22px;border:0;border-radius:999px;background:var(--m-berry);color:#fff;font:inherit;text-decoration:none;cursor:pointer}</style></head>
<body>${sprite}<main>${body}</main><script>document.addEventListener('submit',e=>{e.preventDefault();document.body.dataset.added=e.target.querySelector('[name=id]').value});</script></body></html>`;
}

const pages = {
  '/strip': await page('strip'),
  '/pages/gift-finder': await page('page'),
  '/rtl/pages/gift-finder': await page('page', { dir: 'rtl' }),
  '/rtl/strip': await page('strip', { dir: 'rtl' }),
  '/ready/pages/gift-finder': await page('page', { ready: true }),
};
const server = serve(pages);
const BASE = server.base;

let bad = 0;
const ok = (cond, msg) => { console.log(cond ? 'ok  ' : 'FAIL', msg); if (!cond) bad++; };
const js = readFileSync(join(ROOT, 'assets/gift-finder.js'));
ok(gzipSync(js).length < 8192, `gift-finder.js ${js.length} B, ${gzipSync(js).length} B gzipped (budget 8 KB)`);

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const visible = (p) => p.$$eval('[data-gift-pick]:not([hidden])', (els) => els.map((e) => e.dataset.handle));
const tap = async (p, group, value) => p.click(`[data-group="${group}"] [data-value="${value}"]`);
const show = async (p) => { await p.click('[data-action="show"]'); await p.waitForTimeout(450); };
const shot = async (p, name) => shots && p.screenshot({ path: join(OUT, `${name}.png`), fullPage: true });

for (const [w, h] of [[390, 844], [768, 1024], [1440, 900]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(String(e)));

  await p.goto(`${BASE}/strip`);
  const pills = await p.$$eval('.gf__pill', (els) => els.map((e) => e.getBoundingClientRect().height));
  ok(Math.min(...pills) >= 44, `${w} strip: pill tap targets >= 44px (min ${Math.min(...pills)})`);
  ok((await p.evaluate(() => document.documentElement.scrollWidth)) <= w, `${w} strip: no horizontal scroll`);
  await shot(p, `strip-${w}`);
  await tap(p, 'who', 'wife'); await tap(p, 'occasion', 'anniversary');
  await Promise.all([p.waitForURL(/gift-finder/), p.click('[data-action="show"]')]);
  ok(/who=wife/.test(p.url()) && /occasion=anniversary/.test(p.url()), `${w} strip: Show picks opens the page with the choices`);
  await p.waitForTimeout(450);

  // Wife + Anniversary (her|partner, anniversary): Rose Evening (safe, first) and Amber Night
  ok(JSON.stringify(await visible(p)) === JSON.stringify(['sample-1', 'sample-2']), `${w} wife+anniversary -> ${await visible(p)}`);
  ok((await p.textContent('[data-live]')) === '2 picks found', `${w} live region: "${await p.textContent('[data-live]')}"`);
  await shot(p, `results-wife-anniversary-${w}`);

  // compare
  await p.check('[data-handle="sample-1"] [data-compare]');
  await p.check('[data-handle="sample-2"] [data-compare]');
  await p.click('[data-action="compare"]');
  const heads = await p.$$eval('.gf__table tbody th', (els) => els.map((e) => e.textContent));
  ok(heads.join('|') === 'Price|Feels|Strength|Best moment|Why this one', `${w} compare rows: ${heads.join('|')}`);
  const verdict = await p.textContent('[data-verdict]');
  ok(verdict === 'Sample Rose Evening is the lightest in strength and feels sweet and soft; Sample Amber Night is the strongest and feels warm and rich.', `${w} verdict: ${verdict}`);
  const labelX = await p.$eval('.gf__table tbody th', (e) => e.getBoundingClientRect().left);
  ok(labelX >= 0, `${w} compare: row labels on screen`);
  await shot(p, `compare-${w}`);
  await p.click('[data-action="close-compare"]');

  // Friend + Birthday
  await p.click('[data-action="reset"]');
  await tap(p, 'who', 'friend'); await tap(p, 'occasion', 'birthday'); await show(p);
  ok(JSON.stringify(await visible(p)) === JSON.stringify(['sample-3', 'sample-5']), `${w} friend+birthday -> ${await visible(p)}`);
  await shot(p, `results-friend-birthday-${w}`);

  // Not sure
  await p.click('[data-action="safest"]'); await p.waitForTimeout(450);
  ok(JSON.stringify(await visible(p)) === JSON.stringify(['sample-1', 'sample-3', 'sample-5']), `${w} safest -> ${await visible(p)}`);
  ok(!(await p.$eval('[data-handle="sample-2"] .gp-card__badge', () => true).catch(() => false)), `${w} no "Easy to like" badge on a non-safe pick`);

  // no match: Father + New baby
  await tap(p, 'who', 'father'); await tap(p, 'occasion', 'new_baby'); await show(p);
  ok(await p.isVisible('[data-empty]'), `${w} no match: empty message shown`);
  ok(JSON.stringify(await visible(p)) === JSON.stringify(['sample-1', 'sample-3', 'sample-5']), `${w} no match: safest picks instead`);
  await shot(p, `empty-${w}`);

  // budget: under 1000 with Friend
  await p.click('[data-action="reset"]'); await tap(p, 'who', 'friend'); await tap(p, 'budget', 'b1'); await show(p);
  ok(JSON.stringify(await visible(p)) === JSON.stringify(['sample-3', 'sample-5']), `${w} friend + under 1000 -> ${await visible(p)}`);
  ok(!(await p.$('[data-handle="sample-6"]')), `${w} untagged product never rendered`);
  ok(!(await p.$('[data-row="ready"]')), `${w} gift-ready row hidden while the setting is off`);
  ok((await p.evaluate(() => document.documentElement.scrollWidth)) <= w, `${w} page: no horizontal scroll`);
  if (w === 390) {
    const snap = await p.$eval('.gp-list', (e) => getComputedStyle(e).scrollSnapType);
    ok(/x/.test(snap), `390 cards swipe (scroll-snap ${snap})`);
  }
  const axe = await new AxeBuilder({ page: p }).include('.gf').withTags(['wcag2a', 'wcag2aa']).analyze();
  ok(!axe.violations.length, `${w} axe: ${axe.violations.map((v) => `${v.id} (${v.nodes.length})`).join(', ') || 'no violations'}`);
  ok(!errors.length, `${w} no page errors ${errors.join(' | ')}`);
  await ctx.close();
}

// gift-ready row on with the setting on
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/ready/pages/gift-finder?who=wife`); await p.waitForTimeout(450);
  ok((await p.$$('[data-gift-pick]:not([hidden]) [data-row="ready"]')).length === 1, 'setting on: Gift-ready row only on the pick tagged true');
  await ctx.close();
}

// RTL
for (const w of [390, 1440]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/rtl/pages/gift-finder?who=wife&occasion=anniversary`); await p.waitForTimeout(450);
  const first = await p.$eval('.gf__pills .gf__pill', (e) => e.getBoundingClientRect().right);
  const box = await p.$eval('.gf__pills', (e) => e.getBoundingClientRect().right);
  ok(Math.abs(first - box) < 2, `${w} RTL: first pill starts at the right edge`);
  const badge = await p.$eval('.gp-card__badge', (e) => [e.getBoundingClientRect().right, e.closest('.gp-card__frame').getBoundingClientRect().right]);
  ok(Math.abs(badge[1] - badge[0] - 12) < 2, `${w} RTL: badge 12px from the right of the frame`);
  ok((await p.evaluate(() => document.documentElement.scrollWidth)) <= w, `${w} RTL: no horizontal scroll`);
  await p.check('[data-handle="sample-1"] [data-compare]'); await p.check('[data-handle="sample-2"] [data-compare]'); await p.click('[data-action="compare"]');
  const sticky = await p.$eval('.gf__table tbody th', (e) => getComputedStyle(e).insetInlineStart);
  ok(sticky === '0px', `${w} RTL: compare labels stick to the inline start`);
  await shot(p, `rtl-compare-${w}`);
  await ctx.close();
}

// reduced motion and keyboard only
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/pages/gift-finder`);
  const order = [];
  for (let i = 0; i < 30 && order.length < 3; i++) {
    await p.keyboard.press('Tab');
    const f = await p.evaluate(() => ({ v: document.activeElement.dataset.value || document.activeElement.dataset.action, outline: getComputedStyle(document.activeElement).outlineStyle }));
    if (f.v === 'husband' || f.v === 'eid' || f.v === 'show') { order.push(f); await p.keyboard.press(f.v === 'show' ? 'Enter' : 'Space'); }
  }
  await p.waitForTimeout(450);
  ok(order.length === 3 && order.every((f) => f.outline !== 'none'), `keyboard: pills and Show picks reachable with a visible focus ring (${order.map((f) => f.v)})`);
  ok(JSON.stringify(await visible(p)) === JSON.stringify(['sample-2', 'sample-4']), `keyboard: husband+eid -> ${await visible(p)}`);
  const anim = await p.$eval('[data-gift-pick]:not([hidden])', (e) => getComputedStyle(e).animationName);
  ok(anim === 'none', `reduced motion: no card animation (${anim})`);
  await ctx.close();
}

// JavaScript off: the strip shows the note and the link, no dead controls
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/strip`);
  ok(!(await p.isVisible('.gf__ui')) && (await p.isVisible('.gf__nojs a[href="/collections/all"]')), 'no JS: controls hidden, note and /collections/all link shown');
  await shot(p, 'strip-no-js-390');
  await ctx.close();
}

await browser.close();
server.close();
console.log(bad ? `GIFT FINDER CHECK FAILED (${bad})` : 'GIFT FINDER CHECK PASSED');
process.exit(bad ? 1 : 0);
