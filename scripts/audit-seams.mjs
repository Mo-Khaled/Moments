// Seams audit: for every page, lists each section in layout order with what paints its background, and for each join between two
// sections the colours above and below, borders, shadows, margins, overflow, pseudo-elements, plus a 400px crop at 1440 and 375.
// Output: docs/design/seams-audit.md and docs/screenshots/colour-flow/<tag>-joins/. Dev tool, not part of the theme.
// usage: node scripts/audit-seams.mjs [--tag before] [--only /path]
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const TAG = arg('tag', 'before');
const ONLY = arg('only', null);
const BASE = 'https://momentseg.com';
const PAGES = ONLY ? [ONLY] : ['/', '/pages/moments', '/pages/about-us', '/pages/make-a-bundle', '/cart'];
const OUT = `docs/screenshots/colour-flow/${TAG}-joins`;
mkdirSync(OUT, { recursive: true });

const analyse = () => {
  const vw = innerWidth;
  const all = [...document.querySelectorAll('body > .shopify-section, #MainContent > .shopify-section, main .shopify-section, .shopify-section-group-header-group, .shopify-section-group-footer-group .shopify-section, body > header, body > footer')];
  const seen = new Set();
  const secs = all.filter((e) => { if (seen.has(e)) return false; seen.add(e); const r = e.getBoundingClientRect(); return r.height > 4 && !e.closest('[hidden]'); })
    .filter((e, _, arr) => !arr.some((o) => o !== e && o.contains(e) && o.classList.contains('shopify-section')))
    .map((e) => { const r = e.getBoundingClientRect(); return { e, top: r.top + scrollY, bottom: r.bottom + scrollY }; })
    .sort((a, b) => a.top - b.top);
  const css = (el) => getComputedStyle(el);
  const hasPaint = (s) => (s.backgroundColor && !/rgba\(0, 0, 0, 0\)|transparent/.test(s.backgroundColor)) || (s.backgroundImage && s.backgroundImage !== 'none');
  const short = (s) => (s || '').replace(/\s+/g, ' ').slice(0, 110);
  const label = (el) => el.tagName.toLowerCase() + (el.id ? '#' + el.id.replace('shopify-section-', '').slice(-28) : '') + '.' + String(el.className).split(/\s+/).filter(Boolean).slice(0, 3).join('.');
  const info = secs.map(({ e, top, bottom }) => {
    const r = e.getBoundingClientRect();
    const bands = [e, ...e.querySelectorAll('*')].filter((c) => {
      const b = c.getBoundingClientRect();
      return b.width >= vw * 0.97 && b.height >= r.height * 0.5 && hasPaint(css(c)) && css(c).display !== 'none';
    }).slice(0, 3).map((c) => ({ el: label(c), bg: short(css(c).backgroundColor), img: short(css(c).backgroundImage), mask: css(c).maskImage !== 'none' }));
    const edge = [];
    for (const c of [e, ...e.querySelectorAll('*')]) {
      const b = c.getBoundingClientRect(); const s = css(c);
      if (b.width < vw * 0.9) continue;
      const atTop = Math.abs(b.top - r.top) < 6, atBottom = Math.abs(b.bottom - r.bottom) < 6;
      if (!atTop && !atBottom) continue;
      const bits = [];
      if (atTop && parseFloat(s.borderTopWidth) > 0 && s.borderTopStyle !== 'none') bits.push(`border-top ${s.borderTopWidth} ${s.borderTopColor}`);
      if (atBottom && parseFloat(s.borderBottomWidth) > 0 && s.borderBottomStyle !== 'none') bits.push(`border-bottom ${s.borderBottomWidth} ${s.borderBottomColor}`);
      if (s.boxShadow !== 'none') bits.push('box-shadow ' + short(s.boxShadow));
      if (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) bits.push('outline ' + s.outlineWidth);
      for (const p of ['::before', '::after']) { const ps = getComputedStyle(c, p); if (ps.content !== 'none' && ps.content !== 'normal' && (parseFloat(ps.height) <= 4 || hasPaint(ps)) && parseFloat(ps.width) > vw * 0.5) bits.push(p + ' ' + ps.width + 'x' + ps.height + ' ' + short(ps.backgroundColor)); }
      if (bits.length) edge.push(label(c) + ': ' + bits.join('; '));
    }
    const s = css(e);
    return { id: label(e), top: Math.round(top), bottom: Math.round(bottom), marginTop: s.marginTop, marginBottom: s.marginBottom, paddingTop: s.paddingTop, overflow: s.overflow, isolation: s.isolation, zIndex: s.zIndex, bands, edge };
  });
  return info;
};

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const md = [`# Seams audit (${TAG})`, '', `Every join between two consecutive sections: what paints each side, and anything sitting on the join (border, shadow, outline, thin pseudo-element, margin, overflow, isolation, z-index). Crops: ${OUT}/ (400px tall, centred on the join).`, ''];
for (const path of PAGES) {
  for (const [w, h] of [[1440, 900], [375, 800]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    await ctx.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
    const page = await ctx.newPage();
    await page.goto(`${BASE}${path}?pb=0`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(2500);
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < Math.min(total, 9000); y += h * 0.8) { await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y); await page.waitForTimeout(120); }
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' })); await page.waitForTimeout(500);
    await page.addStyleTag({ content: '.header, header-component, #header-group, [class*="sticky"] { position: static !important; }' });
    const info = await page.evaluate(analyse);
    md.push(`## ${path} at ${w}px`, '', '| # | section | y | bands (painting elements) | on the join |', '|---|---|---|---|---|');
    info.forEach((s, i) => md.push(`| ${i} | ${s.id} | ${s.top}-${s.bottom} | ${s.bands.map((b) => `${b.el} bg=${b.bg} ${b.img !== 'none' ? 'img=' + b.img : ''}${b.mask ? ' mask' : ''}`).join('<br>') || 'none'} | ${[s.marginTop !== '0px' ? 'margin-top ' + s.marginTop : '', s.overflow !== 'visible' ? 'overflow ' + s.overflow : '', s.isolation === 'isolate' ? 'isolate' : '', ...s.edge].filter(Boolean).join('<br>') || '-'} |`));
    md.push('');
    const slug = (path === '/' ? 'home' : path.replace(/[^a-z0-9]+/gi, '_')) + '-' + w;
    for (let i = 1; i < info.length; i++) {
      const y = info[i].top;
      await page.evaluate((yy) => window.scrollTo({ top: Math.max(0, yy - 200), behavior: 'instant' }), y);
      await page.waitForTimeout(250);
      const off = await page.evaluate((yy) => yy - scrollY, y);
      const cy = Math.max(0, Math.min(h - 400, off - 200));
      await page.screenshot({ path: `${OUT}/${slug}-join${String(i).padStart(2, '0')}.png`, clip: { x: 0, y: cy, width: w, height: Math.min(400, h) } });
    }
    console.log(`${path} ${w}: ${info.length} sections`);
    await ctx.close();
  }
}
await browser.close();
writeFileSync('docs/design/seams-audit.md', md.join('\n'));
console.log('written docs/design/seams-audit.md');
