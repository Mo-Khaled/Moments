// Moment tile check (dev tool, not part of the theme).
//
// For every tile on the homepage and /pages/moments, at 1920, 1440, 1024, 768 and 375 px, in LTR and RTL:
//   1. the grid is strict: equal tile sizes, equal cells per row, no orphan cell
//   2. the animated mark, at rest and at its gesture end state (real hover), stays inside the tile with the
//      safe-area margin and is not clipped by any ancestor that hides overflow
//   3. the mark does not run into the label
//   4. no tile image is cover-cropped (tiles hold no photographs; any <img> must be object-fit: contain)
//   5. the page has no horizontal scroll
// Exit code 1 when anything fails. Screenshots of each tile (rest and gesture end state) go to
// docs/screenshots/tiles/ for the viewports in SHOT_WIDTHS.
//
// usage: node scripts/check-tiles.mjs [--base https://momentseg.com] [--theme 161294745791]
// RTL is emulated by setting dir="rtl" and lang="ar" on <html> (Arabic is not a store language yet).
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), []));
const BASE = args.base || 'https://momentseg.com';
const THEME = args.theme || '161294745791';
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs', 'screenshots', 'tiles');
const WIDTHS = [1920, 1440, 1024, 768, 375];
const SHOT_WIDTHS = [1440, 375];
const PAGES = [
  { name: 'home', path: '/' },
  { name: 'moments', path: '/pages/moments' },
];
const MIN_SAFE = 0.12; // the mark must stay at least 12% of the tile width away from the top and the side edges, at rest and in motion
const columnsFor = (w) => (w >= 990 ? 3 : 2);

fs.mkdirSync(OUT, { recursive: true });
const failures = [];
const notes = [];
const fail = (ctx, msg) => failures.push(`${ctx}: ${msg}`);

const url = (p) => `${BASE}${p}${p.includes('?') ? '&' : '?'}preview_theme_id=${THEME}&pb=0`;

const browser = await chromium.launch({ channel: 'chrome', headless: true });

