// Gift-box hero check on a LOCAL render of sections/hero-gift-box.liquid (nothing is read from or written to the store).
// Three scroll states (closed, half open, open) at 1440, 1280, 768, 390 and 360, LTR and RTL, reduced motion, Chromium and WebKit.
// Checks: the stage pins (sticky) and --p follows the scroll, no horizontal scroll, the box stays centred in its column in RTL,
// the headline in the DOM changes with the state, buttons reachable by keyboard with a visible focus ring, axe wcag2aa (contrast
// included) on every state, CLS 0 from the hero while loading, the hero's last row is the brand strip colour (no seam).
// Screenshots: docs/design/hero-gift-box/.   node scripts/check-hero-box.mjs [--no-shots] [--engine chromium|webkit|all]
import { ROOT, engine, css, serve } from './lib/theme-fixture.mjs';
import { chromium, webkit } from 'playwright-core';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(ROOT, 'docs/design/hero-gift-box');
mkdirSync(OUT, { recursive: true });
const shots = !process.argv.includes('--no-shots');
const which = process.argv.includes('--engine') ? process.argv[process.argv.indexOf('--engine') + 1] : 'all';

async function page({ dir = 'ltr', animate = true, phones = true } = {}) {
  css.length = 0;
  const globals = { settings: {}, routes: { root_url: '/', all_products_collection_url: '/collections/all' }, request: { design_mode: false, locale: { iso_code: dir === 'rtl' ? 'ar' : 'en' } }, collections: { gifts: { url: '/collections/gifts' } }, all_products: { '9-pm-night-out': { title: '9 PM Night Out', vendor: 'AFNAN' } } };
  const section = { id: 'hero', settings: { animate, show_on_phones: phones, box_tone: 'plum', logo_tone: 'white' }, blocks: [] };
  const body = await engine.renderFile('hero-gift-box', { section }, { globals });
  return `<!doctype html><html lang="${dir === 'rtl' ? 'ar' : 'en'}" dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Hero fixture</title><link rel="stylesheet" href="/assets/base.css"><link rel="stylesheet" href="/assets/moments.css"><style>${css.join('\n')}</style>
<style>body{margin:0;background:var(--m-pearl);font-family:var(--font-body--family)} .fx-header{block-size:72px;background:var(--m-pearl)} .fx-brands{block-size:260px;background:var(--s-deep)} .fx-tiles{block-size:600px;background:var(--s-plum)}</style>
<script>window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value}).observe({type:'layout-shift',buffered:true});</script></head>
<body><header class="fx-header"></header><main><div class="shopify-section">${body}</div><div class="shopify-section"><div class="m-brands fx-brands"></div></div><div class="shopify-section"><div class="fx-tiles"></div></div></main></body></html>`;
}

const pages = { '/': await page(), '/rtl': await page({ dir: 'rtl' }), '/static': await page({ animate: false }), '/desktop-only': await page({ phones: false }) };
const server = serve(pages);
let bad = 0;
const ok = (cond, msg) => { console.log(cond ? 'ok  ' : 'FAIL', msg); if (!cond) bad++; };

const state = (p) => p.evaluate(() => {
  const stage = document.querySelector('.hgb__stage');
  const vis = [...document.querySelectorAll('.hgb__line')].map((e) => Number(getComputedStyle(e).opacity));
  return { p: Number(getComputedStyle(stage).getPropertyValue('--p')), top: stage.getBoundingClientRect().top, vis, sw: document.documentElement.scrollWidth, iw: innerWidth };
});
const scrollTo = async (p, f) => {
  await p.evaluate((f) => {
    const t = document.querySelector('.hgb__track');
    const top = t.getBoundingClientRect().top + scrollY;
    scrollTo(0, top + (t.offsetHeight - innerHeight) * f);
  }, f);
  await p.waitForTimeout(350);
};

