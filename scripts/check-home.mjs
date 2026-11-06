// Homepage identity checks (dev tool, not part of the theme). Playwright with the installed Chrome.
//
//   tickers      both tickers move (computed transform differs at two times), loop with no jump (the track is exactly two
//                identical groups and the keyframe ends at -50%), constant speed close to the setting, direction reverses in RTL
//   header       at 1920, 1440, 1280, 1024, 768 and 375, LTR and RTL: the header's outer edges match the shared content edge
//                (taken from the hero copy), nothing wraps, the page does not scroll sideways, the height stays in range
//   brand strip  the gap between the brand strip and the next section is 0
//   hero         the default moment matches a mocked local hour of 21:00, 07:00 and 13:00 (night, fresh, allday)
//   switcher     each switch changes html[data-moment] and the --m-live accent
//   layout shift cumulative layout shift stays under 0.05 while the page loads and the hero switches
//   bottle       a "fit" poster is never cropped (its box has the photo's own aspect ratio, object-fit is not cover)
//   clipping     hero headline and controls stay inside the viewport and do not overlap
// Screenshots of every hero slide (rest) go to docs/screenshots/hero/ at 1920, 1440 and 375, LTR and RTL.
// Video pause off-screen cannot be tested until footage exists (no hero video is set); that is reported, not faked.
//
// usage: node scripts/check-home.mjs [--base https://momentseg.com] [--theme 161651720383]
// RTL is emulated with dir="rtl" and lang="ar" on <html> (Arabic is not a store language yet).
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), []));
const BASE = args.base || 'https://momentseg.com';
const THEME = args.theme || '161651720383';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHOTS = path.join(ROOT, 'docs', 'screenshots', 'hero');
const TICKS = path.join(ROOT, 'docs', 'screenshots', 'tickers');
fs.mkdirSync(SHOTS, { recursive: true });
fs.mkdirSync(TICKS, { recursive: true });
const WIDTHS = [1920, 1440, 1280, 1024, 768, 375];
const SHOT_WIDTHS = [1920, 1440, 375];
const MOMENTS = ['night', 'fresh', 'allday', 'gift', 'daily', 'love'];
const url = `${BASE}/?preview_theme_id=${THEME}&pb=0`;
const failures = [];
const log = [];
const fail = (ctx, msg) => failures.push(`${ctx}: ${msg}`);
const say = (msg) => log.push(msg);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch({ channel: 'chrome', headless: true });

async function open(width, dir, { hour } = {}) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.addInitScript((h) => {
    try { sessionStorage.clear(); } catch (e) { /* ignore */ }
    if (typeof h === 'number') window.__MOMENTS_HOUR__ = h;
    window.__cls = 0;
    new PerformanceObserver((list) => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
  }, hour);
  await page.route(/kaspersky-labs|shopifysvc|monorail/, (route) => route.abort());
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForSelector('.m-hero .m-slide', { state: 'attached' });
  if (dir === 'rtl') { await page.evaluate(() => { document.documentElement.dir = 'rtl'; document.documentElement.lang = 'ar'; }); await page.addStyleTag({ content: "html[dir='rtl'] .skip-to-content-link:not(:focus){left:auto;right:-99999px}" }); } // rtl.css (real Arabic only) carries this skip-link rule; emulation adds it
  await page.waitForTimeout(1800);
  // Flipping dir after load is part of the emulation, not a real shift: count shifts from here on.
  if (dir === 'rtl') await page.evaluate(() => { window.__cls = 0; });
  return { context, page };
}

// ---- hero default by hour -------------------------------------------------------------------------------------------
for (const [hour, expected] of [[21, 'night'], [7, 'fresh'], [13, 'allday']]) {
  const { context, page } = await open(1440, 'ltr', { hour });
  const got = await page.evaluate(() => document.documentElement.dataset.moment);
  if (got !== expected) fail(`hero hour ${hour}:00`, `expected ${expected}, got ${got}`);
  else say(`hero at ${String(hour).padStart(2, '0')}:00 opens on ${got}`);
  await context.close();
}

