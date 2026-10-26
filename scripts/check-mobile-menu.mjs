// Mobile menu sheet checks. usage: node scripts/check-mobile-menu.mjs [--theme 161340850367] [--quick] [--engines chromium,webkit] [--shots tag]
// Without --theme it tests the live storefront; with --theme it uses ?preview_theme_id=<id> (a staging theme) so nothing is exposed.
import { chromium, webkit, devices } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const THEME = arg('theme', '');
const QUICK = process.argv.includes('--quick');
const SHOTS = arg('shots', '');
const ENGINES = arg('engines', QUICK ? 'chromium' : 'chromium,webkit').split(',');
const WIDTHS = arg('widths', QUICK ? '375' : '320,360,375,390,412,700').split(',').map(Number);
const DIRS = QUICK ? ['ltr'] : ['ltr', 'rtl'];
const URL_ = `https://momentseg.com/?pb=0${THEME ? '&preview_theme_id=' + THEME : ''}`;
mkdirSync('docs/screenshots/mobile-menu', { recursive: true });
const LAUNCH = { chromium: () => chromium.launch({ channel: 'chrome', headless: true }), webkit: () => webkit.launch({ headless: true }) };

let bad = 0;
const fails = [];
for (const eng of ENGINES) {
  const browser = await LAUNCH[eng]();
  for (const w of WIDTHS) for (const dir of DIRS) {
    const problems = [];
    const ctx = await browser.newContext(w <= 430 ? { ...devices['iPhone 13'], viewport: { width: w, height: 760 } } : { viewport: { width: w, height: 1000 }, hasTouch: true });
    await ctx.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => { if (!/Failed to fetch|importScripts|NetworkError/.test(String(e))) errors.push(String(e).slice(0, 100)); });
    try {
      await page.goto(URL_, { waitUntil: 'domcontentloaded', timeout: 90000 });
      if (dir === 'rtl') { await page.evaluate(() => { document.documentElement.dir = 'rtl'; document.documentElement.lang = 'ar'; }); await page.addStyleTag({ content: "html[dir='rtl'] .skip-to-content-link:not(:focus){left:auto;right:-99999px}" }); }
      await page.waitForTimeout(2500);
      await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'instant' }));
      const y0 = await page.evaluate(() => scrollY);
      if (SHOTS && eng === 'chromium' && w === 375) await page.screenshot({ path: `docs/screenshots/mobile-menu/${SHOTS}-closed-${dir}.png` });
      const opener = page.locator('header-drawer summary').first();
      if (!(await opener.isVisible())) { problems.push('menu button not visible'); throw new Error('no opener'); }
      await opener.click();
      await page.waitForFunction(() => document.querySelector('header-drawer details.menu-open'), null, { timeout: 5000 });
      await page.waitForTimeout(900);
      const m = await page.evaluate(() => {
        const sheet = document.querySelector('.menu-drawer--moments');
        if (!sheet) return { missing: true };
        const R = (e) => e.getBoundingClientRect();
        const s = R(sheet);
        const close = R(sheet.querySelector('.mm__close'));
        const tiles = [...sheet.querySelectorAll('.mm-tile')].map((t) => { const r = R(t); const mm = t.querySelector('moment-mark'); const sv = mm && mm.querySelector('svg'); const mr = sv ? R(sv) : R(t.querySelector('.mm-tile__mark')); const mk = mr; return { w: r.width, h: r.height, mark: mk.width, markInside: mr.left >= r.left - 0.5 && mr.right <= r.right + 0.5 && mr.top >= r.top - 0.5 && mr.bottom <= r.bottom + 0.5, label: t.querySelector('.mm-tile__name').textContent.trim() }; });
        const bar = R(sheet.querySelector('.mm__bar'));
        const doc = document.documentElement;
        const sc = sheet.querySelector('[data-mm-scroll]');
        const cs = getComputedStyle(document.body), hs = getComputedStyle(doc);
        return {
          sheet: { l: s.left, r: s.right, t: s.top, b: s.bottom, w: s.width, h: s.height }, vw: innerWidth, vh: innerHeight, close: [close.width, close.height],
          tiles, bar: { t: bar.top, b: bar.bottom }, overflowX: doc.scrollWidth > doc.clientWidth + 1, sheetOverflowX: sheet.scrollWidth > sheet.clientWidth + 1,
          lock: { bodyOverflow: cs.overflow, htmlOverflow: hs.overflow, bodyPos: cs.position }, scroller: { sh: sc.scrollHeight, ch: sc.clientHeight },
          links: [...sheet.querySelectorAll('.mm-link, .mm__util')].map((a) => ({ t: a.textContent.trim().replace(/\s+/g, ' ').slice(0, 20), h: R(a).height, w: R(a).width })),
          cartHref: sheet.querySelector('a[href*="cart"]')?.getAttribute('href'), accountHref: sheet.querySelector('.mm__util[href*="account"]')?.getAttribute('href'),
          tileCount: tiles.length, hasAbout: !!sheet.querySelector('[data-mm-acc]'),
        };
      });
      if (m.missing) { problems.push('new sheet not rendered'); throw new Error('missing'); }
      if (w <= 599 && (Math.abs(m.sheet.w - m.vw) > 1 || m.sheet.l > 1)) problems.push(`sheet is ${m.sheet.w.toFixed(0)}px wide on a ${m.vw}px screen (a strip shows beside it)`);
      if (w > 599 && m.sheet.w > 421) problems.push(`sheet ${m.sheet.w.toFixed(0)}px wide on tablet (max 420)`);
      if (Math.abs(m.sheet.h - m.vh) > 1 || m.sheet.t > 1) problems.push(`sheet height ${m.sheet.h.toFixed(0)} vs viewport ${m.vh}`);
      if (m.close[0] < 43.5 || m.close[1] < 43.5) problems.push(`close button ${m.close[0]}x${m.close[1]}`);
      if (m.overflowX || m.sheetOverflowX) problems.push('horizontal overflow');
      if (m.tileCount !== 6) problems.push(`${m.tileCount} tiles, expected 6`);
      const t0 = m.tiles[0];
      for (const t of m.tiles) {
        if (Math.abs(t.w - t0.w) > 1 || Math.abs(t.h - t0.h) > 1) problems.push(`tile "${t.label}" is ${t.w.toFixed(0)}x${t.h.toFixed(0)}, others ${t0.w.toFixed(0)}x${t0.h.toFixed(0)}`);
        if (t.mark < t.w * 0.4 - 0.5) problems.push(`mark in "${t.label}" is ${(t.mark / t.w * 100).toFixed(0)}% of the tile (needs 40%)`);
        if (!t.markInside) problems.push(`mark in "${t.label}" is cropped by its tile`);
      }
      for (const l of m.links) if (l.h < 43.5) problems.push(`target "${l.t}" is ${l.h.toFixed(0)}px tall`);
      if (m.bar.b > m.vh + 1 || m.bar.t < 0) problems.push(`bottom bar not visible (${m.bar.t.toFixed(0)}-${m.bar.b.toFixed(0)} of ${m.vh})`);
      if (!/cart/.test(m.cartHref || '') || !/account/.test(m.accountHref || '')) problems.push(`cart/account links: ${m.cartHref} ${m.accountHref}`);
      if (!(m.lock.bodyOverflow === 'hidden' || m.lock.htmlOverflow === 'hidden' || m.lock.bodyPos === 'fixed')) problems.push(`page scroll not locked (${JSON.stringify(m.lock)})`);
      // contrast of the sheet text against its background (tiles use their gradient's worst stop)
      const con = await page.evaluate(() => {
        const cv = document.createElement('canvas'); cv.width = cv.height = 1; const g = cv.getContext('2d', { willReadFrequently: true });
        const px = (c) => { g.clearRect(0, 0, 1, 1); g.fillStyle = '#000'; g.fillStyle = c; g.fillRect(0, 0, 1, 1); const d = g.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2]]; };
        const L = (c) => { const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
        const cr = (a, b) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
        const out = [];
        for (const e of document.querySelectorAll('.menu-drawer--moments .mm-tile__name, .menu-drawer--moments .mm-tile__count, .menu-drawer--moments .mm-link, .menu-drawer--moments .mm__ship, .menu-drawer--moments .mm__util, .menu-drawer--moments .mm__title, .menu-drawer--moments .mm__search span')) {
          const fg = px(getComputedStyle(e).color); const tile = e.closest('.mm-tile');
          let bgs;
          if (tile) bgs = [...getComputedStyle(tile).backgroundImage.matchAll(/(?:rgb|color|oklab)[^)]*\)/g)].map((x) => px(x[0]));
          else { let bg = [250, 246, 242]; for (let x = e; x; x = x.parentElement) { const c = getComputedStyle(x).backgroundColor; if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) { bg = px(c); break; } } bgs = [bg]; }
          const worst = Math.min(...bgs.map((b) => cr(fg, b)));
          const fs = parseFloat(getComputedStyle(e).fontSize);
          if (worst < (fs >= 24 ? 3 : 4.5)) out.push(`${worst.toFixed(2)}:1 "${e.textContent.trim().slice(0, 16)}"`);
        }
        return out;
      });
      con.forEach((c) => problems.push('contrast ' + c));
      if (SHOTS && eng === 'chromium' && w === 375) await page.screenshot({ path: `docs/screenshots/mobile-menu/${SHOTS}-open-${dir}.png` });
      // About: reachable and expandable, never clipped under the bottom bar
      if (m.hasAbout) {
        const acc = page.locator('.menu-drawer--moments [data-mm-acc]');
        await acc.scrollIntoViewIfNeeded();
        const vis = await acc.evaluate((e) => { const r = e.getBoundingClientRect(); const bar = document.querySelector('.menu-drawer--moments .mm__bar').getBoundingClientRect(); return r.bottom <= bar.top + 1 && r.top >= 0; });
        if (!vis) problems.push('About row is hidden under the bottom bar or off screen');
        await acc.click(); await page.waitForTimeout(2000);
        const subs = await page.evaluate(() => { const bar = document.querySelector('.menu-drawer--moments .mm__bar').getBoundingClientRect(); const sc = document.querySelector('.menu-drawer--moments [data-mm-scroll]').getBoundingClientRect(); return [...document.querySelectorAll('.menu-drawer--moments .mm-sublink')].map((a) => { const r = a.getBoundingClientRect(); return { t: a.textContent.trim(), h: r.height, ok: r.height > 40 && r.bottom <= bar.top + 1 && r.top >= sc.top - 1 }; }); });
        if (subs.length < 1) problems.push('About opened with no links'); else for (const s of subs) { if (!s.ok) problems.push(`About link "${s.t}" is clipped or unreachable (h ${s.h.toFixed(0)})`); }
        if (SHOTS && eng === 'chromium' && w === 375) await page.screenshot({ path: `docs/screenshots/mobile-menu/${SHOTS}-about-${dir}.png` });
      }
      // focus trap: Tab many times, focus must stay inside the sheet
      let escaped = false;
      for (let i = 0; i < 40; i++) { await page.keyboard.press('Tab'); const inside = await page.evaluate(() => !!document.activeElement && !!document.activeElement.closest('.menu-drawer--moments, summary')); if (!inside) { escaped = true; break; } }
      if (escaped) problems.push('keyboard focus left the sheet');
      // Escape closes and focus returns to the menu button
      await page.keyboard.press('Escape'); await page.waitForTimeout(700);
      const closed = await page.evaluate(() => !document.querySelector('header-drawer details.menu-open'));
      if (!closed) problems.push('Escape did not close the sheet');
      const back = await page.evaluate(() => !!document.activeElement && !!document.activeElement.closest('header-drawer summary, header-drawer'));
      if (closed && !back) problems.push('focus did not return to the menu button');
      const y1 = await page.evaluate(() => scrollY);
      if (Math.abs(y1 - y0) > 2) problems.push(`page jumped on open/close (${y0} -> ${y1})`);
      const inertLeft = await page.evaluate(() => !!document.querySelector('#MainContent[inert]'));
      if (inertLeft) problems.push('page behind stayed inert after closing');
      // search hand-off
      await opener.click(); await page.waitForTimeout(800);
      await page.locator('.menu-drawer--moments [data-mm-search]').click(); await page.waitForTimeout(1200);
      const search = await page.evaluate(() => !!document.querySelector('#search-modal dialog[open]'));
      if (!search) problems.push('search did not open from the menu');
      if (errors.length) problems.push('console: ' + errors.join(' | '));
    } catch (e) { if (!problems.length) problems.push(String(e).split('\n')[0].slice(0, 100)); }
    // reduced motion: transitions off
    if (w === 375 && dir === 'ltr' && problems.length === 0) {
      const rctx = await browser.newContext({ ...devices['iPhone 13'], reducedMotion: 'reduce' });
      const rp = await rctx.newPage(); await rp.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
      await rp.goto(URL_, { waitUntil: 'domcontentloaded', timeout: 90000 }); await rp.waitForTimeout(2000);
      await rp.locator('header-drawer summary').first().click(); await rp.waitForTimeout(500);
      const rm = await rp.evaluate(() => { const s = document.querySelector('.menu-drawer--moments'); const r = document.querySelector('.menu-drawer--moments .mm-reveal'); return { dur: getComputedStyle(s).transitionDuration, op: getComputedStyle(r).opacity }; });
      if (!/^0s(, 0s)*$/.test(rm.dur)) problems.push(`reduced motion: sheet still transitions (${rm.dur})`);
      if (Number(rm.op) < 1) problems.push('reduced motion: items not visible');
      await rctx.close();
    }
    await ctx.close();
    const status = problems.length ? 'FAIL' : 'ok';
    if (problems.length) { bad++; fails.push(`${eng} ${w} ${dir}: ${problems.join('; ')}`); }
    console.log(`${status.padEnd(4)} ${eng.padEnd(8)} ${String(w).padEnd(4)} ${dir}  ${problems.slice(0, 3).join(' | ').slice(0, 170)}`);
  }
  await browser.close();
}
console.log(bad ? `MOBILE MENU FAILED (${bad})` : 'MOBILE MENU OK');
process.exit(bad ? 1 : 0);
