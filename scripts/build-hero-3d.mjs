// Builds assets/hero-bottle-3d.js from scripts/hero-bottle-3d/entry.js (three.js and its loaders, tree-shaken and minified, one ES module),
// and optimises a source .glb into assets/hero-bottle.glb (1024 px WebP textures, meshopt geometry).
//   node scripts/build-hero-3d.mjs [path/to/source.glb]
import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';

const root = new URL('..', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
await build({ entryPoints: [`${root}scripts/hero-bottle-3d/entry.js`], bundle: true, format: 'esm', minify: true, target: 'es2020', outfile: `${root}assets/hero-bottle-3d.js`, legalComments: 'none', absWorkingDir: `${root}scripts` });
const js = readFileSync(`${root}assets/hero-bottle-3d.js`);
console.log(`assets/hero-bottle-3d.js ${(js.length / 1024).toFixed(0)} KB, ${(gzipSync(js).length / 1024).toFixed(0)} KB gzipped`);

const source = process.argv[2] && (await import('node:path')).resolve(process.argv[2]);
if (source) {
  execFileSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['gltf-transform', 'optimize', source, `${root}assets/hero-bottle.glb`, '--texture-compress', 'webp', '--texture-size', '1024', '--compress', 'meshopt', '--simplify', 'false'], { cwd: `${root}scripts`, stdio: 'inherit', shell: process.platform === 'win32' });
  console.log(`assets/hero-bottle.glb ${(statSync(`${root}assets/hero-bottle.glb`).size / 1024).toFixed(0)} KB`);
}