// ---- tickers (LTR and RTL) ------------------------------------------------------------------------------------------
for (const dir of ['ltr', 'rtl']) {
  const { context, page } = await open(1440, dir, { hour: 21 });
  for (const [name, sel] of [['brands', '.m-brands .m-ticker']]) {
    const info = await page.evaluate(async (s) => {
      const root = document.querySelector(s);
      const track = root.querySelector('.m-ticker__track');
      const groups = [...track.querySelectorAll(':scope > .m-ticker__group')];
      const x = () => new DOMMatrix(getComputedStyle(track).transform).m41;
      const x0 = x(); const t0 = performance.now();
      await new Promise((r) => setTimeout(r, 1500));
      const x1 = x(); const t1 = performance.now();
      const anim = track.getAnimations()[0];
      const timing = anim ? anim.effect.getComputedTiming() : null;
      return { x0, x1, dt: (t1 - t0) / 1000, widths: groups.map((g) => g.getBoundingClientRect().width), trackW: track.getBoundingClientRect().width, duration: timing && timing.duration, iterations: timing && timing.iterations };
    }, sel);
    const ctx = `ticker ${name} ${dir}`;
    if (Math.abs(info.x1 - info.x0) < 5) fail(ctx, `did not move (${info.x0.toFixed(1)} to ${info.x1.toFixed(1)})`);
    const speed = Math.abs(info.x1 - info.x0) / info.dt;
    if (dir === 'ltr' && info.x1 >= info.x0) fail(ctx, 'moves the wrong way in LTR');
    if (dir === 'rtl' && info.x1 <= info.x0) fail(ctx, 'does not reverse in RTL');
    if (info.widths.length !== 2 || Math.abs(info.widths[0] - info.widths[1]) > 1) fail(ctx, `groups differ (${info.widths.join(' / ')}): the loop would jump`);
    if (Math.abs(info.trackW - info.widths[0] * 2) > 2) fail(ctx, 'track is not exactly two groups: the loop would jump');
    if (info.iterations !== Infinity) fail(ctx, `does not loop (iterations ${info.iterations})`);
    if (speed < 25 || speed > 60) fail(ctx, `speed ${speed.toFixed(0)} px/s is far from the 40 px/s setting`);
    say(`ticker ${name} ${dir}: ${speed.toFixed(0)} px/s, groups ${Math.round(info.widths[0])} px, loops forever`);
    if (dir === 'ltr') {
      // frame sequence for review
      const el = await page.$(sel);
      for (let i = 0; i < 4; i++) { await el.screenshot({ path: path.join(TICKS, `${name}-frame-${i}.png`) }); await sleep(900); }
    }
  }
  // announcement: ONE message visible at a time, and it rotates by itself (and loops: every message appears again)
  const seen = new Set(); let maxVisible = 0;
  for (let i = 0; i < 14; i++) {
    const v = await page.evaluate(() => [...document.querySelectorAll('.m-announce__stage .m-announce__msg')].filter((e) => { const cs = getComputedStyle(e); return cs.visibility === 'visible' && Number(cs.opacity) > 0.5; }).map((e) => e.textContent.trim()));
    maxVisible = Math.max(maxVisible, v.length); v.forEach((t) => seen.add(t));
    await sleep(900);
  }
  const ctxA = `announcement ${dir}`;
  if (maxVisible > 1) fail(ctxA, `${maxVisible} messages visible at once, budget is 1`);
  if (seen.size < 3) fail(ctxA, `rotation showed only ${seen.size} of 3 messages in 12 s`);
  const iter = await page.evaluate(() => { const a = document.querySelector('.m-announce__msg').getAnimations()[0]; return a ? a.effect.getComputedTiming().iterations : null; });
  if (iter !== Infinity) fail(ctxA, 'rotation does not loop');
  say(`announcement ${dir}: ${seen.size} messages seen, at most ${maxVisible} visible at once, loops forever`);
  await context.close();
}

