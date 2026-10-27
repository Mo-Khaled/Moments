// The mega panel must close when the pointer leaves the window or the window loses focus (Chrome keeps :hover and fires no pointerleave). usage: node scripts/check-menu-leave.mjs [themeId]
import { chromium } from 'playwright-core';
const THEME = process.argv[2] || '';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto(`https://momentseg.com/?pb=0${THEME ? '&preview_theme_id=' + THEME : ''}`, { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(4000);
let bad = 0;
for (const how of ['mouseleave', 'blur']) {
  await p.locator('header-menu .menu-list__link', { hasText: 'Shop by Moment' }).first().hover();
  await p.waitForTimeout(800);
  // the pointer leaves the window: no pointerleave on the menu, :hover stays
  await p.evaluate((h) => { if (h === 'blur') window.dispatchEvent(new Event('blur')); else document.documentElement.dispatchEvent(new MouseEvent('mouseleave')); }, how);
  await p.waitForTimeout(1200);
  const s = await p.evaluate(() => { const h = document.querySelector('header-menu'); return { v: h.style.getPropertyValue('--submenu-height'), e: h.querySelectorAll('[aria-expanded="true"]').length }; });
  const ok = s.e === 0 && parseFloat(s.v) === 0; if (!ok) bad++;
  console.log(ok ? 'ok  ' : 'FAIL', how, JSON.stringify(s));
}
await b.close(); process.exit(bad ? 1 : 0);
