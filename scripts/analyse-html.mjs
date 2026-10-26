// What makes the HTML heavy? Fetches a page uncompressed and reports raw size and the biggest inline blocks.
// usage: node scripts/analyse-html.mjs [/path ...]
const paths = process.argv.slice(2).length ? process.argv.slice(2) : ['/', '/collections/all', '/products/9-pm-night-out'];
const kb = (n) => (n / 1024).toFixed(0) + ' KB';
for (const path of paths) {
  const html = await (await fetch(`https://momentseg.com${path}?pb=0`, { headers: { 'accept-encoding': 'identity' } })).text();
  console.log(`\n== ${path}: ${kb(html.length)} raw`);
  const blocks = [];
  for (const m of html.matchAll(/<(style|script)([^>]*)>([\s\S]*?)<\/\1>/g)) blocks.push({ kind: m[1] + (/type="application\/(ld\+)?json"/.test(m[2]) ? ':json' : /type="module"|type="importmap"/.test(m[2]) ? ':module' : ''), size: m[3].length, head: m[3].replace(/\s+/g, ' ').slice(0, 70) });
  const sum = (k) => blocks.filter((b) => b.kind === k).reduce((s, b) => s + b.size, 0);
  console.log(`inline <style> ${kb(sum('style'))} in ${blocks.filter((b) => b.kind === 'style').length} blocks; <script> ${kb(sum('script'))}; json ${kb(sum('script:json'))}; module/importmap ${kb(sum('script:module'))}`);
  console.log('biggest inline blocks:');
  blocks.sort((a, b) => b.size - a.size).slice(0, 6).forEach((b) => console.log(`  ${kb(b.size).padStart(7)} ${b.kind.padEnd(12)} ${b.head}`));
  const svg = [...html.matchAll(/<svg[\s\S]*?<\/svg>/g)].reduce((s, m) => s + m[0].length, 0);
  console.log(`inline <svg> ${kb(svg)} in ${(html.match(/<svg/g) || []).length} elements; product cards ${(html.match(/<product-card/g) || []).length}; <img> ${(html.match(/<img/g) || []).length}; srcset bytes ${kb([...html.matchAll(/srcset="([^"]*)"/g)].reduce((s, m) => s + m[1].length, 0))}`);
  const menus = html.match(/<header-drawer[\s\S]*?<\/header-drawer>/);
  console.log(`header drawer markup ${menus ? kb(menus[0].length) : 'n/a'}; mega panels ${(html.match(/m-mega/g) || []).length} class hits`);
}
