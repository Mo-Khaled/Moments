// Visual snapshot of the key pages for before/after comparison (dev tool, not part of the theme).
// Motion is switched off (reduced motion, mocked hour, no video) so two runs of identical code give identical pixels.
//
//   node scripts/visual-snapshot.mjs <label>        writes docs/screenshots/cleanup/<label>/<page>-<width>-<dir>.png
//   python scripts/visual-diff.py <labelA> <labelB>  compares two labels pixel by pixel
// Pages: home, collection, product, cart drawer (empty), About (?view=about), /pages/moments. Widths 1920, 1440, 375. LTR and RTL (dir emulated).
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const label = process.argv[2];
if (!label) { console.error('usage: node scripts/visual-snapshot.mjs <label>'); process.exit(1); }
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'docs', 'screenshots', 'cleanup', label);
fs.mkdirSync(OUT, { recursive: true });
const BASE = 'https://momentseg.com';
const THEME = '161294745791';
const PAGES = [
  ['home', '/'],
  ['collection', '/collections/night-moment'],
  ['product', '/products/9-pm-night-out'],
  ['cart-drawer', '/'],
  ['about', '/pages/about-us?view=about'],
  ['moments', '/pages/moments'],
];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
let n = 0;
for (const width of [1920, 1440, 375]) {
  for (const dir of ['ltr', 'rtl']) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    await context.addInitScript(() => { window.__MOMENTS_HOUR__ = 21; try { sessionStorage.clear(); } catch (e) { /* ignore */ } });
    await context.route(/kaspersky-labs|shopifysvc|monorail|\.mp4|\.webm|\.m3u8/, (route) => route.abort());
    for (const [name, p] of PAGES) {
      const page = await context.newPage();
      const url = `${BASE}${p}${p.includes('?') ? '&' : '?'}preview_theme_id=${THEME}&pb=0`;
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(2500);
        if (dir === 'rtl') await page.evaluate(() => { document.documentElement.dir = 'rtl'; document.documentElement.lang = 'ar'; });
        await page.evaluate(async () => { const h = document.documentElement.scrollHeight; for (let y = 0; y < h; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 100)); } scrollTo(0, 0); });
        await page.waitForTimeout(1200);
        if (name === 'cart-drawer') {
          const cart = await page.$('.action__cart, header-actions .cart-drawer__trigger, [aria-controls="cart-drawer"], a[href="/cart"]');
          if (cart) { await cart.click({ timeout: 5000 }).catch(() => {}); await page.waitForTimeout(1200); }
          await page.screenshot({ path: path.join(OUT, `${name}-${width}-${dir}.png`) });
        } else {
          const h = await page.evaluate(() => Math.min(document.documentElement.scrollHeight, 5000));
          await page.screenshot({ path: path.join(OUT, `${name}-${width}-${dir}.png`), clip: { x: 0, y: 0, width, height: h }, fullPage: true });
        }
        n++;
      } catch (e) {
        console.error(`FAILED ${name} ${width} ${dir}: ${e.message.slice(0, 100)}`);
      }
      await page.close();
    }
    await context.close();
  }
}
await browser.close();
console.log(`${n} snapshots in ${OUT}`);
