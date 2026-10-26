import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
const p = await ctx.newPage();
await p.goto('https://momentseg.com/collections/all?pb=0', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(4000);
console.log(await p.evaluate(() => {
  const c = document.querySelector('product-card'); c.scrollIntoView({ block: 'center', behavior: 'instant' });
  const R = (e) => { const r = e.getBoundingClientRect(); return `top${Math.round(r.top)} bottom${Math.round(r.bottom)} h${Math.round(r.height)}`; };
  const o = ['card ' + R(c)];
  const content = c.querySelector('.product-card__content');
  const wrap = [...content.children].find((x) => x.querySelector('.card-meta') && !x.classList.contains('card-gallery')) || content;
  o.push('wrapper=' + wrap.tagName + '.' + String(wrap.className).split(' ').slice(0,3).join('.'));
  for (const ch of wrap.children) { const s = getComputedStyle(ch); o.push(ch.tagName.toLowerCase() + '.' + String(ch.className).split(' ')[0] + ' ' + R(ch) + ` pad=${s.paddingTop}/${s.paddingBottom} mar=${s.marginTop}/${s.marginBottom}`); }
  const price = c.querySelector('product-price');
  for (const ch of price.querySelectorAll('*')) { if (ch.children.length > 2) continue; const s = getComputedStyle(ch); o.push('   price> ' + ch.tagName.toLowerCase() + '.' + String(ch.className).split(' ')[0] + ' ' + R(ch) + ` lh=${s.lineHeight} mar=${s.marginBottom} pad=${s.paddingBottom}`); }
  return o.join('\n');
}));
await b.close();
