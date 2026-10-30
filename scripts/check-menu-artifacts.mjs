// Mega-menu paint artifacts (owner screenshots 2026-10-30): opens Shop by Moment, goes down to the tiles and back up, then moves to Brands;
// saves menu-downThenUp.png and menu-toBrands.png in the scratch folder and logs every panel's state. FIX="css" injects CSS for experiments.
import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: 1920, height: 940 } });
await ctx.route(/kaspersky-labs|monorail/, (r) => r.abort());
const p = await ctx.newPage();
await p.goto('https://momentseg.com/collections/night-moment', { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(2000);
if (process.env.FIX) await p.addStyleTag({ content: process.env.FIX });
const link = await p.locator('.menu-list__link', { hasText: 'Shop by Moment' }).first().boundingBox(); console.log('link', JSON.stringify(link));
const SP = 'C:/Users/MOHAME~1/AppData/Local/Temp/claude/d--momentsShopify/c08b7f58-e9d2-46f6-bb52-db77ea77cd80/scratchpad/';
const state = () => p.evaluate(() => [...document.querySelectorAll('.menu-list__submenu')].map((sub) => { const cs = getComputedStyle(sub); const mm = sub.querySelector('.m-mega'); const r = sub.getBoundingClientRect(); return `${sub.closest('li')?.querySelector('.menu-list__link-title')?.textContent.trim()} vis=${cs.visibility} clip=${cs.clipPath.slice(0, 34)} mega=${mm ? getComputedStyle(mm).opacity + '/' + mm.className.split(' ').slice(1).join('.') : '-'} anim=${!!sub.closest('li')?.querySelector('[data-animating]')} exp=${sub.closest('li')?.querySelector('[aria-expanded=true]') ? 1 : 0} h=${Math.round(r.height)}`; }).join(' || '));
const stateOld = () => p.evaluate(() => { const m = document.querySelector('header-menu'); const sub = document.querySelector('.menu-list__list-item:has(.menu-list__link[aria-haspopup]) > .menu-list__submenu'); const cs = getComputedStyle(sub); return { h: m.style.getPropertyValue('--submenu-height'), clip: cs.clipPath.slice(0, 50), vis: cs.visibility, op: getComputedStyle(sub.querySelector('.m-mega')).opacity, hover: sub.matches(':hover'), exp: !!document.querySelector('.menu-list__link[aria-expanded=true]') }; });
const paths = {
  downThenUp: [[link.x + link.width / 2, link.y + link.height / 2, 3], [link.x + 40, 400, 6], [link.x + 40, 600, 6], [link.x + 40, link.y + link.height + 18, 3]],
  toBrands: [[link.x + link.width / 2, link.y + link.height / 2, 3], [link.x + 40, 500, 6], [link.x + link.width + 60, link.y + 10, 4]],
};
for (const [name, steps] of Object.entries(paths)) {
  for (const [x, y, st] of steps) { await p.mouse.move(x, y, { steps: st || 1 }); await p.waitForTimeout(350); }
  for (const t of [800]) { await p.waitForTimeout(t); console.log(name, t, JSON.stringify(await state())); }
  await p.screenshot({ path: `${SP}menu-${name}.png`, clip: { x: 0, y: 0, width: 1920, height: 720 } });
  console.log(name, 'copies:', JSON.stringify(await p.evaluate(() => { const all = []; const walk = (root) => { for (const e of root.querySelectorAll('.m-mega--moments')) { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); let a = e, chain = []; while (a && chain.length < 6) { chain.push(a.tagName.toLowerCase() + '.' + String(a.className).split(' ')[0]); a = a.parentElement || a.getRootNode().host; } all.push({ top: Math.round(r.top), h: Math.round(r.height), vis: cs.visibility, op: cs.opacity, chain: chain.join(' < ') }); } for (const el of root.querySelectorAll('*')) if (el.shadowRoot) walk(el.shadowRoot); }; walk(document); return all; })));
  console.log(name, 'at strip:', JSON.stringify(await p.evaluate(() => document.elementsFromPoint(380, 118).slice(0, 6).map((e) => { const cs = getComputedStyle(e); return e.tagName.toLowerCase() + '.' + String(e.className).split(' ').slice(0, 2).join('.') + ' vis=' + cs.visibility + ' op=' + cs.opacity + ' bg=' + cs.backgroundColor; }))));
  console.log(name, 'header:', JSON.stringify(await p.evaluate(() => { const h = document.querySelector('.header'); const r = h.getBoundingClientRect(); const row = document.querySelector('.header__row'); return { headerH: Math.round(r.height), rowBottom: Math.round(row.getBoundingClientRect().bottom), animating: !!document.querySelector('[data-animating]'), sticky: h.dataset.stickyState }; })));
  await p.mouse.move(10, 900, { steps: 3 }); await p.waitForTimeout(1500);
}
await b.close();
