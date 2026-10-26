import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome', headless: true });
for (const [w, path] of [[375, '/'], [1440, '/collections/all']]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
  await ctx.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
  const p = await ctx.newPage();
  await p.goto(`https://momentseg.com${path}?pb=0`, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(3500);
  console.log('=== ' + path + ' ' + w + '\n' + await p.evaluate(() => {
    const c = [...document.querySelectorAll('product-card')].find((e) => e.getBoundingClientRect().width > 100); c.scrollIntoView({ block: 'center', behavior: 'instant' });
    const cl = c.getBoundingClientRect().left; const o = [];
    const leaves = [...c.querySelectorAll('.card-meta__moment, .card-meta__brand, .product-name__first, .product-name__rest, .price, .compare-at-price, .card-meta')].filter((e) => e.getBoundingClientRect().width > 1);
    for (const e of leaves) { const chain = []; for (let x = e; x && x !== c; x = x.parentElement) { const s = getComputedStyle(x); const pl = parseFloat(s.paddingLeft), ml = parseFloat(s.marginLeft); if (pl || ml) chain.push(`${x.tagName.toLowerCase()}.${String(x.className).split(' ')[0]}(pl${pl},ml${ml})`); } o.push(`${e.className.split(' ')[0] || e.tagName} left=${Math.round(e.getBoundingClientRect().left - cl)}  via ${chain.join(' < ')}`); }
    return o.join('\n');
  }));
  await ctx.close();
}
await b.close();
