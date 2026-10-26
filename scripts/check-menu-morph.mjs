// The header section re-renders itself once after load (hydration) and again whenever the cart changes. If that happens while a mega panel is open,
// the menu must still close when the pointer leaves. usage: node scripts/check-menu-morph.mjs [--theme id]
import { chromium } from 'playwright-core';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const THEME = arg('theme', '');
const b = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
const p = await ctx.newPage();
await p.goto(`https://momentseg.com/?pb=0${THEME ? '&preview_theme_id=' + THEME : ''}`, { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(4000);
const state = () => p.evaluate(() => { const h = document.querySelector('header-menu'); const cs = getComputedStyle(h); const sub = h.querySelector('.menu-list__submenu'); return { var: h.style.getPropertyValue('--submenu-height') || cs.getPropertyValue('--submenu-height'), expanded: h.querySelectorAll('[aria-expanded="true"]').length, headerBottom: Math.round(document.querySelector('header-component, .header')?.getBoundingClientRect().bottom ?? 0), subVis: getComputedStyle(sub).visibility }; });
console.log('rest      ', JSON.stringify(await state()));
let bad = 0;
for (let t = 0; t < 6; t++) {
  await p.locator('header-menu .menu-list__link', { hasText: 'Shop by Moment' }).first().hover();
  await p.waitForTimeout(900);
  // re-render the header exactly like hydration / a cart update does, while the panel is open
  await p.evaluate(async () => { const id = document.querySelector('header-component')?.closest('[id^="shopify-section-"]')?.id.replace('shopify-section-', ''); const m = await import('@theme/section-renderer'); await m.sectionRenderer.renderSection(id, { cache: false }); });
  await p.waitForTimeout(300);
  await p.mouse.move(700, 600, { steps: 8 });
  await p.waitForTimeout(1500);
  const s = await state();
  const fine = s.expanded === 0 && (parseFloat(s.var) || 0) === 0 && s.subVis === 'hidden';
  console.log(fine ? 'ok  ' : 'FAIL', 'after morph + leave', JSON.stringify(s));
  if (!fine) bad++;
}
await b.close();
console.log(bad ? 'MENU MORPH FAILED' : 'MENU MORPH OK');
process.exit(bad ? 1 : 0);
