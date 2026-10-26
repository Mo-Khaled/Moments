import { webkit, devices } from 'playwright-core';
const b = await webkit.launch({ headless: true });
const ctx = await b.newContext({ ...devices['iPhone 13'] });
await ctx.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
const p = await ctx.newPage();
await p.goto('https://momentseg.com/products/9-pm-night-out?pb=0', { waitUntil: 'domcontentloaded', timeout: 90000 });
await p.waitForTimeout(3000);
for (let i = 0; i < 12; i++) { await p.evaluate(() => window.scrollBy({ top: 700, behavior: 'instant' })); await p.waitForTimeout(450); }
console.log(await p.evaluate(() => {
  const c = [...document.querySelectorAll('product-card')].find((e) => e.getBoundingClientRect().width > 100);
  const o = []; const R = (e) => { const r = e.getBoundingClientRect(); return `w${Math.round(r.width)} h${Math.round(r.height)} y${Math.round(r.top)}`; };
  o.push('slide chain: ' + [c.parentElement, c.parentElement.parentElement, c.parentElement.parentElement.parentElement].map((x) => x.tagName.toLowerCase() + '.' + String(x.className).split(' ')[0] + ' ' + R(x) + ' disp=' + getComputedStyle(x).display).join(' < '));
  const walk = (el, d) => { for (const ch of el.children) { if (['SCRIPT', 'STYLE'].includes(ch.tagName)) continue; const s = getComputedStyle(ch); const r = ch.getBoundingClientRect(); if (d <= 3 && (r.height > 1 || ch.tagName.includes('-'))) o.push('  '.repeat(d) + ch.tagName.toLowerCase() + '.' + String(ch.className).split(' ').filter(Boolean).slice(0, 3).join('.') + ' ' + R(ch) + ` disp=${s.display} pos=${s.position} flex=${s.flex} ta=${s.textAlign}`); if (d < 3) walk(ch, d + 1); } };
  walk(c, 1);
  return o.slice(0, 40).join('\n');
}));
await b.close();