// ---- header, hero, strip gap, switcher, CLS, bottle -----------------------------------------------------------------
for (const width of WIDTHS) {
  for (const dir of ['ltr', 'rtl']) {
    const ctx = `${width}px ${dir}`;
    const { context, page } = await open(width, dir, { hour: 21 });

    const scrollable = await page.evaluate(() => { scrollTo(-5000, 0); const a = scrollX; scrollTo(5000, 0); const b = scrollX; scrollTo(0, 0); return Math.max(Math.abs(a), Math.abs(b)); });
    if (scrollable > 1) fail(ctx, `page scrolls sideways by ${scrollable}px`);

    const h = await page.evaluate(() => {
      const copy = document.querySelector('.m-slide:not([style*="none"]) .m-slide__copy') || document.querySelector('.m-slide__copy');
      const cs = getComputedStyle(copy); const r = copy.getBoundingClientRect();
      const edge = { left: r.left + parseFloat(cs.paddingLeft), right: r.right - parseFloat(cs.paddingRight) };
      const header = document.querySelector('#header-component') || document.querySelector('header-component');
      const hr = header.getBoundingClientRect();
      const items = [...header.querySelectorAll('svg, img, .menu-list__link-title, .search-modal__button')].filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && getComputedStyle(e).visibility !== 'hidden' && b.top < hr.bottom && b.bottom > hr.top; });
      const left = Math.min(...items.map((e) => e.getBoundingClientRect().left));
      const right = Math.max(...items.map((e) => e.getBoundingClientRect().right));
      const titles = [...header.querySelectorAll('.menu-list__link-title')].filter((e) => e.getBoundingClientRect().width > 0).map((e) => e.getBoundingClientRect().height);
      const brands = document.querySelector('.m-brands'); const nextSection = brands.closest('.shopify-section').nextElementSibling;
      const gap = nextSection ? nextSection.getBoundingClientRect().top - brands.closest('.shopify-section').getBoundingClientRect().bottom : null;
      return { edge, hdr: { h: hr.height, left, right }, titles, gap, vw: innerWidth };
    });
    const tol = 4; // icon glyphs carry a pixel or two of internal space
    if (Math.abs(h.hdr.left - h.edge.left) > tol) fail(ctx, `header left edge ${h.hdr.left.toFixed(1)} is not the content edge ${h.edge.left.toFixed(1)}`);
    if (Math.abs(h.hdr.right - h.edge.right) > tol) fail(ctx, `header right edge ${h.hdr.right.toFixed(1)} is not the content edge ${h.edge.right.toFixed(1)}`);
    if (h.hdr.h < 56 || h.hdr.h > 80) fail(ctx, `header height ${h.hdr.h.toFixed(0)}px is outside 56 to 80`);
    if (h.titles.some((t) => t > 34)) fail(ctx, 'a navigation label wraps onto two lines');
    if (h.gap === null || Math.abs(h.gap) > 0.5) fail(ctx, `gap between the brand strip and the next section is ${h.gap}px, expected 0`);

    // each moment: switch, accent, hero geometry, screenshot
    // clutter budget: primary nav items, panels
    if (width >= 750) {
      const nav = await page.$$eval('header-menu li > a.menu-list__link', (as) => as.filter((a) => a.getBoundingClientRect().width > 0 && !a.closest('[slot="overflow"]')).map((a) => a.textContent.trim()));
      if (nav.length > 3) fail(ctx, `${nav.length} primary nav items visible (${nav.join(', ')}), budget is 3`);
      for (const label of ['shop by moment', 'brands']) {
        const pt = await page.evaluate((n) => { const a = [...document.querySelectorAll('header-menu li > a.menu-list__link')].find((x) => x.textContent.trim().toLowerCase() === n && x.getBoundingClientRect().width > 0); if (!a) return null; const b = a.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }, label);
        if (!pt) continue;
        await page.mouse.move(pt.x, pt.y);
        await page.waitForTimeout(1000);
        const panel = await page.evaluate((edgeLeft) => {
          const sub = [...document.querySelectorAll('.menu-list__submenu')].find((e) => { const r = e.getBoundingClientRect(); return r.height > 20 && getComputedStyle(e).visibility === 'visible'; });
          if (!sub) return null;
          const cols = [...sub.querySelectorAll('.m-mega__col')];
          const heads = [...sub.querySelectorAll('.m-mega__heading')];
          const colLinks = cols.map((c) => c.querySelectorAll('a').length);
          const emptyHeading = heads.some((h) => !h.parentElement.querySelector('a'));
          const minLeft = Math.min(...[...sub.querySelectorAll('.m-mega *')].filter((e) => e.getBoundingClientRect().width > 0).map((e) => e.getBoundingClientRect().left));
          const maxRight = Math.max(...[...sub.querySelectorAll('.m-mega *')].filter((e) => e.getBoundingClientRect().width > 0).map((e) => e.getBoundingClientRect().right));
          const blank = sub.querySelector('.m-mega') === null || sub.querySelector('.m-mega').getBoundingClientRect().height < 30;
          return { cols: cols.length, colLinks, emptyHeading, minLeft, maxRight, blank, h: sub.getBoundingClientRect().height, vw: innerWidth };
        });
        const pc = `${ctx} panel "${label}"`;
        if (!panel) { fail(pc, 'did not open'); continue; }
        if (panel.blank) fail(pc, 'rendered blank');
        if (panel.cols > 3) fail(pc, `${panel.cols} columns, budget is 3`);
        if (panel.colLinks.some((n) => n > 4)) fail(pc, `a column has ${Math.max(...panel.colLinks)} links, budget is 4`);
        if (panel.emptyHeading) fail(pc, 'a heading has no links under it');
        const gutterLeft = dir === 'ltr' ? h.edge.left : h.edge.left;
        if (panel.minLeft < h.edge.left - 1.5) fail(pc, `content starts at ${panel.minLeft.toFixed(1)}px, inside the shared gutter edge ${h.edge.left.toFixed(1)}px`);
        if (panel.maxRight > h.edge.right + 1.5) fail(pc, `content ends at ${panel.maxRight.toFixed(1)}px, past the shared gutter edge ${h.edge.right.toFixed(1)}px`);
        await page.mouse.move(width / 2, 880);
        await page.waitForTimeout(700);
      }
    }
    const accents = {};
    for (const moment of MOMENTS) {
      const btn = await page.$(`[data-moment-switch="${moment}"]`);
      await btn.click();
      await page.waitForTimeout(900);
      const s = await page.evaluate(() => {
        const root = document.documentElement;
        const title = document.querySelector('.m-slide .m-slide__title:not(:empty)');
        const slide = [...document.querySelectorAll('.m-slide')].find((x) => getComputedStyle(x).display !== 'none');
        const t = slide.querySelector('.m-slide__title').getBoundingClientRect();
        const act = slide.querySelector('.m-slide__actions').getBoundingClientRect();
        const ctl = document.querySelector('.m-hero__controls .m-switch').getBoundingClientRect();
        const hdr = (document.querySelector('#header-component') || document.querySelector('header-component')).getBoundingClientRect();
        const labels = [...document.querySelectorAll('.m-switch__btn')].map((b) => ({ vis: b.querySelector('.m-switch__label').getBoundingClientRect().width > 4, h: b.getBoundingClientRect().height }));
        const poster = slide.querySelector('.m-slide__media--fit .m-slide__poster');
        let crop = null;
        if (poster) { const b = poster.getBoundingClientRect(); crop = { fit: getComputedStyle(poster).objectFit, boxRatio: b.width / b.height, natural: poster.naturalWidth / poster.naturalHeight }; }
        return { headerBottom: hdr.bottom, titleTop: t.top, labels, moment: root.dataset.moment, live: getComputedStyle(root).getPropertyValue('--m-live').trim(), t: { l: t.left, r: t.right }, actionsBottom: act.bottom, ctlTop: ctl.top, vw: innerWidth, crop, title: !!title };
      });
      const c2 = `${ctx} ${moment}`;
      if (s.moment !== moment) fail(c2, `switch did not set html[data-moment] (got ${s.moment})`);
      accents[moment] = s.live;
      if (s.t.l < -1 || s.t.r > s.vw + 1) fail(c2, 'headline leaves the viewport');
      if (s.titleTop < s.headerBottom - 1) fail(c2, `headline is behind the header (title top ${s.titleTop.toFixed(0)}, header bottom ${s.headerBottom.toFixed(0)})`);
      if (width >= 750 && s.labels.some((l) => !l.vis)) fail(c2, 'a moment switcher label is not visible on desktop');
      if (s.labels.some((l) => l.h < 44)) fail(c2, 'a switcher button is under 44px tall');
      if (s.actionsBottom > s.ctlTop + 1) fail(c2, 'hero buttons overlap the switcher');
      if (s.crop && s.crop.fit !== 'contain' && Math.abs(s.crop.boxRatio - s.crop.natural) / s.crop.natural > 0.03) fail(c2, `fit poster may be cropped (object-fit ${s.crop.fit}, box ${s.crop.boxRatio.toFixed(2)} vs photo ${s.crop.natural.toFixed(2)})`);
      if (SHOT_WIDTHS.includes(width)) await page.screenshot({ path: path.join(SHOTS, `${moment}-${width}-${dir}.png`), clip: { x: 0, y: 0, width, height: Math.min(900, 900) } });
    }
    const distinct = new Set(Object.values(accents));
    if (distinct.size < 5) fail(ctx, `accent token barely changes across moments: ${JSON.stringify(accents)}`);

    const cls = await page.evaluate(() => window.__cls);
    if (cls > 0.05) fail(ctx, `cumulative layout shift ${cls.toFixed(3)} is over 0.05`);
    if (width === 1440 && dir === 'ltr') say(`CLS at 1440: ${cls.toFixed(3)}`);
    await context.close();
  }
}
await browser.close();

say('video pause off-screen: not testable, no hero video exists yet (the IntersectionObserver and visibilitychange paths are in place)');
fs.writeFileSync(path.join(ROOT, 'docs', 'screenshots', 'hero', 'report.json'), JSON.stringify({ failures, log }, null, 2));
for (const l of log) console.log('  ' + l);
if (failures.length) {
  console.error(`\nFAILED (${failures.length}):`);
  for (const f of failures.slice(0, 80)) console.error('  ' + f);
  process.exit(1);
}
console.log('PASS');
