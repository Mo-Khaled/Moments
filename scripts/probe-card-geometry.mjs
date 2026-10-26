import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome', headless: true });
for (const [w, path] of [[375, '/'], [1440, '/'], [375, '/collections/all']]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
  await ctx.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
  const p = await ctx.newPage();
  await p.goto(`https://momentseg.com${path}?pb=0`, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3500);
  const res = await p.evaluate(() => {
    const c = [...document.querySelectorAll('product-card')].find((e) => e.getBoundingClientRect().width > 100);
    c.scrollIntoView({ block: 'center', behavior: 'instant' });
    const R = (e) => { const r = e.getBoundingClientRect(); return `x${Math.round(r.left)} y${Math.round(r.top)} w${Math.round(r.width)} h${Math.round(r.height)} (r${Math.round(r.right)} b${Math.round(r.bottom)})`; };
    const o = [`card ${R(c)} border=${getComputedStyle(c).border.slice(0, 40)} radius=${getComputedStyle(c).borderRadius} overflow=${getComputedStyle(c).overflow}`];
    const walk = (el, d) => { for (const ch of el.children) { if (['SCRIPT', 'STYLE'].includes(ch.tagName)) continue; const r = ch.getBoundingClientRect(); if (r.width < 1 && r.height < 1) { continue; } o.push('  '.repeat(d) + ch.tagName.toLowerCase() + '.' + String(ch.className).split(' ').filter(Boolean).slice(0, 3).join('.') + ' ' + R(ch) + ' pos=' + getComputedStyle(ch).position); if (d < 4) walk(ch, d + 1); } };
    walk(c, 1);
    return o.slice(0, 48).join('\n');
  });
  console.log(`=== ${path} at ${w}\n${res}\n`);
  await ctx.close();
}
await b.close();
