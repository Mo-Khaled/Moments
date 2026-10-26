// Product card text area across a matrix of browser conditions on the LIVE storefront. For the first card on each page it checks every text
// leaf of the text area against its effective background (4.5:1) and fails on a "plum panel" (a dark text-area background on a light page).
// Engines: Chromium (system Chrome), WebKit and Firefox when installed. Variants: light, dark, forced-colors, prefers-contrast, reduced-motion,
// iPhone 13, cart with 3 items, bundle state in localStorage, preview cookie, JavaScript off, slow 3G (Chromium only).
// usage: node scripts/check-card-matrix.mjs [--engines chromium,webkit,firefox] [--pages /,/collections/all] [--variants light,dark] [--quick]
import { chromium, webkit, firefox, devices } from 'playwright-core';
import { writeFileSync } from 'node:fs';

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const QUICK = process.argv.includes('--quick');
const BASE = 'https://momentseg.com';
const PAGES = arg('pages', QUICK ? '/pages/make-a-bundle,/collections/all' : '/pages/make-a-bundle,/collections/all,/,/search?q=gift').split(',');
const ENGINES = arg('engines', 'chromium,webkit,firefox').split(',');
const ALL = ['light', 'dark', 'forced-colors', 'contrast-more', 'reduced-motion', 'iphone13', 'cart-3', 'bundle-state', 'preview-cookie', 'no-js', 'slow-3g'];
const VARIANTS = arg('variants', QUICK ? 'light,dark,forced-colors,iphone13,cart-3,bundle-state' : ALL.join(',')).split(',');
const LAUNCH = { chromium: () => chromium.launch({ channel: 'chrome', headless: true }), webkit: () => webkit.launch({ headless: true }), firefox: () => firefox.launch({ headless: true }) };

const inPage = () => {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const g = cv.getContext('2d', { willReadFrequently: true });
  const parse = (c) => { if (!c || c === 'transparent') return null; g.clearRect(0, 0, 1, 1); g.fillStyle = '#000'; g.fillStyle = c; g.fillRect(0, 0, 1, 1); const d = g.getImageData(0, 0, 1, 1).data; return { r: d[0], g: d[1], b: d[2], a: d[3] / 255 }; };
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  const cr = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const over = (t, b) => ({ r: t.r * t.a + b.r * (1 - t.a), g: t.g * t.a + b.g * (1 - t.a), b: t.b * t.a + b.b * (1 - t.a), a: 1 });
  const effBg = (el) => { const stack = []; for (let e = el; e; e = e.parentElement) { const bg = parse(getComputedStyle(e).backgroundColor); if (bg && bg.a > 0) { stack.push(bg); if (bg.a >= 1) break; } } let c = { r: 255, g: 255, b: 255, a: 1 }; for (const l of stack.reverse()) c = over(l, c); return c; };
  const card = document.querySelector('product-card');
  if (!card) return { error: 'no product-card' };
  const meta = card.querySelector('.card-meta');
  const textArea = (meta && meta.parentElement) || card.querySelector('.product-card__content') || card;
  const pageBg = effBg(document.body);
  const area = effBg(textArea);
  const leaves = [...textArea.querySelectorAll('*')].filter((e) => !e.children.length && (e.textContent || '').trim() && getComputedStyle(e).visibility !== 'hidden' && e.getBoundingClientRect().width > 1);
  const fails = [];
  for (const e of leaves) {
    const s = getComputedStyle(e); const fg = parse(s.color); if (!fg) continue;
    const bg = effBg(e); const f = over({ ...fg, a: fg.a }, bg); const ratio = cr(f, bg);
    const size = parseFloat(s.fontSize), bold = Number(s.fontWeight) >= 700;
    const need = size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5;
    if (ratio < need) fails.push(`${ratio.toFixed(2)}:1 "${e.textContent.trim().slice(0, 24)}" ${e.tagName.toLowerCase()}.${String(e.className).split(' ')[0]}`);
  }
  const panel = lum(area) < 0.15 && lum(pageBg) > 0.6;
  return { panel, area: `rgb(${area.r | 0} ${area.g | 0} ${area.b | 0})`, page: `rgb(${pageBg.r | 0} ${pageBg.g | 0} ${pageBg.b | 0})`, leaves: leaves.length, fails };
};

