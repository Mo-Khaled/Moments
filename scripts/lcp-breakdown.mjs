// One Lighthouse mobile run (simulated slow 4G, 4x CPU) with the LCP element, its time split, render-blocking requests, fonts and the
// critical stylesheets. usage: node scripts/lcp-breakdown.mjs https://momentseg.com/?view=hero-box
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
const chrome = await launch({ chromeFlags: ['--headless=new', '--no-sandbox'] });
const url = process.argv[2];
const r = await lighthouse(url, { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance'], throttlingMethod: 'simulate', blockedUrlPatterns: ['*kaspersky*', '*kis.v2.scr*'] });
const a = r.lhr.audits;
const el = a['largest-contentful-paint-element']?.details?.items;
console.log('perf', Math.round(r.lhr.categories.performance.score * 100), 'LCP', a['largest-contentful-paint'].displayValue, 'FCP', a['first-contentful-paint'].displayValue, 'TBT', a['total-blocking-time'].displayValue, 'CLS', a['cumulative-layout-shift'].displayValue);
console.log('LCP element:', JSON.stringify(el?.[0]?.items?.[0]?.node?.snippet), el?.[0]?.items?.[0]?.node?.selector);
console.log('phases:', JSON.stringify(el?.[1]?.items));
console.log('render-blocking:', (a['render-blocking-resources']?.details?.items || a['render-blocking-insight']?.details?.items || []).map((i) => `${(i.url || '').replace('https://momentseg.com', '').slice(0, 90)} ${Math.round(i.wastedMs || 0)}ms`).join('\n  '));
const fonts = (a['network-requests']?.details?.items || []).filter((i) => i.resourceType === 'Font' || /\.woff2/.test(i.url)).map((i) => `${i.url.split('/').pop().slice(0, 60)} ${Math.round(i.transferSize / 1024)}KB prio=${i.priority}`);
console.log('fonts:', fonts.join(' | '));
const ids = Object.keys(a).filter((k) => /lcp|insight|server-response|critical|dependency/.test(k));
console.log('audits:', ids.join(', '));
const br = a['lcp-breakdown-insight'];
console.log('lcp breakdown:', JSON.stringify(br?.details?.items?.map?.((i) => i.items || i) ?? br?.details).slice(0, 900));
console.log('ttfb:', a['server-response-time']?.displayValue);
const net = a['network-requests']?.details?.items || [];
const doc = net.find((i) => i.resourceType === 'Document');
console.log('document', Math.round((doc?.transferSize || 0) / 1024), 'KB');
for (const i of net.filter((i) => ['Stylesheet', 'Document', 'Font'].includes(i.resourceType)).slice(0, 12)) console.log(`  ${i.resourceType.padEnd(10)} ${String(Math.round(i.transferSize / 1024)).padStart(4)}KB start ${Math.round(i.networkRequestTime)} end ${Math.round(i.networkEndTime)} ${i.url.replace('https://momentseg.com', '').slice(0, 70)}`);
await chrome.kill();
