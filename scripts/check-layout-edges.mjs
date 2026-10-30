// Site-wide layout and type check (2026-10-30 colour and placement pass).
// On each page at 1440, 768 and 390, LTR and RTL:
//   edges     no section's content starts outside the header's content edge (start side); sections whose content starts inside it
//             are listed for review (centred bands are allowed: the gift-box hero, the email band, the cart empty state);
//   headings  every visible h1/h2 (and role=heading level 1/2) in English is Marcellus, uppercase, letter-spacing 0.04em, and no larger
//             than the brand guide (H1 56px, H2 36px; 34 and 26 under 750px); RTL pages are only checked for no horizontal scroll;
//   gold      no element's text, border, background or outline colour is one of the removed gold values;
//   overflow  no horizontal scroll.
// usage: node scripts/check-layout-edges.mjs [--theme id] [--pages /,/cart] [--widths 1440,390] [--dirs ltr,rtl]
import { chromium } from 'playwright-core';

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const THEME = arg('theme', '');
const PAGES = arg('pages', '/,/collections/all,/products/9-pm-night-out,/cart,/search?q=oud,/pages/about-us,/pages/faq,/pages/brands,/pages/make-a-bundle,/pages/moments').split(',');
const WIDTHS = arg('widths', '1440,768,390').split(',').map(Number);
// RTL here only flips dir on an English page (no Arabic store language yet), which parks skip links far outside; use --dirs ltr,rtl to include it
const DIRS = arg('dirs', 'ltr').split(',');
const GOLD = ['rgb(205, 165, 83)', 'rgb(138, 106, 34)'];

const browser = await chromium.launch({ channel: 'chrome', headless: true });
let bad = 0;
const fail = (m) => { bad++; console.log('FAIL', m); };
for (const w of WIDTHS) {
  for (const dir of DIRS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, ...(w < 750 ? { isMobile: true, hasTouch: true } : {}) });
    await ctx.route(/kaspersky-labs|shopifysvc|monorail/, (r) => r.abort());
    const p = await ctx.newPage();
    for (const path of PAGES) {
      const url = `https://momentseg.com${path}${path.includes('?') ? '&' : '?'}pb=0${THEME ? '&preview_theme_id=' + THEME : ''}`;
      try {
        await p.goto(url, { waitUntil: 'load', timeout: 60000 });
      } catch { fail(`${w} ${dir} ${path}: did not load`); continue; }
      if (dir === 'rtl') await p.evaluate(() => { document.documentElement.dir = 'rtl'; });
      await p.waitForTimeout(800);
      const r = await p.evaluate(({ dir, w, GOLD }) => {
        const out = { overflow: document.documentElement.scrollWidth - innerWidth, outside: [], inset: [], headings: [], gold: [] };
        // the shared content edge: a probe .m-wrap (assets/moments.css), the wrapper the header content is checked against in check-home.mjs
        const probe = document.createElement('div');
        probe.className = 'm-wrap';
        probe.innerHTML = '<span style="display:block;block-size:1px"></span>';
        document.body.append(probe);
        const pr = probe.firstElementChild.getBoundingClientRect();
        const edge = dir === 'ltr' ? pr.left : innerWidth - pr.right;
        probe.remove();
        // on screen horizontally (skip links and parked carousel items sit far outside), with a size, not hidden
        const visible = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 1 && r.height > 1 && r.right > 0 && r.left < innerWidth && s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0' && !e.closest('.visually-hidden, [hidden], .skip-to-content-link'); };
        {
          for (const sec of document.querySelectorAll('main > .shopify-section, #MainContent > .shopify-section')) {
            if (getComputedStyle(sec).display === 'none') continue;
            const items = [...sec.querySelectorAll('h1, h2, h3, p, a, button, img, li')].filter((e) => visible(e) && !e.closest('[class*="marquee"], .m-brands, slideshow-component, .resource-list--carousel, .m-tile, .hgb__scene, .card-gallery, media-gallery, .product-information__media, .m-slide__media, .m-hero__stage > img, .m-slide__blur'));
            if (!items.length) continue;
            const starts = items.map((e) => { const r = e.getBoundingClientRect(); return dir === 'ltr' ? r.left : innerWidth - r.right; });
            const min = Math.min(...starts);
            const id = sec.id.replace('shopify-section-', '').replace(/^template--\d+__/, '');
            if (min < edge - 2) out.outside.push(`${id} starts ${Math.round(edge - min)}px outside the edge`);
            else if (min > edge + 2) out.inset.push(`${id} +${Math.round(min - edge)}px`);
          }
        }
        if (dir === 'ltr') {
          for (const h of document.querySelectorAll('h1, h2, [role="heading"][aria-level="1"], [role="heading"][aria-level="2"]')) {
            if (!visible(h) || h.closest('.visually-hidden, [hidden], .m-mega, header')) continue;
            const s = getComputedStyle(h);
            const level = h.tagName === 'H1' || h.getAttribute('aria-level') === '1' ? 1 : 2;
            const size = parseFloat(s.fontSize);
            const max = level === 1 ? (w < 750 ? 34.5 : 56.5) : (w < 750 ? 26.5 : 36.5);
            const ls = parseFloat(s.letterSpacing) / size;
            const problems = [];
            if (!/Marcellus/i.test(s.fontFamily)) problems.push('font ' + s.fontFamily.split(',')[0]);
            if (s.textTransform !== 'uppercase') problems.push('case ' + s.textTransform);
            if (!(ls > 0.035 && ls < 0.045)) problems.push('spacing ' + (isNaN(ls) ? s.letterSpacing : ls.toFixed(3) + 'em'));
            if (size > max) problems.push(`size ${size}px > ${max}`);
            if (problems.length) out.headings.push(`h${level} "${h.textContent.trim().slice(0, 30)}": ${problems.join(', ')}`);
          }
        }
        for (const e of document.querySelectorAll('body *')) {
          if (!visible(e)) continue;
          const s = getComputedStyle(e);
          for (const prop of ['color', 'backgroundColor', 'borderTopColor', 'outlineColor']) if (GOLD.includes(s[prop]) && (prop !== 'outlineColor' || s.outlineStyle !== 'none') && (prop !== 'borderTopColor' || parseFloat(s.borderTopWidth) > 0)) { out.gold.push(`${e.tagName.toLowerCase()}.${String(e.className).split(' ')[0]} ${prop}`); break; }
          if (out.gold.length > 5) break;
        }
        return out;
      }, { dir, w, GOLD });
      const tag = `${w} ${dir} ${path}`;
      if (r.overflow > 1) fail(`${tag}: horizontal scroll ${r.overflow}px`);
      for (const o of r.outside) fail(`${tag}: ${o}`);
      for (const h of r.headings) fail(`${tag}: ${h}`);
      for (const g of r.gold) fail(`${tag}: gold ${g}`);
      console.log(`ok   ${tag}${r.inset.length ? '  (inset, review: ' + r.inset.join('; ') + ')' : ''}`);
    }
    await ctx.close();
  }
}
await browser.close();
console.log(bad ? `LAYOUT CHECK FAILED (${bad})` : 'LAYOUT CHECK PASSED');
process.exit(bad ? 1 : 0);
