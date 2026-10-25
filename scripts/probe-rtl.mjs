// Dev probe: where does content sit at 375px in emulated RTL? usage: node scripts/probe-rtl.mjs [width]
import { chromium } from 'playwright-core';

const width = Number(process.argv[2] || 375);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await (await browser.newContext({ viewport: { width, height: 900 } })).newPage();
await page.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
await page.goto('https://momentseg.com/?preview_theme_id=161294745791&pb=0', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(3500);
const probe = () => page.evaluate(() => {
  const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)]; };
  return { dir: document.documentElement.dir, scrollW: document.documentElement.scrollWidth, bodyW: document.body.scrollWidth, scrollX, header: r(document.querySelector('#header-component')), hero: r(document.querySelector('.m-hero')), announce: r(document.querySelector('.m-announce__bar')), main: r(document.querySelector('main')) };
});
console.log('LTR', JSON.stringify(await probe()));
await page.evaluate(() => { document.documentElement.dir = 'rtl'; document.documentElement.lang = 'ar'; });
await page.waitForTimeout(1500);
console.log('RTL', JSON.stringify(await probe()));
const wide = await page.evaluate(() => [...document.querySelectorAll('body *')].filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && (b.left < -200 || b.right > innerWidth + 200); }).slice(0, 8).map((e) => e.tagName.toLowerCase() + '.' + String(e.className).slice(0, 40) + ' ' + Math.round(e.getBoundingClientRect().left) + ' ' + Math.round(e.getBoundingClientRect().right)));
console.log('far-off elements in RTL:', JSON.stringify(wide, null, 1));
await page.screenshot({ path: 'D:/tmp_h/rtl_probe.png' });
await browser.close();