// Three real products, fetched once (the public products.json is rate limited when asked for every run).
let PRODUCTS = [];
try {
  const pw = await chromium.launch({ channel: 'chrome', headless: true }); const c = await pw.newContext();
  const html = await (await c.request.get(`${BASE}/collections/all`)).text();
  const handles = [...new Set([...html.matchAll(/\/products\/([a-z0-9-]+)/g)].map((m) => m[1]))].slice(0, 3);
  for (const h of handles) { const j = await (await c.request.get(`${BASE}/products/${h}.js`)).json(); PRODUCTS.push({ handle: h, title: j.title, images: j.featured_image ? [{ src: j.featured_image }] : [], variants: [{ id: j.variants[0].id, price: String(j.variants[0].price / 100) }] }); }
  await pw.close();
} catch (e) { console.log('no product list: cart-3 and bundle-state run empty'); }
const rows = []; let bad = 0;
for (const eng of ENGINES) {
  let browser;
  try { browser = await LAUNCH[eng](); } catch (e) { console.log(`skip ${eng}: ${String(e).split('\n')[0].slice(0, 90)}`); continue; }
  for (const v of VARIANTS) {
    if (v === 'slow-3g' && eng !== 'chromium') continue;
    for (const path of PAGES) {
      const opts = { viewport: { width: 1440, height: 900 } };
      if (v === 'dark') opts.colorScheme = 'dark';
      if (v === 'forced-colors') opts.forcedColors = 'active';
      if (v === 'contrast-more') opts.contrast = 'more';
      if (v === 'reduced-motion') opts.reducedMotion = 'reduce';
      if (v === 'iphone13') { Object.assign(opts, devices['iPhone 13']); if (eng === 'firefox') { delete opts.isMobile; delete opts.hasTouch; } }
      if (v === 'no-js') opts.javaScriptEnabled = false;
      let ctx, status = 'ok', detail = '';
      try {
        ctx = await browser.newContext(opts);
        await ctx.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
        if (v === 'preview-cookie') await ctx.addCookies([{ name: 'preview_theme_id', value: '161294745791', domain: 'momentseg.com', path: '/' }]);
        const page = await ctx.newPage();
        if (v === 'slow-3g') { const cdp = await ctx.newCDPSession(page); await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 400, downloadThroughput: (500 * 1024) / 8, uploadThroughput: (500 * 1024) / 8 }); }
        if (v === 'cart-3') {
          const items = PRODUCTS.map((p) => ({ id: p.variants[0].id, quantity: 1 }));
          await ctx.request.post(`${BASE}/cart/add.js`, { data: { items } });
        }
        if (v === 'bundle-state') {
          const items = PRODUCTS.map((p) => ({ handle: p.handle, title: p.title, id: p.variants[0].id, price: Number(p.variants[0].price) * 100, image: (p.images[0] || {}).src || '' }));
          await page.addInitScript((it) => { try { localStorage.setItem('moments-bundle-v1', JSON.stringify({ id: 'x', items: it })); } catch (e) { /* ignore */ } }, items);
        }
        await page.goto(`${BASE}${path}${path.includes('?') ? '&' : '?'}pb=0`, { waitUntil: 'domcontentloaded', timeout: 90000 });
        await page.waitForTimeout(path.includes('bundle') ? (v === 'slow-3g' ? 14000 : 6000) : 3500);
        const r = await page.evaluate(inPage);
        if (r.error) { status = v === 'no-js' && path.includes('bundle') ? 'n/a (cards load with JS)' : 'FAIL'; detail = r.error; }
        else if (r.panel || r.fails.length) { status = 'FAIL'; detail = `${r.panel ? 'PLUM PANEL ' : ''}area ${r.area} on page ${r.page}; ${r.fails.slice(0, 3).join('; ')}`; }
        else detail = `area ${r.area}, ${r.leaves} text leaves`;
      } catch (e) { status = 'ERR'; detail = String(e).split('\n')[0].slice(0, 100); }
      if (ctx) await ctx.close().catch(() => {});
      if (status === 'FAIL' || status === 'ERR') bad++;
      rows.push({ eng, v, path, status, detail });
      console.log(`${status.padEnd(4)} ${eng.padEnd(8)} ${v.padEnd(14)} ${path.padEnd(22)} ${detail.slice(0, 110)}`);
    }
  }
  await browser.close();
}
const md = ['# Card matrix', '', `Live storefront, ${new Date().toISOString().slice(0, 10)}. First card, text area contrast 4.5:1 and no plum panel.`, '', '| engine | variant | page | status | detail |', '|---|---|---|---|---|', ...rows.map((r) => `| ${r.eng} | ${r.v} | ${r.path} | ${r.status} | ${r.detail} |`)];
writeFileSync('docs/design/card-matrix.md', md.join('\n'));
console.log(bad ? `CARD MATRIX FAILED (${bad})` : 'CARD MATRIX OK');
process.exit(bad ? 1 : 0);
