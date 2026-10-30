// Full-page screenshots of the main pages at 1440 and 390, for before/after reviews.
// usage: node scripts/shot-site.mjs <tag> [--theme id] [--pages /,/cart]   Output: docs/design/site-polish/<tag>-<page>-<width>.png
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const TAG = process.argv[2] || 'run';
const THEME = arg('theme', '');
const PAGES = arg('pages', '/,/collections/all,/products/9-pm-night-out,/cart,/search?q=oud,/pages/about-us,/pages/faq,/pages/brands,/pages/make-a-bundle,/pages/moments').split(',');
const OUT = 'docs/design/site-polish';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, ...(w < 750 ? { isMobile: true, hasTouch: true } : {}) });
  await ctx.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
  const p = await ctx.newPage();
  for (const path of PAGES) {
    const url = `https://momentseg.com${path}${path.includes('?') ? '&' : '?'}pb=0${THEME ? '&preview_theme_id=' + THEME : ''}`;
    try {
      await p.goto(url, { waitUntil: 'load', timeout: 60000 });
      // walk down once so lazy images load, then back to the top
      await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } scrollTo(0, 0); });
      await p.waitForTimeout(1200);
      const name = path === '/' ? 'home' : path.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '');
      await p.screenshot({ path: `${OUT}/${TAG}-${name}-${w}.png`, fullPage: true });
      console.log('ok', w, path);
    } catch (e) {
      console.log('FAIL', w, path, String(e).slice(0, 100));
    }
  }
  await ctx.close();
}
await browser.close();
