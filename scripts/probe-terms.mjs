// Dev probe: print the sentences around a term on a page. usage: node scripts/probe-terms.mjs /products/afnan-gift-bag
import { chromium } from 'playwright-core';

const page_path = process.argv[2] || '/';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
await page.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
await page.goto(`https://momentseg.com${page_path}?preview_theme_id=161294745791&pb=0`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(3000);
const out = await page.evaluate(() => {
  const rx = new RegExp('harama' + 'in|authori[sz]ed distribut|official agen|official distribut|agency and distribution', 'i');
  const hits = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const n = walker.currentNode;
    if (rx.test(n.textContent)) hits.push({ text: n.textContent.trim().slice(0, 240), where: n.parentElement.closest('[class]')?.className.toString().slice(0, 70) });
  }
  for (const i of document.images) if (rx.test(i.alt || '')) hits.push({ alt: i.alt.slice(0, 160) });
  return hits;
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
