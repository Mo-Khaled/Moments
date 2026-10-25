// Check that every internal link on the key pages of the DEV theme resolves (no 404), and that the system pages respond.
// Dev tool, not part of the theme. usage: node scripts/check-links.mjs
import { chromium } from 'playwright-core';

const BASE = 'https://momentseg.com';
const THEME = '161294745791';
const PAGES = ['/', '/pages/moments', '/pages/about-us?view=about', '/collections/night-moment', '/products/9-pm-night-out'];
const SYSTEM = ['/cart', '/search?q=oud', '/account/login', '/collections/all', '/this-page-does-not-exist'];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const links = new Map();
for (const p of PAGES) {
  const page = await context.newPage();
  await page.goto(`${BASE}${p}${p.includes('?') ? '&' : '?'}preview_theme_id=${THEME}&pb=0`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(2500);
  // open the two panels so their links are in the DOM too (they are always rendered, hidden)
  const found = await page.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter((h) => h && (h.startsWith('/') && !h.startsWith('//'))));
  for (const h of found) if (!links.has(h)) links.set(h, p);
  await page.close();
}
const skip = /^\/(cart|account|checkout|cdn|\.well-known)\b|\/(cart\/|search\?)/;
const targets = [...links.keys()].map((h) => h.split('#')[0]).filter((h) => h && !skip.test(h));
const unique = [...new Set(targets)];
console.log(`${unique.length} unique internal links from ${PAGES.length} pages`);
let bad = 0;
for (const h of unique) {
  const url = `${BASE}${h}${h.includes('?') ? '&' : '?'}preview_theme_id=${THEME}`;
  let status = 0;
  for (let i = 0; i < 3 && (status === 0 || status === 429); i++) {
    const res = await context.request.get(url, { timeout: 60000, maxRedirects: 5 }).catch(() => null);
    status = res ? res.status() : 0;
    if (status === 429 || status === 0) await sleep(4000 * (i + 1));
  }
  if (status >= 400 || status === 0) { bad++; console.log('BROKEN', status, h, '(from', links.get(h) + ')'); }
  await sleep(350);
}
for (const s of SYSTEM) {
  const res = await context.request.get(`${BASE}${s}${s.includes('?') ? '&' : '?'}preview_theme_id=${THEME}`, { timeout: 60000 }).catch(() => null);
  const status = res ? res.status() : 0;
  const expected404 = s === '/this-page-does-not-exist';
  const ok = expected404 ? status === 404 : status === 200;
  if (!ok) bad++;
  console.log(ok ? 'ok    ' : 'FAIL  ', status, s, expected404 ? '(404 page expected)' : '');
  await sleep(400);
}
await browser.close();
console.log(bad ? `${bad} problem(s)` : 'all links and system pages OK');
process.exit(bad ? 1 : 0);
