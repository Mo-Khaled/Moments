// Quick hover-and-leave on "Shop by Moment" (the owner's report 2026-10-29: a cropped strip of moment tiles stays under the header).
// For each dwell time, hover the link, then move the pointer DOWN through the panel area into the page, wait, and record what is still painted.
//   node scripts/check-menu-quick-leave.mjs [--base https://momentseg.com] [--trials 3]
import { chromium } from 'playwright-core';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const BASE = arg('base', 'https://momentseg.com');
const TRIALS = Number(arg('trials', 3));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ viewport: { width: 1920, height: 940 } });
await ctx.route(/kaspersky-labs|monorail/, (r) => r.abort());
const page = await ctx.newPage();
await page.goto(BASE + '/', { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(2000);
const link = page.locator('.menu-list__link[aria-haspopup]').first();
const box = await link.boundingBox();
const probe = () => page.evaluate(() => {
  const menu = document.querySelector('header-menu');
  const sub = document.querySelector('.menu-list__list-item:has(.menu-list__link[aria-haspopup]) > .menu-list__submenu');
  const cs = getComputedStyle(sub);
  const r = sub.getBoundingClientRect();
  // painted height: the clip's bottom inset is the visible height of the panel
  const m = /rect\(0px 100% ([\d.]+)px 0px\)|rect\(0px, 100%, ([\d.]+)px, 0px\)/.exec(cs.clipPath);
  return { vis: cs.visibility, clip: cs.clipPath, painted: m ? Number(m[1] || m[2]) : null, height: menu.style.getPropertyValue('--submenu-height'), expanded: !!document.querySelector('.menu-list__link[aria-expanded="true"]'), animating: !!document.querySelector('.menu-list__link[data-animating]'), hover: sub.matches(':hover'), content: cs.getPropertyValue('--submenu-content-opacity'), top: r.top | 0 };
});
let stuck = 0, runs = 0;
for (const dwell of [0, 30, 60, 100, 150, 220, 300, 400]) {
  for (let t = 0; t < TRIALS; t++) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 2 });
    await page.waitForTimeout(dwell);
    // leave fast: down through the panel area to below it (900px, the panel ends near 620px), or up out of the window edge of the header
    const exits = [[box.x + box.width / 2 + 40, 900], [box.x + 600, 2], [box.x + box.width / 2, box.y + box.height + 12], [box.x + box.width / 2 + 200, box.y + box.height + 30], [box.x + box.width / 2, box.y + box.height + 60]];
    const exit = exits[t % exits.length];
    await page.mouse.move(exit[0], exit[1], { steps: 4 });
    await page.waitForTimeout(1500);
    const s = await probe();
    runs++;
    const bad = s.vis === 'visible' || (parseFloat(s.height) || 0) > 0;
    if (bad) { stuck++; console.log('STUCK', `dwell ${dwell}ms exit ${exit.map(Math.round)}`, JSON.stringify(s)); await page.screenshot({ path: `docs/screenshots/menu-quick-leave-${dwell}-${t}.png`, clip: { x: 0, y: 0, width: 1920, height: 400 } }); }
    await page.mouse.move(10, 900); await page.waitForTimeout(600);
  }
}
console.log(stuck ? `QUICK LEAVE: ${stuck} of ${runs} left the panel painted` : `QUICK LEAVE OK (${runs} trials)`);
await browser.close();
process.exit(stuck ? 1 : 0);
