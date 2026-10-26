import { chromium, devices } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await b.newContext({ ...devices['iPhone 13'] });
await ctx.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
const p = await ctx.newPage();
await p.goto('https://momentseg.com/?pb=0', { waitUntil: 'domcontentloaded', timeout: 90000 });
await p.waitForTimeout(4000);
console.log(await p.evaluate(() => {
  const c = [...document.querySelectorAll('product-card')].find((e) => e.getBoundingClientRect().width > 100);
  c.scrollIntoView({ block: 'center', behavior: 'instant' });
  const R = (e) => { const r = e.getBoundingClientRect(); return `x${Math.round(r.left)} y${Math.round(r.top)} w${Math.round(r.width)} h${Math.round(r.height)} r${Math.round(r.right)}`; };
  const o = ['card ' + R(c), 'gallery ' + R(c.querySelector('.card-gallery'))];
  for (const el of c.querySelectorAll('button, quick-add-component, .quick-add__button, [class*=quick-add], .product-badges__badge, img, .card-gallery > *')) { const s = getComputedStyle(el); o.push(el.tagName.toLowerCase() + '.' + String(el.className).split(' ').filter(Boolean).slice(0, 3).join('.') + ' ' + R(el) + ' pos=' + s.position + ' disp=' + s.display + (el.tagName === 'BUTTON' ? ' inset=' + s.insetBlockEnd + '/' + s.insetInlineEnd : '')); }
  const t = [...c.querySelectorAll('*')].filter((e) => !e.children.length && e.textContent.trim().length > 2).map((e) => e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0] + ' "' + e.textContent.trim().slice(0, 18) + '" ' + R(e));
  return o.concat(['--- text']).concat(t).join('\n');
}));
await b.close();
