// Screenshot one section of the home page. usage: node scripts/shot-section.mjs <selector> <out.png> [--theme id] [--width 1440] [--mobile]
import { chromium, devices } from 'playwright-core';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const [sel, out] = [process.argv[2], process.argv[3]];
const THEME = arg('theme', ''); const W = Number(arg('width', 1440)); const mobile = process.argv.includes('--mobile');
const b = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await b.newContext(mobile ? { ...devices['iPhone 13'] } : { viewport: { width: W, height: 900 } });
await ctx.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
const p = await ctx.newPage();
await p.goto(`https://momentseg.com/?pb=0${THEME ? '&preview_theme_id=' + THEME : ''}`, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(3500);
const el = p.locator(sel).first(); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(900);
await p.addStyleTag({ content: '#header-group,header-component{position:static!important}' });
await el.screenshot({ path: out });
await b.close();
