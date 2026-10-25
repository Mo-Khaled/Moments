// Final screenshot set for review: header, both panels open, the phone drawer, and the About page, at 1920, 1440 and 375, LTR and RTL.
// Output: docs/screenshots/final/. Dev tool, not part of the theme. RTL is emulated (dir and lang on <html> plus the rtl.css skip-link rule).
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'docs', 'screenshots', 'final');
fs.mkdirSync(OUT, { recursive: true });
const THEME = '161294745791';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const rtlFix = "html[dir='rtl'] .skip-to-content-link:not(:focus){left:auto;right:-99999px}";

for (const width of [1920, 1440, 375]) {
  for (const dir of ['ltr', 'rtl']) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    await context.addInitScript(() => { window.__MOMENTS_HOUR__ = 21; try { sessionStorage.clear(); } catch (e) { /* ignore */ } });
    await context.route(/kaspersky-labs|shopifysvc|monorail|\.mp4|\.webm/, (r) => r.abort());
    const open = async (p) => {
      const page = await context.newPage();
      await page.goto(`https://momentseg.com${p}${p.includes('?') ? '&' : '?'}preview_theme_id=${THEME}&pb=0`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(3000);
      if (dir === 'rtl') { await page.evaluate(() => { document.documentElement.dir = 'rtl'; document.documentElement.lang = 'ar'; }); await page.addStyleTag({ content: rtlFix }); await page.waitForTimeout(600); }
      return page;
    };
    // header, then each panel open (desktop), or the drawer (phone)
    let page = await open('/');
    await page.screenshot({ path: path.join(OUT, `header-${width}-${dir}.png`), clip: { x: 0, y: 0, width, height: Math.min(900, 900) } });
    if (width >= 750) {
      for (const [label, name] of [['shop by moment', 'panel-moments'], ['brands', 'panel-brands']]) {
        const pt = await page.evaluate((n) => { const a = [...document.querySelectorAll('header-menu li > a.menu-list__link')].find((x) => x.textContent.trim().toLowerCase() === n && x.getBoundingClientRect().width > 0); if (!a) return null; const b = a.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }, label);
        if (!pt) continue;
        await page.mouse.move(pt.x, pt.y);
        await page.waitForTimeout(1200);
        await page.screenshot({ path: path.join(OUT, `${name}-${width}-${dir}.png`), clip: { x: 0, y: 0, width, height: 700 } });
        await page.mouse.move(width / 2, 880);
        await page.waitForTimeout(700);
      }
    } else {
      const burger = await page.$('summary.header__icon--menu, .header__icon--summary');
      if (burger) { await burger.click().catch(() => {}); await page.waitForTimeout(1200); await page.screenshot({ path: path.join(OUT, `drawer-${width}-${dir}.png`), clip: { x: 0, y: 0, width, height: 900 } }); }
    }
    await page.close();
    // About page (full length)
    page = await open('/pages/about-us?view=about');
    await page.evaluate(async () => { const h = document.documentElement.scrollHeight; for (let y = 0; y < h; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)); } scrollTo(0, 0); });
    await page.waitForTimeout(800);
    const h = await page.evaluate(() => Math.min(document.documentElement.scrollHeight, 6000));
    await page.screenshot({ path: path.join(OUT, `about-${width}-${dir}.png`), fullPage: true, clip: { x: 0, y: 0, width, height: h } });
    await page.close();
    await context.close();
    console.log('done', width, dir);
  }
}
await browser.close();
