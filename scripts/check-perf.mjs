// Mobile performance audit with Lighthouse (headless Chrome, Lighthouse's default slow-4G + 4x CPU throttling), plus the heaviest requests.
// usage: node scripts/check-perf.mjs [--pages /,/collections/all,/products/9-pm-night-out] [--tag before] [--desktop]
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { writeFileSync, mkdirSync } from 'node:fs';

const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > -1 ? process.argv[i + 1] : d; };
const PAGES = arg('pages', '/,/collections/all,/products/9-pm-night-out,/pages/brands').split(',');
const TAG = arg('tag', 'run');
const DESKTOP = process.argv.includes('--desktop');
mkdirSync('docs/performance', { recursive: true });
const chrome = await launch({ chromePath: process.env.CHROME_PATH || undefined, chromeFlags: ['--headless=new', '--no-sandbox'] });
const rows = [];
const md = [`# Performance ${TAG}${DESKTOP ? ' (desktop)' : ' (mobile, slow 4G, 4x CPU)'}`, '', `Lighthouse on https://momentseg.com, ${new Date().toISOString().slice(0, 10)}. Scores vary a few points run to run.`, '', '| page | perf | LCP | TBT | CLS | FCP | transferred | requests | JS | images |', '|---|---|---|---|---|---|---|---|---|---|'];
for (const path of PAGES) {
  const r = await lighthouse(`https://momentseg.com${path}${path.includes('?') ? '&' : '?'}pb=0${process.env.PREVIEW ? '&preview_theme_id=' + process.env.PREVIEW : ''}`, { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance'], formFactor: DESKTOP ? 'desktop' : 'mobile', screenEmulation: DESKTOP ? { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false } : undefined, throttlingMethod: 'simulate', blockedUrlPatterns: ['*kaspersky*', '*kis.v2.scr*'] });
  const lhr = r.lhr; const a = lhr.audits;
  // a run that times out has no request list; report the timing metrics anyway
  const net = a['network-requests']?.details?.items || [];
  const byType = (t) => net.filter((x) => x.resourceType === t).reduce((s, x) => s + (x.transferSize || 0), 0);
  const total = net.reduce((s, x) => s + (x.transferSize || 0), 0);
  const kb = (n) => (n / 1024).toFixed(0) + ' KB';
  const row = { path, perf: Math.round(lhr.categories.performance.score * 100), lcp: a['largest-contentful-paint'].displayValue, tbt: a['total-blocking-time'].displayValue, cls: a['cumulative-layout-shift'].displayValue, fcp: a['first-contentful-paint'].displayValue, total: kb(total), reqs: net.length, js: kb(byType('Script')), img: kb(byType('Image')) };
  rows.push(row);
  console.log(`${path.padEnd(28)} perf ${row.perf}  LCP ${row.lcp}  TBT ${row.tbt}  CLS ${row.cls}  ${row.total} in ${row.reqs} requests (JS ${row.js}, images ${row.img})`);
  md.push(`| ${path} | ${row.perf} | ${row.lcp} | ${row.tbt} | ${row.cls} | ${row.fcp} | ${row.total} | ${row.reqs} | ${row.js} | ${row.img} |`);
  const heavy = [...net].sort((x, y) => (y.transferSize || 0) - (x.transferSize || 0)).slice(0, 8);
  md.push('', `Heaviest requests on ${path}:`, ...heavy.map((x) => `- ${kb(x.transferSize || 0)} ${x.resourceType} ${x.url.replace('https://momentseg.com', '').slice(0, 110)}`), '');
  const opp = Object.values(a).filter((x) => x.details && x.details.type === 'opportunity' && x.details.overallSavingsMs > 150).sort((x, y) => y.details.overallSavingsMs - x.details.overallSavingsMs).slice(0, 5);
  if (opp.length) md.push(`Lighthouse opportunities on ${path}:`, ...opp.map((x) => `- ${x.title}: about ${Math.round(x.details.overallSavingsMs)} ms${x.details.overallSavingsBytes ? ', ' + kb(x.details.overallSavingsBytes) : ''}`), '');
}
await chrome.kill();
writeFileSync(`docs/performance/perf-${TAG}${DESKTOP ? '-desktop' : ''}.md`, md.join('\n'));
