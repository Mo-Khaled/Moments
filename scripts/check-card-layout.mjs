// Product card layout on the LIVE storefront, every placement. For each visible card (up to 8 per page):
//  - badge, add button, primary image and every text block lie inside the card box (overflow reported in px);
//  - badge and add button lie inside the image frame;
//  - the frame is as wide as the card's inner width (within 1px);
//  - the card border differs visibly from the page (OKLab dE) and the card surface differs from the page surface;
//  - no empty gap taller than 24px between the last text and the card's bottom edge;
//  - cards in the same row have equal heights and their price blocks end at the same y;
//  - the primary image is object-fit: contain (never cropped).
// usage: node scripts/check-card-layout.mjs [--quick] [--tag before] [--widths 375,1440] [--pages /,/collections/all] [--shots]
import { chromium, webkit, devices } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const QUICK = process.argv.includes('--quick');
const SHOTS = process.argv.includes('--shots');
const TAG = arg('tag', 'run');
const BASE = 'https://momentseg.com';
const WIDTHS = arg('widths', QUICK ? '375,1440' : '320,375,390,768,1440').split(',').map(Number);
const DIRS = QUICK ? ['ltr'] : ['ltr', 'rtl'];
const PAGES = arg('pages', '/,/collections/all,/search?q=gift,/pages/make-a-bundle,/products/9-pm-night-out,/cart').split(',');
const OUT = 'docs/screenshots/cards';
mkdirSync(OUT, { recursive: true });

