// Colour flow proof. Samples a 1px column in the empty gutter (x=24 at 1440, x=8 at 375) on EVERY pixel row down the page, plus a second
// column at the edge of the content width, and computes the OKLab colour step between consecutive rows (delta E x100).
// FAILS when: any step is above STEP (a smooth gradient over 200px changes about 0.4 per row), a single row differs from both neighbours
// like a 1px line, or more than 3 distinct full-bleed surface tones rest on the page (a tone = 40+ rows of flat colour; tones within
// dE 10 are one family). Rows inside the hero (photo/video) and the header chrome are not measured.
// usage: node scripts/check-colour-flow.mjs [--path /] [--tag run] [--inject file.css] [--step 1.2] [--modes 1440:ltr,375:ltr,1440:rtl,375:rtl]
// Output: docs/design/colour-flow-<tag>.md, filmstrip and join crops in docs/screenshots/colour-flow/.
import { chromium } from 'playwright-core';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const BASE = 'https://momentseg.com';
const PATH = arg('path', '/');
const TAG = arg('tag', 'run');
const INJECT = arg('inject', null);
const STEP = Number(arg('step', 1.2));
const MODES = arg('modes', '1440:ltr,375:ltr,1440:rtl,375:rtl').split(',').map((m) => m.split(':'));
const OUT = 'docs/screenshots/colour-flow';
mkdirSync(OUT, { recursive: true });
const slug = PATH === '/' ? 'home' : PATH.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '');

