// Dev probe: geometry of the best-sellers carousel at a width. usage: node scripts/probe-carousel.mjs [width]
import { chromium } from 'playwright-core';

const width = Number(process.argv[2] || 1440);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width, height: 900 } });
await page.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
await page.goto('https://momentseg.com/?preview_theme_id=161294745791&pb=0', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(4000);
const out = await page.evaluate(() => {
  const sec = [...document.querySelectorAll('.shopify-section')].find((x) => x.id.endsWith('product_list_CYd9gQ'));
  sec.scrollIntoView();
  const r = (e) => { const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.right), Math.round(b.width)]; };
  const chain = [];
  let el = sec.querySelector('product-card');
  while (el && el !== sec) { const cs = getComputedStyle(el); chain.push({ t: el.tagName.toLowerCase() + '.' + String(el.className).slice(0, 50), r: r(el), disp: cs.display, ov: cs.overflowX, snap: cs.scrollSnapType }); el = el.parentElement; }
  const header = sec.querySelector('[class*="static-header"], .resource-list__header, [class*=header]');
  return { vw: innerWidth, chain: chain.slice(0, 9), header: header ? [header.className.slice(0, 60), r(header)] : null, cards: [...sec.querySelectorAll('product-card')].slice(0, 6).map((c) => r(c)) };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