const inPage = () => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const g = cv.getContext('2d', { willReadFrequently: true });
  const parse = (c) => { g.clearRect(0, 0, 1, 1); g.fillStyle = '#000'; g.fillStyle = c; g.fillRect(0, 0, 1, 1); const d = g.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const lab = ([r, gg, b]) => { const [R, G, B] = [lin(r), lin(gg), lin(b)]; const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B), m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B), s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B); return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s]; };
  const dE = (a, b) => { const A = lab(a), B = lab(b); return 100 * Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]); };
  const pageBgOf = (el) => { for (let e = el.parentElement; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c[3] >= 0.99) return c; } return [255, 255, 255, 1]; };
  const rect = (e) => e.getBoundingClientRect();
  const cards = [...document.querySelectorAll('product-card')].filter((c) => { const r = rect(c); return r.width > 100 && r.height > 100 && r.left >= -2 && r.right <= innerWidth + 2 + (c.closest('.resource-list__carousel, slideshow-slides') ? innerWidth : 0); }).slice(0, 8);
  const out = [];
  for (const c of cards) {
    c.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
    const cr = rect(c); const cs = getComputedStyle(c);
    const problems = [];
    const label = (c.querySelector('.product-name__first, h3, a')?.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 18);
    const inside = (name, el, box, tol = 0.75) => { if (!el) return; const r = rect(el); if (r.width < 1 && r.height < 1) return; const o = { l: box.left - r.left, r: r.right - box.right, t: box.top - r.top, b: r.bottom - box.bottom }; const worst = Math.max(o.l, o.r, o.t, o.b); if (worst > tol) problems.push(`${name} sticks out ${worst.toFixed(1)}px (l${o.l.toFixed(1)} r${o.r.toFixed(1)} t${o.t.toFixed(1)} b${o.b.toFixed(1)})`); };
    const gal = c.querySelector('.card-gallery');
    const badge = c.querySelector('.product-badges__badge');
    const btn = c.querySelector('.quick-add__button');
    const meta = c.querySelector('.card-meta');
    const price = c.querySelector('product-price');
    const galBox = gal ? rect(gal) : null;
    const prim = gal && [...gal.querySelectorAll('img')].find((i) => { const r = rect(i); return r.width > 4 && r.right > galBox.left + 1 && r.left < galBox.right - 1; });
    for (const [n, el] of [['badge', badge], ['add button', btn], ['image', prim], ['meta', meta], ['price', price]]) inside(n + ' vs card', el, cr);
    if (galBox) { inside('badge vs frame', badge, galBox); inside('add button vs frame', btn, galBox); if (btn) { const bw = rect(btn); if (bw.width > 0 && (bw.width < 43.5 || bw.height < 43.5)) problems.push(`add button ${bw.width.toFixed(0)}x${bw.height.toFixed(0)} (needs 44x44)`); } }
    if (gal && galBox && Math.abs(galBox.height - galBox.width) > Math.max(2, galBox.width * 0.02) && !c.closest('.m-bundle__grid')) problems.push(`image frame is ${galBox.width.toFixed(0)}x${galBox.height.toFixed(0)}, not square`);
    const pill = c.querySelector('.buy-buttons-block'); if (pill && rect(pill).height > 1) problems.push('in-flow Add to cart block inside the card');
    const brandCount = [...c.querySelectorAll('.card-meta__brand, rte-formatter')].filter((e) => rect(e).height > 1).length; if (brandCount > 1) problems.push(`brand shown ${brandCount} times`);
    const bw = parseFloat(cs.borderLeftWidth) || 0;
    if (gal) { const inner = cr.width - 2 * bw; if (Math.abs(rect(gal).width - inner) > 1) problems.push(`frame ${rect(gal).width.toFixed(1)}px but card inner width ${inner.toFixed(1)}px`); }
    const pb = pageBgOf(c);
    const bc = parse(cs.borderLeftColor);
    if (bw < 1 || cs.borderLeftStyle === 'none') problems.push('no card border');
    else { const d = dE(bc, pb); if (d < 8) problems.push(`border barely visible (dE ${d.toFixed(1)})`); }
    const surf = parse(cs.backgroundColor);
    const sd = surf[3] < 0.5 ? 0 : dE(surf, pb);
    if (sd < 0.8) problems.push(`card surface same as page (dE ${sd.toFixed(1)})`);
    const lastText = [...c.querySelectorAll('product-price *, .card-meta *')].filter((e) => !e.children.length && (e.textContent || '').trim() && rect(e).width > 1 && getComputedStyle(e).visibility !== 'hidden').map((e) => rect(e).bottom).sort((a, b) => b - a)[0];
    if (lastText) { const gap = cr.bottom - bw - lastText; if (gap > 24) problems.push(`empty gap ${gap.toFixed(0)}px below the last text`); }
    const edge = (sel) => { const e = c.querySelector(sel); return e && rect(e).width > 1 ? Math.abs(document.dir === 'rtl' || getComputedStyle(c).direction === 'rtl' ? cr.right - rect(e).right : rect(e).left - cr.left) : null; };
    const edges = ['.card-meta__moment', '.product-name__first', '.price'].map(edge).filter((v) => v !== null);
    if (edges.length > 1 && Math.max(...edges) - Math.min(...edges) > 1.5) problems.push(`text edges not aligned (${edges.map((v) => v.toFixed(0)).join(' / ')}px from the card edge)`);
    if (prim && getComputedStyle(prim).objectFit !== 'contain') problems.push(`image object-fit ${getComputedStyle(prim).objectFit}`);
    out.push({ label, top: Math.round(cr.top + scrollY), h: Math.round(cr.height), w: Math.round(cr.width), priceBottom: price ? Math.round(rect(price).bottom + scrollY) : null, problems });
  }
  // rows: equal heights and level price blocks
  const rowFails = [];
  for (const a of out) for (const b of out) if (a !== b && Math.abs(a.top - b.top) <= 6 && a.label < b.label) {
    if (Math.abs(a.h - b.h) > 1) rowFails.push(`row cards differ in height: "${a.label}" ${a.h}px vs "${b.label}" ${b.h}px`);
    if (a.priceBottom && b.priceBottom && Math.abs(a.priceBottom - b.priceBottom) > 1) rowFails.push(`price blocks not level: "${a.label}" vs "${b.label}" (${a.priceBottom - b.priceBottom}px)`);
  }
  return { n: cards.length, cards: out, rowFails: [...new Set(rowFails)].slice(0, 3) };
};

