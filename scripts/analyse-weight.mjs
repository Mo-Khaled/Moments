// Real bytes on the wire for a page load (CDP encodedDataLength), grouped by owner and type. Kaspersky injection is blocked.
// usage: node scripts/analyse-weight.mjs [/path ...]   (mobile emulation)
import { chromium, devices } from 'playwright-core';
const paths = process.argv.slice(2).length ? process.argv.slice(2) : ['/', '/collections/all', '/products/9-pm-night-out'];
const b = await chromium.launch({ channel: 'chrome', headless: true });
const kb = (n) => (n / 1024).toFixed(0).padStart(5) + ' KB';
for (const path of paths) {
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  await ctx.route(/kaspersky/, (r) => r.abort());
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Network.enable');
  const reqs = new Map();
  cdp.on('Network.responseReceived', (e) => reqs.set(e.requestId, { url: e.response.url, type: e.type, mime: e.response.mimeType }));
  cdp.on('Network.loadingFinished', (e) => { const r = reqs.get(e.requestId); if (r) r.size = e.encodedDataLength; });
  await p.goto(`https://momentseg.com${path}?pb=0${process.env.PREVIEW ? '&preview_theme_id=' + process.env.PREVIEW : ''}`, { waitUntil: 'load', timeout: 90000 });
  await p.waitForTimeout(4000);
  const owner = (u) => (/momentseg\.com\/cdn\/shop\/t\/\d+\/assets\//.test(u) ? 'theme assets' : /\/cdn\/shop\/(files|products)\//.test(u) ? 'store images' : /shopifycloud|\/cdn\/wpm|web-pixels|shop\.app|shopify\.com/.test(u) ? 'Shopify platform' : /momentseg\.com/.test(u) ? 'store other' : 'third party: ' + new URL(u).host);
  const g = {}; let total = 0;
  for (const r of reqs.values()) { if (!r.size) continue; const k = owner(r.url) + ' / ' + (r.type || '?'); g[k] = g[k] || { n: 0, size: 0 }; g[k].n++; g[k].size += r.size; total += r.size; }
  console.log(`\n== ${path}: ${kb(total)} in ${[...reqs.values()].length} requests`);
  Object.entries(g).sort((x, y) => y[1].size - x[1].size).slice(0, 12).forEach(([k, v]) => console.log(`${kb(v.size)} ${String(v.n).padStart(4)}x  ${k}`));
  const big = [...reqs.values()].filter((r) => r.size).sort((x, y) => y.size - x.size).slice(0, 6);
  console.log('largest:'); big.forEach((r) => console.log(`  ${kb(r.size)} ${r.type} ${r.url.replace('https://momentseg.com', '').slice(0, 95)}`));
  await ctx.close();
}
await b.close();
