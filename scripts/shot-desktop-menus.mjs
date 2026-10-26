import { chromium } from 'playwright-core';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
const p = await ctx.newPage();
await p.goto('https://momentseg.com/?pb=0', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(3500);
for (const [name, text] of [['moments', 'Shop by Moment'], ['brands', 'Brands']]) {
  await p.locator(`header-menu >> text="${text}"`).first().hover().catch(() => {}); await p.waitForTimeout(900);
  await p.screenshot({ path: `docs/screenshots/cards/menu-${name}.png`, clip: { x: 0, y: 0, width: 1440, height: 620 } });
  await p.mouse.move(700, 800); await p.waitForTimeout(500);
}
await p.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })); await p.waitForTimeout(1500);
await p.screenshot({ path: 'docs/screenshots/cards/footer-bottom.png' });
await b.close();
