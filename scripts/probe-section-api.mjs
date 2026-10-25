// Dev probe: what does the Section Rendering API return for a collection grid? usage: node scripts/probe-section-api.mjs <path> <sectionKey> [page]
import { chromium } from 'playwright-core';

const [p, key, pageNo = '1'] = process.argv.slice(2);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
await page.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
await page.goto('https://momentseg.com/?preview_theme_id=161294745791&pb=0', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(2500);
const out = await page.evaluate(async ({ p, key, pageNo }) => {
  const res = await fetch(`${p}${p.includes("?") ? "&" : "?"}page=${pageNo}&section_id=${key}&preview_theme_id=161294745791`);
  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const cards = [...doc.querySelectorAll('product-card')];
  return { status: res.status, len: html.length, cards: cards.length, first: cards[0] ? cards[0].outerHTML.slice(0, 600) : null, items: [...doc.querySelectorAll('li')].filter((l) => l.querySelector('product-card')).length, next: [...doc.querySelectorAll('a')].filter((a) => /page=\d/.test(a.getAttribute('href') || '')).map((a) => a.getAttribute('href')).slice(0, 4), soldOut: [...doc.querySelectorAll('product-card')].filter((c) => /sold out/i.test(c.textContent)).length };
}, { p, key, pageNo });
console.log(JSON.stringify(out, null, 1));
await browser.close();
