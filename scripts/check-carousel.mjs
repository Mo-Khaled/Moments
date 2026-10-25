// Product carousel check on the DEV theme (dev tool): the "Most loved" row and every product list built on the same section.
// At 1920, 1440, 1024, 768 and 375, LTR and RTL:
//   - exactly 3 / 3 / 3 / 2 cards visible at 1920, 1440, 1024, 768; 1.15 cards on a phone (an intentional peek)
//   - desktop: the first and last visible card edges equal the content gutters (within 1px); no card is cut off by the scroller or the viewport
//   - one backdrop for every card in the row: the sampled backdrop colour is identical (within 2 levels)
//   - the bottle image sits inside its frame, object-fit contain, never cropped
//   - the arrows sit at the inline-end of the section header beside "View all"; previous is disabled at the start, next works (also by keyboard),
//     next is disabled at the end
// Screenshots in docs/screenshots/carousel/. usage: node scripts/check-carousel.mjs
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'docs', 'screenshots', 'carousel');
fs.mkdirSync(OUT, { recursive: true });
const failures = [];
const log = [];
const fail = (c, m) => failures.push(`${c}: ${m}`);
const rtlFix = "html[dir='rtl'] .skip-to-content-link:not(:focus){left:auto;right:-99999px}";
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const expected = { 1920: 3, 1440: 3, 1024: 3, 768: 2 };

