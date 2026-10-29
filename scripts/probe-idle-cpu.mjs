// Idle CPU probe: how many style recalculations and how much main-thread time does a page burn while nothing happens?
// Optionally switches suspects off (injected CSS or JS) to bisect. usage: node scripts/probe-idle-cpu.mjs [/path] [--theme id]
import { chromium, devices } from 'playwright-core';
const path = process.argv[2] && process.argv[2].startsWith('/') ? process.argv[2] : '/';
const THEME = process.argv.includes('--theme') ? process.argv[process.argv.indexOf('--theme') + 1] : '';
const VARIANTS = {
  baseline: {},
  'no CSS animations': { css: '*,*::before,*::after{animation:none!important}' },
  'no CSS transitions': { css: '*,*::before,*::after{transition:none!important}' },
  'no marquee/ticker': { css: '.m-ticker__track,.m-ticker__group,.m-ticker__list,.m-ticker *{animation:none!important}' },
  'no announcement rotation': { css: '.m-announce__msg{animation:none!important}' },
  'no hero slides animation': { css: '.m-hero *{animation:none!important;transition:none!important}' },
  'no video': { js: "document.querySelectorAll('video').forEach(v=>{v.pause();v.removeAttribute('src');v.load()})" },
  'no moment marks gestures': { css: 'moment-mark,moment-mark *{animation:none!important}' },
};
const b = await chromium.launch({ channel: 'chrome', headless: true });
for (const [name, v] of Object.entries(VARIANTS)) {
  const ctx = await b.newContext({ ...devices['iPhone 13'] });
  await ctx.route(/kaspersky/, (r) => r.abort());
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p); await cdp.send('Performance.enable');
  await p.goto(`https://momentseg.com${path}?pb=0${THEME ? '&preview_theme_id=' + THEME : ''}`, { waitUntil: 'load' });
  await p.waitForTimeout(2500);
  if (v.css) await p.addStyleTag({ content: v.css });
  if (v.js) await p.evaluate(v.js);
  await p.waitForTimeout(1500);
  const get = async () => (await cdp.send('Performance.getMetrics')).metrics.reduce((o, x) => ((o[x.name] = x.value), o), {});
  const a = await get(); await p.waitForTimeout(4000); const c = await get();
  console.log(`${name.padEnd(26)} recalcs/s ${((c.RecalcStyleCount - a.RecalcStyleCount) / 4).toFixed(0).padStart(4)}   main thread busy ${(((c.TaskDuration - a.TaskDuration) / 4) * 100).toFixed(0).padStart(3)}%   script ${(((c.ScriptDuration - a.ScriptDuration) / 4) * 100).toFixed(0)}%`);
  await ctx.close();
}
await b.close();
