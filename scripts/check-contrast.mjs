// Contrast check on the live storefront: (1) axe-core's color-contrast rule, (2) our own computed check of every visible text node
// against its effective background (opaque ancestors, gradient stops worst case; background images are reported, not guessed).
// FAIL below 4.5:1 for normal text and 3:1 for large text (24px, or 18.66px bold).
// usage: node scripts/check-contrast.mjs [--quick] [--only /path]   Output: docs/design/contrast-report.md
import { chromium } from 'playwright-core';
import AxeBuilder from '@axe-core/playwright';
import { writeFileSync } from 'node:fs';

const BASE = 'https://momentseg.com';
const argv = process.argv.slice(2);
const only = argv.includes('--only') ? argv[argv.indexOf('--only') + 1] : null;
const PAGES = only ? [only] : ['/', '/pages/make-a-bundle', '/collections/all', '/search?q=oud', '/products/9-pm-night-out', '/cart', '/pages/about-us', '/pages/moments'];
const MODES = argv.includes('--quick') ? [[1440, 'ltr']] : [[1440, 'ltr'], [1440, 'rtl'], [375, 'ltr'], [375, 'rtl']];

const own = () => {
  // Any computed colour (rgb, color(srgb ...), oklab, oklch from color-mix) is converted through a 1px canvas.
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const g = cv.getContext('2d', { willReadFrequently: true });
  const parse = (c) => {
    if (!c || c === 'transparent') return null;
    g.clearRect(0, 0, 1, 1); g.fillStyle = '#000'; g.fillStyle = c; g.fillRect(0, 0, 1, 1);
    const d = g.getImageData(0, 0, 1, 1).data;
    return { r: d[0], g: d[1], b: d[2], a: d[3] / 255 };
  };
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  const cr = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const over = (top, bottom) => ({ r: top.r * top.a + bottom.r * (1 - top.a), g: top.g * top.a + bottom.g * (1 - top.a), b: top.b * top.a + bottom.b * (1 - top.a), a: 1 });
  // backgrounds behind an element: candidate colours (worst case over gradient stops); null if a photograph is behind it
  const layersOf = (e, stack) => {
    const s = getComputedStyle(e);
    const bi = s.backgroundImage;
    if (bi && bi !== 'none') {
      if (/url\(/.test(bi) && !/gradient/.test(bi)) return 'image';
      const stops = [...bi.matchAll(/(?:rgba?|color|oklab|oklch|lab|lch|hsla?)\((?:[^()]|\([^()]*\))*\)/g)].map((m) => parse(m[0])).filter(Boolean);
      if (stops.length) stack.push({ stops });
    }
    const bg = parse(s.backgroundColor);
    if (bg && bg.a > 0) { stack.push({ stops: [bg] }); if (bg.a >= 1) return 'opaque'; }
    return '';
  };
  // Backgrounds behind an element, worst case over gradient stops; null when a photograph is behind it. Ancestors first; when none is
  // opaque (a sibling such as .section-background paints the colour) the elements painted under the text's centre are used.
  let viaBody = false;
  const backdrops = (el) => {
    const stack = []; let state = ''; viaBody = false;
    for (let e = el; e && !state; e = e.parentElement) {
      state = layersOf(e, stack);
      if (state === 'opaque' && (e === document.body || e === document.documentElement)) viaBody = true;
    }
    if (state === 'image') return null;
    if (state !== 'opaque') viaBody = true;
    let cands = [{ r: 255, g: 255, b: 255, a: 1 }];
    for (const layer of stack.reverse()) cands = layer.stops.flatMap((st) => cands.map((c) => over(st, c)));
    return cands;
  };
  const out = [];
  const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const t = n.textContent.trim(); if (!t) continue;
    const el = n.parentElement; if (!el || seen.has(el)) continue;
    if (el.closest('script, style, noscript, [hidden], [aria-hidden="true"], svg, .visually-hidden, .m-sr-only')) continue;
    const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || s.display === 'none') continue;
    let eff = 1; for (let e = el; e; e = e.parentElement) eff *= Number(getComputedStyle(e).opacity); if (eff < 0.05) continue;
    const fg = parse(s.color); if (!fg) continue;
    const bds = backdrops(el);
    seen.add(el);
    const label = el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0] + (el.closest('product-card') ? ' [card]' : '');
    if (!bds) { out.push({ kind: 'image', text: t.slice(0, 40), sel: label }); continue; }
    let worst = Infinity;
    for (const bd of bds) { const f = over({ ...fg, a: fg.a * eff }, bd); worst = Math.min(worst, cr(f, bd)); }
    const size = parseFloat(s.fontSize), bold = Number(s.fontWeight) >= 700;
    const need = size >= 24 || (size >= 18.66 && bold) ? 3 : 4.5;
    if (worst < need && viaBody) {
      // Only the page background was found behind the text: a sibling (a section background layer) may paint the real colour. Sample the pixel.
      const id = String(out.length); el.setAttribute('data-ct', id);
      out.push({ kind: 'sample', id, fg: s.color, need, text: t.slice(0, 40), sel: label });
    } else if (worst < need) out.push({ kind: 'fail', ratio: +worst.toFixed(2), need, text: t.slice(0, 40), sel: label, fg: s.color });
  }
  return out;
};

