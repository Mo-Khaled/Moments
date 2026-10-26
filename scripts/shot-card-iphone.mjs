// Screenshots of the first product cards as a real iPhone sees them (touch, dpr 3), Chromium and WebKit.
// usage: node scripts/shot-card-iphone.mjs [--tag x] [--pages /,/products/9-pm-night-out]
import { chromium, webkit, devices } from 'playwright-core';
import { mkdirSync } from 'node:fs';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const TAG = arg('tag', 'iphone');
const PAGES = arg('pages', '/,/products/9-pm-night-out,/collections/all,/pages/make-a-bundle').split(',');
mkdirSync('docs/screenshots/cards', { recursive: true });
for (const [name, eng] of [['chromium', () => chromium.launch({ channel: 'chrome', headless: true })], ['webkit', () => webkit.launch({ headless: true })]]) {
  const b = await eng();
  for (const path of PAGES) {
    const ctx = await b.newContext({ ...devices['iPhone 13'] });
    await ctx.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
    const p = await ctx.newPage();
    try {
      await p.goto(`https://momentseg.com${path}?pb=0`, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await p.waitForTimeout(path.includes('bundle') ? 7000 : 4500);
      const info = await p.evaluate(() => {
        const c = [...document.querySelectorAll('product-card')].find((e) => { const r = e.getBoundingClientRect(); return r.width > 100 && r.left >= -2; });
        if (!c) return null;
        c.scrollIntoView({ block: 'center', behavior: 'instant' });
        const r = c.getBoundingClientRect();
        const g = c.querySelector('.card-gallery').getBoundingClientRect();
        const btn = c.querySelector('.quick-add__button'); const br = btn && btn.getBoundingClientRect();
        return { card: [Math.round(r.width), Math.round(r.height)], gallery: [Math.round(g.width), Math.round(g.height)], btn: br && [Math.round(br.width), Math.round(br.height)], align: getComputedStyle(c.querySelector('.card-meta') || c).textAlign };
      });
      const slug = path === '/' ? 'home' : path.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '');
      await p.screenshot({ path: `docs/screenshots/cards/${TAG}-${name}-${slug}.png` });
      console.log(name.padEnd(8), path.padEnd(24), JSON.stringify(info));
    } catch (e) { console.log(name, path, 'ERR', String(e).split('\n')[0].slice(0, 80)); }
    await ctx.close();
  }
  await b.close();
}
