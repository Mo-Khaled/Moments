// A contact sheet of the six Moment marks at 24, 48 and 96px on their moment colours, to check each is recognisable small.
// usage: node scripts/shot-marks.mjs [--theme id] [--tag name]
import { chromium } from 'playwright-core';
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const THEME = arg('theme', ''); const TAG = arg('tag', 'marks');
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await (await b.newContext({ viewport: { width: 1000, height: 560 }, deviceScaleFactor: 2 })).newPage();
await p.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
await p.goto(`https://momentseg.com/?pb=0${THEME ? '&preview_theme_id=' + THEME : ''}`, { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(3000);
await p.evaluate(() => {
  const sprite0 = document.querySelector('svg[aria-hidden="true"][width="0"]');
  document.body.innerHTML = '';
  if (sprite0) document.body.appendChild(sprite0);
  document.body.style.cssText = 'margin:0;background:#FAF6F2;display:grid;grid-template-columns:repeat(3,1fr);gap:0;min-height:100vh';
  for (const m of ['night', 'gift', 'allday', 'daily', 'fresh', 'love']) {
    const d = document.createElement('div'); d.className = 'm-tone--' + m;
    d.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:28px;padding:28px 12px;background:var(--tile-bg);color:var(--tile-ink);--m-mark-ink:var(--tile-ink);--m-mark-body:var(--tile-body);--m-mark-accent:var(--tile-accent);--m-mark-gold:var(--tile-gold)';
    for (const px of [24, 48, 96]) { const e = document.createElement('div'); e.innerHTML = `<moment-mark class="moment-mark moment-mark--${px > 60 ? 'lg' : 'sm'}" data-mark="${m}" style="--mm-size:${px}px;--mm-amp:0"><svg viewBox="0 0 48 48"><use href="#moment-mark-${m}"></use></svg></moment-mark>`; d.appendChild(e.firstChild); }
    document.body.appendChild(d);
  }
});
await p.waitForTimeout(500);
await p.screenshot({ path: `docs/screenshots/cards/${TAG}.png` });
await b.close();
