// Builds the pointer PNGs from the committed SVG sources (assets/cursor-*.svg): 32x32 (1x) and 64x64 (2x), transparent background.
// Hotspots (1x pixels): arrow tip (8, 3), hand fingertip (18, 3) (see snippets/moment-pointer.liquid). usage: node scripts/build-cursors.mjs
import { chromium } from 'playwright-core';
import { readFileSync } from 'node:fs';

const NAMES = ['cursor-default', 'cursor-link'];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
for (const [size, suffix] of [[32, ''], [64, '-2x']]) {
  for (const n of NAMES) {
    const ctx = await browser.newContext({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const svg = readFileSync(`assets/${n}.svg`, 'utf8').replace('width="32" height="32"', `width="${size}" height="${size}"`);
    await page.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
    await page.screenshot({ path: `assets/${n}${suffix}.png`, omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
    console.log(`assets/${n}${suffix}.png ${size}x${size}`);
    await ctx.close();
  }
}
await browser.close();