for (const width of [1920, 1440, 1024, 768, 375]) {
  for (const dir of ['ltr', 'rtl']) {
    const c = `${width}px ${dir}`;
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    await context.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
    const page = await context.newPage();
    await page.goto('https://momentseg.com/?preview_theme_id=161294745791&pb=0', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForSelector('.section-resource-list slideshow-slides product-card', { timeout: 60000 });
    if (dir === 'rtl') { await page.evaluate(() => { document.documentElement.dir = 'rtl'; document.documentElement.lang = 'ar'; }); await page.addStyleTag({ content: rtlFix }); }
    await page.waitForTimeout(2500);
    await page.evaluate(() => { const s = [...document.querySelectorAll('.shopify-section')].find((x) => x.id.endsWith('product_list_CYd9gQ')); s.scrollIntoView(); });
    await page.waitForTimeout(2500);

    const m = await page.evaluate(() => {
      const sec = [...document.querySelectorAll('.shopify-section')].find((x) => x.id.endsWith('product_list_CYd9gQ'));
      const slides = sec.querySelector('slideshow-slides');
      const sr = slides.getBoundingClientRect();
      const header = sec.querySelector('.section-resource-list__header');
      const hr = header.querySelector('.layout-panel-flex').getBoundingClientRect();
      const ctrl = sec.querySelector('.m-carousel-controls');
      const link = sec.querySelector('.m-carousel-end a');
      const cards = [...slides.querySelectorAll('slideshow-slide.resource-list__slide')].map((s) => s.querySelector('product-card')).filter(Boolean);
      const rows = cards.map((card) => {
        const r = card.getBoundingClientRect();
        const g = card.querySelector('.card-gallery');
        const gr = g ? g.getBoundingClientRect() : null;
        const img = g ? g.querySelector('img') : null;
        const ir = img ? img.getBoundingClientRect() : null;
        return { l: r.left, r: r.right, w: r.width, gallery: gr && [gr.left, gr.top, gr.right, gr.bottom], img: ir && [ir.left, ir.top, ir.right, ir.bottom], fit: img ? getComputedStyle(img).objectFit : null, bg: g ? getComputedStyle(g).backgroundColor : null, blend: img ? getComputedStyle(img).mixBlendMode : null };
      });
      const cs = getComputedStyle(slides);
      return { vw: innerWidth, scroller: [sr.left, sr.right], headerBox: [hr.left, hr.right], controls: ctrl ? ctrl.getBoundingClientRect().toJSON() : null, link: link ? link.getBoundingClientRect().toJSON() : null, rows, gutter: parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--m-gutter')), contentMax: parseFloat(getComputedStyle(document.documentElement).fontSize) * 90, dir: cs.direction, prev: ctrl ? ctrl.querySelector('[data-dir="prev"]').disabled : null, next: ctrl ? ctrl.querySelector('[data-dir="next"]').disabled : null };
    });

    // content edges (the theme's shared width)
    const contentW = Math.min(m.contentMax, m.vw - 2 * m.gutter);
    const contentL = (m.vw - contentW) / 2;
    const contentR = contentL + contentW;
    const visible = m.rows.filter((r) => r.r > m.scroller[0] + 1 && r.l < m.scroller[1] - 1);
    const fully = visible.filter((r) => r.l >= m.scroller[0] - 1 && r.r <= m.scroller[1] + 1);
    if (width >= 750) {
      if (fully.length !== expected[width]) fail(c, `${fully.length} whole cards visible, expected ${expected[width]}`);
      if (visible.length !== fully.length) fail(c, `a card is cut off (${visible.length} visible, ${fully.length} whole)`);
      const first = dir === 'ltr' ? fully[0].l : fully[0].r;
      const last = dir === 'ltr' ? fully[fully.length - 1].r : fully[fully.length - 1].l;
      const wantFirst = dir === 'ltr' ? contentL : contentR;
      const wantLast = dir === 'ltr' ? contentR : contentL;
      if (Math.abs(first - wantFirst) > 1) fail(c, `first card edge ${first.toFixed(1)} is not the content gutter ${wantFirst.toFixed(1)}`);
      if (Math.abs(last - wantLast) > 1) fail(c, `last card edge ${last.toFixed(1)} is not the content gutter ${wantLast.toFixed(1)}`);
    } else {
      if (fully.length < 1 || visible.length - fully.length !== 1) fail(c, `phone: expected one whole card and one peeking, got ${fully.length} whole of ${visible.length}`);
      const peeking = visible.find((r) => !(r.l >= m.scroller[0] - 1 && r.r <= m.scroller[1] + 1));
      const shown = peeking ? (dir === 'ltr' ? m.scroller[1] - peeking.l : peeking.r - m.scroller[0]) / peeking.w : 0;
      if (shown < 0.1 || shown > 0.35) fail(c, `phone peek shows ${(shown * 100).toFixed(0)}% of the next card, expected about 15 to 20%`);
    }

    // frames: contained, inside, same backdrop token
    const bgs = new Set(visible.map((r) => r.bg));
    if (bgs.size !== 1) fail(c, `backdrop differs across cards: ${[...bgs].join(' | ')}`);
    for (const r of visible) {
      if (r.fit !== 'contain') fail(c, `image is ${r.fit}, not contain`);
      if (r.img && r.gallery && (r.img[0] < r.gallery[0] - 1 || r.img[2] > r.gallery[2] + 1 || r.img[1] < r.gallery[1] - 1 || r.img[3] > r.gallery[3] + 1)) fail(c, 'bottle image leaves its frame');
    }

    // arrows at the inline-end of the header, beside View all
    if (!m.controls) fail(c, 'arrow controls missing');
    else if (width >= 750) {
      const endEdge = dir === 'ltr' ? m.controls.right : m.controls.left;
      const want = dir === 'ltr' ? m.headerBox[1] : m.headerBox[0];
      if (Math.abs(endEdge - want) > 2) fail(c, `arrows are not at the header's inline-end (${endEdge.toFixed(1)} vs ${want.toFixed(1)})`);
      const linkBefore = dir === 'ltr' ? m.link.right <= m.controls.left + 1 : m.link.left >= m.controls.right - 1;
      if (!linkBefore) fail(c, '"View all" is not beside the arrows');
    }
    if (m.prev !== true) fail(c, 'previous is not disabled at the start');

    // backdrop sampled from pixels: the corner of every card's frame
    if (width >= 750) {
      const samples = [];
      for (const r of visible.slice(0, expected[width])) {
        const buf = await page.screenshot({ clip: { x: Math.round(r.gallery[0]) + 3, y: Math.round(r.gallery[1]) + 3, width: 4, height: 4 } });
        samples.push(await page.evaluate(async (b64) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const cv = document.createElement('canvas'); cv.width = 4; cv.height = 4; const x = cv.getContext('2d'); x.drawImage(img, 0, 0); const d = x.getImageData(1, 1, 1, 1).data; return [d[0], d[1], d[2]]; }, buf.toString('base64')));
      }
      const spread = [0, 1, 2].map((i) => Math.max(...samples.map((s) => s[i])) - Math.min(...samples.map((s) => s[i])));
      if (Math.max(...spread) > 2) fail(c, `sampled backdrop colours differ by up to ${Math.max(...spread)} levels: ${JSON.stringify(samples)}`);
      else if (width === 1440 && dir === 'ltr') log.push(`backdrop sampled on ${samples.length} cards: ${JSON.stringify(samples[0])} (spread ${Math.max(...spread)})`);
    }

    // navigation: next works by keyboard, previous enables, end disables next
    if (m.controls && width >= 750 && dir === 'ltr') {
      const before = await page.evaluate(() => { const s = [...document.querySelectorAll('.shopify-section')].find((x) => x.id.endsWith('product_list_CYd9gQ')).querySelector('slideshow-slides'); return s.scrollLeft; });
      await page.focus('.m-carousel-controls [data-dir="next"]');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(900);
      const after = await page.evaluate(() => { const sec = [...document.querySelectorAll('.shopify-section')].find((x) => x.id.endsWith('product_list_CYd9gQ')); return { x: sec.querySelector('slideshow-slides').scrollLeft, prev: sec.querySelector('[data-dir="prev"]').disabled }; });
      if (after.x <= before + 5) fail(c, 'the next button (Enter) did not scroll'); else if (after.prev) fail(c, 'previous stays disabled after scrolling');
      await page.evaluate(() => { const s = [...document.querySelectorAll('.shopify-section')].find((x) => x.id.endsWith('product_list_CYd9gQ')).querySelector('slideshow-slides'); s.scrollTo({ left: s.scrollWidth }); });
      await page.waitForTimeout(900);
      const end = await page.evaluate(() => [...document.querySelectorAll('.shopify-section')].find((x) => x.id.endsWith('product_list_CYd9gQ')).querySelector('[data-dir="next"]').disabled);
      if (!end) fail(c, 'next is not disabled at the end'); else if (width === 1440) log.push('arrows: previous disabled at the start, next works by keyboard, next disabled at the end');
      await page.evaluate(() => { const s = [...document.querySelectorAll('.shopify-section')].find((x) => x.id.endsWith('product_list_CYd9gQ')).querySelector('slideshow-slides'); s.scrollTo({ left: 0 }); });
      await page.waitForTimeout(600);
    }

    if (width === 1440 || width === 375 || width === 1024) {
      await page.evaluate(() => { const s = [...document.querySelectorAll('.shopify-section')].find((x) => x.id.endsWith('product_list_CYd9gQ')); s.scrollIntoView(); });
      await page.waitForTimeout(600);
      const box = await (await page.$('.shopify-section[id$="product_list_CYd9gQ"]')).boundingBox();
      await page.screenshot({ path: path.join(OUT, `most-loved-${width}-${dir}.png`), clip: { x: 0, y: Math.max(0, box.y), width, height: Math.min(box.height, 900) } });
    }
    await context.close();
  }
}
await browser.close();
for (const l of log) console.log('  ' + l);
if (failures.length) { console.error(`FAILED (${failures.length}):`); failures.slice(0, 40).forEach((f) => console.error('  ' + f)); process.exit(1); }
console.log('PASS');
