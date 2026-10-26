import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const colour = async (page) => page.locator('product-card').first().evaluate((c) => { const t = c.querySelector('.product-card__content'); const out = []; for (const e of [c, t, ...c.querySelectorAll('[class*=text], [class*=title], [class*=vendor], [class*=price]')].slice(0, 8)) { const s = getComputedStyle(e); out.push(`${e.tagName.toLowerCase()}.${String(e.className).split(' ')[0]} bg=${s.backgroundColor} color=${s.color}`); } return out.join('\n'); });
for (const [name, opts] of [['dark scheme', { colorScheme: 'dark' }], ['light', {}], ['reduced contrast', { contrast: 'more' }], ['forced colors', { forcedColors: 'active' }]]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  await ctx.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
  const page = await ctx.newPage();
  await page.goto('https://momentseg.com/pages/make-a-bundle?pb=0', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4500);
  const card = page.locator('product-card').first(); await card.scrollIntoViewIfNeeded();
  console.log('==', name); console.log(await colour(page));
  if (name === 'light') {
    await card.hover(); await page.waitForTimeout(700); console.log('-- hover'); console.log(await colour(page));
    await page.locator('.m-add').first().click(); await page.waitForTimeout(900); console.log('-- after add'); console.log(await colour(page));
    await page.screenshot({ path: 'docs/screenshots/bundle/probe-after-add.png' });
  }
  await ctx.close();
}
await browser.close();
