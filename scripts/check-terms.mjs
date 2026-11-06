// Fail if text that must not reach shoppers appears on the storefront (dev theme preview). Dev tool, not part of the theme.
// Looks at what a shopper sees (rendered text) and at image alt text: other-shop names, TODO placeholders, unconfirmed distributor
// claims, awards and ratings. usage: node scripts/check-terms.mjs
import { chromium } from 'playwright-core';

const BASE = 'https://momentseg.com';
const THEME = '161651720383';
const PAGES = ['/', '/collections/gift-moment', '/collections/gift-bags', '/products/afnan-gift-bag', '/products/9-pm-night-out', '/pages/about-us?view=about', '/pages/about-us',
  '/pages/brands', '/pages/moments', '/collections/all', '/cart', '/search?q=gift', '/pages/contact', '/pages/returns-exchange-policy'];
const TERMS = [
  ['other-shop name', new RegExp('harama' + 'in', 'i')],
  ['TODO text', /\bTODO/i],
  ['distributor claim', /authori[sz]ed distribut|official agen|official distribut|agency and distribution/i],
  ['award or rating claim', /award[- ]winning|\b5[- ]star|rated \d/i],
];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await context.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
let bad = 0;
for (const p of PAGES) {
  const page = await context.newPage();
  const url = `${BASE}${p}${p.includes('?') ? '&' : '?'}preview_theme_id=${THEME}&pb=0`;
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3000);
    const text = await page.evaluate(() => document.body.innerText + ' ' + [...document.images].map((i) => i.alt).join(' '));
    const hits = TERMS.filter(([, rx]) => rx.test(text)).map(([n]) => n);
    const note = hits.length ? `FOUND: ${hits.join(', ')}` : 'ok';
    if (hits.length) bad++;
    console.log(p.padEnd(40), note, '(' + text.length + ' chars)');
  } catch (e) {
    console.log(p.padEnd(40), 'COULD NOT LOAD', e.message.slice(0, 60));
    bad++;
  }
  await page.close();
}
await browser.close();
process.exit(bad ? 1 : 0);