for (const pg of PAGES) {
  for (const width of WIDTHS) {
    for (const dir of ['ltr', 'rtl']) {
      const ctxName = `${pg.name} ${width}px ${dir}`;
      const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
      const page = await context.newPage();
      await page.route(/kaspersky-labs|shopifysvc|monorail/, (route) => route.abort());
      await page.goto(url(pg.path), { waitUntil: 'domcontentloaded', timeout: 60000 });
      if (dir === 'rtl') await page.evaluate(() => { document.documentElement.dir = 'rtl'; document.documentElement.lang = 'ar'; });
      await page.waitForSelector('.m-tile');
      await page.evaluate(() => document.querySelector('.m-moments').scrollIntoView({ block: 'start' }));
      await page.waitForTimeout(500);

      // 5. no horizontal scroll
      // Real scroll test, so a harmless off-screen element (RTL emulation) does not count: try to scroll both ways.
      const scrollable = await page.evaluate(() => { scrollTo(-5000, 0); const a = scrollX; scrollTo(5000, 0); const b = scrollX; scrollTo(0, scrollY); return Math.max(Math.abs(a), Math.abs(b)); });
      if (scrollable > 1) fail(ctxName, `page scrolls horizontally by ${scrollable}px`);

      // 1. strict grid
      const grid = await page.$$eval('.m-tile-item', (items) => items.map((li) => { const r = li.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, w: r.width, h: r.height }; }));
      if (grid.length !== 6) fail(ctxName, `expected 6 tiles, found ${grid.length}`);
      const cols = columnsFor(width);
      const rows = {};
      for (const g of grid) rows[Math.round(g.y)] = (rows[Math.round(g.y)] || 0) + 1;
      const rowCounts = Object.values(rows);
      if (rowCounts.some((n) => n !== cols)) fail(ctxName, `orphan cell: row counts ${rowCounts.join('/')}, expected ${cols} per row`);
      const spreadW = Math.max(...grid.map((g) => g.w)) - Math.min(...grid.map((g) => g.w));
      const spreadH = Math.max(...grid.map((g) => g.h)) - Math.min(...grid.map((g) => g.h));
      if (spreadW > 1.5 || spreadH > 1.5) fail(ctxName, `tiles differ in size (width spread ${spreadW.toFixed(1)}px, height spread ${spreadH.toFixed(1)}px)`);

      // 4. no cropped images in tiles
      const imgs = await page.$$eval('.m-tile img', (list) => list.map((i) => ({ fit: getComputedStyle(i).objectFit, src: i.currentSrc })));
      for (const i of imgs) if (i.fit !== 'contain') fail(ctxName, `tile image is ${i.fit}-cropped: ${i.src}`);

      const tiles = await page.$$('.m-tile');
      for (let t = 0; t < tiles.length; t++) {
        const tile = tiles[t];
        const tone = await tile.evaluate((a) => [...a.classList].find((c) => c.startsWith('m-tile--')).replace('m-tile--', ''));
        const tctx = `${ctxName} ${tone}`;

        const measure = () => tile.evaluate((a) => {
          const tr = a.getBoundingClientRect();
          const use = a.querySelector('moment-mark use');
          const ur = use.getBoundingClientRect();
          const lr = a.querySelector('.m-tile__label').getBoundingClientRect();
          const box = a.querySelector('.m-tile__art').getBoundingClientRect();
          // ancestors between the mark and the page that hide overflow
          const clippers = [];
          for (let el = use.parentElement; el && el !== document.body; el = el.parentElement || (el.getRootNode().host ?? null)) {
            const o = getComputedStyle(el);
            if (o.overflowX !== 'visible' || o.overflowY !== 'visible') {
              const r = el.getBoundingClientRect();
              clippers.push({ el: el.tagName.toLowerCase() + '.' + String(el.className).slice(0, 30), l: r.left, t: r.top, r: r.right, b: r.bottom });
            }
          }
          return {
            tile: { l: tr.left, t: tr.top, r: tr.right, b: tr.bottom, w: tr.width, h: tr.height },
            mark: { l: ur.left, t: ur.top, r: ur.right, b: ur.bottom },
            box: { l: box.left, t: box.top, r: box.right, b: box.bottom },
            label: { l: lr.left, t: lr.top, r: lr.right, b: lr.bottom },
            clippers,
          };
        });

        const check = (m, state) => {
          const safe = MIN_SAFE * m.tile.w;
          const margins = { start: Math.min(m.mark.l, m.mark.r) - 0, left: m.mark.l - m.tile.l, right: m.tile.r - m.mark.r, top: m.mark.t - m.tile.t, bottom: m.tile.b - m.mark.b };
          for (const [side, v] of Object.entries({ left: margins.left, right: margins.right, top: margins.top })) {
            if (v < 0) fail(tctx, `${state}: mark crosses the tile edge (${side} ${v.toFixed(1)}px)`);
            else if (v < safe) fail(tctx, `${state}: mark ${side} margin ${v.toFixed(1)}px is under the ${(safe).toFixed(1)}px safe area`);
          }
          for (const c of m.clippers) {
            if (m.mark.l < c.l - 0.5 || m.mark.r > c.r + 0.5 || m.mark.t < c.t - 0.5 || m.mark.b > c.b + 0.5) fail(tctx, `${state}: mark is clipped by ancestor ${c.el}`);
          }
          const overlap = m.mark.l < m.label.r && m.mark.r > m.label.l && m.mark.t < m.label.b && m.mark.b > m.label.t;
          if (overlap) fail(tctx, `${state}: mark overlaps the label`);
          return { left: margins.left, right: margins.right, top: margins.top };
        };

        await page.mouse.move(2, 2);
        await page.waitForTimeout(150);
        const rest = await measure();
        check(rest, 'rest');

        const shoot = async (state) => {
          if (!SHOT_WIDTHS.includes(width) || !(dir === 'ltr' || (pg.name === 'moments' && width === 1440))) return;
          const r = await tile.boundingBox();
          const pad = 24;
          await page.screenshot({ path: path.join(OUT, `${pg.name}-${width}-${dir}-${tone}-${state}.png`), clip: { x: Math.max(0, r.x - pad), y: Math.max(0, r.y - pad), width: Math.min(width, r.width + 2 * pad), height: r.height + 2 * pad } });
        };
        await shoot('rest');

        await tile.scrollIntoViewIfNeeded();
        await tile.hover();
        await page.waitForTimeout(800);
        const end = await measure();
        const m = check(end, 'gesture end');
        const moved = Math.abs(end.mark.l - rest.mark.l) + Math.abs(end.mark.t - rest.mark.t) + Math.abs(end.mark.r - rest.mark.r) + Math.abs(end.mark.b - rest.mark.b);
        notes.push({ ctx: tctx, moved: Number(moved.toFixed(1)), minMarginPx: Number(Math.min(m.left, m.right, m.top).toFixed(1)), tileW: Math.round(end.tile.w) });
        await shoot('gesture');
      }
      await context.close();
    }
  }
}
await browser.close();

fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify({ failures, notes }, null, 2));
const noMotion = notes.filter((n) => n.moved === 0).length;
console.log(`checked ${notes.length} tile states; mark bounding box changed in ${notes.length - noMotion} of them (the rest are marks whose gesture does not move the outer box).`);
if (failures.length) {
  console.error(`\nFAILED (${failures.length}):`);
  for (const f of failures.slice(0, 60)) console.error('  ' + f);
  process.exit(1);
}
console.log('PASS: no clipped mark, no orphan cell, no cropped tile image.');
