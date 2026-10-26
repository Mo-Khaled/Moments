// Dev probe: computed colours and box of the product card text on the bundle page. usage: node scripts/probe-bundle-card.mjs [path] [tag]
import { chromium } from 'playwright-core';
const path = process.argv[2] || '/pages/make-a-bundle', tag = process.argv[3] || 'probe';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
for (const [w, h] of [[1440, 900], [375, 800]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
  const page = await ctx.newPage();
  await page.goto(`https://momentseg.com${path}?pb=0`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  const card = page.locator('product-card').first();
  await card.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  if (w === 1440) {
    const info = await card.evaluate((c) => {
      const chain = []; for (let e = c; e && e !== document.documentElement; e = e.parentElement) { const s = getComputedStyle(e); chain.push(`${e.tagName.toLowerCase()}.${String(e.className).split(' ').slice(0, 3).join('.')} bg=${s.backgroundColor} color=${s.color} img=${s.backgroundImage.slice(0, 40)}`); }
      const q = (sel) => [...c.querySelectorAll(sel)].slice(0, 4).map((e) => { const s = getComputedStyle(e); const r = e.getBoundingClientRect(); return `${sel} "${e.textContent.trim().slice(0, 30)}" color=${s.color} bg=${s.backgroundColor} h=${Math.round(r.height)}`; });
      return { classes: c.className, attrs: [...c.attributes].map((a) => a.name + '=' + a.value.slice(0, 40)).join(' '), scheme: c.closest('[class*=color-]')?.className, h: Math.round(c.getBoundingClientRect().height), vars: ['--color-background', '--color-foreground', '--m-card-backdrop'].map((v) => v + ':' + getComputedStyle(c).getPropertyValue(v)).join(' | '), chain: chain.slice(0, 9), text: [...q('[class*=title], h3, h4, a'), ...q('[class*=vendor], [class*=brand]'), ...q('.price, [class*=price]'), ...q('button')], html: c.outerHTML.replace(/\s+/g, ' ').slice(0, 1800) };
    });
    console.log(JSON.stringify(info, null, 1));
  }
  await page.screenshot({ path: `docs/screenshots/bundle/${tag}-${w}.png` });
  await ctx.close();
}
await browser.close();
