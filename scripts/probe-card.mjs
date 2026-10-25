// Dev probe: describe the first product card's images (classes, object-fit, aspect ratio). usage: node scripts/probe-card.mjs [path]
import { chromium } from 'playwright-core';

const p = process.argv[2] || '/';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
await page.goto(`https://momentseg.com${p}${p.includes('?') ? '&' : '?'}preview_theme_id=161294745791&pb=0`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(4000);
const out = await page.evaluate(() => {
  const card = document.querySelector('product-card');
  const gallery = card.querySelector('.card-gallery');
  const imgs = [...card.querySelectorAll('img')].map((i) => ({ cls: i.className.slice(0, 80), fit: getComputedStyle(i).objectFit, w: i.naturalWidth, h: i.naturalHeight, box: [Math.round(i.getBoundingClientRect().width), Math.round(i.getBoundingClientRect().height)], parent: i.parentElement.className.slice(0, 60) }));
  const quick = card.querySelector('quick-add-component, .quick-add, [class*=quick]');
  return { galleryCls: gallery && gallery.className.slice(0, 90), galleryRatio: gallery && getComputedStyle(gallery).aspectRatio, bg: gallery && getComputedStyle(gallery).backgroundColor, imgs, quick: quick ? quick.className.slice(0, 60) : null };
});
console.log(JSON.stringify(out, null, 1));
await browser.close();
