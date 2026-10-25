// Dev probe: print what shifts during load at a given width (default 768). usage: node scripts/probe-cls.mjs [width]
import { chromium } from 'playwright-core';

const width = Number(process.argv[2] || 768);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ viewport: { width, height: 900 } });
const page = await context.newPage();
await page.addInitScript(() => {
  window.__shifts = [];
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      if (e.hadRecentInput) continue;
      window.__shifts.push({ value: e.value, t: Math.round(e.startTime), sources: e.sources.map((s) => (s.node ? s.node.nodeName.toLowerCase() + '.' + String(s.node.className).slice(0, 40) : '?') + ' ' + JSON.stringify([s.previousRect.y, s.previousRect.height, s.currentRect.y, s.currentRect.height].map(Math.round))) });
    }
  }).observe({ type: 'layout-shift', buffered: true });
});
await page.route(/kaspersky-labs|shopifysvc|monorail/, (route) => route.abort());
await page.goto(`https://momentseg.com/?preview_theme_id=161294745791&pb=0`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(6000);
console.log(JSON.stringify(await page.evaluate(() => window.__shifts), null, 1));
await browser.close();
