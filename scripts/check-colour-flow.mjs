// Colour flow of the homepage: colour difference at every section boundary (last pixel row above vs first row below),
// hard boundaries per 1000px of scroll, distinct full-bleed surface colours. Dev tool, not part of the theme.
// usage: node scripts/check-colour-flow.mjs [--path /] [--query ?view=x] [--tag before] [--max-hard 1] [--max-surfaces 3]
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const BASE = 'https://momentseg.com';
const PATH = arg('path', '/');
const QUERY = arg('query', '');
const TAG = arg('tag', 'run');
const HARD = 8;                              // OKLab delta x100 above which a boundary is a visible seam
const MAX_HARD_PER_1000 = Number(arg('max-hard', 1));
const MAX_SURFACES = Number(arg('max-surfaces', 3));
const OUT = 'docs/screenshots/colour-flow';
mkdirSync(OUT, { recursive: true });

const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const oklab = ([r, g, b]) => {
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
};
const dE = (a, b) => { const A = oklab(a), B = oklab(b); return 100 * Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]); };
const hex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = [];
let failed = false;
for (const [w, h] of [[1440, 900], [375, 800]]) {
  for (const dir of ['ltr', 'rtl']) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    await ctx.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
    const page = await ctx.newPage();
    await page.goto(`${BASE}${PATH}${QUERY}${QUERY.includes('?') ? '&' : '?'}pb=0`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    if (dir === 'rtl') await page.evaluate(() => { document.documentElement.dir = 'rtl'; document.documentElement.lang = 'ar'; }).then(() => page.addStyleTag({ content: "html[dir='rtl'] .skip-to-content-link:not(:focus){left:auto;right:-99999px}" }));
    await page.waitForTimeout(2000);
    // scroll through once so lazy media and reveals settle, then back to the top
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < total; y += h * 0.8) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(150); }
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(800);
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    const secs = await page.evaluate(() => [...document.querySelectorAll('main > .shopify-section, #MainContent > .shopify-section, .shopify-section-group-footer-group .shopify-section, body > .shopify-section')]
      .map((el) => { const r = el.getBoundingClientRect(); return { id: el.id.replace('shopify-section-', ''), top: Math.round(r.top + scrollY), bottom: Math.round(r.bottom + scrollY) }; })
      .filter((s) => s.bottom - s.top > 8).sort((a, b) => a.top - b.top));
    // The sticky header would cover the sampled rows: pin it static for the measurement only.
    await page.addStyleTag({ content: '.header, header-component, [class*="sticky"] { position: static !important; }' });
    const ys = secs.flatMap((s) => [s.top + 2, s.bottom - 3]);
    const shots = [];
    for (const y of ys) {
      await page.evaluate((yy) => window.scrollTo(0, Math.max(0, yy - 200)), y);
      await page.waitForTimeout(90);
      const off = await page.evaluate((yy) => yy - scrollY, y);
      shots.push((await page.screenshot({ clip: { x: 0, y: Math.max(0, Math.min(h - 1, off)), width: w, height: 1 } })).toString('base64'));
    }
    // filmstrip: viewport shots down the page (at most 12), for looking at
    for (let i = 0, y = 0; y < height && i < 12; i++, y += h) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(300);
      await page.screenshot({ path: `${OUT}/${TAG}-${w}-${dir}-${String(i).padStart(2, '0')}.png` });
    }
    const rows = await page.evaluate(async (list) => {
      const out = [];
      for (const b64 of list) {
        const img = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob());
        const c = new OffscreenCanvas(img.width, 1); const g = c.getContext('2d', { willReadFrequently: true });
        g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, img.width, 1).data; let r = 0, gg = 0, bb = 0;
        for (let i = 0; i < img.width; i++) { r += d[i * 4]; gg += d[i * 4 + 1]; bb += d[i * 4 + 2]; }
        out.push([r / img.width, gg / img.width, bb / img.width]);
      }
      return out;
    }, shots);
    const dpr = 1; // screenshot is at css px
    const bounds = []; let hard = 0;
    for (let i = 1; i < secs.length; i++) {
      const above = rows[(i - 1) * 2 + 1], below = rows[i * 2];
      const d = dE(above, below);
      const isHard = d > HARD; if (isHard) hard++;
      bounds.push({ from: secs[i - 1].id, to: secs[i].id, y: secs[i].top, dE: +d.toFixed(1), above: hex(above), below: hex(below), hard: isHard });
    }
    const surfaces = [...new Set(secs.map((_, i) => hex(rows[i * 2].map((v) => Math.round(v / 6) * 6))))];
    const per1000 = hard / (height / 1000);
    const ok = per1000 <= MAX_HARD_PER_1000 && surfaces.length <= MAX_SURFACES;
    if (!ok) failed = true;
    report.push({ w, dir, height, sections: secs.length, hard, per1000: +per1000.toFixed(2), surfaces, bounds, ok });
    console.log(`${w} ${dir}: ${secs.length} sections, ${height}px, hard boundaries ${hard} (${per1000.toFixed(2)}/1000px), distinct surface colours ${surfaces.length} ${ok ? 'PASS' : 'FAIL'}`);
    await ctx.close();
  }
}
await browser.close();
const md = [`# Colour flow ${TAG}`, '', `Page ${PATH}${QUERY}. Hard boundary = OKLab delta x100 above ${HARD} between the last row of a section and the first row of the next. Limits: ${MAX_HARD_PER_1000} hard per 1000px, ${MAX_SURFACES} distinct surfaces.`, ''];
for (const r of report) {
  md.push(`## ${r.w}px ${r.dir.toUpperCase()}: ${r.ok ? 'PASS' : 'FAIL'}`, `${r.sections} sections, ${r.height}px tall, ${r.hard} hard boundaries (${r.per1000} per 1000px), ${r.surfaces.length} surface colours: ${r.surfaces.join(' ')}`, '', '| from | to | y | dE | above | below |', '|---|---|---|---|---|---|');
  for (const b of r.bounds) md.push(`| ${b.from} | ${b.to} | ${b.y} | ${b.dE}${b.hard ? ' **hard**' : ''} | ${b.above} | ${b.below} |`);
  md.push('');
}
writeFileSync(`docs/design/colour-flow-${TAG}.md`, md.join('\n'));
process.exit(failed ? 1 : 0);
