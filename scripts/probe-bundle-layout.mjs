import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
for (const w of [1440, 375]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  await ctx.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
  const page = await ctx.newPage();
  await page.goto('https://momentseg.com/pages/make-a-bundle?pb=0', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4500);
  await page.fill('input[type=search], input[placeholder*=earch]', 'afnan').catch(() => {});
  await page.waitForTimeout(3500);
  const rows = await page.evaluate(() => [...document.querySelectorAll('.m-bundle__grid > li')].slice(0, 8).map((li) => {
    const r = li.getBoundingClientRect(), b = li.querySelector('.m-add')?.getBoundingClientRect(), c = li.querySelector('product-card')?.getBoundingClientRect();
    const txt = [...li.querySelectorAll('product-card [class*=text], product-card a, product-card product-price')].map((e) => e.textContent.trim().replace(/\s+/g, ' ')).filter(Boolean);
    return { top: Math.round(r.top + scrollY), h: Math.round(r.height), cardH: c && Math.round(c.height), btnTop: b && Math.round(b.top + scrollY), text: [...new Set(txt)].slice(0, 6).join(' / ').slice(0, 110) };
  }));
  console.log(w, JSON.stringify(rows, null, 0).replace(/\},\{/g, '},\n{'));
  await ctx.close();
}
await browser.close();