const browser = await chromium.launch({ channel: 'chrome', headless: true });
let bad = 0;
const md = ['# Contrast report', '', `Live storefront, ${new Date().toISOString().slice(0, 10)}. axe color-contrast rule plus our own computed check (4.5:1 normal text, 3:1 large text). Text over photographs is listed as "image" (not computed).`, ''];
for (const path of PAGES) {
  for (const [w, dir] of MODES) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w === 375 ? 800 : 900 } });
    await ctx.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
    const page = await ctx.newPage();
    try {
      await page.goto(`${BASE}${path}${path.includes('?') ? '&' : '?'}pb=0`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      if (dir === 'rtl') {
        await page.evaluate(() => { document.documentElement.dir = 'rtl'; document.documentElement.lang = 'ar'; });
        await page.addStyleTag({ content: "html[dir='rtl'] .skip-to-content-link:not(:focus){left:auto;right:-99999px}" });
      }
      await page.waitForTimeout(path.includes('bundle') ? 5000 : 2500);
      const h = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < Math.min(h, 9000); y += 700) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(120); }
      await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(400);
      const axe = await new AxeBuilder({ page }).exclude('.m-announce__stage').withRules(['color-contrast']).analyze();
      const axeFails = axe.violations.flatMap((v) => v.nodes.map((n) => ({ target: n.target.join(' ').slice(0, 70), msg: (n.any[0]?.message || '').replace(/\s+/g, ' ').slice(0, 110) })));
      const mine = await page.evaluate(own);
      const fails = mine.filter((m) => m.kind === 'fail');
      for (const m of mine.filter((q) => q.kind === 'sample')) {
        let ratio = 0;
        for (let attempt = 0; attempt < 3 && ratio < m.need; attempt++) {
          // Re-measure at sample time (long pages shift while lazy media loads): scroll the element to the middle, read its box, sample just left of it.
          await page.evaluate((id) => document.querySelector(`[data-ct="${id}"]`)?.scrollIntoView({ block: 'center', behavior: 'instant' }), m.id);
          await page.waitForTimeout(450); // lazy media shifts long pages; scroll again once they have settled
          const box = await page.evaluate((id) => { const e = document.querySelector(`[data-ct="${id}"]`); if (!e) return null; e.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }); const r = e.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); if (!hit || !(e === hit || e.contains(hit) || hit.contains(e))) return null; return { x: r.left, y: r.top + r.height / 2 }; }, m.id);
          if (!box) { ratio = 99; break; }
          await page.waitForTimeout(120);
          const vp = page.viewportSize();
          const shot = await page.screenshot({ clip: { x: Math.max(0, Math.min(vp.width - 2, box.x - 3)), y: Math.max(0, Math.min(vp.height - 2, box.y)), width: 1, height: 1 } });
          const bgPx = await page.evaluate(async (b64) => { const img = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob()); const c = new OffscreenCanvas(1, 1); const g = c.getContext('2d'); g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2]]; }, shot.toString('base64'));
          ratio = await page.evaluate(({ fg, bgPx }) => { const cv = document.createElement('canvas'); cv.width = cv.height = 1; const g = cv.getContext('2d', { willReadFrequently: true }); g.fillStyle = fg; g.fillRect(0, 0, 1, 1); const f = g.getImageData(0, 0, 1, 1).data; const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; const L = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]); const [x, y] = [L(f), L(bgPx)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }, { fg: m.fg, bgPx });
        }
        if (ratio < m.need) fails.push({ kind: 'fail', ratio: +ratio.toFixed(2), need: m.need, text: m.text, sel: m.sel + ' (sampled)', fg: m.fg });
      }
      const imgs = mine.filter((m) => m.kind === 'image');
      const status = fails.length || axeFails.length ? 'FAIL' : 'ok';
      if (status === 'FAIL') bad++;
      console.log(`${status.padEnd(4)} ${path} ${w} ${dir}: ours ${fails.length}, axe ${axeFails.length}, over image ${imgs.length}`);
      md.push(`## ${path} ${w}px ${dir.toUpperCase()}: ${status}`, `Own check: ${fails.length} below threshold. axe: ${axeFails.length}. Text over photographs (not computed): ${imgs.length}.`);
      for (const f of fails.slice(0, 15)) md.push(`- ${f.ratio}:1 (needs ${f.need}) "${f.text}" ${f.sel} ${f.fg}`);
      for (const f of axeFails.slice(0, 8)) md.push(`- axe: ${f.target}: ${f.msg}`);
      md.push('');
    } catch (e) {
      bad++;
      console.log(`ERR  ${path} ${w} ${dir}: ${String(e).slice(0, 100)}`);
      md.push(`## ${path} ${w} ${dir}: ERROR ${String(e).slice(0, 100)}`, '');
    }
    await ctx.close();
  }
}
await browser.close();
writeFileSync('docs/design/contrast-report.md', md.join('\n'));
console.log(bad ? `CONTRAST FAILED (${bad} page runs)` : 'CONTRAST OK');
process.exit(bad ? 1 : 0);