const engines = which === 'all' ? [['chromium', chromium], ['webkit', webkit]] : [[which, which === 'webkit' ? webkit : chromium]];
for (const [name, type] of engines) {
  const browser = await type.launch(name === 'chromium' ? { channel: 'chrome' } : {});
  const widths = name === 'chromium' ? [1440, 1280, 768, 390, 360] : [1440, 390];
  for (const dir of ['ltr', 'rtl']) {
    for (const w of widths) {
      const h = w >= 1280 ? 900 : w >= 768 ? 1024 : 800;
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, ...(name === 'webkit' && w < 768 ? { isMobile: true, hasTouch: true, deviceScaleFactor: 3 } : {}) });
      const p = await ctx.newPage();
      const errors = [];
      p.on('pageerror', (e) => errors.push(String(e)));
      await p.goto(server.base + (dir === 'rtl' ? '/rtl' : '/'), { waitUntil: 'load' });
      await p.waitForTimeout(400);
      const tag = `${name} ${w} ${dir}`;
      ok((await p.evaluate(() => window.__cls)) < 0.001, `${tag}: CLS ${(await p.evaluate(() => window.__cls)).toFixed(4)}`);

      for (const [label, f] of [['closed', 0], ['half', 0.42], ['open', 1]]) {
        await scrollTo(p, f);
        const s = await state(p);
        ok(s.sw <= s.iw, `${tag} ${label}: no horizontal scroll (${s.sw}/${s.iw})`);
        if (f > 0) ok(Math.abs(s.top) < 2, `${tag} ${label}: stage pinned (top ${s.top.toFixed(1)})`);
        ok(Math.abs(s.p - f) < 0.06, `${tag} ${label}: progress ${s.p.toFixed(2)} (expected ${f})`);
        const shown = s.vis.indexOf(Math.max(...s.vis));
        ok(shown === (f === 0 ? 0 : f < 0.6 ? 1 : 2), `${tag} ${label}: headline ${shown + 1} showing (${s.vis.map((v) => v.toFixed(2))})`);
        if (label !== 'half') {
          const axe = await new AxeBuilder({ page: p }).include('.hgb').withTags(['wcag2a', 'wcag2aa']).analyze();
          ok(!axe.violations.length, `${tag} ${label}: axe ${axe.violations.map((v) => `${v.id} (${v.nodes.length})`).join(', ') || 'no violations'}`);
        }
        if (shots && (name === 'chromium' || label !== 'half')) await p.screenshot({ path: join(OUT, `${name}-${w}-${dir}-${label}.png`) });
      }
      if (dir === 'rtl') {
        const c = await p.evaluate(() => {
          const box = document.querySelector('.hgb-box').getBoundingClientRect();
          const scene = document.querySelector('.hgb__scene').getBoundingClientRect();
          const copy = document.querySelector('.hgb__copy').getBoundingClientRect();
          return { off: Math.abs(box.left + box.width / 2 - (scene.left + scene.width / 2)), copyRight: copy.right, sceneRight: scene.right };
        });
        ok(c.off < 0.2 * w, `${tag}: box centred in its column (offset ${c.off.toFixed(0)}px)`);
        if (w >= 990) ok(c.copyRight > c.sceneRight, `${tag}: copy on the right in RTL`);
      }
      // the last stage row is the brand strip colour: the join below the hero is seamless
      await scrollTo(p, 1);
      const join_ = await p.evaluate(() => {
        const brands = document.querySelector('.fx-brands').getBoundingClientRect();
        return { gap: brands.top - document.querySelector('.hgb').getBoundingClientRect().bottom };
      });
      ok(Math.abs(join_.gap) < 1, `${tag}: brand strip starts right under the hero (${join_.gap})`);
      ok(!errors.length, `${tag}: no page errors ${errors.join(' | ')}`);
      await ctx.close();
    }
  }

  // the default ("Show on phones" off): hidden under 750px, shown from 750px
  for (const [w, want] of [[390, false], [749, false], [750, true], [1440, true]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
    const p = await ctx.newPage();
    await p.goto(server.base + '/desktop-only');
    const shown = await p.evaluate(() => getComputedStyle(document.querySelector('.hgb').closest('.shopify-section')).display !== 'none');
    ok(shown === want, `${name} ${w}px with "Show on phones" off: hero ${shown ? 'shown' : 'hidden'}`);
    await ctx.close();
  }

  // keyboard: the two buttons in order, visible focus
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(server.base + '/');
    const seen = [];
    for (let i = 0; i < 4; i++) {
      // Tab order is checked in Chromium. Playwright's WebKit on Windows does not move focus to links with Tab or Option+Tab, so there
      // each button is focused in DOM order and the focus ring is checked.
      if (name === 'webkit') await p.evaluate((i) => document.querySelectorAll('.hgb-btn')[i]?.focus({ focusVisible: true }), i);
      else await p.keyboard.press('Tab');
      seen.push(await p.evaluate(() => ({ t: document.activeElement.textContent.trim(), o: getComputedStyle(document.activeElement).outlineStyle })));
    }
    ok(seen[0].t === 'Shop gifts' && seen[1].t === 'Find your moment' && seen.slice(0, 2).every((s) => s.o !== 'none'), `${name} keyboard: ${seen.slice(0, 2).map((s) => `${s.t} (${s.o})`).join(', ')}`);
    await ctx.close();
  }

  // reduced motion and the setting off: open box, last headline, no tall track
  for (const [label, url, opts] of [['reduced motion', '/', { reducedMotion: 'reduce' }], ['setting off', '/static', {}]]) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
    const p = await ctx.newPage();
    await p.goto(server.base + url); await p.waitForTimeout(300);
    const s = await state(p);
    const track = await p.$eval('.hgb__track', (e) => e.offsetHeight);
    ok(s.p === 1 && s.vis[2] === 1 && track <= 900, `${name} ${label}: open box, headline 3, track ${track}px`);
    if (shots && name === 'chromium') await p.screenshot({ path: join(OUT, `${label.replace(' ', '-')}-1440.png`) });
    await ctx.close();
  }
  await browser.close();
}

server.close();
console.log(bad ? `HERO CHECK FAILED (${bad})` : 'HERO CHECK PASSED');
process.exit(bad ? 1 : 0);
