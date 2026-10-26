import { chromium, devices } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome', headless: true });
for (const [name, opts] of [['d', { viewport: { width: 1440, height: 900 } }], ['m', { ...devices['iPhone 13'] }]]) {
  const ctx = await b.newContext(opts); await ctx.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
  const p = await ctx.newPage();
  await p.goto('https://momentseg.com/collections/all?page=3&pb=0', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(3500);
  const el = p.locator('nav.pagination'); await el.scrollIntoViewIfNeeded(); await p.addStyleTag({ content: 'moment-cursor{display:none!important}' });
  const r = await el.boundingBox(); console.log(name, JSON.stringify(r), await p.evaluate(() => [...document.querySelectorAll('.pagination__link')].map((a) => Math.round(a.getBoundingClientRect().width) + 'x' + Math.round(a.getBoundingClientRect().height)).join(' ')));
  await p.screenshot({ path: `docs/screenshots/cards/pagination-${name}.png`, clip: { x: 0, y: Math.max(0, r.y - 20), width: opts.viewport ? 1440 : 390, height: 130 } });
  await ctx.close();
}
await b.close();
