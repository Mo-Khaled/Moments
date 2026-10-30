// Renders the still images of the 3D bottle (the first paint, the fallback without WebGL, and the phone/static versions) with the SAME
// framing code the live hero uses (assets/hero-bottle-3d.js), at the start and end angles of the turn, on a transparent background.
// Output: assets/hero-bottle-{start,end}[-sm].webp. Needs Python with Pillow for the WebP encode.   node scripts/render-hero-posters.mjs
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, extname } from 'node:path';
import { tmpdir } from 'node:os';

const root = new URL('..', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
export const W = 372, H = 600; // CSS px of the bottle box (ratio 0.62); rendered at 2x
const page = `<!doctype html><body style="margin:0"><canvas id="c"></canvas><script type="module">
import { setup } from '/assets/hero-bottle-3d.js';
const canvas = document.getElementById('c');
const view = await setup(canvas, '/assets/hero-bottle.glb', ${W}, ${H}, 2);
window.shot = (p) => { view.render(p); return canvas.toDataURL('image/png'); };
window.ready = true;
</script></body>`;
const server = createServer((req, res) => {
  const path = decodeURIComponent(req.url.split('?')[0]);
  if (path === '/') return res.writeHead(200, { 'content-type': 'text/html' }).end(page);
  const file = join(root, path);
  if (!existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': extname(file) === '.js' ? 'text/javascript' : 'application/octet-stream' }).end(readFileSync(file));
}).listen(0);
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await browser.newPage();
await p.goto(`http://127.0.0.1:${server.address().port}/`);
await p.waitForFunction(() => window.ready, null, { timeout: 120000 });
const dir = mkdtempSync(join(tmpdir(), 'hgb-'));
for (const [name, prog] of [['start', 0], ['end', 1]]) {
  const data = await p.evaluate((x) => window.shot(x), prog);
  writeFileSync(join(dir, `${name}.png`), Buffer.from(data.split(',')[1], 'base64'));
}
await browser.close();
server.close();
const py = `
from PIL import Image
import sys
d, out = sys.argv[1], sys.argv[2]
for n in ('start', 'end'):
    im = Image.open(f'{d}/{n}.png').convert('RGBA')
    im.save(f'{out}/hero-bottle-{n}.webp', 'WEBP', quality=84, method=6)
    im.resize((im.width // 2, im.height // 2), Image.LANCZOS).save(f'{out}/hero-bottle-{n}-sm.webp', 'WEBP', quality=84, method=6)
    sheet = Image.new('RGB', (im.width * 3, im.height))
    for i, c in enumerate(('#3B1E3A', '#E9CFC8', '#FAF6F2')):
        t = Image.new('RGB', im.size, c); t.paste(im, (0, 0), im); sheet.paste(t, (i * im.width, 0))
    sheet.save(f'{d}/{n}-check.png')
print(d)
`;
const py3 = process.platform === 'win32' ? 'C:/Python314/python.exe' : 'python3';
console.log('check sheets in', execFileSync(py3, ['-c', py, dir, join(root, 'assets')]).toString().trim());