const ENGINE = arg('engine', 'chromium');
const browser = ENGINE === 'webkit' ? await webkit.launch({ headless: true }) : await chromium.launch({ channel: 'chrome', headless: true });
const md = [`# Card layout: ${TAG}`, '', `Live storefront, ${new Date().toISOString().slice(0, 10)}.`, ''];
let bad = 0;
for (const path of PAGES) {
  for (const w of WIDTHS) for (const dir of DIRS) {
    // phones are emulated as a real touch iPhone (touch-only styles run), not as a narrow desktop window
    const ctx = await browser.newContext(w <= 430 ? { ...devices['iPhone 13'], viewport: { width: w, height: 800 } } : { viewport: { width: w, height: 900 } });
    await ctx.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
    const page = await ctx.newPage();
    try {
      await page.goto(`${BASE}${path}${path.includes('?') ? '&' : '?'}pb=0`, { waitUntil: 'domcontentloaded', timeout: 90000 });
      if (dir === 'rtl') { await page.evaluate(() => { document.documentElement.dir = 'rtl'; document.documentElement.lang = 'ar'; }); await page.addStyleTag({ content: "html[dir='rtl'] .skip-to-content-link:not(:focus){left:auto;right:-99999px}" }); }
      await page.waitForTimeout(path.includes('bundle') ? 6500 : 3500);
      if (path === '/cart' || path.startsWith('/products/')) { for (let i = 0; i < 12; i++) { await page.evaluate(() => window.scrollBy({ top: 700, behavior: 'instant' })); await page.waitForTimeout(350); } }
      await page.waitForTimeout(800);
      const r = await page.evaluate(inPage);
      const probs = r.cards.flatMap((c) => c.problems.map((p) => `"${c.label}": ${p}`)).concat(r.rowFails);
      const status = r.n === 0 ? 'n/a (no cards)' : probs.length ? 'FAIL' : 'ok';
      if (status === 'FAIL') bad++;
      console.log(`${status.padEnd(4)} ${path.padEnd(24)} ${String(w).padEnd(5)} ${dir}  cards ${r.n}  ${probs.length ? probs.slice(0, 2).join(' | ').slice(0, 150) : ''}`);
      md.push(`## ${path} ${w}px ${dir.toUpperCase()}: ${status} (${r.n} cards)`);
      [...new Set(probs)].slice(0, 12).forEach((p) => md.push('- ' + p));
      md.push('');
      if (SHOTS && r.n && dir === 'ltr' && (w === 375 || w === 1440)) {
        const box = await page.evaluate(() => { const cs = [...document.querySelectorAll('product-card')].filter((c) => { const b = c.getBoundingClientRect(); return b.width > 100 && b.left >= 0 && b.right <= innerWidth + 1 && b.top >= -4 && b.bottom <= innerHeight + 4; }); if (!cs.length) return null; const rs = cs.slice(0, 4).map((c) => c.getBoundingClientRect()); const l = Math.min(...rs.map((x) => x.left)), t = Math.min(...rs.map((x) => x.top)), rr = Math.max(...rs.map((x) => x.right)), bb = Math.max(...rs.map((x) => x.bottom)); return { x: Math.max(0, l - 16), y: Math.max(0, t - 16), width: Math.min(innerWidth, rr + 16) - Math.max(0, l - 16), height: Math.min(innerHeight, bb + 16) - Math.max(0, t - 16) }; });
        if (box) await page.screenshot({ path: `${OUT}/${TAG}-${(path === '/' ? 'home' : path.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, ''))}-${w}.png`, clip: box });
      }
    } catch (e) { bad++; console.log(`ERR  ${path} ${w} ${dir} ${String(e).split('\n')[0].slice(0, 90)}`); md.push(`## ${path} ${w} ${dir}: ERROR ${String(e).split('\n')[0].slice(0, 90)}`, ''); }
    await ctx.close();
  }
}
await browser.close();
writeFileSync(`docs/design/card-layout-${TAG}.md`, md.join('\n'));
console.log(bad ? `CARD LAYOUT FAILED (${bad})` : 'CARD LAYOUT OK');
process.exit(bad ? 1 : 0);
