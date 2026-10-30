// Pointer checks on the live storefront: computed cursor per element type, every cursor image loads at <= 32/64px with its hotspot
// inside, no cursor follower on the page, no layout shift. usage: node scripts/check-pointer.mjs [--site] 
//   default: the diagnostic page /pages/about-us?view=cursor-test; --site: the real pages (needs the theme.liquid render pushed)
import { chromium } from 'playwright-core';
const SITE = process.argv.includes('--site');
const BASE = 'https://momentseg.com';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
let bad = 0;
const fail = (m) => { bad++; console.log('FAIL', m); };
if (!SITE) {
  const page = await ctx.newPage();
  await page.goto(`${BASE}/pages/about-us?view=cursor-test&pb=0`, { waitUntil: 'load', timeout: 60000 });
  await page.waitForFunction(() => document.querySelector('[data-summary]')?.textContent.startsWith('Done'), null, { timeout: 20000 });
  const rows = await page.evaluate(() => window.__cursorTest);
  for (const r of rows) {
    const custom = r.urls.length > 0;
    console.log(`${r.name.padEnd(18)} ${custom ? 'CUSTOM' : 'native'} ${r.size || ''} hot ${r.hot ? r.hot.join(',') : '-'}  ${r.cur.slice(0, 60)}`);
  }
  // text fields carry the MOMENTS I-beam since 2026-10-30 (the thin system I-beam was easy to lose on white fields)
  const want = { custom: ['html', 'body', 'link', 'button', 'role=button', 'label', 'select', 'summary', 'm-btn link', 'checkbox', 'paragraph text', 'card (div)', 'text input', 'textarea'], native: ['disabled button'] };
  for (const n of want.custom) { const r = rows.find((x) => x.name === n); if (!r || !r.urls.length) fail(`${n} should be the custom pointer`); else if (!r.ok) fail(`${n} cursor image invalid (${r.size})`); }
  for (const n of want.native) { const r = rows.find((x) => x.name === n); if (r && r.urls.length) fail(`${n} must keep the native cursor`); }
  const link = rows.find((x) => x.name === 'link'), def = rows.find((x) => x.name === 'body');
  if (link && def && link.urls[0] === def.urls[0]) fail('link and default use the same image');
}
if (SITE) {
  const page = await ctx.newPage();
  await page.addInitScript(() => { window.__cls = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); });
  for (const path of ['/', '/collections/all', '/products/9-pm-night-out', '/pages/about-us', '/cart']) {
    await page.goto(`${BASE}${path}?pb=0`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2500);
    const res = await page.evaluate(() => {
      const pick = (sel) => [...document.querySelectorAll(sel)].find((e) => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; });
      const out = {};
      for (const [k, sel] of Object.entries({ body: 'body', link: 'header a[href]', button: 'button:not(:disabled)', cta: '.m-btn, a.button', card: 'product-card a, .m-tile a', input: 'input[type=search], input[type=text], input[type=email]' })) {
        const el = k === 'body' ? document.body : pick(sel); out[k] = el ? getComputedStyle(el).cursor : null;
      }
      return out;
    });
    const isCustom = (c) => c && /url\(/.test(c);
    for (const k of ['body', 'link', 'button', 'cta', 'card']) if (res[k] !== null && !isCustom(res[k])) fail(`${path} ${k}: ${res[k]}`);
    if (res.input && !/cursor-text/.test(res.input)) fail(`${path} text input should use the MOMENTS I-beam: ${res.input}`);
    console.log(`ok ${path}`, JSON.stringify(Object.fromEntries(Object.entries(res).map(([k, v]) => [k, v && (v.includes('url(') ? (v.includes('cursor-link') ? 'link-img' : 'default-img') : v)]))));
  }
  // only the pointer images: nothing may follow the mouse (the owner removed the cursor follower for good on 2026-10-27)
  await page.goto(`${BASE}/?pb=0`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  for (const [x, y] of [[300, 300], [700, 500], [1000, 250]]) { await page.mouse.move(x, y, { steps: 8 }); await page.waitForTimeout(400); }
  const follower = await page.evaluate(() => [...document.querySelectorAll('body *')].filter((e) => /cursor/i.test(e.tagName) || /cursor-?(token|follow|companion)/i.test(String(e.className?.baseVal ?? e.className ?? ''))).map((e) => e.tagName.toLowerCase()));
  if (follower.length) fail(`a cursor follower is on the page: ${follower.join(', ')}`); else console.log('ok no cursor follower, pointer images only');
  const cls = await page.evaluate(() => window.__cls);
  if (cls > 0.05) fail(`layout shift ${cls.toFixed(3)}`); else console.log(`ok CLS ${cls.toFixed(3)}`);
}
await browser.close();
console.log(bad ? `POINTER FAILED (${bad})` : 'POINTER OK');
process.exit(bad ? 1 : 0);
