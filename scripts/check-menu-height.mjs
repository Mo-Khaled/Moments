// The mega panel must open to the height of its content, also when the page's images load late (the header once stayed open at a few dozen pixels with the tiles cut off).
// usage: node scripts/check-menu-height.mjs [--theme id]
import { chromium } from 'playwright-core';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const THEME = arg('theme', '');
const b = await chromium.launch({ channel: 'chrome', headless: true });
let bad = 0;
for (const slow of [false, true]) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
  // slow: images arrive 2.5s late, so the panel is measured before its tiles have their final size
  if (slow) await ctx.route(/\.(png|jpe?g|webp|avif)(\?|$)/, async (r) => { await new Promise((s) => setTimeout(s, 2500)); r.continue().catch(() => {}); });
  const p = await ctx.newPage();
  await p.goto(`https://momentseg.com/?pb=0${THEME ? '&preview_theme_id=' + THEME : ''}`, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(slow ? 1500 : 3500);
  const item = p.locator('header-menu .menu-list__link', { hasText: 'Shop by Moment' }).first();
  await item.hover();
  const rows = [];
  for (let i = 0; i < 8; i++) {
    await p.waitForTimeout(700);
    rows.push(await p.evaluate(() => {
      const h = document.querySelector('header-menu');
      const open = h.querySelector('[aria-expanded="true"]');
      const sub = open?.querySelector('.menu-list__submenu, [class*="submenu"]');
      const hh = parseFloat(getComputedStyle(h).getPropertyValue('--submenu-height')) || 0;
      return { set: Math.round(hh), content: sub ? Math.round(sub.scrollHeight) : 0 };
    }));
  }
  const last = rows[rows.length - 1];
  const fine = last.content > 0 && last.set >= last.content - 2;
  console.log(fine ? 'ok  ' : 'FAIL', slow ? 'late images' : 'normal', JSON.stringify(last));
  if (!fine) bad++;
  await ctx.close();
}
await b.close();
console.log(bad ? 'MENU HEIGHT FAILED' : 'MENU HEIGHT OK');
process.exit(bad ? 1 : 0);
