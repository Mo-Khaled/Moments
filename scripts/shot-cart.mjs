// Cart page screenshots: empty, and with items. usage: node scripts/shot-cart.mjs <tag> [--theme id] [--view name]
import { chromium, devices } from 'playwright-core';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const TAG = process.argv[2] || 'cart'; const THEME = arg('theme', ''); const VIEW = arg('view', '');
const q = `pb=0${THEME ? '&preview_theme_id=' + THEME : ''}${VIEW ? '&view=' + VIEW : ''}`;
const b = await chromium.launch({ channel: 'chrome', headless: true });
for (const [name, opts] of [['d', { viewport: { width: 1440, height: 900 } }], ['m', { ...devices['iPhone 13'] }]]) {
  const ctx = await b.newContext(opts); await ctx.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
  const p = await ctx.newPage();
  await p.goto(`https://momentseg.com/cart?${q}`, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(3500);
  await p.addStyleTag({ content: 'moment-cursor{display:none!important}' });
  await p.screenshot({ path: `docs/screenshots/cart/${TAG}-empty-${name}.png`, fullPage: name === 'd' });
  const items = [];
  for (const h of ['khadlaj-25-experience', '9-pm-night-out', 'supremacy-collectors-edition']) { try { const j = await (await ctx.request.get(`https://momentseg.com/products/${h}.js`)).json(); items.push({ id: j.variants[0].id, quantity: 1 }); } catch (e) { /* skip */ } }
  if (items.length) await ctx.request.post('https://momentseg.com/cart/add.js', { data: { items } });
  await p.goto(`https://momentseg.com/cart?${q}`, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(3500);
  await p.addStyleTag({ content: 'moment-cursor{display:none!important}' });
  await p.screenshot({ path: `docs/screenshots/cart/${TAG}-items-${name}.png`, fullPage: name === 'd' });
  await ctx.close();
}
await b.close();
