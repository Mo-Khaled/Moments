// Gift card checks on the home page. usage: node scripts/check-gift.mjs [--theme id]
// Card at most 640px tall on desktop; headline on one line at 1440; packshots uncropped (object-fit contain, inside their frames, frames inside the card);
// no overflow; the card has the card radius; at 375 nothing overflows horizontally and the mark accent does not overlap a frame.
import { chromium, devices } from 'playwright-core';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const THEME = arg('theme', '');
const b = await chromium.launch({ channel: 'chrome', headless: true });
let bad = 0;
for (const [w, mobile] of [[1440, false], [1024, false], [375, true]]) {
  const ctx = await b.newContext(mobile ? { ...devices['iPhone 13'] } : { viewport: { width: w, height: 900 } });
  await ctx.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
  const p = await ctx.newPage();
  await p.goto(`https://momentseg.com/?pb=0${THEME ? '&preview_theme_id=' + THEME : ''}`, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(3500);
  await p.locator('.m-gift').scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
  const r = await p.evaluate(() => {
    const R = (e) => e.getBoundingClientRect();
    const card = document.querySelector('.m-gift__card'); const c = R(card);
    const title = document.querySelector('.m-gift__title'); const lh = parseFloat(getComputedStyle(title).lineHeight);
    const frames = [...document.querySelectorAll('.m-gift__frame')];
    const out = { h: c.height, w: c.width, radius: getComputedStyle(card).borderRadius, titleLines: Math.round(R(title).height / lh), sets: frames.length, probs: [] };
    for (const f of frames) {
      const fr = R(f); const img = f.querySelector('img'); const ir = R(img);
      if (getComputedStyle(img).objectFit !== 'contain') out.probs.push('packshot not object-fit contain');
      if (ir.left < fr.left - 0.5 || ir.right > fr.right + 0.5 || ir.top < fr.top - 0.5 || ir.bottom > fr.bottom + 0.5) out.probs.push('packshot outside its frame');
      if (fr.left < c.left - 0.5 || fr.right > c.right + 0.5 || fr.top < c.top - 0.5 || fr.bottom > c.bottom + 0.5) out.probs.push('frame sticks out of the card');
    }
    const acc = document.querySelector('.m-gift__accent'); if (acc) { const a = R(acc); for (const f of frames) { const fr = R(f); if (a.left < fr.right && a.right > fr.left && a.top < fr.bottom - 4 && a.bottom > fr.top + 4 && innerWidth < 990) out.probs.push('accent mark overlaps a frame'); } }
    out.overflowX = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
    return out;
  });
  const probs = [...r.probs];
  if (!mobile && r.h > 640) probs.push(`card ${r.h.toFixed(0)}px tall (max 640)`);
  if (w === 1440 && r.titleLines > 1) probs.push(`headline wraps to ${r.titleLines} lines`);
  if (r.sets < 2) probs.push(`only ${r.sets} packshots`);
  if (r.overflowX) probs.push('horizontal overflow');
  if (parseFloat(r.radius) < 12) probs.push(`radius ${r.radius}`);
  if (probs.length) bad++;
  console.log(`${probs.length ? 'FAIL' : 'ok  '} ${w}  card ${r.w.toFixed(0)}x${r.h.toFixed(0)}  sets ${r.sets}  ${probs.join('; ')}`);
  await ctx.close();
}
await b.close();
console.log(bad ? `GIFT FAILED (${bad})` : 'GIFT OK'); process.exit(bad ? 1 : 0);
