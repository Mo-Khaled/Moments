// Stress the desktop mega menu with random fast pointer paths, then check that the header returns to its resting height with nothing open.
// usage: node scripts/check-menu-hover.mjs [--trials 40] [--theme id]
import { chromium } from 'playwright-core';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const TRIALS = Number(arg('trials', 40)); const THEME = arg('theme', '');
const b = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
const p = await ctx.newPage();
// --local-js: serve this repo's assets/header-menu.js to the live page, to test a fix before it is pushed
let served = 0;
const JS = process.argv.includes('--debug-js') ? 'scripts/.hm-debug.js' : 'assets/header-menu.js';
if (process.argv.includes('--local-js') || process.argv.includes('--debug-js')) await p.route(/\/assets\/header-menu\.js/, (r) => { served++; r.fulfill({ path: JS, contentType: 'text/javascript' }); });
await p.goto(`https://momentseg.com/?pb=0${THEME ? '&preview_theme_id=' + THEME : ''}`, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(3500);
const state = () => p.evaluate(() => {
  const hm = document.querySelector('header-menu');
  const hdr = document.querySelector('header.header-section, #header-component, header');
  const hero = document.querySelector('.m-hero');
  const subs = [...document.querySelectorAll('.menu-list__submenu')].map((e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return { vis: s.visibility, op: s.opacity, h: Math.round(r.height), clip: s.clipPath.slice(0, 40), top: Math.round(r.top) }; }).filter((s) => s.vis !== 'hidden' && s.h > 0);
  return { heroTop: Math.round(hero.getBoundingClientRect().top), subH: hm.style.getPropertyValue('--submenu-height'), subO: hm.style.getPropertyValue('--submenu-opacity'), aria: hm.getAttribute('aria-expanded'), animating: [...document.querySelectorAll('[data-animating]')].length, visibleSubs: subs };
});
console.log('local header-menu.js served:', served);
const base = await state(); console.log('baseline', JSON.stringify(base));
const items = await p.evaluate(() => [...document.querySelectorAll('header-menu .menu-list__list-item, header-menu [slot], header-menu > nav li')].slice(0, 6).map((e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; }).filter((r) => r.w > 20 && r.h > 10 && r.y < 200));
console.log('nav targets', items.length);
let stuck = 0; const rnd = (a, b2) => a + Math.random() * (b2 - a);
for (let t = 0; t < TRIALS; t++) {
  const steps = 2 + Math.floor(Math.random() * 3);
  for (let s = 0; s < steps; s++) {
    const it = items[Math.floor(Math.random() * items.length)];
    await p.mouse.move(it.x + rnd(-8, 8), it.y + rnd(-6, 6), { steps: 2 + Math.floor(Math.random() * 6) });
    await p.waitForTimeout(rnd(20, 260));
  }
  // leave: straight down into the page, or off to the side, sometimes fast
  // clearly outside the menu: below the tallest panel, the announcement bar above the header, or a thin strip beside the page content
  const r0 = Math.random();
  const away = r0 < 0.5 ? [rnd(100, 1400), rnd(680, 860)] : r0 < 0.8 ? [rnd(100, 1400), rnd(4, 26)] : [rnd(1425, 1438), rnd(150, 500)];
  await p.mouse.move(away[0], away[1], { steps: 1 + Math.floor(Math.random() * 8) });
  await p.waitForTimeout(1300);
  const s2 = await state();
  const hovered = await p.evaluate(() => document.querySelector('header-menu').matches(':hover') || document.querySelector('header-menu [ref=overflowMenu]')?.matches(':hover'));
  const bad = !hovered && (s2.heroTop !== base.heroTop || s2.visibleSubs.length || s2.aria === 'true' || s2.animating);
  if (bad) { stuck++; console.log(`trial ${t} STUCK`, JSON.stringify(s2)); if (process.argv.includes('--debug-js')) {
      console.log('now', await p.evaluate(() => performance.now().toFixed(0)), 'hover over header-menu:', await p.evaluate(() => document.querySelector('header-menu').matches(':hover')), 'overflow-list hover:', await p.evaluate(() => { const o = document.querySelector('header-menu [ref=overflowMenu]'); return o ? o.matches(':hover') : 'none'; }));
      console.log((await p.evaluate(() => (window.__hm || []).slice(-10))).join(' | ').replace(/\s+/g, ' '));
      await p.waitForTimeout(1500);
      console.log('after +1.5s:', JSON.stringify(await state()));
    }
 await p.screenshot({ path: `docs/screenshots/cards/menu-stuck-${t}.png`, clip: { x: 0, y: 0, width: 1440, height: 330 } }); if (stuck >= 3) break; }
}
console.log(stuck ? `STUCK ${stuck} of ${TRIALS}` : `no stuck state in ${TRIALS} trials`);
await b.close(); process.exit(stuck ? 1 : 0);