const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const oklab = ([r, g, b]) => {
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
};
const dE = (A, B) => 100 * Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]);
const hex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const md = [`# Colour flow: ${TAG}`, '', `Page ${PATH}${INJECT ? ` (draft CSS injected: ${INJECT})` : ''}. Every pixel row of a gutter column, OKLab step x100 between consecutive rows. Limit ${STEP} per row, no 1px lines, at most 3 resting surface tones (tones within dE 10 are one family). Hero media and header chrome are not measured.`, ''];
let failed = false;
for (const [ws, dir] of MODES) {
  const w = Number(ws), h = w === 375 ? 800 : 900;
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  await ctx.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
  const page = await ctx.newPage();
  await page.goto(`${BASE}${PATH}${PATH.includes('?') ? '&' : '?'}pb=0`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  if (dir === 'rtl') {
    await page.evaluate(() => { document.documentElement.dir = 'rtl'; document.documentElement.lang = 'ar'; });
    await page.addStyleTag({ content: "html[dir='rtl'] .skip-to-content-link:not(:focus){left:auto;right:-99999px}" });
  }
  if (INJECT) await page.addStyleTag({ content: readFileSync(INJECT, 'utf8') });
  await page.waitForTimeout(2500);
  const total0 = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < Math.min(total0, 12000); y += h * 0.8) { await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y); await page.waitForTimeout(110); }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await page.waitForTimeout(500);
  await page.addStyleTag({ content: '#header-group, #header-group *, .header, header-component, moment-cursor, [class*="sticky"] { position: static !important; } moment-cursor { display: none !important; } .m-announce { position: static !important; }' });
  await page.waitForTimeout(300);
  const meta = await page.evaluate(() => {
    const secs = [...document.querySelectorAll('body > .shopify-section, #MainContent > .shopify-section, #header-group > .shopify-section, body > header.shopify-section')].map((e) => { const r = e.getBoundingClientRect(); return { id: e.id.replace('shopify-section-', '').slice(-26), top: Math.round(r.top + scrollY), bottom: Math.round(r.bottom + scrollY), hero: !!e.querySelector('.m-hero, .m-brands'), chrome: e.classList.contains('shopify-section-group-header-group') }; }).filter((s) => s.bottom - s.top > 4).sort((a, b) => a.top - b.top);
    return { height: document.documentElement.scrollHeight, secs };
  });
  const H = meta.height;
  // read both columns row by row in viewport-high strips
  // Desktop: both gutters (x=24 and x=w-24). Phones: only the start-side gutter (x=8), because the carousels deliberately peek into the end side.
  const cols = w === 375 ? [dir === 'ltr' ? 8 : w - 9] : [24, w - 25];
  const data = cols.map(() => []);
  for (let y = 0; y < H; y += h) {
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y);
    await page.waitForTimeout(140);
    const sy = await page.evaluate(() => scrollY);
    const rows = Math.min(h, H - sy);
    for (let c = 0; c < cols.length; c++) {
      const shot = await page.screenshot({ clip: { x: cols[c], y: 0, width: 1, height: rows } });
      const px = await page.evaluate(async ({ b64, rows }) => { const img = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob()); const cv = new OffscreenCanvas(1, rows); const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, 1, rows).data; const o = []; for (let i = 0; i < rows; i++) o.push([d[i * 4], d[i * 4 + 1], d[i * 4 + 2]]); return o; }, { b64: shot.toString('base64'), rows });
      for (let i = 0; i < rows; i++) data[c][sy + i] = px[i];
    }
  }
  // exempt: hero media, header chrome
  const ex = meta.secs.filter((s) => s.hero || s.chrome).map((s) => [s.top, s.bottom]);
  const exempt = (y) => ex.some(([a, b]) => y >= a - 2 && y <= b + 2);
  const problems = [];
  let maxStep = 0, maxAt = 0;
  const tones = [];
  for (let c = 0; c < cols.length; c++) {
    const lab = data[c].map((p) => (p ? oklab(p) : null));
    let flat = 0, start = 0;
    for (let y = 1; y < H; y++) {
      if (!lab[y] || !lab[y - 1] || exempt(y)) { flat = 0; continue; }
      const d = dE(lab[y], lab[y - 1]);
      if (d > maxStep) { maxStep = d; maxAt = y; }
      if (d > STEP) problems.push(`step ${d.toFixed(2)} at y=${y} (col x=${cols[c]}) ${hex(data[c][y - 1])} -> ${hex(data[c][y])}`);
      if (y > 1 && y < H - 1 && lab[y + 1] && !exempt(y + 1)) {
        const a = dE(lab[y], lab[y - 1]), b = dE(lab[y], lab[y + 1]), around = dE(lab[y - 1], lab[y + 1]);
        if (a > 0.6 && b > 0.6 && around < Math.min(a, b) * 0.5) problems.push(`1px line at y=${y} (col x=${cols[c]}) ${hex(data[c][y])} between ${hex(data[c][y - 1])} and ${hex(data[c][y + 1])}`);
      }
      if (d < 0.05) { if (!flat) start = y; flat++; if (flat === 40) tones.push(data[c][y]); } else flat = 0;
    }
  }
  const fam = [];
  for (const t of tones) { const L = oklab(t); if (!fam.some((f) => dE(f.lab, L) < 10)) fam.push({ lab: L, hex: hex(t) }); }
  const ok = problems.length === 0 && fam.length <= 3;
  if (!ok) failed = true;
  console.log(`${PATH} ${w} ${dir}: height ${H}, max step ${maxStep.toFixed(2)} at y=${maxAt}, problems ${problems.length}, resting tones ${fam.length} (${fam.map((f) => f.hex).join(' ')}) ${ok ? 'PASS' : 'FAIL'}`);
  md.push(`## ${w}px ${dir.toUpperCase()}: ${ok ? 'PASS' : 'FAIL'}`, `Height ${H}px. Largest step ${maxStep.toFixed(2)} at y=${maxAt}. Resting surface tones: ${fam.length} (${fam.map((f) => f.hex).join(', ')}).`, '');
  const uniq = [...new Set(problems)].slice(0, 12);
  for (const p of uniq) md.push('- ' + p);
  if (problems.length > uniq.length) md.push(`- ... ${problems.length - uniq.length} more`);
  md.push('');
  // filmstrip (viewport shots) and a 400px crop at each join
  for (let i = 0, y = 0; y < H && i < 14; i++, y += h) {
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y); await page.waitForTimeout(250);
    await page.screenshot({ path: `${OUT}/${TAG}-${slug}-${w}-${dir}-strip${String(i).padStart(2, '0')}.png` });
  }
  if (dir === 'ltr') {
    const joins = meta.secs.filter((s) => !s.chrome && !s.hero).map((s) => s.top);
    for (const [i, y] of joins.entries()) {
      await page.evaluate((yy) => window.scrollTo({ top: Math.max(0, yy - 200), behavior: 'instant' }), y); await page.waitForTimeout(220);
      const off = await page.evaluate((yy) => yy - scrollY, y);
      await page.screenshot({ path: `${OUT}/${TAG}-${slug}-${w}-join${String(i).padStart(2, '0')}.png`, clip: { x: 0, y: Math.max(0, Math.min(h - 400, off - 200)), width: w, height: 400 } });
    }
  }
  await ctx.close();
}
await browser.close();
writeFileSync(`docs/design/colour-flow-${TAG}-${slug}.md`, md.join('\n'));
console.log(failed ? 'COLOUR FLOW FAILED' : 'COLOUR FLOW OK');
process.exit(failed ? 1 : 0);
