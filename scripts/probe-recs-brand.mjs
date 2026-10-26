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
  const o = [];
  for (const e of c.querySelectorAll('*')) { if (e.children.length) continue; const t = (e.textContent || '').trim(); if (!t || e.closest('.card-gallery') || e.classList.contains('visually-hidden')) continue; const chain = []; for (let x = e; x && x !== c; x = x.parentElement) chain.push(x.tagName.toLowerCase() + '.' + String(x.className).split(' ').filter(Boolean).slice(0, 2).join('.') + '[' + getComputedStyle(x).display + '/' + getComputedStyle(x).justifyContent + '/' + getComputedStyle(x).alignItems + '/' + getComputedStyle(x).textAlign + ']'); o.push(`"${t.slice(0, 16)}"  ${chain.slice(0, 5).join(' < ')}`); }
  return o.join('\n');
}));
await b.close();
